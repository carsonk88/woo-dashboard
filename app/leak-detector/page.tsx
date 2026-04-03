"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, AlertCircle } from "lucide-react";

type TimeRange = "7" | "14" | "30";

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "High Cart Abandonment Rate on Semaglutide 5mg Vial",
    description:
      "73% of visitors who add Semaglutide 5mg Vial to cart are abandoning checkout. This is 28% above average. Possible causes: price shock at checkout, missing payment options, or trust issues.",
    metric: "73% abandonment",
    impact: "$4,200 potential lost revenue",
    date: "Mar 28",
  },
  {
    id: 2,
    type: "critical",
    title: "Checkout Page Load Time Exceeding 3 Seconds",
    description:
      "Your checkout page is averaging 3.8 second load times on mobile devices. Research shows every second delay costs ~20% conversions. This is likely costing you 2-4 sales per day.",
    metric: "3.8s load time",
    impact: "~$800/week in lost conversions",
    date: "Mar 27",
  },
  {
    id: 3,
    type: "warning",
    title: "Email Recovery Sequence Not Configured",
    description:
      "You have 3 abandoned carts with no email recovery sequence triggered. Setting up a 3-email sequence can recover 5-15% of abandoned carts automatically.",
    metric: "3 unrecovered carts",
    impact: "$694 recoverable",
    date: "Mar 27",
  },
  {
    id: 4,
    type: "warning",
    title: "Out of Stock: Premium Research Bundle Pack",
    description:
      "The Premium Research Bundle Pack (your 3rd highest revenue product) has been out of stock for 6 days. You may be losing $1,500+ in weekly revenue. Consider a back-in-stock notification.",
    metric: "6 days out of stock",
    impact: "Estimated $1,500/week lost",
    date: "Mar 26",
  },
  {
    id: 5,
    type: "warning",
    title: "Low Stock Alert: 3 Products Below 10 Units",
    description:
      "Ipamorelin 5mg Vial (8 units), CJC-1295 2mg Vial (7 units), and Sermorelin 2mg Vial (6 units) are running low. Reorder recommended within the next 5 days.",
    metric: "3 products low stock",
    impact: "Risk of lost sales",
    date: "Mar 26",
  },
  {
    id: 6,
    type: "win",
    title: "Instagram Retargeting ROAS Above 4x",
    description:
      "Your Facebook retargeting campaign is performing exceptionally well with a 4.89x ROAS. Consider increasing budget by 20-30% to scale this winning campaign.",
    metric: "4.89x ROAS",
    impact: "+$1,200/month potential",
    date: "Mar 25",
  },
  {
    id: 7,
    type: "win",
    title: "Semaglutide 5mg Trending +34% Week-over-Week",
    description:
      "Your Semaglutide 5mg Vial has seen a 34% increase in orders this week. Capitalize on the momentum by featuring it in your next email campaign and social posts.",
    metric: "+34% growth",
    impact: "Momentum to leverage",
    date: "Mar 25",
  },
  {
    id: 8,
    type: "warning",
    title: "No Reviews on 8 Products",
    description:
      "8 of your 15 products have zero reviews. Products with reviews convert 3.5x better. Consider sending a post-purchase review request email sequence.",
    metric: "8 products, 0 reviews",
    impact: "3.5x conversion opportunity",
    date: "Mar 24",
  },
  {
    id: 9,
    type: "win",
    title: "Organic Google Traffic Up 18% This Month",
    description:
      "Your organic search traffic has grown 18% month-over-month, likely driven by recent blog content. Continue publishing high-value peptide research educational content to compound this growth.",
    metric: "+18% organic traffic",
    impact: "$3,200 in attributed revenue",
    date: "Mar 23",
  },
  {
    id: 10,
    type: "critical",
    title: "Payment Method: Missing Crypto/ACH Options",
    description:
      "Analysis shows 12% of your checkout drop-offs occur on the payment page. Adding ACH/bank transfer and cryptocurrency options may capture high-value buyers who prefer these methods.",
    metric: "12% payment drop-off",
    impact: "Estimated 6-8 lost orders/week",
    date: "Mar 22",
  },
];

type AlertType = "all" | "critical" | "warning" | "win";

export default function LeakDetectorPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [filter, setFilter] = useState<AlertType>("all");

  const filtered = alerts.filter((a) => filter === "all" || a.type === filter);

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
            Leak Detector
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            AI-powered insights to find and fix revenue leaks
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
                  : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Critical Issues",
              value: alerts.filter((a) => a.type === "critical").length,
              color: "var(--accent-red)",
              bg: "rgba(220,38,38,0.08)",
              border: "rgba(220,38,38,0.2)",
            },
            {
              label: "Warnings",
              value: alerts.filter((a) => a.type === "warning").length,
              color: "#facc15",
              bg: "rgba(202,138,4,0.08)",
              border: "var(--badge-pending-border)",
            },
            {
              label: "Wins",
              value: alerts.filter((a) => a.type === "win").length,
              color: "var(--accent-green-bright)",
              bg: "rgba(37,99,235,0.08)",
              border: "rgba(37,99,235,0.18)",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: card.bg, border: `1px solid ${card.border}` }}
            >
              <p className="text-3xl font-bold font-mono mb-1" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-xs font-medium" style={{ color: card.color }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {(["all", "critical", "warning", "win"] as AlertType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={
                filter === f
                  ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                  : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl p-5"
              style={{
                backgroundColor:
                  alert.type === "critical"
                    ? "rgba(220,38,38,0.05)"
                    : alert.type === "win"
                    ? "rgba(22,163,74,0.05)"
                    : "rgba(202,138,4,0.05)",
                border: `1px solid ${
                  alert.type === "critical"
                    ? "rgba(220,38,38,0.2)"
                    : alert.type === "win"
                    ? "rgba(37,99,235,0.18)"
                    : "var(--badge-pending-border)"
                }`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    backgroundColor:
                      alert.type === "critical"
                        ? "rgba(220,38,38,0.15)"
                        : alert.type === "win"
                        ? "rgba(37,99,235,0.12)"
                        : "rgba(202,138,4,0.15)",
                  }}
                >
                  {alert.type === "critical" ? (
                    <AlertCircle
                      size={16}
                      style={{ color: "var(--accent-red)" }}
                    />
                  ) : alert.type === "win" ? (
                    <TrendingUp size={16} style={{ color: "var(--accent-green-bright)" }} />
                  ) : (
                    <AlertTriangle size={16} style={{ color: "#facc15" }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3
                      className="text-sm font-semibold"
                      style={{
                        color:
                          alert.type === "critical"
                            ? "#dc2626"
                            : alert.type === "win"
                            ? "#4ade80"
                            : "#fde047",
                      }}
                    >
                      {alert.title}
                    </h3>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-subtle)" }}>
                      {alert.date}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          alert.type === "critical"
                            ? "rgba(220,38,38,0.15)"
                            : alert.type === "win"
                            ? "rgba(37,99,235,0.12)"
                            : "rgba(202,138,4,0.15)",
                        color:
                          alert.type === "critical"
                            ? "#dc2626"
                            : alert.type === "win"
                            ? "#4ade80"
                            : "#fde047",
                      }}
                    >
                      {alert.metric}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {alert.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
