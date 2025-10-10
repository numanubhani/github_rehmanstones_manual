// src/pages/OrderHistory.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ---------- Types (match your Checkout/localStorage shape) ---------- */
type Status =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type Payment =
  | { method: "COD" }
  | {
      method: "ONLINE";
      bankName?: string;
      accountNumber?: string;
      accountTitle?: string;
      txnRef?: string | null;
      proofDataUrl?: string | null;
    };

type OrderItem = {
  id: string | number;
  name: string;
  qty: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  status: Status;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    email?: string;
  };
  items: OrderItem[];
  shippingFee?: number;
  note?: string;
  payment?: Payment;
  /** (Optional) we’ll prefer this for account linking */
  userEmail?: string;
};

const LS_KEY = "orders";

/* ---------- helpers ---------- */
function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
const rs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
const statusLabel = (s: Status) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const statusClasses: Record<Status, string> = {
  PLACED: "bg-gray-100 text-gray-800 ring-gray-200",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
  PACKED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  SHIPPED: "bg-sky-50 text-sky-700 ring-sky-200",
  OUT_FOR_DELIVERY: "bg-amber-50 text-amber-700 ring-amber-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

function Badge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ring-1 ${statusClasses[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

/* ---------- Component ---------- */
export default function OrderHistory() {
  const { user } = useAuth();
  const [all, setAll] = useState<Order[]>(() =>
    readOrders().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  );

  // live sync if another tab modifies orders
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setAll(
          readOrders().sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
          )
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Filter orders belonging to this signed-in user.
  const myOrders = useMemo(() => {
    if (!user) return all; // not logged in? show everything on this device

    const email = user.email?.toLowerCase();
    const name = user.name?.toLowerCase();

    // Prefer strict email match (userEmail saved at checkout),
    // then fallback to customer.email, then fallback to customer.name.
    let mine = all.filter(
      (o) =>
        (o.userEmail && o.userEmail.toLowerCase() === email) ||
        (o.customer?.email && o.customer.email.toLowerCase() === email)
    );
    if (mine.length === 0 && name) {
      mine = all.filter((o) => o.customer?.name?.toLowerCase() === name);
    }
    // If still empty, show orders on this device so user isn’t confused
    return mine.length ? mine : all;
  }, [all, user]);

  const totals = useMemo(() => {
    const count = myOrders.length;
    const spent = myOrders.reduce((s, o) => {
      const sub = o.items.reduce((a, it) => a + it.qty * it.price, 0);
      return s + sub + (o.shippingFee ?? 0);
    }, 0);
    const delivered = myOrders.filter((o) => o.status === "DELIVERED").length;
    return { count, spent, delivered };
  }, [myOrders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Order History</h1>
            <p className="text-sm text-gray-600">
              {user ? (
                <>
                  Signed in as <b>{user.name}</b> ({user.email})
                </>
              ) : (
                "Orders saved on this device"
              )}
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </header>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card
            title="Total Orders"
            value={totals.count.toLocaleString()}
            icon="stack"
          />
          <Card title="Total Spent" value={rs(totals.spent)} icon="cash" />
          <Card
            title="Delivered"
            value={totals.delivered.toLocaleString()}
            icon="check"
          />
        </div>

        {/* List */}
        {myOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {myOrders.map((o) => {
              const subtotal = o.items.reduce(
                (s, it) => s + it.qty * it.price,
                0
              );
              const total = subtotal + (o.shippingFee ?? 0);
              const first = o.items[0];

              return (
                <div
                  key={o.id}
                  className="bg-white rounded-xl ring-1 ring-gray-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <code className="px-1.5 py-0.5 rounded bg-gray-100">
                        #{o.id}
                      </code>
                      <span className="text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                      <Badge status={o.status} />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-lg font-semibold">{rs(total)}</div>
                    </div>
                  </div>

                  {/* items preview */}
                  <div className="mt-3 flex items-center gap-3">
                    {first?.image ? (
                      <img
                        src={first.image}
                        alt=""
                        className="w-14 h-14 rounded-md object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-100 grid place-items-center text-gray-400">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M4 5h16v14H4zM4 16l4-4 3 3 4-4 5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {first?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""} •{" "}
                        {o.customer.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/track?id=${o.id}`}
                        className="px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50 text-sm"
                        title="Track & download invoice"
                      >
                        Track
                      </Link>
                      <DetailsButton order={o} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small bits ---------- */
function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: "stack" | "cash" | "check";
}) {
  const d =
    icon === "stack"
      ? "M4 7h16v3H4zM4 12h16v3H4zM4 17h16v3H4z"
      : icon === "cash"
      ? "M3 7h18v10H3zM6 10h3M15 14h3"
      : "M5 13l4 4L19 7";
  return (
    <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-black text-white grid place-items-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d={d} stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200 p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 grid place-items-center text-gray-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16v12H4zM4 13h16"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <h3 className="mt-3 text-lg font-semibold">No orders found</h3>
      <p className="text-sm text-gray-600">
        Jab aap order place karenge, yahan aapki history dikhegi.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block px-4 py-2 rounded-lg bg-black text-white"
      >
        Start shopping
      </Link>
    </div>
  );
}

/* --------- Details Button + Modal (inline so page is self-contained) --------- */
function DetailsButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50 text-sm"
      >
        View details
      </button>
      {open && (
        <OrderDetailsModal order={order} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const subtotal = order.items.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = order.shippingFee ?? 0;
  const total = subtotal + shipping;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[820px] top-10 bg-white rounded-2xl ring-1 ring-gray-200 shadow-xl max-h-[80vh] overflow-auto">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Order Details</h3>
            <span className="text-sm text-gray-500">
              #{order.id} • {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={order.status} />
            <button
              className="w-9 h-9 grid place-items-center rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* Items */}
          <div className="space-y-4">
            <div className="rounded-xl ring-1 ring-gray-200 p-4">
              <h4 className="font-medium">Items ({order.items.length})</h4>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">Product</th>
                      <th className="text-right px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Price</th>
                      <th className="text-right px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it) => (
                      <tr key={String(it.id)} className="border-t">
                        <td className="px-3 py-2">{it.name}</td>
                        <td className="px-3 py-2 text-right">{it.qty}</td>
                        <td className="px-3 py-2 text-right">{rs(it.price)}</td>
                        <td className="px-3 py-2 text-right">
                          {rs(it.qty * it.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-1 text-sm">
                <Row label="Subtotal" value={rs(subtotal)} />
                <Row label="Shipping" value={rs(shipping)} />
                <div className="flex items-center justify-between pt-1 font-semibold text-base">
                  <span>Grand Total</span>
                  <span>{rs(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer + Payment */}
          <aside className="space-y-4">
            <div className="rounded-xl ring-1 ring-gray-200 p-4">
              <h4 className="font-medium">Customer</h4>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-medium">{order.customer.name}</div>
                {order.customer.email && (
                  <div className="text-gray-600">{order.customer.email}</div>
                )}
                <div className="text-gray-600">{order.customer.phone}</div>
                <div className="mt-1">
                  {order.customer.address}, {order.customer.city}
                </div>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-gray-200 p-4">
              <h4 className="font-medium">Payment</h4>
              <div className="mt-2 text-sm text-gray-700">
                {!order.payment ? (
                  <div className="text-gray-500">Method not specified</div>
                ) : order.payment.method === "COD" ? (
                  <div>Cash on Delivery</div>
                ) : (
                  <div className="space-y-1">
                    <div>Online / Bank Transfer</div>
                    {order.payment.bankName && (
                      <RowMini label="Bank" value={order.payment.bankName} />
                    )}
                    {order.payment.accountTitle && (
                      <RowMini
                        label="Account Title"
                        value={order.payment.accountTitle}
                      />
                    )}
                    {order.payment.accountNumber && (
                      <RowMini
                        label="Account #"
                        value={order.payment.accountNumber}
                      />
                    )}
                    {order.payment.txnRef && (
                      <RowMini label="Txn Ref" value={order.payment.txnRef} />
                    )}
                    {order.payment.proofDataUrl && (
                      <a
                        href={order.payment.proofDataUrl}
                        target="_blank"
                        className="inline-block mt-1 text-blue-600 underline"
                      >
                        View payment proof
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {order.note && (
              <div className="rounded-xl ring-1 ring-gray-200 p-4">
                <h4 className="font-medium">Customer Note</h4>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {order.note}
                </p>
              </div>
            )}
          </aside>
        </div>
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
function RowMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
