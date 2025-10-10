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
  payment?: Payment;
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
  PLACED: "bg-gray-100 text-gray-800 ring-gray-300",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-300",
  PACKED: "bg-indigo-50 text-indigo-700 ring-indigo-300",
  SHIPPED: "bg-sky-50 text-sky-700 ring-sky-300",
  OUT_FOR_DELIVERY: "bg-amber-50 text-amber-700 ring-amber-300",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-300",
  CANCELLED: "bg-red-50 text-red-700 ring-red-300",
};

function Badge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusClasses[status]}`}
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
  const [openOrder, setOpenOrder] = useState<Order | null>(null);

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

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "DELIVERED"),
    [orders]
  );
  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED"),
    [orders]
  );

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

  const currentList = tab === "ACTIVE" ? filteredActive : filteredDelivered;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = currentList.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [tab, filter, query, orders.length]);

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
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Orders"
          value={totals.count.toLocaleString()}
          icon="stack"
          color="blue"
        />
        <SummaryCard
          title="Total Revenue"
          value={rs(totals.revenue)}
          icon="cash"
          color="green"
        />
        <SummaryCard
          title="Delivered"
          value={totals.delivered.toLocaleString()}
          icon="check"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
        <div className="flex-1" />
        <button
          onClick={refresh}
          className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <RefreshIcon />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters (mobile: horizontal scroll) */}
      {tab === "ACTIVE" && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
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

      {/* Search */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${tab === "ACTIVE" ? "active" : "delivered"} orders...`}
          className="w-full rounded-xl ring-1 ring-gray-300 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Table (horizontal scroll on mobile) */}
      {pageItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No orders found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Date</Th>
                  <Th className="text-right">Items</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((o) => {
                  const subtotal = o.items.reduce((s, it) => s + it.qty * it.price, 0);
                  const total = subtotal + (o.shippingFee ?? 0);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition">
                      <Td>
                        <code className="px-2 py-1 rounded-lg bg-gray-100 text-xs font-mono">
                          #{o.id.slice(0, 8)}
                        </code>
                      </Td>
                      <Td>
                        <div className="font-medium text-gray-900">{o.customer.name}</div>
                        <div className="text-gray-500 text-xs">{o.customer.phone}</div>
                      </Td>
                      <Td className="hidden md:table-cell text-gray-600">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </Td>
                      <Td className="text-right font-medium">{o.items.length}</Td>
                      <Td className="text-right font-semibold">{rs(total)}</Td>
                      <Td>
                        <Badge status={o.status} />
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setOpenOrder(o)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800"
                          >
                            View
                          </button>
                          {tab === "ACTIVE" && nextStatus(o.status) && (
                            <button
                              onClick={() => advance(o.id)}
                              className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                            >
                              Next
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

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing <b>{currentList.length === 0 ? 0 : pageStart + 1}</b> to{" "}
              <b>{Math.min(pageStart + PAGE_SIZE, currentList.length)}</b> of{" "}
              <b>{currentList.length}</b>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}

      {openOrder && (
        <OrderDetailsModal order={openOrder} onClose={() => setOpenOrder(null)} onStatusChange={setStatus} tab={tab} />
      )}
    </section>
  );
}

/* --------------- Modal --------------- */
function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  tab,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
  tab: TabKey;
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
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">Order Details</h3>
              <Badge status={order.status} />
            </div>
            <button
              className="w-10 h-10 grid place-items-center rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 transition"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Content (mobile: vertical stack, desktop: grid) */}
          <div className="p-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Left: Items */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span>Items ({order.items.length})</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white rounded-lg">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Product</th>
                        <th className="text-right px-3 py-2 font-medium">Qty</th>
                        <th className="text-right px-3 py-2 font-medium">Price</th>
                        <th className="text-right px-3 py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((it) => (
                        <tr key={String(it.id)}>
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-right">{it.qty}</td>
                          <td className="px-3 py-2 text-right">{rs(it.price)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{rs(it.qty * it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <Row label="Subtotal" value={rs(subtotal)} />
                  <Row label="Shipping" value={rs(shipping)} />
                  <div className="flex items-center justify-between pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-black">{rs(total)}</span>
                  </div>
                </div>
              </div>

              {/* Status changer (mobile friendly) */}
              {tab === "ACTIVE" && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    className="w-full rounded-lg ring-1 ring-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black bg-white"
                    value={order.status}
                    onChange={(e) => {
                      onStatusChange(order.id, e.target.value as Status);
                      toast.success("Status updated");
                    }}
                  >
                    {STATUSES.filter((s) => s !== "DELIVERED").map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: Customer & Payment */}
            <aside className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Customer</h4>
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-gray-900">{order.customer.name}</div>
                  <div className="text-gray-600">{order.customer.phone}</div>
                  <div className="text-gray-600 pt-2 border-t border-gray-200">
                    {order.customer.address}, {order.customer.city}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Payment</h4>
                <div className="text-sm">
                  {!order.payment ? (
                    <div className="text-gray-500">Not specified</div>
                  ) : order.payment.method === "COD" ? (
                    <div className="font-medium">Cash on Delivery</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="font-medium">Online / Bank Transfer</div>
                      {order.payment.bankName && <RowMini label="Bank" value={order.payment.bankName} />}
                      {order.payment.accountTitle && <RowMini label="Account" value={order.payment.accountTitle} />}
                      {order.payment.accountNumber && <RowMini label="Number" value={order.payment.accountNumber} />}
                      {order.payment.txnRef && <RowMini label="Ref" value={order.payment.txnRef} />}
                      {order.payment.proofDataUrl && (
                        <a
                          href={order.payment.proofDataUrl}
                          target="_blank"
                          className="inline-block mt-2 text-blue-600 underline text-xs"
                        >
                          View payment proof →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {order.note && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Note</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.note}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2">
                Order ID: <code className="bg-gray-100 px-2 py-1 rounded">{order.id}</code>
                <br />
                Created: {new Date(order.createdAt).toLocaleString()}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------- UI Components --------------- */
function SummaryCard({ title, value, icon, color }: { title: string; value: string | number; icon: "stack" | "cash" | "check"; color: string }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
  };
  const IconEl = icon === "stack" ? <StackIcon /> : icon === "cash" ? <CashIcon /> : <CheckIcon />;
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white grid place-items-center shadow-lg`}>
        {IconEl}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
        active ? "bg-black text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
        active ? "bg-black text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function RowMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-2 rounded-lg ring-1 ring-gray-300 disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
        onClick={() => onChange(page - 1)}
        disabled={!canPrev}
      >
        ← Prev
      </button>
      <span className="px-3 py-2 text-sm font-medium">
        {page} of {totalPages}
      </span>
      <button
        className="px-3 py-2 rounded-lg ring-1 ring-gray-300 disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
      >
        Next →
      </button>
    </div>
  );
}

/* Icons */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
