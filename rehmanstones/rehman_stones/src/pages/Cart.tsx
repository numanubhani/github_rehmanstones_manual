// src/pages/Cart.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ORANGE = "#D8791F";
const formatRs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export default function Cart() {
  const navigate = useNavigate();
  const { items, setQty, removeItem, clear } = useCart();

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

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.id)),
    [items, selected]
  );

  // Voucher (front-end demo only)
  const [voucher, setVoucher] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round((subtotal * discountPct) / 100);
  const shippingFee = 0;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (code === "SAVE10") setDiscountPct(10);
    else if (code === "SAVE5") setDiscountPct(5);
    else setDiscountPct(0);
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-gray-600">
            Browse our collections and add items to your cart.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-5 py-2 rounded text-white"
            style={{ background: ORANGE }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* LEFT: items list */}
      <div className="space-y-3">
        {/* Top bar: select all + delete (no border, card style) */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3">
          <label className="flex items-center gap-3 select-none">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span className="font-medium">
              SELECT ALL ({items.length} ITEM{items.length > 1 ? "S" : ""})
            </span>
          </label>
          <button
            className="text-gray-600 hover:text-black inline-flex items-center gap-2"
            onClick={() => {
              selectedItems.forEach((it) => removeItem(it.id));
            }}
            title="Delete selected"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6h8Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            DELETE
          </button>
        </div>

        {/* Items as separate soft cards (no big borders) */}
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-lg shadow-sm px-4 py-4"
            >
              <div className="grid grid-cols-[24px_80px_1fr_auto] gap-3 items-center">
                {/* checkbox */}
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selected.has(it.id)}
                  onChange={() => toggleOne(it.id)}
                />

                {/* image */}
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-20 h-20 object-cover rounded-md"
                />

                {/* title + meta + actions */}
                <div className="min-w-0">
                  <Link
                    to="#"
                    className="block text-sm sm:text-base font-medium hover:underline line-clamp-2"
                    title={it.name}
                  >
                    {it.name}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">
                    No Brand, Category: {it.category}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-gray-500">
                    {/* wishlist (dummy) */}
                    <button
                      className="hover:text-black"
                      title="Save to wishlist"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    {/* remove */}
                    <button
                      className="hover:text-black"
                      title="Remove"
                      onClick={() => removeItem(it.id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6h8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* price + qty */}
                <div className="justify-self-end text-right">
                  <div className="text-[20px] font-semibold text-[#F85606]">
                    {formatRs(it.price)}
                  </div>
                  <div className="text-sm text-gray-400 line-through h-5">
                    {/* old price placeholder */}
                  </div>

                  {/* qty control (use ring instead of border) */}
                  <div className="mt-2 inline-flex items-center ring-1 ring-gray-200 rounded">
                    <button
                      className="w-8 h-8 grid place-items-center hover:bg-gray-50 rounded-l"
                      onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                      aria-label="Decrease"
                    >
                      –
                    </button>
                    <div className="w-10 text-center select-none">{it.qty}</div>
                    <button
                      className="w-8 h-8 grid place-items-center hover:bg-gray-50 rounded-r"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* bottom actions */}
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            className="text-sm text-gray-500 hover:text-black"
            onClick={clear}
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* RIGHT: order summary */}
      <aside className="lg:sticky lg:top-20 h-fit">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div className="mt-4 space-y-2">
            <Row
              label={`Subtotal (${totalQty} item${totalQty !== 1 ? "s" : ""})`}
              value={formatRs(subtotal)}
            />
            <Row label="Shipping Fee" value={formatRs(0)} />
            {discountPct > 0 && (
              <Row
                label={`Discount (${discountPct}%)`}
                value={`- ${formatRs(discount)}`}
              />
            )}
          </div>

          {/* Voucher */}
          <div className="mt-4 flex gap-2">
            <input
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Enter Voucher Code"
              className="flex-1 border px-3 py-2 outline-none rounded"
            />
            <button
              onClick={applyVoucher}
              className="px-4 py-2 text-white rounded"
              style={{ background: "#5BA1DB" }}
            >
              APPLY
            </button>
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-medium">Total</div>
            <div className="text-lg font-semibold text-[#F85606]">
              {formatRs(total)}
            </div>
          </div>

          {/* Checkout */}
          <button
            className="mt-5 w-full py-3 text-white font-semibold rounded"
            style={{ background: "#D8791F" }}
            onClick={() => navigate("/checkout")}
          >
            PROCEED TO CHECKOUT ({totalQty})
          </button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
