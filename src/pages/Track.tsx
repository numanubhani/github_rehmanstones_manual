// src/pages/Track.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Status =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type OrderItem = {
  id: string | number;
  name: string;
  image: string;
  qty: number;
  price: number; // per unit
};

type Order = {
  id: string;
  status: Status;
  createdAt: string; // ISO
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: OrderItem[];
  // optional timestamps for each status
  timeline?: Partial<Record<Status, string>>;
  shippingFee?: number;
};

const STATUS_STEPS: Status[] = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusLabel = (s: Status) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// ------- LocalStorage helpers -------
const LS_KEY = "orders";

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(orders));
}

// ------- Demo orders (fallback when not found) -------
const DEMO_ORDERS: Record<string, Order> = {
  "RS-DEMO-1001": {
    id: "RS-DEMO-1001",
    status: "SHIPPED",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    customer: {
      name: "Numan",
      phone: "03xx-xxxxxxx",
      address: "19-A Model Town",
      city: "Lahore",
    },
    items: [
      {
        id: 1,
        name: "Silver Band Ring",
        qty: 1,
        price: 3500,
        image:
          "https://images.unsplash.com/photo-1546456073-6712f79251bb?q=80&w=800",
      },
      {
        id: 3,
        name: "Amethyst Oval Gem",
        qty: 1,
        price: 7800,
        image:
          "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800",
      },
    ],
    shippingFee: 0,
  },
};

function buildTimeline(order: Order): Required<Order>["timeline"] {
  // If explicit timeline present, use it.
  if (order.timeline) return order.timeline as Required<Order>["timeline"];

  // Otherwise synthesize using createdAt (+N days per step)
  const base = new Date(order.createdAt);
  const idx = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s === order.status)
  );
  const tl: Partial<Record<Status, string>> = {};
  for (let i = 0; i <= idx; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    tl[STATUS_STEPS[i]] = d.toISOString();
  }
  return tl as Required<Order>["timeline"];
}

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "--");

// ---------- Invoice (letterhead) ----------
function downloadInvoice(order: Order) {
  const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal + (order.shippingFee ?? 0);

  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td>${i.name}</td>
        <td style="text-align:center">${i.qty}</td>
        <td style="text-align:right">Rs. ${i.price.toLocaleString("en-PK")}</td>
        <td style="text-align:right">Rs. ${(i.qty * i.price).toLocaleString(
          "en-PK"
        )}</td>
      </tr>`
    )
    .join("");

  const htmlContent = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice - ${order.customer.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    background: #f9fafb;
    padding: 40px 20px;
    color: #1f2937;
  }
  .container {
    max-width: 850px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  .header {
    background: #000000;
    padding: 32px 40px;
    color: white;
    border-bottom: 3px solid #000;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    color: #000;
  }
  .brand-name {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.5px;
  }
  .header-right {
    text-align: right;
  }
  .invoice-title {
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  .invoice-meta {
    font-size: 13px;
    color: #9ca3af;
    font-weight: 600;
  }
  .content {
    padding: 48px 40px;
  }
  .section {
    margin-bottom: 36px;
  }
  .section-title {
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #000;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
  }
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 48px;
  }
  .detail-box {
    background: #ffffff;
    padding: 24px;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
  }
  .detail-label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 12px;
    letter-spacing: 1px;
  }
  .detail-value {
    font-size: 15px;
    font-weight: 600;
    color: #000;
    line-height: 1.8;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  thead {
    background: #000;
  }
  th {
    padding: 14px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: #fff;
    letter-spacing: 1px;
  }
  th.right { text-align: right; }
  td {
    padding: 18px 16px;
    font-size: 15px;
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
    font-weight: 500;
  }
  td.right { text-align: right; font-weight: 700; color: #000; }
  tbody tr:last-child td { border-bottom: none; }
  .totals {
    margin-top: 40px;
    padding: 28px;
    background: #f9fafb;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }
  .total-row.grand {
    font-size: 24px;
    font-weight: 900;
    padding: 20px 0 0 0;
    margin-top: 16px;
    border-top: 3px solid #000;
    color: #000;
  }
  .footer {
    background: #000;
    padding: 24px 40px;
    text-align: center;
  }
  .footer-text {
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.8;
  }
  .footer-brand {
    font-weight: 900;
    color: #fff;
    margin-top: 12px;
    font-size: 16px;
    letter-spacing: 2px;
  }
  @media print {
    body { background: white; padding: 0; }
    .container { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-logo">RS</div>
          <div>
            <div class="brand-name">REHMAN STONES</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Premium Silver Jewelry</div>
          </div>
        </div>
        <div class="header-right">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-meta">Order #${order.id}</div>
          <div class="invoice-meta">${new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}</div>
      </div>
      </div>
    </div>

    <div class="content">

      <div class="details-grid">
        <div class="detail-box">
          <div class="detail-label">Bill To</div>
          <div class="detail-value">
            <strong>${order.customer.name}</strong><br/>
            ${order.customer.phone}<br/>
            ${order.customer.address}<br/>
            ${order.customer.city}
          </div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Order Information</div>
          <div class="detail-value">
            <strong>Status:</strong> ${statusLabel(order.status)}<br/>
            <strong>Payment:</strong> Cash on Delivery<br/>
            <strong>Items:</strong> ${order.items.length} item${order.items.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Details</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="right">Qty</th>
              <th class="right">Price</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>Rs. ${subtotal.toLocaleString("en-PK")}</span>
          </div>
          <div class="total-row">
            <span>Shipping Fee</span>
            <span style="color: ${order.shippingFee === 0 ? '#10b981' : '#000'}; font-weight: 700;">${
              order.shippingFee === 0
                ? "FREE"
                : `Rs. ${order.shippingFee.toLocaleString("en-PK")}`
            }</span>
          </div>
          <div class="total-row grand">
            <span>GRAND TOTAL</span>
            <span>Rs. ${total.toLocaleString("en-PK")}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        Thank you for shopping with us!<br/>
        Questions? Email us at <strong style="color: #fff;">info@rehmanstones.com</strong> or call <strong style="color: #fff;">+92 300 1234567</strong>
      </div>
      <div class="footer-brand">RS • REHMAN STONES</div>
    </div>
  </div>
</body>
</html>`;

  // Create a Blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  // Use customer name for filename, sanitize it for filesystem
  const sanitizedName = order.customer.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Invoice_${sanitizedName}_${order.id}.html`;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Track() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get("id") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Auto-search if ?id= present
  useEffect(() => {
    const q = params.get("id");
    if (q) handleSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => (order ? order.items.reduce((s, it) => s + it.price * it.qty, 0) : 0),
    [order]
  );
  const shipping = order?.shippingFee ?? 0;
  const total = subtotal + shipping;

  function handleSearch(q?: string) {
    const query = (q ?? input).trim();
    if (!query) return;

    // Update URL
    setParams((p) => {
      p.set("id", query);
      return p;
    });

    // 1) LS orders
    const found = readOrders().find((o) => o.id === query);
    if (found) {
      setOrder(found);
      setNotFound(false);
      return;
    }

    // 2) Demo orders
    if (DEMO_ORDERS[query]) {
      setOrder(DEMO_ORDERS[query]);
      setNotFound(false);
      return;
    }

    setOrder(null);
    setNotFound(true);
  }

  // Simulate progressing status (for demo only)
  function advanceStatus() {
    if (!order) return;
    const idx = STATUS_STEPS.findIndex((s) => s === order.status);
    if (idx === -1 || idx === STATUS_STEPS.length - 1) return;
    const next = STATUS_STEPS[idx + 1];
    const updated: Order = {
      ...order,
      status: next,
      timeline: {
        ...(order.timeline ?? {}),
        [next]: new Date().toISOString(),
      },
    };
    setOrder(updated);

    // persist if it's a "real" LS order
    const stored = readOrders();
    const pos = stored.findIndex((o) => o.id === updated.id);
    if (pos >= 0) {
      stored[pos] = updated;
      writeOrders(stored);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
        {/* Header - Only show when no order is displayed */}
        {!order && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-3xl mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-black mb-6 tracking-tight">Track Your Order</h1>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">Enter your order ID to get real-time updates and delivery status</p>
          </div>
        )}

        {/* Search Box - Compact when order is displayed */}
        <div className={`mx-auto transition-all duration-500 ${order ? 'max-w-full mb-10' : 'max-w-3xl mb-20'}`}>
          <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-500 ${order ? 'border-gray-300 shadow-md' : 'border-gray-200 shadow-2xl'}`}>
            <div className={`transition-all duration-500 ${order ? 'p-5' : 'p-10'}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter your order ID"
                    className={`w-full px-6 border-2 border-gray-300 rounded-xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-semibold ${order ? 'py-3.5 text-sm' : 'py-5 text-lg'}`}
                  />
                  {!order && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono tracking-wider">
                      RS-XXXX-XXXX
                    </div>
                  )}
                </div>
          <button
            onClick={() => handleSearch()}
                  className={`bg-black hover:bg-gray-900 text-white rounded-xl font-black transition-all hover:shadow-2xl whitespace-nowrap flex items-center justify-center gap-2 ${order ? 'px-8 py-3.5 text-sm' : 'px-12 py-5 text-lg'}`}
          >
                  <svg className={order ? 'w-5 h-5' : 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {order ? 'New Search' : 'Track Order'}
          </button>
              </div>
              {!order && (
                <div className="mt-6 flex items-start gap-3 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-900">
                    <span className="font-bold">Need help?</span> Your order ID was sent to your email. Try <code className="bg-blue-200 px-2 py-1 rounded font-mono font-bold">RS-DEMO-1001</code> for demo.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 p-8 text-red-700 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-black text-2xl mb-2 text-red-900">Order Not Found</div>
                  <div className="text-red-800 text-base mb-4">
                    We couldn't find any order matching <span className="font-mono font-bold bg-red-200 px-2 py-1 rounded">{params.get("id")}</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="text-sm text-gray-700">
                      <span className="font-bold text-black">Try our demo order:</span>{" "}
                      <code className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono font-bold text-black border border-gray-300">RS-DEMO-1001</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!order ? null : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* LEFT: status + timeline */}
            <div className="space-y-8">
              {/* Order Status Card */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
                <div className="relative bg-gradient-to-br from-black via-gray-900 to-black p-10 text-white overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-[0.07]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between gap-6 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <span className="text-black font-black text-lg">RS</span>
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Order Details</div>
                        </div>
                        <div className="text-4xl font-black mb-2 tracking-tight">#{order.id}</div>
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                  <span
                          className={`px-6 py-3 rounded-xl text-sm font-black shadow-2xl ${
                      order.status === "CANCELLED"
                              ? "bg-red-500 text-white"
                              : order.status === "DELIVERED"
                              ? "bg-green-500 text-white"
                              : "bg-white text-black"
                    }`}
                  >
                    {statusLabel(order.status)}
                  </span>
                        <div className="text-xs text-gray-400 font-semibold">
                          {Math.round((STATUS_STEPS.indexOf(order.status) / (STATUS_STEPS.length - 1)) * 100)}% Complete
                        </div>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-3xl font-black mb-1">{order.items.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Items</div>
                      </div>
                      <div className="text-center border-x border-white/10">
                        <div className="text-3xl font-black mb-1">Rs. {(subtotal + shipping).toLocaleString("en-PK")}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Total Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black mb-1">{shipping === 0 ? "FREE" : "PAID"}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Shipping</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-gradient-to-b from-white to-gray-50">
                {/* Stepper */}
                <Stepper status={order.status} />

                  {/* Demo-only: advance status */}
                  {order.status !== "DELIVERED" &&
                    order.status !== "CANCELLED" && (
                      <button
                        onClick={advanceStatus}
                        className="mt-8 w-full px-4 py-3.5 text-sm font-bold rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400 transition-all"
                        title="Demo only: simulate next status"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Simulate Next Status (Demo)
                        </span>
                      </button>
                    )}
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-black">Delivery Timeline</h3>
                    <p className="text-sm text-gray-600 mt-1">Track every step of your order</p>
                  </div>
                </div>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-gradient-to-b from-black via-gray-400 to-gray-200 rounded-full" />
                  
                  <ul className="space-y-6 relative">
                    {STATUS_STEPS.map((s) => {
                      const done =
                        STATUS_STEPS.indexOf(s) <=
                        STATUS_STEPS.indexOf(order.status);
                      const tl = buildTimeline(order);
                      const isActive = s === order.status;
                      return (
                        <li
                          key={s}
                          className="flex items-start gap-5 relative"
                        >
                          <span
                            className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-xl border-2 shadow-lg transition-all ${
                              done 
                                ? isActive
                                  ? "bg-black border-black scale-110"
                                  : "bg-green-500 border-green-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {done && !isActive && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {isActive && (
                              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            )}
                          </span>
                          <div className="flex-1 pb-2">
                            <div
                              className={`font-bold text-lg mb-1 ${
                                done ? "text-black" : "text-gray-400"
                              }`}
                            >
                              {statusLabel(s)}
                            </div>
                            <div className={`text-sm font-medium ${done ? "text-gray-600" : "text-gray-400"}`}>
                              {done ? fmtDate(tl[s]) : "Awaiting update"}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT: order details + invoice */}
            <aside className="space-y-8">
              {/* Shipping Details */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black">Delivery Address</h3>
                    <p className="text-sm text-gray-600">Where we'll ship your order</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="font-black text-xl text-black mb-3">{order.customer.name}</div>
                  <div className="space-y-2">
                    <div className="text-gray-700 flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-semibold">{order.customer.phone}</span>
                    </div>
                    <div className="text-gray-700 flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-semibold">{order.customer.address}, {order.customer.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-black">Order Items</h3>
                    <p className="text-sm text-gray-600">{order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-20 h-20 object-cover rounded-xl bg-white border-2 border-gray-200 shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-base font-bold line-clamp-2 text-black mb-1"
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
                        <div className="text-sm text-gray-600 font-semibold">
                          Quantity: {it.qty}
                        </div>
                      </div>
                      <div className="font-black text-xl text-black">
                        Rs. {(it.price * it.qty).toLocaleString("en-PK")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-semibold">Subtotal</span>
                    <span className="font-bold text-black">Rs. {subtotal.toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-semibold">Shipping Fee</span>
                    <span className="font-bold text-black">{shipping === 0 ? <span className="text-green-600">FREE</span> : `Rs. ${shipping.toLocaleString("en-PK")}`}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t-2 border-black">
                    <span className="font-black text-xl text-black">TOTAL</span>
                    <span className="font-black text-2xl text-black">Rs. {total.toLocaleString("en-PK")}</span>
                  </div>
                </div>
              </div>

              {/* Invoice card */}
              <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-2xl border-2 border-gray-900 p-10 text-white overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-[0.06]">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black text-2xl mb-1">Invoice</h3>
                      <p className="text-gray-400 text-sm font-semibold">Official Receipt</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-base mb-8 leading-relaxed">
                    Download your professional invoice with complete order details and RS branding
                </p>
                <button
                    onClick={() => downloadInvoice(order)}
                    className="w-full px-6 py-5 bg-white hover:bg-gray-100 text-black rounded-2xl font-black transition-all shadow-2xl hover:shadow-none hover:scale-[1.02] flex items-center justify-center gap-3 text-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Invoice
                </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Stepper({ status }: { status: Status }) {
  const current = STATUS_STEPS.indexOf(status);
  const safeCurrent = Math.max(0, Math.min(current, STATUS_STEPS.length - 1));
  const progress = (safeCurrent / (STATUS_STEPS.length - 1)) * 100;
  
  return (
    <div className="mt-8">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-black via-gray-800 to-gray-700 rounded-full transition-all duration-700 shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Steps */}
      <div className="mt-8 grid grid-cols-6 gap-2 text-[10px] sm:text-xs">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <span
              className={`w-10 h-10 sm:w-12 sm:h-12 grid place-items-center rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 mb-3 ${
                i <= current
                  ? "bg-black text-white shadow-2xl scale-110"
                  : "bg-gray-200 text-gray-400 shadow-md"
              }`}
            >
              {i <= current ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </span>
            <span
              className={`text-center leading-tight font-bold ${
                i <= current ? "text-black" : "text-gray-400"
              }`}
            >
              {statusLabel(s)}
            </span>
          </div>
        ))}
      </div>
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
