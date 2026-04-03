"use client";

import { useState, useEffect } from "react";
import { Circle, Monitor, Smartphone, Tablet } from "lucide-react";
import { liveVisitors, revenueStats } from "@/lib/mock-data";

type LiveTab = "live" | "today" | "7days" | "30days";

const liveEvents = [
  { type: "purchase", text: "James H. completed a $249.99 purchase", time: "2s ago", color: "#4ade80" },
  { type: "cart", text: "New visitor added BPC-157 5mg Vial to cart", time: "12s ago", color: "#facc15" },
  { type: "checkout", text: "Maria S. started checkout — $259.00", time: "28s ago", color: "#60a5fa" },
  { type: "visit", text: "New visitor from Austin, TX via Google", time: "34s ago", color: "var(--text-muted)" },
  { type: "cart", text: "Tom B. added Semaglutide 5mg Vial to cart", time: "1m ago", color: "#facc15" },
  { type: "purchase", text: "Sarah M. completed a $89.95 purchase", time: "2m ago", color: "#4ade80" },
  { type: "visit", text: "New visitor from Denver, CO via Instagram", time: "3m ago", color: "var(--text-muted)" },
  { type: "cart", text: "Visitor added CJC-1295 DAC 2mg Vial to cart", time: "4m ago", color: "#facc15" },
  { type: "checkout", text: "Anonymous started checkout — $150.00", time: "5m ago", color: "#60a5fa" },
  { type: "visit", text: "3 new visitors from Portland, OR via Facebook", time: "6m ago", color: "var(--text-muted)" },
];

const pagesRightNow = [
  { page: "Product: Semaglutide 5mg Vial", visitors: 4 },
  { page: "Checkout", visitors: 3 },
  { page: "Cart", visitors: 2 },
  { page: "Product: BPC-157 5mg Vial", visitors: 2 },
  { page: "Collections: Weight Loss", visitors: 1 },
  { page: "Home", visitors: 1 },
  { page: "Blog: Peptide Research Guide", visitors: 1 },
];

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

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone size={13} style={{ color: "var(--text-muted)" }} />;
  if (device === "Tablet") return <Tablet size={13} style={{ color: "var(--text-muted)" }} />;
  return <Monitor size={13} style={{ color: "var(--text-muted)" }} />;
}

export default function LivePage() {
  const [tab, setTab] = useState<LiveTab>("live");
  const [visitorCount, setVisitorCount] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount((c) => c + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: LiveTab; label: string }[] = [
    { key: "live", label: "Live" },
    { key: "today", label: "Today" },
    { key: "7days", label: "7 Days" },
    { key: "30days", label: "30 Days" },
  ];

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
                  : {
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }
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
        {/* Revenue + Orders vs yesterday */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {tab === "live" ? "Today's Revenue" : tab === "today" ? "Today's Revenue" : tab === "7days" ? "7-Day Revenue" : "30-Day Revenue"}
            </p>
            <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
              ${tab === "live" || tab === "today" ? revenueStats.today.toFixed(2) : tab === "7days" ? revenueStats.last7days.toLocaleString() : revenueStats.thisMonth.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--accent-green-bright)" }}>
              +{tab === "live" || tab === "today" ? "28.9" : "12.4"}% vs yesterday
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {tab === "live" ? "Today's Orders" : "Orders"}
            </p>
            <p className="text-3xl font-semibold font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
              {tab === "live" || tab === "today" ? 4 : tab === "7days" ? 26 : 89}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--accent-green-bright)" }}>
              vs {tab === "live" || tab === "today" ? 6 : tab === "7days" ? 22 : 76} yesterday period
            </p>
          </div>
        </div>

        {/* Live visitor count */}
        {tab === "live" && (
          <div
            className="rounded-xl p-4 mb-4 flex items-center gap-4"
            style={{
              backgroundColor: "rgba(37,99,235,0.08)",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            <Circle size={10} className="fill-green-400 text-green-400 pulse-green" />
            <div>
              <span
                className="text-4xl font-semibold font-mono tabular-nums"
                style={{ color: "var(--accent-green-bright)" }}
              >
                {visitorCount}
              </span>
              <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>
                active visitors right now
              </span>
            </div>
          </div>
        )}

        {/* 5 metric cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: "Pageviews", value: tab === "live" ? "142" : tab === "today" ? "1,842" : tab === "7days" ? "12,456" : "48,234" },
            { label: "Unique Visitors", value: tab === "live" ? "87" : tab === "today" ? "984" : tab === "7days" ? "6,234" : "24,156" },
            { label: "Cart Adds", value: tab === "live" ? "14" : tab === "today" ? "89" : tab === "7days" ? "534" : "2,134" },
            { label: "Checkouts", value: tab === "live" ? "6" : tab === "today" ? "34" : tab === "7days" ? "198" : "756" },
            { label: "Conversions", value: tab === "live" ? "4" : tab === "today" ? "18" : tab === "7days" ? "89" : "312", color: "var(--accent-green-bright)" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </p>
              <p
                className="text-xl font-semibold font-mono tabular-nums"
                style={{ color: card.color || "var(--text-primary)" }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
          {/* Active Visitors table */}
          <div className="space-y-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Active Visitors
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["PAGE", "LOCATION", "DEVICE", "SOURCE", "TIME", "CART", "INTENT"].map((h) => (
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
                  {liveVisitors.map((v) => (
                    <tr
                      key={v.id}
                      className="table-row-hover"
                      style={{ borderBottom: "1px solid rgba(34,34,34,0.4)" }}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                          {v.pageLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {v.location}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <DeviceIcon device={v.device} />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {v.source}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {v.duration}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {v.cartValue > 0 ? (
                          <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                            ${v.cartValue.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <IntentBadge intent={v.intent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right sidebar: Pages + Events feed */}
          <div className="space-y-4">
            {/* Pages Right Now */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Pages Right Now
              </h3>
              <div className="space-y-2">
                {pagesRightNow.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span
                      className="text-xs truncate flex-1 mr-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.page}
                    </span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(37,99,235,0.1)",
                        color: "var(--accent-green-bright)",
                      }}
                    >
                      {p.visitors}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Events Feed */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Circle size={6} className="fill-green-400 text-green-400 pulse-green" />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Live Events
                </h3>
              </div>
              <div className="space-y-2.5">
                {liveEvents.slice(0, 8).map((event, i) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
