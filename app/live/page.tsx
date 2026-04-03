"use client";

import { useState, useMemo } from "react";
import { Circle, Monitor, Smartphone, AlertTriangle } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

type LiveTab = "live" | "today" | "7days" | "30days";

function IntentBadge({ intent }: { intent: string }) {
  if (intent === "hot") {
    return (
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "rgba(220,38,38,0.2)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}
      >
        HOT
      </span>
    );
  }
  if (intent === "warm") {
    return (
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "rgba(249,115,22,0.2)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        WARM
      </span>
    );
  }
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
    >
      COLD
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function timeAgo(isoDate: string): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export default function LivePage() {
  const [tab, setTab] = useState<LiveTab>("live");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, isLive } = useWooData<any>("orders", { per_page: 100 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start7Days = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const start30Days = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

  const filteredOrders = useMemo(() => {
    if (!isLive) return orders;
    const cutoff =
      tab === "live" || tab === "today" ? startOfToday
      : tab === "7days" ? start7Days
      : start30Days;
    return orders.filter((o: any) => o.isoDate && new Date(o.isoDate) >= cutoff);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, tab, isLive]);

  const revenue = useMemo(
    () => filteredOrders.reduce((acc: number, o: any) => acc + parseFloat(String(o.total).replace("$", "") || "0"), 0),
    [filteredOrders]
  );
  const orderCount = filteredOrders.length;

  const recentEvents = useMemo(
    () => orders.slice(0, 8).map((o: any) => ({
      text: `${o.customer?.name || o.customer || "A customer"} completed a ${o.total} purchase`,
      time: timeAgo(o.isoDate),
      color: o.status === "completed" || o.status === "processing" ? "#4ade80" : "#facc15",
    })),
    [orders]
  );

  // Top products from filtered orders
  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o: any) => {
      (o.items || []).forEach((i: any) => {
        const name = i.name || "Unknown";
        counts[name] = (counts[name] || 0) + (i.quantity || 1);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, qty]) => ({ page: name, visitors: qty }));
  }, [filteredOrders]);

  const tabs: { key: LiveTab; label: string }[] = [
    { key: "live", label: "Live" },
    { key: "today", label: "Today" },
    { key: "7days", label: "7 Days" },
    { key: "30days", label: "30 Days" },
  ];

  const revenueLabel =
    tab === "live" || tab === "today" ? "Today's Revenue"
    : tab === "7days" ? "7-Day Revenue"
    : "30-Day Revenue";

  const ordersLabel =
    tab === "live" || tab === "today" ? "Today's Orders" : "Orders";

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Circle size={8} className="fill-green-500 text-green-500 pulse-green" />
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Live Analytics
          </h1>
        </div>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={
                tab === t.key
                  ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                  : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              {t.key === "live" && tab === "live" ? (
                <span className="flex items-center gap-1.5">
                  <Circle size={6} className="fill-green-400 text-green-400 pulse-green" />
                  {t.label}
                </span>
              ) : (
                t.label
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Revenue + Orders */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {revenueLabel}
            </p>
            <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
              ${revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {isLive && (
              <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-subtle)" }}>
                {orderCount} order{orderCount !== 1 ? "s" : ""} in period
              </p>
            )}
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {ordersLabel}
            </p>
            <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
              {orderCount}
            </p>
            {isLive && (
              <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-subtle)" }}>
                from your {isLive ? "store" : "demo data"}
              </p>
            )}
          </div>
        </div>

        {/* Visitor tracking banner */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-4"
          style={{ backgroundColor: "rgba(202,138,4,0.08)", border: "1px solid rgba(202,138,4,0.25)" }}
        >
          <AlertTriangle size={14} style={{ color: "#facc15", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "#facc15", fontWeight: 600 }}>Visitor data requires an analytics integration.</span>{" "}
            Active visitors, pageviews, cart adds, and checkouts need Google Analytics, Plausible, or a similar tracker — these cannot be pulled from the store API.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
          {/* Top products from real orders */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {isLive ? "Top Products in Period" : "Top Products"}
              </h3>
              {isLive && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.25)" }}
                >
                  Live
                </span>
              )}
            </div>
            {topProducts.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["PRODUCT", "UNITS SOLD"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i} className="table-row-hover" style={{ borderBottom: "1px solid rgba(34,34,34,0.4)" }}>
                      <td className="px-4 py-2.5">
                        <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                          {p.page.length > 40 ? p.page.slice(0, 40) + "…" : p.page}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "var(--accent-green-bright)" }}
                        >
                          {p.visitors}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No orders in this period
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar: Live Events */}
          <div>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Circle size={6} className="fill-green-400 text-green-400 pulse-green" />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {isLive ? "Recent Orders" : "Live Events"}
                </h3>
              </div>
              <div className="space-y-2.5">
                {recentEvents.length > 0 ? recentEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                        {event.text}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                        {event.time}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No recent orders</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
