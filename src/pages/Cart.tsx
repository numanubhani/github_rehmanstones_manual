import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";
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
  const { items, setQty, removeItem, clear } = useCart();
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

  const { discount, discountLabel } = useMemo(() => {
    if (!appliedCode) return { discount: 0, discountLabel: "" };
    const res = applyCoupon(selectedItems, appliedCode);
    if (res.ok) {
      const label = `${res.coupon.code} • ${res.coupon.label}`;
      return { discount: res.discount, discountLabel: label };
    }
    return { discount: 0, discountLabel: "" };
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black mb-2">Shopping Cart</h1>
        <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* LEFT: items list */}
        <div className="space-y-4">
          {/* Top bar: select all + delete */}
          <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
            <label className="flex items-center gap-3 select-none cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded cursor-pointer"
                checked={allSelected}
                onChange={toggleAll}
              />
              <span className="font-bold text-black">
                Select All ({items.length} {items.length === 1 ? 'Item' : 'Items'})
              </span>
            </label>
            <button
              className="text-red-600 hover:text-red-700 inline-flex items-center gap-2 font-semibold text-sm transition-colors"
              onClick={() => {
                if (selectedItems.length === 0) {
                  toast.error("No items selected");
                  return;
                }
                selectedItems.forEach((it) => removeItem(it.id));
                toast.success(`${selectedItems.length} item(s) removed`);
              }}
              title="Delete selected"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className={`px-6 py-5 ${idx !== items.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50 transition-colors`}
            >
              <div className="grid grid-cols-[auto_100px_1fr_auto] gap-5 items-center">
                {/* checkbox */}
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded cursor-pointer"
                  checked={selected.has(it.id)}
                  onChange={() => toggleOne(it.id)}
                />

                {/* image */}
                <div className="relative">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-50"
                  />
                </div>

                {/* title + meta + actions */}
                <div className="min-w-0 flex flex-col">
                  <Link
                    to={`/product/${it.id}`}
                    className="block text-base font-bold hover:text-gray-700 line-clamp-2 mb-1 transition-colors"
                    title={it.name}
                  >
                    {it.name}
                  </Link>
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="capitalize font-medium">{it.category}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                        isInWishlist(it.id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-600 hover:text-black"
                      }`}
                      onClick={() => {
                        if (!isInWishlist(it.id)) {
                          addToWishlist({
                            id: it.id,
                            name: it.name,
                            price: it.price,
                            image: it.image,
                            category: it.category,
                          });
                          toast.success("Moved to wishlist!");
                        }
                      }}
                      title="Move to wishlist"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isInWishlist(it.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isInWishlist(it.id) ? "In Wishlist" : "Move to Wishlist"}
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
                      title="Remove from cart"
                      onClick={() => {
                        removeItem(it.id);
                        toast.success("Item removed from cart");
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                {/* price + qty */}
                <div className="justify-self-end text-right space-y-3">
                  <div className="text-xl font-black text-black">
                    {formatRs(it.price * it.qty)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRs(it.price)} each
                  </div>
                  <div className="inline-flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      className="w-10 h-10 grid place-items-center hover:bg-gray-100 font-bold text-lg transition-colors"
                      onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="w-12 text-center select-none font-bold text-black">{it.qty}</div>
                    <button
                      className="w-10 h-10 grid place-items-center hover:bg-gray-100 font-bold text-lg transition-colors"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-black hover:text-gray-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
          </div>
        </div>

        {/* RIGHT: order summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-6 text-white">
            <h2 className="text-2xl font-black mb-1">Order Summary</h2>
            <p className="text-gray-300 text-sm">{totalQty} {totalQty === 1 ? 'item' : 'items'} selected</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                <span className="font-bold text-black">{formatRs(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">Coupon Discount</span>
                  <span className="font-bold">- {formatRs(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="font-bold text-green-600">{shippingFee === 0 ? "FREE" : formatRs(shippingFee)}</span>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-black">Total</span>
                <span className="text-2xl font-black text-black">{formatRs(total)}</span>
              </div>
            </div>

            {/* Coupon UI */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-black mb-3">
                Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="Enter code"
                  className="flex-1 border-2 border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-black transition-all font-mono font-bold text-sm"
                  aria-invalid={couponError ? "true" : "false"}
                  aria-describedby={couponError ? "coupon-error" : undefined}
                />
                {!appliedCode ? (
                  <button
                    onClick={onApplyCoupon}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Apply
                  </button>
                ) : (
                  <button 
                    onClick={onRemoveCoupon} 
                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Inline message area */}
              {couponError ? (
                <p
                  id="coupon-error"
                  className="mt-2 text-xs text-red-600 font-semibold"
                  aria-live="polite"
                >
                  ⚠ {couponError}
                </p>
              ) : appliedCoupon ? (
                <p className="mt-2 text-xs text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg">
                  ✓ {appliedCoupon.code} applied — {appliedCoupon.label}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Try: <code className="bg-gray-200 px-2 py-0.5 rounded font-mono font-bold">SAVE10</code>
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              className="w-full py-4 bg-black hover:bg-gray-800 text-white font-black text-base rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate("/checkout")}
              disabled={selectedItems.length === 0}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Proceed to Checkout ({totalQty})
              </span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-semibold">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Easy Returns</span>
              </div>
            </div>

            {/* Clear Cart */}
            <button
              className="w-full text-sm text-gray-600 hover:text-red-600 font-semibold transition-colors underline"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your cart?")) {
                  clear();
                  toast.success("Cart cleared");
                }
              }}
            >
              Clear Entire Cart
            </button>
          </div>
        </div>
        </aside>
      </div>
    </div>
  );
}
