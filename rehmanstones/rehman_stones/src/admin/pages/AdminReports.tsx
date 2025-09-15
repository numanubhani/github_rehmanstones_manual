import { useMemo } from "react";

/* ---------- Types & storage ---------- */
type OrderItem = {
  id: string | number;
  name: string;
  qty: number;
  price: number;
};
type Order = {
  id: string;
  createdAt: string; // ISO
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

/* ---------- Utils ---------- */
const rs = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
const statusLabel = (s: string) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const ACTIVE_STATUSES = new Set([
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
]);

/* ---------- Sparkline (SVG) ---------- */
function Sparkline({
  points,
  width = 420,
  height = 90,
  stroke = "#111111",
  fill = "rgba(17,17,17,.08)",
}: {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (points.length === 0) {
    return (
      <div className="h-[90px] grid place-items-center text-xs text-gray-400">
        No data
      </div>
    );
  }

  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const max = Math.max(...points, 1);
  const step = w / Math.max(1, points.length - 1);

  const xy = points.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - v / max) * h;
    return [x, y] as const;
  });

  const path = xy
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");
  const area =
    `M${pad},${pad + h} ` +
    xy.map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${pad + (points.length - 1) * step},${pad + h} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  );
}

/* ---------- Small UI bits ---------- */
function Kpi({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: "orders" | "revenue" | "aov" | "items" | "delivered" | "pending";
}) {
  const Icon =
    icon === "orders" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h16v3H4zM4 12h16v3H4zM4 17h16v3H4z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ) : icon === "revenue" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19h16M6 16l4-6 3 4 5-8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ) : icon === "aov" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 7h18v10H3zM6 10h6M6 14h4"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ) : icon === "items" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h6v6H4zM14 7h6v10h-6zM4 15h6v2H4z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ) : icon === "delivered" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 7h14M5 12h10M5 17h6"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );

  return (
    <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-black text-white grid place-items-center">
        {Icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-lg font-semibold truncate">{value}</div>
        {hint && <div className="text-xs text-gray-500">{hint}</div>}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs ring-1 ring-gray-200 bg-white">
      {children}
    </span>
  );
}

/* ---------- Main component ---------- */
export default function AdminReports() {
  const orders = read();

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const revenue = orders.reduce(
      (s, o) => s + o.items.reduce((a, i) => a + i.qty * i.price, 0),
      0
    );

    const itemsSold = orders.reduce(
      (s, o) => s + o.items.reduce((a, i) => a + i.qty, 0),
      0
    );

    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

    // Top products by quantity
    const productMap = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        productMap.set(i.name, (productMap.get(i.name) ?? 0) + i.qty);
      })
    );
    const top = [...productMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxTopQty = top.length ? Math.max(...top.map(([, q]) => q)) : 1;

    // Revenue by last 6 months (including current)
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
    const deliveredRate = totalOrders
      ? Math.round((delivered / totalOrders) * 100)
      : 0;

    // Latest orders (8)
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
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500">Key metrics and sales insights</p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi
          title="Total Orders"
          value={String(stats.totalOrders)}
          icon="orders"
        />
        <Kpi title="Revenue" value={rs(stats.revenue)} icon="revenue" />
        <Kpi title="Avg. Order Value" value={rs(stats.aov)} icon="aov" />
        <Kpi title="Items Sold" value={String(stats.itemsSold)} icon="items" />
        <Kpi
          title="Delivered Rate"
          value={`${stats.deliveredRate}%`}
          hint={`${stats.delivered} delivered`}
          icon="delivered"
        />
        <Kpi
          title="Pending"
          value={String(stats.pending)}
          hint={`${stats.cancelled} cancelled`}
          icon="pending"
        />
      </div>

      {/* Revenue trend */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Revenue (last 6 months)</h3>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            {stats.trendLabels.map((l, i) => (
              <span key={i} className="px-1">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-1">
          <Sparkline points={stats.trend} />
        </div>
      </div>

      {/* Two-up: Top products & Status breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top products */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
          <h3 className="font-medium mb-2">Top Products</h3>
          {stats.top.length === 0 ? (
            <div className="text-gray-500 text-sm">No data yet.</div>
          ) : (
            <div className="space-y-3">
              {stats.top.map(([name, qty]) => {
                const pct = Math.round((qty / stats.maxTopQty) * 100);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate pr-3">{name}</span>
                      <span className="text-gray-600">{qty}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 rounded bg-black"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
          <h3 className="font-medium mb-2">Status Breakdown</h3>
          {orders.length === 0 ? (
            <div className="text-gray-500 text-sm">No orders yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[
                "PLACED",
                "CONFIRMED",
                "PACKED",
                "SHIPPED",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
              ].map((s) => {
                const count = orders.filter((o) => o.status === s).length;
                return (
                  <Chip key={s}>
                    {statusLabel(s)} • {count}
                  </Chip>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Latest orders */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
        <h3 className="font-medium">Latest Orders</h3>
        {stats.latest.length === 0 ? (
          <div className="mt-2 text-gray-500 text-sm">No recent orders.</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Order #</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-right px-3 py-2">Items</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.latest.map((o, i) => (
                  <tr
                    key={o.id}
                    className={i !== stats.latest.length - 1 ? "border-t" : ""}
                  >
                    <td className="px-3 py-2">
                      <code className="px-1.5 py-0.5 rounded bg-gray-100">
                        #{o.id}
                      </code>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">{o.items.length}</td>
                    <td className="px-3 py-2 text-right">
                      {rs((o as any).total)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded-full text-xs ring-1 ring-gray-200 bg-white">
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
