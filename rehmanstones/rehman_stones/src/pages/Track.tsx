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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Track your order</h1>

        {/* Search */}
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Order ID (e.g., RS-DEMO-1001)"
            className="flex-1 border px-3 py-2 outline-none bg-white"
          />
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-black text-white"
          >
            Track
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="mt-4 border bg-white p-4 text-red-600">
            No order found for <b>{params.get("id")}</b>. Try{" "}
            <code className="bg-gray-100 px-1">RS-DEMO-1001</code> for demo.
          </div>
        )}

        {!order ? null : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT: status + timeline */}
            <div className="space-y-4">
              <div className="border bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-gray-500">Order</div>
                    <div className="text-lg font-semibold">#{order.id}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs border bg-white ${
                      order.status === "CANCELLED"
                        ? "text-red-600 border-red-300"
                        : "text-gray-700"
                    }`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                {/* Stepper */}
                <Stepper status={order.status} />

                {/* Timeline */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Timeline</h3>
                  <ul className="space-y-2">
                    {STATUS_STEPS.map((s) => {
                      const done =
                        STATUS_STEPS.indexOf(s) <=
                        STATUS_STEPS.indexOf(order.status);
                      const tl = buildTimeline(order);
                      return (
                        <li
                          key={s}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <span
                            className={`mt-1 inline-block w-2 h-2 rounded-full ${
                              done ? "bg-emerald-600" : "bg-gray-300"
                            }`}
                          />
                          <div>
                            <div
                              className={done ? "font-medium" : "text-gray-500"}
                            >
                              {statusLabel(s)}
                            </div>
                            <div className="text-gray-500">
                              {fmtDate(tl[s])}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Demo-only: advance status */}
                  {order.status !== "DELIVERED" &&
                    order.status !== "CANCELLED" && (
                      <button
                        onClick={advanceStatus}
                        className="mt-4 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                        title="Demo only: simulate next status"
                      >
                        Advance status (demo)
                      </button>
                    )}
                </div>
              </div>
            </div>

            {/* RIGHT: order details */}
            <aside className="space-y-4">
              <div className="border bg-white p-5">
                <h3 className="font-semibold">Shipping details</h3>
                <div className="mt-2 text-sm text-gray-700">
                  <div className="font-medium">{order.customer.name}</div>
                  <div>{order.customer.phone}</div>
                  <div>
                    {order.customer.address}, {order.customer.city}
                  </div>
                </div>
              </div>

              <div className="border bg-white p-5">
                <h3 className="font-semibold">Items</h3>
                <div className="mt-3 space-y-3">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-14 h-14 object-cover border"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-sm font-medium line-clamp-2"
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
                        <div className="text-xs text-gray-500">
                          Qty: {it.qty}
                        </div>
                      </div>
                      <div className="font-medium">
                        Rs. {(it.price * it.qty).toLocaleString("en-PK")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-3 space-y-1 text-sm">
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
  return (
    <div className="mt-5">
      <div className="relative">
        <div className="h-1 bg-gray-200" />
        <div
          className="absolute top-0 h-1 bg-black transition-all"
          style={{
            width: `${(safeCurrent / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>
      <div className="mt-3 grid grid-cols-6 text-[11px] sm:text-xs">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <span
              className={`w-6 h-6 grid place-items-center rounded-full border text-[11px] ${
                i <= current ? "bg-black text-white border-black" : "bg-white"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`mt-1 text-center ${
                i <= current ? "text-gray-900" : "text-gray-500"
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
