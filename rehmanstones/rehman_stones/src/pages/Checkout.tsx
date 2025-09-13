// src/pages/Checkout.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

/* -------------------- Types & helpers -------------------- */
type Form = {
  name: string;
  phone: string;
  address: string;
  city: string;
};
type PaymentMethod = "COD" | "ONLINE";

const ORANGE = "#D8791F";
const BANK = {
  name: "Meezan Bank",
  accountNumber: "05820105879482",
  accountTitle: "Numan",
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

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const shipping = 0;
  const total = subtotal + shipping;

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
        status: "PLACED" as const,
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
        })),
        shippingFee: shipping,
        note,
        payment: {
          method: paymentMethod,
          ...(paymentMethod === "ONLINE"
            ? {
                bankName: BANK.name,
                accountNumber: BANK.accountNumber,
                accountTitle: BANK.accountTitle,
                txnRef: txnRef || null,
                proofDataUrl: proofPreview, // demo only; backend later
              }
            : {}),
        },
      };

      const existing = readOrders();
      existing.push(order);
      writeOrders(existing);

      clear();

      // Toast on success (bottom-right from <Toaster /> in main.tsx)
      toast.success(`Order placed successfully! Tracking ID: ${orderId}`);

      navigate(`/track?id=${orderId}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT: form */}
        <form onSubmit={placeOrder} className="space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-gray-500">
              Enter your shipping details & payment method.
            </p>
          </div>

          {/* Shipping details */}
          <div className="bg-white p-5 rounded-lg shadow-sm space-y-4">
            <Field
              label="Full name *"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              placeholder="Numan"
            />
            <Field
              label="Phone *"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
              placeholder="03xx-xxxxxxx"
            />
            <Field
              label="Address"
              value={form.address}
              onChange={(v) => handleChange("address", v)}
              placeholder="Street, house, etc."
            />
            <Field
              label="City"
              value={form.city}
              onChange={(v) => handleChange("city", v)}
              placeholder="Lahore"
            />
            <div>
              <label className="block text-sm text-gray-600">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full border px-3 py-2 outline-none min-h-[80px]"
                placeholder="Any special instructions..."
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white p-5 rounded-lg shadow-sm space-y-4">
            <h2 className="font-semibold">Payment</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <div>
                <div className="font-medium">Cash on Delivery (COD)</div>
                <div className="text-sm text-gray-500">
                  Pay in cash to the courier when your order arrives.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymethod"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              <div>
                <div className="font-medium">
                  Online Payment (Bank Transfer)
                </div>
                <div className="text-sm text-gray-500">
                  Transfer to our account and upload the payment proof.
                </div>
              </div>
            </label>

            {paymentMethod === "ONLINE" && (
              <div className="mt-3 p-4 rounded-lg bg-gray-50">
                <h3 className="font-medium">Bank Details</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <InfoRow label="Bank" value={BANK.name} />
                  <InfoRow
                    label="Account Title"
                    value={BANK.accountTitle}
                    copyable
                  />
                  <InfoRow
                    label="Account Number"
                    value={BANK.accountNumber}
                    copyable
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600">
                    Transaction / Reference ID (optional)
                  </label>
                  <input
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 outline-none"
                    placeholder="e.g. 9K3X2…"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600">
                    Upload Payment Proof (required)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleProofChange}
                    className="mt-1 block w-full text-sm"
                  />
                  {proofPreview && (
                    <div className="mt-3 bg-white p-2 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-600 mb-1">Preview</div>
                      {/* If image, show image; if pdf, show link */}
                      {proofPreview.startsWith("data:image") ? (
                        <img
                          src={proofPreview}
                          alt="Payment proof"
                          className="max-h-64 object-contain mx-auto"
                        />
                      ) : (
                        <a
                          href={proofPreview}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-blue-600"
                        >
                          View uploaded file
                        </a>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: upload a small screenshot/photo (&lt; 1–2 MB) so it
                    saves quickly.
                  </p>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          {/* Submit bar */}
          <div className="bg-white p-5 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm">Total</div>
              <div className="text-xl font-semibold">
                Rs. {total.toLocaleString("en-PK")}
              </div>
            </div>
            <button
              type="submit"
              disabled={placing || items.length === 0}
              className="px-6 py-3 text-white font-semibold disabled:opacity-60"
              style={{ background: ORANGE }}
            >
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </form>

        {/* RIGHT: summary */}
        <aside className="space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="mt-3 space-y-3">
              {items.length === 0 && (
                <div className="text-gray-500 text-sm">Your cart is empty.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-14 h-14 object-cover rounded-md bg-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-medium"
                      title={it.name}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {it.name}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                  </div>
                  <div className="font-medium">
                    Rs. {(it.price * it.qty).toLocaleString("en-PK")}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals (no divider line) */}
            <div className="mt-4 pt-3 space-y-1 text-sm">
              <Row
                label="Subtotal"
                value={`Rs. ${subtotal.toLocaleString("en-PK")}`}
              />
              <Row
                label="Shipping"
                value={`Rs. ${shipping.toLocaleString("en-PK")}`}
              />
              <div className="flex items-center justify-between pt-1 font-semibold text-lg">
                <span>Total</span>
                <span>Rs. {total.toLocaleString("en-PK")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Secure checkout</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>SSL encryption</li>
              <li>Cash on delivery available</li>
              <li>7-day easy returns</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------- Small UI bits -------------------- */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border px-3 py-2 outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
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
    <div className="flex items-center justify-between gap-2">
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={() => copy(value)}
          className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
        >
          Copy
        </button>
      )}
    </div>
  );
}
