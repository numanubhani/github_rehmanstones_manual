import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ---------------- Types ---------------- */
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

type Order = {
  id: string;
  status: Status;
  createdAt: string;
  customer: { name: string; phone: string; address: string; city: string };
  items: { id: string | number; name: string; qty: number; price: number }[];
  shippingFee?: number;
  note?: string;
  payment?: Payment; // optional from checkout
};

/* --------------- Storage helpers --------------- */
const KEY = "orders";
const STATUSES: Status[] = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function read(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

/* --------------- UI helpers --------------- */
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
      title={statusLabel(status)}
    >
      {statusLabel(status)}
    </span>
  );
}

function nextStatus(s: Status): Status | null {
  const i = STATUSES.indexOf(s);
  if (i < 0) return null;
  if (s === "DELIVERED" || s === "CANCELLED") return null;
  return STATUSES[i + 1] ?? null;
}

const rs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

/* --------------- Component --------------- */
type TabKey = "ACTIVE" | "DELIVERED";
const PAGE_SIZE = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(() =>
    read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  );

  const [tab, setTab] = useState<TabKey>("ACTIVE");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Details modal
  const [openOrder, setOpenOrder] = useState<Order | null>(null);

  // cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        setOrders(
          read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refresh() {
    setOrders(
      read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    );
    toast.success("Orders refreshed");
  }

  function setStatus(id: string, status: Status) {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status } : o));
      write(next);
      return next;
    });
    toast.success("Status updated");
  }

  function advance(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const nxt = nextStatus(order.status);
    if (!nxt) {
      toast("Cannot advance further", { icon: "ℹ️" });
      return;
    }
    setStatus(id, nxt);
  }

  // Derived lists by tab
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "DELIVERED"),
    [orders]
  );
  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED"),
    [orders]
  );

  // searching & filtering per tab
  const filteredActive = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeOrders;
    if (filter !== "ALL") list = list.filter((o) => o.status === filter);
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeOrders, filter, query]);

  const filteredDelivered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = deliveredOrders;
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q)
      );
    }
    return list;
  }, [deliveredOrders, query]);

  // current list & pagination
  const currentList = tab === "ACTIVE" ? filteredActive : filteredDelivered;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = currentList.slice(pageStart, pageStart + PAGE_SIZE);

  // reset page when list changes or tab/filter/search changes
  useEffect(() => {
    setPage(1);
  }, [tab, filter, query, orders.length]);

  // quick numbers (overall)
  const totals = useMemo(() => {
    const revenue = orders.reduce((sum, o) => {
      const sub = o.items.reduce((s, it) => s + it.qty * it.price, 0);
      return sum + sub + (o.shippingFee ?? 0);
    }, 0);
    const delivered = deliveredOrders.length;
    return { count: orders.length, revenue, delivered };
  }, [orders, deliveredOrders.length]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="text-sm text-gray-500">
            Manage statuses, search, and review recent orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
            title="Re-read from local storage"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Orders"
          value={totals.count.toLocaleString()}
          icon="stack"
        />
        <SummaryCard
          title="Total Revenue"
          value={rs(totals.revenue)}
          icon="cash"
        />
        <SummaryCard
          title="Delivered"
          value={totals.delivered.toLocaleString()}
          icon="check"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Tab
          label={`Active (${activeOrders.length})`}
          active={tab === "ACTIVE"}
          onClick={() => setTab("ACTIVE")}
        />
        <Tab
          label={`Delivered (${deliveredOrders.length})`}
          active={tab === "DELIVERED"}
          onClick={() => setTab("DELIVERED")}
        />
      </div>

      {/* Line 1: Status filters (single row, scrollable) -> only for ACTIVE tab */}
      {tab === "ACTIVE" && (
        <div className="flex gap-2 flex-nowrap overflow-x-auto pb-1">
          <FilterPill
            label="All"
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          {STATUSES.filter((s) => s !== "DELIVERED").map((s) => (
            <FilterPill
              key={s}
              label={statusLabel(s)}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>
      )}

      {/* Line 2: Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-96">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${
              tab === "ACTIVE" ? "active" : "delivered"
            } orders by ID, name, or phone`}
            className="w-full rounded-lg ring-1 ring-gray-300 pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon name="search" />
          </span>
        </div>
      </div>

      {/* Table */}
      {pageItems.length === 0 ? (
        <div className="text-gray-600">
          {currentList.length === 0
            ? "No matching orders."
            : "No results on this page."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <Th>Order #</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th className="text-right">Items</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((o, idx) => {
                const subtotal = o.items.reduce(
                  (s, it) => s + it.qty * it.price,
                  0
                );
                const total = subtotal + (o.shippingFee ?? 0);
                return (
                  <tr
                    key={o.id}
                    className={idx !== pageItems.length - 1 ? "border-t" : ""}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <code className="px-1.5 py-0.5 rounded bg-gray-100">
                          #{o.id}
                        </code>
                        <button
                          className="text-xs text-gray-500 underline"
                          onClick={() =>
                            navigator.clipboard
                              .writeText(o.id)
                              .then(() => toast.success("Order ID copied"))
                          }
                        >
                          Copy
                        </button>
                      </div>
                    </Td>
                    <Td>
                      <div className="font-medium">{o.customer.name}</div>
                      <div className="text-gray-500">{o.customer.phone}</div>
                    </Td>
                    <Td>{new Date(o.createdAt).toLocaleString()}</Td>
                    <Td className="text-right">{o.items.length}</Td>
                    <Td className="text-right">{rs(total)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge status={o.status} />
                        {tab === "ACTIVE" ? (
                          <select
                            className="rounded-lg ring-1 ring-gray-300 px-2 py-1 outline-none focus:ring-2 focus:ring-black bg-white"
                            value={o.status}
                            onChange={(e) =>
                              setStatus(o.id, e.target.value as Status)
                            }
                            title="Change status"
                          >
                            {STATUSES.filter((s) => s !== "DELIVERED").map(
                              (s) => (
                                <option key={s} value={s}>
                                  {statusLabel(s)}
                                </option>
                              )
                            )}
                            {/* If you really want to set delivered directly from active list: add it back */}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-600">
                            Delivered
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setOpenOrder(o)}
                          className="text-xs px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                          title="View details"
                        >
                          View details
                        </button>
                        {tab === "ACTIVE" && (
                          <button
                            onClick={() => advance(o.id)}
                            className="text-xs px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            disabled={!nextStatus(o.status)}
                            title="Advance to next stage"
                          >
                            Next stage
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>
            {currentList.length === 0 ? 0 : pageStart + 1}-
            {Math.min(pageStart + PAGE_SIZE, currentList.length)}
          </b>{" "}
          of <b>{currentList.length}</b>
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Details Modal */}
      {openOrder && (
        <OrderDetailsModal
          order={openOrder}
          onClose={() => setOpenOrder(null)}
        />
      )}
    </section>
  );
}

/* --------------- Modal --------------- */
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
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      {/* dialog */}
      <div className="absolute inset-x-4 sm:inset-x-auto sm:right-6 sm:left-6 top-10 sm:top-16 bg-white rounded-2xl ring-1 ring-gray-200 shadow-xl max-height-[80vh] max-h-[80vh] overflow-auto">
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
          {/* Left: items */}
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

          {/* Right: customer + payment */}
          <aside className="space-y-4">
            <div className="rounded-xl ring-1 ring-gray-200 p-4">
              <h4 className="font-medium">Customer</h4>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-medium">{order.customer.name}</div>
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

/* --------------- Little UI parts --------------- */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`text-left px-3 py-2 font-medium ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: "stack" | "cash" | "check";
}) {
  const IconEl =
    icon === "stack" ? (
      <Icon name="stack" />
    ) : icon === "cash" ? (
      <Icon name="cash" />
    ) : (
      <Icon name="check" />
    );
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-black text-white grid place-items-center">
        {IconEl}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm ring-1 transition
      ${
        active
          ? "bg-black text-white ring-black"
          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium ring-1 transition ${
        active
          ? "bg-black text-white ring-black"
          : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function Icon({ name }: { name: "search" | "stack" | "cash" | "check" }) {
  const d =
    name === "search"
      ? "M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19Zm8 2-4.35-4.35"
      : name === "stack"
      ? "M4 7h16v3H4zM4 12h16v3H4zM4 17h16v3H4z"
      : name === "cash"
      ? "M3 7h18v10H3zM6 10h3M15 14h3"
      : "M5 13l4 4L19 7";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2" />
    </svg>
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

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onChange(p);
  };

  // simple numeric buttons (compact): show first, prev, current, next, last
  const nums = Array.from(
    new Set(
      [1, page - 1, page, page + 1, totalPages].filter(
        (n) => n >= 1 && n <= totalPages
      )
    )
  ).sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-lg ring-1 ring-gray-300 disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={!canPrev}
      >
        Prev
      </button>
      {nums.map((n, i) => {
        const prev = nums[i - 1];
        const gap = prev && n - prev > 1;
        return (
          <span key={n} className="inline-flex items-center">
            {gap && <span className="px-1 text-gray-400">…</span>}
            <button
              className={`px-3 py-1.5 rounded-lg ring-1 ${
                n === page
                  ? "bg-black text-white ring-black"
                  : "ring-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => go(n)}
            >
              {n}
            </button>
          </span>
        );
      })}
      <button
        className="px-3 py-1.5 rounded-lg ring-1 ring-gray-300 disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={!canNext}
      >
        Next
      </button>
    </div>
  );
}
