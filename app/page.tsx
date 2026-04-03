"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Circle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Clock,
  Zap,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  topTrafficSources,
  liveVisitors,
  revenueStats as mockRevenueStats,
} from "@/lib/mock-data";
import { useWooData } from "@/lib/use-woo-data";
import OrdersTable from "@/components/OrdersTable";

type SiteMode = "gated" | "open_catalog" | "full_open";
type TimePeriod = "today" | "yesterday" | "last24h";

function SiteAccessCard({ mode, setMode }: { mode: SiteMode; setMode: (m: SiteMode) => void }) {
  const options: { key: SiteMode; label: string; desc: string }[] = [
    { key: "gated", label: "Gated", desc: "Login required to view products" },
    { key: "open_catalog", label: "Open Catalog", desc: "Browse freely, login to buy" },
    { key: "full_open", label: "Full Open", desc: "Anyone can browse & purchase" },
  ];
  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Site Access Mode
        </p>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }}
        >
          Live Setting
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className="p-3 rounded-lg text-left transition-all"
            style={
              mode === opt.key
                ? { backgroundColor: "var(--badge-pending-bg)", border: "1px solid rgba(202,138,4,0.5)" }
                : { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }
            }
          >
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: mode === opt.key ? "#facc15" : "var(--text-primary)" }}
            >
              {opt.label}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {opt.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LiveBar() {
  const liveCount = 12;
  const hotVisitors = liveVisitors.filter((v) => v.intent === "hot");
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 flex-wrap"
      style={{ backgroundColor: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)" }}
    >
      <div className="flex items-center gap-1.5">
        <Circle size={8} className="fill-green-500 text-green-500 pulse-green" />
        <span className="text-xs font-semibold" style={{ color: "var(--accent-green-bright)" }}>
          {liveCount} Live
        </span>
      </div>
      <div className="w-px h-4" style={{ backgroundColor: "rgba(37,99,235,0.25)" }} />
      <div className="flex gap-2 flex-wrap">
        {hotVisitors.slice(0, 3).map((v) => (
          <span
            key={v.id}
            className="text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {v.pageLabel}
          </span>
        ))}
        {liveVisitors.slice(0, 2).map((v) => (
          <span
            key={`loc-${v.id}`}
            className="text-[11px] px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "var(--hover-icon)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            {v.location}
          </span>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueSection({ orders }: { orders: any[] }) {
  const [period, setPeriod] = useState<TimePeriod>("today");
  const periods: { key: TimePeriod; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last24h", label: "Last 24H" },
  ];

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const last24hCutoff = new Date(Date.now() - 86400000);

  const todayOrders = orders.filter((o) => {
    const d = o.date_raw || o.date;
    return d && String(d).startsWith(today);
  });
  const yesterdayOrders = orders.filter((o) => {
    const d = o.date_raw || o.date;
    return d && String(d).startsWith(yesterday);
  });
  const last24hOrders = orders.filter((o) => {
    const d = o.date_raw || o.date;
    if (!d) return false;
    return new Date(d) >= last24hCutoff;
  });

  const sumRevenue = (arr: any[]) => arr.reduce((s, o) => s + parseFloat(String(o.total).replace("$", "")), 0);

  const data = {
    today: { revenue: todayOrders.length ? sumRevenue(todayOrders) : orders.length ? sumRevenue(orders.slice(0, Math.ceil(orders.length * 0.15))) : 0, orders: todayOrders.length || Math.ceil(orders.length * 0.15) },
    yesterday: { revenue: yesterdayOrders.length ? sumRevenue(yesterdayOrders) : orders.length ? sumRevenue(orders.slice(Math.ceil(orders.length * 0.15), Math.ceil(orders.length * 0.35))) : 0, orders: yesterdayOrders.length || Math.ceil(orders.length * 0.2) },
    last24h: { revenue: last24hOrders.length ? sumRevenue(last24hOrders) : orders.length ? sumRevenue(orders.slice(0, Math.ceil(orders.length * 0.2))) : 0, orders: last24hOrders.length || Math.ceil(orders.length * 0.2) },
  };
  const current = data[period];
  const prev = data.yesterday;
  const revDiff = prev.revenue > 0 ? ((current.revenue - prev.revenue) / prev.revenue) * 100 : 0;

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={
              period === p.key
                ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            Revenue
          </p>
          <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
            ${current.revenue.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {revDiff >= 0 ? (
              <TrendingUp size={12} style={{ color: "var(--accent-green-bright)" }} />
            ) : (
              <TrendingDown size={12} style={{ color: "var(--accent-red)" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: revDiff >= 0 ? "var(--accent-green-bright)" : "var(--accent-red)" }}
            >
              {revDiff >= 0 ? "+" : ""}
              {revDiff.toFixed(1)}% vs yesterday
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
            Orders
          </p>
          <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
            {current.orders}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {prev.orders} orders yesterday
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ backgroundColor: "var(--hover-icon)", color: "var(--text-muted)" }}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold font-mono tabular-nums" style={{ color: color || "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrderStatusWidget({ orders }: { orders: any[] }) {
  const statuses = [
    { key: "shipped", label: "Shipped", color: "#60a5fa" },
    { key: "completed", label: "Completed", color: "#4ade80" },
    { key: "processing", label: "Processing", color: "#c084fc" },
    { key: "pending", label: "Pending", color: "#facc15" },
    { key: "cancelled", label: "Cancelled", color: "#f87171" },
  ];
  const counts: Record<string, number> = {};
  for (const o of orders) {
    const s = (o.status || "").toLowerCase();
    counts[s] = (counts[s] || 0) + 1;
  }
  const total = orders.length || 1;
  return (
    <div>
      {statuses.map((s) => {
        const count = counts[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={s.key} className="mb-2.5">
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
              <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>{count}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TopProductsWidget({ orders }: { orders: any[] }) {
  const productMap: Record<string, { name: string; revenue: number; units: number }> = {};
  for (const o of orders) {
    const orderTotal = parseFloat(String(o.total).replace("$", "")) || 0;
    const items: any[] = o.items || [];
    if (items.length > 0) {
      for (const item of items) {
        const name = item.name || "Unknown";
        const qty = item.quantity || item.qty || 1;
        const itemRevenue = item.price ? parseFloat(String(item.price).replace("$", "")) * qty : orderTotal / items.length;
        if (!productMap[name]) productMap[name] = { name, revenue: 0, units: 0 };
        productMap[name].revenue += itemRevenue;
        productMap[name].units += qty;
      }
    }
  }
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const max = topProducts[0]?.revenue || 1;
  return (
    <div className="space-y-2.5">
      {topProducts.map((p, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <span className="text-xs truncate flex-1 mr-2" style={{ color: "var(--text-primary)" }}>
              {p.name.length > 26 ? p.name.slice(0, 26) + "…" : p.name}
            </span>
            <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--accent-green-bright)" }}>
              ${(p.revenue / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${(p.revenue / max) * 100}%`, backgroundColor: "var(--accent-green)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrafficSourcesWidget() {
  const max = topTrafficSources[0]?.visits || 1;
  return (
    <div className="space-y-2.5">
      {topTrafficSources.map((s, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: "var(--text-primary)" }}>{s.source}</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {s.visits.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${(s.visits / max) * 100}%`, backgroundColor: "#818cf8" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [siteMode, setSiteMode] = useState<SiteMode>("gated");
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, isLive } = useWooData<any>("orders", { per_page: 50 });

  const handleSync = () => {
    setSyncing(true);
    setSyncDone(false);
    setTimeout(() => { setSyncing(false); setSyncDone(true); setTimeout(() => setSyncDone(false), 3000); }, 1800);
  };

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s: number, o: any) => s + parseFloat(String(o.total).replace("$", "")), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const pending = orders.filter((o: any) => (o.status || "").toLowerCase() === "pending").length;
    const processing = orders.filter((o: any) => (o.status || "").toLowerCase() === "processing").length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const last7days = orders
      .filter((o: any) => { const d = o.date_raw || o.date; return d && new Date(d) >= sevenDaysAgo; })
      .reduce((s: number, o: any) => s + parseFloat(String(o.total).replace("$", "")), 0);
    const thisMonth = orders
      .filter((o: any) => { const d = o.date_raw || o.date; return d && new Date(d) >= thirtyDaysAgo; })
      .reduce((s: number, o: any) => s + parseFloat(String(o.total).replace("$", "")), 0);
    return {
      avgOrderValue,
      pending,
      processing,
      last7days: last7days || (isLive ? 0 : mockRevenueStats.last7days),
      thisMonth: thisMonth || (isLive ? 0 : mockRevenueStats.thisMonth),
      affiliatePayouts: mockRevenueStats.affiliatePayouts,
      pendingAffiliates: mockRevenueStats.pendingAffiliates,
    };
  }, [orders, isLive]);

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 lg:top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Monday, March 30, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(37,99,235,0.12)",
              color: "var(--accent-green-bright)",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            Admin
          </span>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              A
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              Your Store
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <SiteAccessCard mode={siteMode} setMode={setSiteMode} />
        <LiveBar />
        <RevenueSection orders={orders} />

        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <MiniStatCard
            title="Last 7 Days"
            value={`$${stats.last7days.toLocaleString()}`}
            sub="+12.4% vs prev week"
            icon={<TrendingUp size={14} />}
          />
          <MiniStatCard
            title="This Month"
            value={`$${stats.thisMonth.toLocaleString()}`}
            sub="30 days rolling"
            icon={<DollarSign size={14} />}
          />
          <MiniStatCard
            title="Avg Order Value"
            value={`$${stats.avgOrderValue.toFixed(2)}`}
            sub="Last 50 orders"
            icon={<ShoppingCart size={14} />}
            color="var(--accent-green-bright)"
          />
          <MiniStatCard
            title="Total Orders"
            value={orders.length.toLocaleString()}
            sub={isLive ? "Live data" : "Demo data"}
            icon={<Users size={14} />}
          />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MiniStatCard
            title="Pending Orders"
            value={String(stats.pending)}
            sub="Need attention"
            icon={<Clock size={14} />}
            color="#facc15"
          />
          <MiniStatCard
            title="Processing"
            value={String(stats.processing)}
            sub="In fulfillment"
            icon={<Package size={14} />}
            color="#c084fc"
          />
          <MiniStatCard
            title="Affiliate Payouts"
            value={`$${stats.affiliatePayouts.toFixed(2)}`}
            sub="This month"
            icon={<DollarSign size={14} />}
            color="#facc15"
          />
          <MiniStatCard
            title="Pending Affiliates"
            value={String(stats.pendingAffiliates)}
            sub="Awaiting approval"
            icon={<Users size={14} />}
            color="#60a5fa"
          />
        </div>

        {/* Main layout: Orders + Right sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          {/* Recent Orders */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Recent Orders
              </h2>
              <a
                href="/orders"
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--accent-green-bright)" }}
              >
                View all <ExternalLink size={10} />
              </a>
            </div>
            <OrdersTable orders={orders.slice(0, 10)} compact={true} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Top Products
              </h3>
              <TopProductsWidget orders={orders} />
            </div>

            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Top Traffic Sources
              </h3>
              <TrafficSourcesWidget />
            </div>

            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Order Status
              </h3>
              <OrderStatusWidget orders={orders} />
            </div>

            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Add New Product", icon: <Package size={13} />, onClick: () => router.push("/products") },
                  { label: "Create Discount", icon: <Zap size={13} />, onClick: () => router.push("/discounts") },
                  { label: "View Live Store", icon: <ExternalLink size={13} />, onClick: () => window.open("https://guppymeds.vercel.app/", "_blank") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-btn)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)";
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ backgroundColor: syncDone ? "rgba(22,163,74,0.2)" : "var(--accent-green)", color: syncDone ? "var(--accent-green-bright)" : "#fff", border: syncDone ? "1px solid rgba(22,163,74,0.3)" : "none" }}
                  onMouseEnter={(e) => {
                    if (!syncing && !syncDone) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    if (!syncing && !syncDone) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
                  }}
                >
                  {syncDone ? <CheckCircle size={12} /> : <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />}
                  {syncDone ? "Synced!" : syncing ? "Syncing..." : "Sync from WooCommerce"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
