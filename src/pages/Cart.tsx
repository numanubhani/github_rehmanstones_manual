import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import {
  applyCoupon,
  readAppliedCoupon,
  saveAppliedCoupon,
  itemsSubtotal,
  getCoupon,
} from "../utils/coupons";

const formatRs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function Cart() {
  const navigate = useNavigate();
  const { items, setQty, removeItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // selection state (defaults to all items selected)
  const [selected, setSelected] = useState<Set<number | string>>(
    () => new Set(items.map((i) => i.id))
  );

  // keep selection in sync with items
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<number | string>();
      for (const it of items) if (prev.has(it.id)) next.add(it.id);
      return next;
    });
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.id)),
    [items, selected]
  );

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };
  const toggleOne = (id: number | string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ---------------- Coupon state (with inline error) ---------------- */
  const [couponInput, setCouponInput] = useState(readAppliedCoupon() ?? "");
  const [appliedCode, setAppliedCode] = useState<string | null>(() =>
    readAppliedCoupon()
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const appliedCoupon = appliedCode ? getCoupon(appliedCode) : null;

  // Money
  const subtotal = itemsSubtotal(selectedItems);
  const shippingFee = 0;

  const discount = useMemo(() => {
    if (!appliedCode) return 0;
    const res = applyCoupon(selectedItems, appliedCode);
    return res.ok ? res.discount : 0;
  }, [selectedItems, appliedCode]);

  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);

  function onApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    const res = applyCoupon(selectedItems, code);
    if (res.ok) {
      setAppliedCode(res.coupon.code);
      saveAppliedCoupon(res.coupon.code);
      setCouponError(null);
      toast.success(`Coupon applied: ${res.coupon.code}`);
    } else {
      setAppliedCode(null);
      saveAppliedCoupon(null);
      const reason = res.reason || "Invalid coupon code";
      setCouponError(reason); // inline red text
      toast.error("Wrong coupon applied"); // toast message
    }
  }

  function onRemoveCoupon() {
    setAppliedCode(null);
    saveAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
    toast("Coupon removed", { icon: "✖️" });
  }

  // If selection changes and coupon becomes invalid, auto-clear (optional)
  useEffect(() => {
    if (!appliedCode) return;
    const res = applyCoupon(selectedItems, appliedCode);
    if (!res.ok) {
      setAppliedCode(null);
      saveAppliedCoupon(null);
      setCouponError(res.reason || "Coupon no longer valid for current items.");
      toast.error("Coupon no longer valid");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  // Empty state
  if (items.length === 0) {
    return (
      <>
        <SEO
          title="Shopping Cart"
          description="Review your cart and proceed to checkout. Shop premium 925 silver jewelry and gemstones at Rehman Stones."
          keywords="shopping cart, silver jewelry cart, checkout"
        />
        <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-black mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Browse our collections and discover something special!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-bold transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/wishlist"
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              View Wishlist
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review your items and proceed to secure checkout. Premium 925 silver jewelry with cash on delivery available."
        keywords="shopping cart, jewelry cart, silver rings cart"
      />
      <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black">Your Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT: items list */}
          <div>
            {/* Top bar: select all + delete */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <label className="flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded cursor-pointer accent-black"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                <span className="text-sm text-gray-700">
                  Select all ({items.length})
                </span>
              </label>
              {selectedItems.length > 0 && (
                <button
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  onClick={() => {
                    if (window.confirm(`Remove ${selectedItems.length} selected item(s)?`)) {
                      selectedItems.forEach((it) => removeItem(it.id));
                      toast.success(`Removed ${selectedItems.length} item(s)`);
                    }
                  }}
                >
                  Delete selected
                </button>
              )}
            </div>

            {/* Items */}
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  {/* checkbox */}
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 rounded cursor-pointer accent-black flex-shrink-0"
                    checked={selected.has(it.id)}
                    onChange={() => toggleOne(it.id)}
                  />

                  {/* image */}
                  <Link to={`/product/${it.id}`} className="relative group block flex-shrink-0">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-24 h-24 object-cover rounded-md border border-gray-200 bg-gray-50 group-hover:border-gray-400 transition-colors"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${it.id}`}
                      className="font-semibold text-black hover:text-gray-700 line-clamp-2 mb-2 block transition-colors"
                      title={it.name}
                    >
                      {it.name}
                    </Link>
                    <div className="text-sm text-gray-500 mb-3 capitalize">{it.category}</div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                        onClick={() => {
                          if (!isInWishlist(it.id)) {
                            addToWishlist({
                              id: it.id,
                              name: it.name,
                              price: it.price,
                              image: it.image,
                              category: it.category,
                            });
                            toast.success("Saved to wishlist");
                          }
                        }}
                      >
                        {isInWishlist(it.id) ? "♥ Saved" : "Save for later"}
                      </button>
                      <button
                        className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                        onClick={() => {
                          removeItem(it.id);
                          toast.success("Removed from cart");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price & Quantity */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-black mb-3">
                      {formatRs(it.price * it.qty)}
                    </div>
                    <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                      <button
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                        disabled={it.qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <div className="w-12 h-9 flex items-center justify-center border-x border-gray-300 font-semibold text-sm">{it.qty}</div>
                      <button
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={() => setQty(it.id, it.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14m-7-7h14" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{formatRs(it.price)} each</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: order summary */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              {/* Price Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalQty} items)</span>
                  <span className="font-semibold">{formatRs(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatRs(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">{shippingFee === 0 ? "FREE" : formatRs(shippingFee)}</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold">{formatRs(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Promo Code</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError(null);
                    }}
                    placeholder="Enter code"
                    className="flex-1 border border-gray-300 px-3 py-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-mono uppercase"
                  />
                  {!appliedCode ? (
                    <button
                      onClick={onApplyCoupon}
                      className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-md font-semibold text-sm transition-colors"
                    >
                      Apply
                    </button>
                  ) : (
                    <button 
                      onClick={onRemoveCoupon} 
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {couponError ? (
                  <p className="text-xs text-red-600 mt-1">{couponError}</p>
                ) : appliedCoupon ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {appliedCoupon.code} applied
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Try code: <span className="font-mono font-semibold">SAVE10</span></p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-semibold rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => navigate("/checkout")}
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 pt-4 mt-4 border-t border-gray-300">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Easy Returns</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
