// src/pages/Checkout.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import {
  applyCoupon,
  readAppliedCoupon,
  saveAppliedCoupon,
  itemsSubtotal,
  getCoupon,
} from "../utils/coupons";

/* -------------------- Types & helpers -------------------- */
type Form = {
  name: string;
  phone: string;
  address: string;
  city: string;
};
type PaymentMethod = "COD" | "ONLINE";

const BANK = {
  name: "Meezan Bank",
  accountNumber: "05820111753366",
  accountTitle: "Rehman Stones",
};

const LS_KEY = "orders";
function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeOrders(orders: any[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(orders));
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {}
}

/* -------------------- Component -------------------- */
export default function Checkout() {
  const navigate = useNavigate();
  const { items, clear } = useCart();

  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [txnRef, setTxnRef] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Coupon state (use state, not just direct read)
  const [appliedCode, setAppliedCode] = useState<string | null>(() =>
    readAppliedCoupon()
  );
  const appliedCoupon = appliedCode ? getCoupon(appliedCode) : null;

  const subtotal = useMemo(() => itemsSubtotal(items), [items]);
  const shipping = 0;
  const discount = useMemo(() => {
    if (!appliedCode) return 0;
    const res = applyCoupon(items, appliedCode);
    return res.ok ? res.discount : 0;
  }, [items, appliedCode]);
  const total = Math.max(0, subtotal - discount + shipping);

  function handleChange<K extends keyof Form>(key: K, v: Form[K]) {
    setForm((f) => ({ ...f, [key]: v }));
  }

  async function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (f) {
      const url = await fileToDataUrl(f);
      setProofPreview(url);
    } else {
      setProofPreview(null);
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (paymentMethod === "ONLINE" && !proofPreview) {
      setError("Please upload payment proof (screenshot or PDF).");
      return;
    }

    setPlacing(true);
    try {
      const orderId = `RS-${Date.now().toString().slice(-8)}`;
      const order = {
        id: orderId,
        status: "PLACED",
        createdAt: new Date().toISOString(),
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          image: it.image,
          qty: it.qty,
          price: it.price,
          category: it.category,
        })),
        shippingFee: shipping,
        note,
        coupon: appliedCoupon
          ? { code: appliedCoupon.code, label: appliedCoupon.label, discount }
          : null,
        payment: {
          method: paymentMethod,
          ...(paymentMethod === "ONLINE"
            ? {
                bankName: BANK.name,
                accountNumber: BANK.accountNumber,
                accountTitle: BANK.accountTitle,
                txnRef: txnRef || null,
                proofDataUrl: proofPreview,
              }
            : {}),
        },
      };

      const existing = readOrders();
      existing.push(order);
      writeOrders(existing);
      clear();
      saveAppliedCoupon(null); // clear coupon after placing order
      setAppliedCode(null);
      toast.success(`Order placed successfully! Tracking ID: ${orderId}`);
      navigate(`/track?id=${orderId}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <SEO
        title="Checkout - Secure Payment"
        description="Complete your order securely. Cash on delivery available. Buy premium 925 silver jewelry with confidence."
        keywords="checkout, secure payment, cash on delivery, silver jewelry checkout"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Checkout</h1>
              <p className="text-gray-600 text-sm">Complete your order</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-sm font-medium text-black">Information</span>
            </div>
            <div className="h-px flex-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm text-gray-500">Payment</span>
            </div>
            <div className="h-px flex-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-sm text-gray-500">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT: form */}
          <form onSubmit={placeOrder} className="space-y-6">

            {/* Shipping Details */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Shipping Information
                </h2>
                <span className="text-xs text-gray-500">Step 1 of 3</span>
              </div>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => handleChange("name", v)}
                  placeholder="Enter your full name"
                  required
                />
                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => handleChange("phone", v)}
                  placeholder="03xx-xxxxxxx"
                  required
                />
                <Field
                  label="Delivery Address"
                  value={form.address}
                  onChange={(v) => handleChange("address", v)}
                  placeholder="Street address, house/apartment number"
                />
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => handleChange("city", v)}
                  placeholder="Enter your city"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                    placeholder="Any special instructions for your order..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  Payment Method
                </h2>
                <span className="text-xs text-gray-500">Step 2 of 3</span>
              </div>

              <div className="space-y-3">
                <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-black bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="paymethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 w-5 h-5 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-black flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cash on Delivery
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold">Recommended</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Pay with cash when your order is delivered
                      </div>
                    </div>
                  </div>
                </label>

                <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-black bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="paymethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="mt-1 w-5 h-5 accent-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-black flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Bank Transfer
                      </div>
                      <div className="text-sm text-gray-600">
                        Transfer funds and upload payment proof
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === "ONLINE" && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Bank Account Details
                    </h3>
                    <div className="grid gap-3">
                      <InfoRow label="Bank Name" value={BANK.name} />
                      <InfoRow label="Account Title" value={BANK.accountTitle} copyable />
                      <InfoRow label="Account Number" value={BANK.accountNumber} copyable />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference ID <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Enter transaction reference number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Proof <span className="text-red-600">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleProofChange}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Click to upload screenshot or PDF
                        </span>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (Max 10MB)</p>
                      </label>
                    </div>
                    {proofPreview && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">Uploaded File</span>
                          <button
                            type="button"
                            onClick={() => setProofPreview(null)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        {proofPreview.startsWith("data:image") ? (
                          <img
                            src={proofPreview}
                            alt="Payment proof"
                            className="max-h-40 object-contain mx-auto rounded"
                          />
                        ) : (
                          <a
                            href={proofPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View uploaded file
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700 font-medium">{error}</span>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={placing || items.length === 0}
              className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Place Order - Rs. {total.toLocaleString("en-PK")}
                </>
              )}
            </button>
          </form>

          {/* RIGHT: Order Summary */}
          <aside className="lg:sticky lg:top-8 h-fit space-y-5">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="font-bold text-lg">Order Summary</h2>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-1">
                    {items.map((it) => (
                      <div key={it.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-20 h-20 object-cover rounded-md border-2 border-gray-300"
                            />
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                              {it.qty}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-black line-clamp-2 mb-1.5" title={it.name}>
                              {it.name}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              Rs. {it.price.toLocaleString("en-PK")} each
                            </div>
                            <div className="text-base font-bold text-black">
                              Rs. {(it.price * it.qty).toLocaleString("en-PK")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-4 space-y-2.5 text-sm">
                    <Row
                      label="Subtotal"
                      value={`Rs. ${subtotal.toLocaleString("en-PK")}`}
                    />
                    {appliedCoupon && discount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Discount ({appliedCoupon.code})
                        </span>
                        <span className="font-semibold">-Rs. {discount.toLocaleString("en-PK")}</span>
                      </div>
                    )}
                    <Row
                      label="Shipping"
                      value={shipping === 0 ? "FREE" : `Rs. ${(shipping as number).toLocaleString("en-PK")}`}
                    />
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-bold text-black">Total</span>
                      <span className="font-bold text-black text-2xl">Rs. {total.toLocaleString("en-PK")}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-bold text-green-900">Why Shop With Us</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">Secure Payment</div>
                    <div className="text-green-700 text-xs mt-0.5">256-bit SSL encryption</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">Cash on Delivery</div>
                    <div className="text-green-700 text-xs mt-0.5">Pay when you receive</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">Easy Returns</div>
                    <div className="text-green-700 text-xs mt-0.5">7-day hassle-free policy</div>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}

/* -------------------- Small UI bits -------------------- */
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex-1">
        <div className="text-xs text-gray-600 font-medium mb-1">{label}</div>
        <div className="font-semibold text-black text-sm">{value}</div>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={() => copy(value)}
          className="text-xs bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
        >
          Copy
        </button>
      )}
    </div>
  );
}
