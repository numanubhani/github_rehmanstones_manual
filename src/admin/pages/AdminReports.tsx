import { useMemo, useState } from "react";

type OrderItem = { id: string | number; name: string; qty: number; price: number };
type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  status: string;
};

const KEY = "orders";
function read(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

const rs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
const statusLabel = (s: string) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const ACTIVE_STATUSES = new Set(["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"]);

export default function AdminReports() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const ordersAll = read();

  const orders = useMemo(() => {
    if (!from && !to) return ordersAll;
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    return ordersAll.filter((o) => {
      const d = new Date(o.createdAt);
      if (isNaN(+d)) return false;
      if (fromD && d < fromD) return false;
      if (toD) {
        const end = new Date(toD);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [ordersAll, from, to]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty * i.price, 0), 0);
    const itemsSold = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

    const productMap = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        productMap.set(i.name, (productMap.get(i.name) ?? 0) + i.qty);
      })
    );
    const top = [...productMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxTopQty = top.length ? Math.max(...top.map(([, q]) => q)) : 1;

    const now = new Date();
    const months: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString(undefined, { month: "short" });
      months.push({ key, label, total: 0 });
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (isNaN(+d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const slot = months.find((m) => m.key === key);
      if (slot) {
        const orderTotal = o.items.reduce((s, it) => s + it.qty * it.price, 0);
        slot.total += orderTotal;
      }
    });
    const trend = months.map((m) => m.total);
    const trendLabels = months.map((m) => m.label);

    const aov = totalOrders ? Math.round(revenue / totalOrders) : 0;
    const deliveredRate = totalOrders ? Math.round((delivered / totalOrders) * 100) : 0;

    const latest = [...orders]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 8)
      .map((o) => ({
        ...o,
        total: o.items.reduce((s, it) => s + it.qty * it.price, 0),
      }));

    return {
      totalOrders,
      revenue,
      itemsSold,
      aov,
      delivered,
      deliveredRate,
      pending,
      cancelled,
      top,
      maxTopQty,
      trend,
      trendLabels,
      latest,
    };
  }, [orders]);

  return (
    <section className="space-y-6">
      {/* Date Filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5"
            />
          </div>
          <div className="flex gap-2 sm:pt-5">
            <button
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Clear
            </button>
            <button
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 flex items-center gap-2"
              onClick={() => exportCsv(orders)}
            >
              <DownloadIcon />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi title="Orders" value={String(stats.totalOrders)} icon="orders" color="blue" />
        <Kpi title="Revenue" value={rs(stats.revenue)} icon="revenue" color="green" />
        <Kpi title="Avg Order" value={rs(stats.aov)} icon="aov" color="purple" />
        <Kpi title="Items Sold" value={String(stats.itemsSold)} icon="items" color="orange" />
        <Kpi title="Delivered" value={`${stats.deliveredRate}%`} hint={`${stats.delivered} orders`} icon="delivered" color="emerald" />
        <Kpi title="Pending" value={String(stats.pending)} hint={`${stats.cancelled} cancelled`} icon="pending" color="red" />
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Revenue Trend (Last 6 Months)</h3>
          <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-gray-500">
            {stats.trendLabels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Sparkline points={stats.trend} />
        </div>
      </div>

      {/* Two-column: Top Products & Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Top Products</h3>
          {stats.top.length === 0 ? (
            <div className="text-gray-500 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {stats.top.map(([name, qty]) => {
                const pct = Math.round((qty / stats.maxTopQty) * 100);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate pr-2">{name}</span>
                      <span className="text-gray-600 font-semibold">{qty}</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-black to-gray-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Status Breakdown</h3>
          {orders.length === 0 ? (
            <div className="text-gray-500 text-sm">No orders</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((s) => {
                const count = orders.filter((o) => o.status === s).length;
                return (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-gray-200 bg-gray-50"
                  >
                    {statusLabel(s)} • {count}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Latest Orders */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Latest Orders</h3>
        </div>
        {stats.latest.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">No orders</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Items</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.latest.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 rounded-lg bg-gray-100 text-xs font-mono">#{o.id.slice(0, 8)}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{o.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold">{rs((o as any).total)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-gray-200 bg-gray-50">
                        {statusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* Components */
function Kpi({
  title,
  value,
  hint,
  icon,
  color,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    emerald: "from-teal-500 to-teal-600",
    red: "from-rose-500 to-rose-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} text-white grid place-items-center shadow-md mb-3`}>
        <KpiIcon name={icon} />
      </div>
      <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-900 truncate">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) {
    return <div className="h-24 grid place-items-center text-sm text-gray-400">No data</div>;
  }

  const width = 600;
  const height = 100;
  const pad = 10;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const max = Math.max(...points, 1);
  const step = w / Math.max(1, points.length - 1);

  const xy = points.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - v / max) * h;
    return [x, y] as const;
  });

  const path = xy.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `M${pad},${pad + h} ` + xy.map(([x, y]) => `L${x},${y}`).join(" ") + ` L${pad + (points.length - 1) * step},${pad + h} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      <path d={area} fill="rgba(0,0,0,0.05)" />
      <path d={path} fill="none" stroke="#000" strokeWidth={2.5} />
    </svg>
  );
}

function exportCsv(orders: Order[]) {
  const header = ["Order ID", "Date", "Status", "Items", "Total"];
  const rows = orders.map((o) => {
    const total = o.items.reduce((s, it) => s + it.qty * it.price, 0);
    return [o.id, new Date(o.createdAt).toISOString(), o.status, String(o.items.length), String(total)];
  });
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function KpiIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    orders: "M4 7h16v3H4zM4 12h16v3H4z",
    revenue: "M4 19h16M6 16l4-6 3 4 5-8",
    aov: "M3 7h18v10H3z",
    items: "M4 7h6v6H4zM14 7h6v10h-6z",
    delivered: "M5 12l4 4L19 6",
    pending: "M5 7h14M5 12h10",
  };
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={paths[name] || ""} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
