"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useWooData } from "@/lib/use-woo-data";

// ── US Tile Map ──────────────────────────────────────────────────────────────

const STATE_POS: Record<string, { col: number; row: number }> = {
  ME: { col: 11, row: 0 },
  VT: { col: 10, row: 1 }, NH: { col: 11, row: 1 },
  WA: { col: 0, row: 2 }, MT: { col: 2, row: 2 }, ND: { col: 3, row: 2 }, MN: { col: 4, row: 2 },
  WI: { col: 5, row: 2 }, MI: { col: 6, row: 2 }, NY: { col: 9, row: 2 }, MA: { col: 10, row: 2 },
  OR: { col: 0, row: 3 }, ID: { col: 1, row: 3 }, WY: { col: 2, row: 3 }, SD: { col: 3, row: 3 },
  IA: { col: 4, row: 3 }, IL: { col: 5, row: 3 }, IN: { col: 6, row: 3 }, OH: { col: 7, row: 3 },
  PA: { col: 8, row: 3 }, CT: { col: 10, row: 3 }, RI: { col: 11, row: 3 },
  CA: { col: 0, row: 4 }, NV: { col: 1, row: 4 }, CO: { col: 2, row: 4 }, NE: { col: 3, row: 4 },
  MO: { col: 4, row: 4 }, KY: { col: 5, row: 4 }, WV: { col: 6, row: 4 }, VA: { col: 7, row: 4 },
  MD: { col: 8, row: 4 }, NJ: { col: 9, row: 4 }, DE: { col: 10, row: 4 },
  UT: { col: 1, row: 5 }, KS: { col: 3, row: 5 }, AR: { col: 4, row: 5 }, TN: { col: 5, row: 5 },
  NC: { col: 6, row: 5 }, SC: { col: 7, row: 5 },
  AZ: { col: 1, row: 6 }, NM: { col: 2, row: 6 }, OK: { col: 3, row: 6 }, LA: { col: 4, row: 6 },
  MS: { col: 5, row: 6 }, AL: { col: 6, row: 6 }, GA: { col: 7, row: 6 },
  TX: { col: 3, row: 7 }, FL: { col: 7, row: 7 },
  AK: { col: 0, row: 8 }, HI: { col: 2, row: 8 },
};

const STATE_DATA: Record<string, { revenue: number; orders: number; customers: number }> = {
  CA: { revenue: 54234, orders: 234, customers: 201 },
  TX: { revenue: 44921, orders: 198, customers: 156 },
  FL: { revenue: 36847, orders: 156, customers: 134 },
  NY: { revenue: 32234, orders: 143, customers: 118 },
  CO: { revenue: 26890, orders: 112, customers: 89 },
  WA: { revenue: 22234, orders: 98, customers: 76 },
  OR: { revenue: 19234, orders: 87, customers: 68 },
  NV: { revenue: 16234, orders: 76, customers: 61 },
  AZ: { revenue: 14234, orders: 65, customers: 54 },
  NC: { revenue: 12234, orders: 54, customers: 45 },
  IL: { revenue: 11500, orders: 48, customers: 39 },
  GA: { revenue: 10800, orders: 45, customers: 36 },
  VA: { revenue: 9600, orders: 41, customers: 33 },
  OH: { revenue: 8900, orders: 38, customers: 30 },
  PA: { revenue: 8200, orders: 35, customers: 28 },
  MA: { revenue: 7800, orders: 33, customers: 26 },
  MN: { revenue: 7200, orders: 30, customers: 24 },
  TN: { revenue: 6800, orders: 28, customers: 22 },
  MI: { revenue: 6400, orders: 26, customers: 21 },
  NJ: { revenue: 6000, orders: 25, customers: 20 },
  UT: { revenue: 5600, orders: 23, customers: 18 },
  MO: { revenue: 5200, orders: 22, customers: 17 },
  MD: { revenue: 4800, orders: 20, customers: 16 },
  SC: { revenue: 4400, orders: 19, customers: 15 },
  WI: { revenue: 4100, orders: 17, customers: 14 },
  AL: { revenue: 3800, orders: 16, customers: 13 },
  IN: { revenue: 3500, orders: 15, customers: 12 },
  LA: { revenue: 3200, orders: 14, customers: 11 },
  KY: { revenue: 3000, orders: 13, customers: 10 },
  OK: { revenue: 2800, orders: 12, customers: 10 },
  NM: { revenue: 2500, orders: 11, customers: 9 },
  ID: { revenue: 2300, orders: 10, customers: 8 },
  AR: { revenue: 2100, orders: 9, customers: 7 },
  KS: { revenue: 1900, orders: 8, customers: 7 },
  MS: { revenue: 1700, orders: 7, customers: 6 },
  NE: { revenue: 1600, orders: 7, customers: 5 },
  IA: { revenue: 1500, orders: 6, customers: 5 },
  ME: { revenue: 1400, orders: 6, customers: 5 },
  MT: { revenue: 1300, orders: 5, customers: 4 },
  WY: { revenue: 1200, orders: 5, customers: 4 },
  SD: { revenue: 1100, orders: 5, customers: 4 },
  ND: { revenue: 1000, orders: 4, customers: 3 },
  NH: { revenue: 950, orders: 4, customers: 3 },
  VT: { revenue: 900, orders: 4, customers: 3 },
  DE: { revenue: 850, orders: 3, customers: 3 },
  CT: { revenue: 750, orders: 3, customers: 2 },
  RI: { revenue: 700, orders: 3, customers: 2 },
  WV: { revenue: 650, orders: 3, customers: 2 },
  HI: { revenue: 600, orders: 2, customers: 2 },
  AK: { revenue: 550, orders: 2, customers: 2 },
};

function USMapTile({ stateData }: { stateData: Record<string, { revenue: number; orders: number; customers: number }> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const maxRevenue = Math.max(...Object.values(stateData).map((d) => d.revenue), 1);
  const TILE = 26;
  const GAP = 3;
  const COLS = 12;
  const ROWS = 9;
  const W = COLS * TILE + (COLS - 1) * GAP;
  const H = ROWS * TILE + (ROWS - 1) * GAP;

  const hoveredData = hovered ? stateData[hovered] : null;

  return (
    <div className="relative">
      <div
        className="relative mx-auto"
        style={{ width: W, height: H }}
        onMouseLeave={() => setHovered(null)}
      >
        {Object.entries(STATE_POS).map(([abbr, { col, row }]) => {
          const data = stateData[abbr];
          const intensity = data ? data.revenue / maxRevenue : 0;
          const x = col * (TILE + GAP);
          const y = row * (TILE + GAP);
          const isHot = intensity > 0.5;
          const bgColor = data
            ? isHot
              ? `rgba(22,163,74,${0.2 + intensity * 0.75})`
              : `rgba(22,163,74,${0.08 + intensity * 0.35})`
            : "rgba(255,255,255,0.03)";
          const isHovered = hovered === abbr;

          return (
            <div
              key={abbr}
              onMouseEnter={(e) => {
                setHovered(abbr);
                const rect = (e.currentTarget as HTMLDivElement).parentElement!.getBoundingClientRect();
                setTooltipPos({ x: x + TILE / 2, y: y });
              }}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: TILE,
                height: TILE,
                backgroundColor: bgColor,
                border: isHovered ? "1px solid rgba(74,222,128,0.8)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4,
                cursor: data ? "pointer" : "default",
                transition: "all 0.12s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 600,
                  color: isHovered ? "#4ade80" : data ? (intensity > 0.3 ? "#86efac" : "rgba(255,255,255,0.35)") : "rgba(255,255,255,0.12)",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                {abbr}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hovered && hoveredData && (
        <div
          style={{
            position: "absolute",
            left: tooltipPos.x,
            top: tooltipPos.y - 80,
            transform: "translateX(-50%)",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 8,
            padding: "8px 12px",
            zIndex: 10,
            pointerEvents: "none",
            minWidth: 140,
          }}
        >
          <p className="text-xs font-semibold mb-1.5" style={{ color: "#4ade80" }}>{hovered}</p>
          <div className="space-y-0.5">
            <p className="text-[11px] flex justify-between gap-4" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>Revenue</span>
              <span className="font-mono font-semibold">${hoveredData.revenue.toLocaleString()}</span>
            </p>
            <p className="text-[11px] flex justify-between gap-4" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>Orders</span>
              <span className="font-mono">{hoveredData.orders}</span>
            </p>
            <p className="text-[11px] flex justify-between gap-4" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>Customers</span>
              <span className="font-mono">{hoveredData.customers}</span>
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Low</span>
        <div className="flex gap-0.5">
          {[0.08, 0.2, 0.35, 0.55, 0.75, 0.9].map((a, i) => (
            <div key={i} style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: `rgba(22,163,74,${a})` }} />
          ))}
        </div>
        <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>High</span>
      </div>
    </div>
  );
}

type TimeRange = "7" | "14" | "30";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2"
        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-mono" style={{ color: p.color }}>
            {p.name}: {p.name === "revenue" ? `$${p.value.toFixed(0)}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const revenueByCategory = [
  { category: "Weight Loss", revenue: 42234.50, pct: 38 },
  { category: "Research Bundles", revenue: 24888.00, pct: 22 },
  { category: "Healing & Recovery", revenue: 18597.85, pct: 17 },
  { category: "Growth Hormone", revenue: 13224.00, pct: 12 },
  { category: "Anti-Aging", revenue: 7456.50, pct: 7 },
  { category: "Nootropics", revenue: 4456.00, pct: 4 },
];

const trendingProducts = [
  { name: "Semaglutide 5mg Vial", change: "+34%", orders: 47 },
  { name: "BPC-157 5mg Vial", change: "+28%", orders: 33 },
  { name: "Tirzepatide 15mg Vial", change: "+21%", orders: 28 },
  { name: "TB-500 2mg Vial", change: "+18%", orders: 19 },
  { name: "Ipamorelin 5mg Vial", change: "+15%", orders: 24 },
];

const customerCohorts = [
  { cohort: "Jan 2026", newCustomers: 142, retained30d: 89, retained60d: 64 },
  { cohort: "Feb 2026", newCustomers: 168, retained30d: 112, retained60d: 0 },
  { cohort: "Mar 2026", newCustomers: 195, retained30d: 0, retained60d: 0 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = useWooData<any>("orders", { per_page: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: discounts } = useWooData<any>("discounts", { per_page: 50 });

  const { chartData, topProducts, orderStatusCounts, trendingProducts, liveStateData, topStates } = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoff = new Date(Date.now() - days * 86400000);

    const filtered = orders.filter((o: any) => {
      const d = o.date_raw || o.date;
      return d && new Date(d) >= cutoff;
    });

    // Build chart data grouped by date
    const dateMap: Record<string, { revenue: number; orders: number }> = {};
    for (const o of filtered) {
      const raw = o.date_raw || o.date || "";
      const dateKey = String(raw).slice(0, 10);
      if (!dateKey) continue;
      const d = new Date(dateKey);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dateMap[label]) dateMap[label] = { revenue: 0, orders: 0 };
      dateMap[label].revenue += parseFloat(String(o.total).replace("$", "")) || 0;
      dateMap[label].orders += 1;
    }
    const chartData = Object.entries(dateMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Top products from line items
    const prodMap: Record<string, { name: string; revenue: number; units: number }> = {};
    for (const o of filtered) {
      for (const item of (o.items || [])) {
        const name = item.name || "Unknown";
        const qty = item.quantity || item.qty || 1;
        const rev = parseFloat(String(item.price).replace("$", "")) * qty || 0;
        if (!prodMap[name]) prodMap[name] = { name, revenue: 0, units: 0 };
        prodMap[name].revenue += rev;
        prodMap[name].units += qty;
      }
    }
    const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Trending: compare first half vs second half
    const half = Math.floor(filtered.length / 2);
    const recentOrders = filtered.slice(0, half);
    const olderOrders = filtered.slice(half);
    const recentMap: Record<string, number> = {};
    const olderMap: Record<string, number> = {};
    for (const o of recentOrders) for (const item of (o.items || [])) recentMap[item.name] = (recentMap[item.name] || 0) + (item.quantity || 1);
    for (const o of olderOrders) for (const item of (o.items || [])) olderMap[item.name] = (olderMap[item.name] || 0) + (item.quantity || 1);
    const trendingProducts = Object.entries(recentMap)
      .map(([name, recent]) => {
        const older = olderMap[name] || 0;
        const change = older > 0 ? Math.round(((recent - older) / older) * 100) : 100;
        return { name, orders: recent, change: `${change >= 0 ? "+" : ""}${change}%` };
      })
      .sort((a, b) => parseInt(b.change) - parseInt(a.change))
      .slice(0, 5);

    // Order status counts
    const orderStatusCounts: Record<string, number> = {};
    for (const o of filtered) {
      const s = (o.status || "").toLowerCase();
      orderStatusCounts[s] = (orderStatusCounts[s] || 0) + 1;
    }

    // State data from shipping addresses
    const stateMap: Record<string, { revenue: number; orders: number; customers: number }> = {};
    for (const o of orders) {
      const state = (o.shippingAddress?.state || "").toUpperCase().slice(0, 2);
      if (!state || state.length !== 2) continue;
      if (!stateMap[state]) stateMap[state] = { revenue: 0, orders: 0, customers: 0 };
      stateMap[state].revenue += parseFloat(String(o.total).replace("$", "")) || 0;
      stateMap[state].orders += 1;
      stateMap[state].customers += 1;
    }
    const liveStateData = Object.keys(stateMap).length > 0 ? stateMap : STATE_DATA;
    const topStates = Object.entries(liveStateData)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([state, d]) => ({ state, ...d }));

    return { chartData, topProducts, orderStatusCounts, trendingProducts, liveStateData, topStates };
  }, [orders, timeRange]);

  const totalRevenue = chartData.reduce((acc: number, d: any) => acc + d.revenue, 0);
  const totalOrders = chartData.reduce((acc: number, d: any) => acc + d.orders, 0);
  const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalStatusCount = Object.values(orderStatusCounts).reduce((a: number, b: number) => a + b, 0) || 1;

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
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Analytics
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Store performance overview
          </p>
        </div>
        <div className="flex gap-1">
          {(["7", "14", "30"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={
                timeRange === r
                  ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                  : {
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "var(--accent-green-bright)" },
            { label: "Total Orders", value: totalOrders, color: "var(--text-primary)" },
            { label: "Avg Order Value", value: `$${avgOrderVal.toFixed(2)}`, color: "var(--text-primary)" },
            { label: "Conversion Rate", value: "3.2%", color: "#60a5fa" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </p>
              <p className="text-2xl font-semibold font-mono tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue & Orders Chart */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
            Revenue & Orders — Last {timeRange} Days
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#555" }}
                tickLine={false}
                axisLine={false}
                interval={timeRange === "7" ? 0 : timeRange === "14" ? 1 : 4}
              />
              <YAxis tick={{ fontSize: 10, fill: "#555" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--hover-min)" }} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[3, 3, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  name="orders"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-center mt-1" style={{ color: "var(--text-muted)" }}>
              Orders count
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top States — US Tile Map */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Revenue by State
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Hover a state for details</p>
            <USMapTile stateData={liveStateData} />
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="space-y-1.5">
                {topStates.map((state, i) => (
                  <div key={state.state} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-4 text-right font-mono" style={{ color: "var(--text-subtle)" }}>{i + 1}</span>
                      <span className="text-xs" style={{ color: "var(--text-primary)" }}>{state.state}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{state.orders} orders</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                        ${(state.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Trending Products */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Trending Products
              </h3>
              <div className="space-y-2.5">
                {trendingProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs flex-1 mr-2 truncate" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {p.orders} orders
                      </span>
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(37,99,235,0.1)",
                          color: "var(--accent-green-bright)",
                        }}
                      >
                        {p.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Order Status Breakdown
              </h3>
              {[
                { key: "shipped", label: "Shipped", color: "#60a5fa" },
                { key: "completed", label: "Completed", color: "#4ade80" },
                { key: "processing", label: "Processing", color: "#c084fc" },
                { key: "pending", label: "Pending", color: "#facc15" },
                { key: "cancelled", label: "Cancelled", color: "#f87171" },
              ].map((s) => {
                const count = (orderStatusCounts as Record<string, number>)[s.key] || 0;
                const pct = Math.round((count / totalStatusCount) * 100);
                return (
                  <div key={s.key} className="mb-2.5">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {s.label}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products by Revenue + Revenue by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Top Products by Revenue
            </h3>
            {topProducts.map((p, i) => {
              const pct = Math.round((p.revenue / topProducts[0].revenue) * 100);
              return (
                <div key={i} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs flex-1 mr-2 truncate" style={{ color: "var(--text-primary)" }}>
                      {p.name.length > 30 ? p.name.slice(0, 30) + "…" : p.name}
                    </span>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--accent-green-bright)" }}>
                      ${(p.revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--accent-green)" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Revenue by Category
            </h3>
            {revenueByCategory.map((c, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                    {c.category}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                    {c.pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, backgroundColor: "#818cf8" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Cohorts + Affiliate Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Customer Cohorts
            </h3>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["COHORT", "NEW", "30D RETENTION", "60D RETENTION"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerCohorts.map((cohort, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(34,34,34,0.4)" }}>
                    <td className="py-2">
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {cohort.cohort}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {cohort.newCustomers}
                      </span>
                    </td>
                    <td className="py-2">
                      {cohort.retained30d > 0 ? (
                        <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                          {cohort.retained30d} ({Math.round((cohort.retained30d / cohort.newCustomers) * 100)}%)
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {cohort.retained60d > 0 ? (
                        <span className="text-xs font-mono" style={{ color: "#60a5fa" }}>
                          {cohort.retained60d} ({Math.round((cohort.retained60d / cohort.newCustomers) * 100)}%)
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Affiliate Leaderboard
            </h3>
            <div className="space-y-3">
              {affiliates
                .filter((a) => a.status === "active")
                .sort((a, b) => b.totalSales - a.totalSales)
                .slice(0, 5)
                .map((aff, i) => (
                  <div key={aff.id} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: i === 0 ? "rgba(202,138,4,0.3)" : "var(--hover-subtle)",
                        color: i === 0 ? "#facc15" : "var(--text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {aff.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {aff.code} · {aff.conversions} sales
                      </p>
                    </div>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: "var(--accent-green-bright)" }}>
                      ${(aff.totalSales / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Promo Code Performance */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Promo Code Performance
          </h3>
          <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["CODE", "TYPE", "VALUE", "USES", "MAX USES", "STATUS"].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.slice(0, 6).map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid rgba(34,34,34,0.4)" }}>
                  <td className="py-2">
                    <span className="text-xs font-mono font-semibold" style={{ color: "#a78bfa" }}>
                      {d.code}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d.type}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                      {d.value}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                      {d.uses}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {(d.maxUses ?? d.limit) ?? "∞"}
                    </span>
                  </td>
                  <td className="py-2">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={
                        d.status === "active"
                          ? { backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }
                          : { backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }
                      }
                    >
                      {d.status === "active" ? "Active" : "Expired"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
