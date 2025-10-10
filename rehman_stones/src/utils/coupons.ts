// src/utils/coupons.ts
import type { CartItem } from "../context/CartContext";

export type Coupon = {
  code: string;                        // e.g. "SAVE10"
  label: string;                       // human readable
  type: "percent" | "flat";            // % or fixed amount
  value: number;                       // 10 -> 10%  |  500 -> Rs. 500
  minSubtotal?: number;                // optional min spend (on eligible items)
  category?: "ring" | "gemstone";      // optional category restriction
  maxDiscount?: number;                // cap for percent coupons
  expiresAt?: string;                  // ISO date; optional
};

export const COUPONS: Coupon[] = [
  {
    code: "SAVE10",
    label: "10% off everything",
    type: "percent",
    value: 10,
  },
  {
    code: "SAVE5",
    label: "5% sitewide",
    type: "percent",
    value: 5,
  },
  {
    code: "RINGS200",
    label: "Rs. 200 off rings (min Rs. 2,000)",
    type: "flat",
    value: 200,
    minSubtotal: 2000,
    category: "ring",
  },
  {
    code: "FEST25",
    label: "25% off (max Rs. 1,500, min Rs. 6,000)",
    type: "percent",
    value: 25,
    minSubtotal: 6000,
    maxDiscount: 1500,
    // expiresAt: "2025-12-31T23:59:59.000Z",
  },
];

export function getCoupon(code: string): Coupon | null {
  const c = COUPONS.find(
    (x) => x.code.toUpperCase() === code.trim().toUpperCase()
  );
  return c || null;
}

function nowISO() {
  return new Date().toISOString();
}

export function itemsSubtotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

/**
 * Apply a coupon against a list of items (e.g., selected items in Cart or all items in Checkout)
 */
export function applyCoupon(
  items: CartItem[],
  code: string
): { ok: true; discount: number; coupon: Coupon } | { ok: false; reason: string } {
  const coupon = getCoupon(code);
  if (!coupon) return { ok: false, reason: "Invalid coupon code" };

  // expiry check
  if (coupon.expiresAt && nowISO() > coupon.expiresAt) {
    return { ok: false, reason: "This coupon has expired" };
  }

  // eligible items (by category if restricted)
  const eligible = coupon.category
    ? items.filter((i) => i.category === coupon.category)
    : items;

  if (eligible.length === 0) {
    return {
      ok: false,
      reason: coupon.category
        ? `This coupon applies to ${coupon.category}s only`
        : "No eligible items",
    };
  }

  const eligibleSubtotal = itemsSubtotal(eligible);

  // min subtotal check (on eligible group)
  if (coupon.minSubtotal && eligibleSubtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Minimum spend for this coupon is Rs. ${coupon.minSubtotal.toLocaleString(
        "en-PK"
      )} on eligible items`,
    };
  }

  // compute discount
  let discount = 0;
  if (coupon.type === "flat") {
    discount = Math.min(coupon.value, eligibleSubtotal);
  } else {
    // percent
    discount = Math.round((eligibleSubtotal * coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }

  if (discount <= 0) {
    return { ok: false, reason: "This coupon does not reduce your total" };
  }

  return { ok: true, discount, coupon };
}

// (Optional) persist across pages (Cart -> Checkout)
const LS_COUPON = "applied-coupon-code";

export function saveAppliedCoupon(code: string | null) {
  if (!code) localStorage.removeItem(LS_COUPON);
  else localStorage.setItem(LS_COUPON, code.toUpperCase());
}

export function readAppliedCoupon(): string | null {
  const v = localStorage.getItem(LS_COUPON);
  return v || null;
}
