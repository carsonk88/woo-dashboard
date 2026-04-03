"use client";

import { orders, affiliates } from "@/lib/mock-data";

const affiliateCodes = affiliates.map((a) => a.code);

const affiliateOrders = orders.slice(0, 8).map((order, i) => ({
  ...order,
  affiliateCode: affiliateCodes[i % affiliateCodes.length],
  affiliateName: affiliates[i % affiliates.length].name,
  commission: order.total * 0.15,
}));

export default function AffiliateOrdersPage() {
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
            Affiliate Orders
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Orders attributed to affiliate codes
          </p>
        </div>
      </div>

      <div className="p-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ORDER", "CUSTOMER", "AFFILIATE", "CODE", "ORDER TOTAL", "COMMISSION", "DATE", "STATUS"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliateOrders.map((order) => (
                <tr
                  key={order.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-medium" style={{ color: "#a78bfa" }}>
                      #{order.id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {order.customer}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {order.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {order.affiliateName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.2)",
                      }}
                    >
                      {order.affiliateCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "#facc15" }}>
                      ${order.commission.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={
                        order.status === "shipped"
                          ? { backgroundColor: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }
                          : order.status === "completed"
                          ? { backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }
                          : order.status === "processing"
                          ? { backgroundColor: "rgba(147,51,234,0.15)", color: "#c084fc", border: "1px solid rgba(147,51,234,0.25)" }
                          : { backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
