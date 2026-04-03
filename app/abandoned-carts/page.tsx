"use client";

import { ShoppingCart, DollarSign, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { abandonedCarts } from "@/lib/mock-data";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bgVar: string; colorVar: string; borderVar: string }> = {
    new: { label: "New", bgVar: "var(--badge-shipped-bg)", colorVar: "var(--badge-shipped-color)", borderVar: "var(--badge-shipped-border)" },
    email_sent: { label: "Email Sent", bgVar: "var(--badge-processing-bg)", colorVar: "var(--badge-processing-color)", borderVar: "var(--badge-processing-border)" },
    recovered: { label: "Recovered", bgVar: "var(--badge-completed-bg)", colorVar: "var(--badge-completed-color)", borderVar: "var(--badge-completed-border)" },
    lost: { label: "Lost", bgVar: "var(--badge-cancelled-bg)", colorVar: "var(--badge-cancelled-color)", borderVar: "var(--badge-cancelled-border)" },
  };
  const s = map[status] || map.new;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bgVar, color: s.colorVar, border: `1px solid ${s.borderVar}` }}
    >
      {s.label}
    </span>
  );
}

function timeAgo(date: string) {
  const now = new Date("2026-03-28T18:00:00");
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD}d ago`;
  return `${diffH}h ago`;
}

export default function AbandonedCartsPage() {
  const totalValue = abandonedCarts.reduce((acc, c) => acc + c.value, 0);
  const recovered = abandonedCarts.filter((c) => c.status === "recovered");
  const recoveryRate = (recovered.length / abandonedCarts.length) * 100;
  const recoveredValue = recovered.reduce((acc, c) => acc + c.value, 0);
  const pendingValue = abandonedCarts
    .filter((c) => c.status === "new" || c.status === "email_sent")
    .reduce((acc, c) => acc + c.value, 0);

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
            Abandoned Carts
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Recovery and cart analytics
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Safe Mode Banner */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            backgroundColor: "rgba(202,138,4,0.08)",
            border: "1px solid rgba(202,138,4,0.3)",
          }}
        >
          <AlertTriangle size={15} style={{ color: "#facc15", flexShrink: 0 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#facc15" }}>
              Safe Mode Active
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Recovery emails will be sent with a 30-minute delay to prevent sending to customers who return on their own.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Total Abandoned Value",
              value: `$${totalValue.toFixed(2)}`,
              icon: <ShoppingCart size={14} />,
              color: "var(--accent-red)",
            },
            {
              label: "Recoverable Value",
              value: `$${pendingValue.toFixed(2)}`,
              icon: <DollarSign size={14} />,
              color: "#facc15",
            },
            {
              label: "Recovered Value",
              value: `$${recoveredValue.toFixed(2)}`,
              icon: <RefreshCw size={14} />,
              color: "var(--accent-green-bright)",
            },
            {
              label: "Total Carts",
              value: abandonedCarts.length,
              icon: <ShoppingCart size={14} />,
              color: "var(--text-primary)",
            },
            {
              label: "Recovery Rate",
              value: `${recoveryRate.toFixed(1)}%`,
              icon: <RefreshCw size={14} />,
              color: "var(--accent-green-bright)",
            },
            {
              label: "Emails Sent",
              value: abandonedCarts.reduce((acc, c) => acc + c.recoveryEmails, 0),
              icon: <Mail size={14} />,
              color: "var(--badge-shipped-color)",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{card.icon}</span>
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["CUSTOMER", "CART ITEMS", "VALUE", "ABANDONED", "EMAILS", "STATUS", "ACTIONS"].map((h) => (
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
              {abandonedCarts.map((cart) => (
                <tr
                  key={cart.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {cart.customer}
                      </p>
                      {cart.email && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {cart.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {cart.items.map((item, i) => (
                        <p key={i} className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.qty}x {item.name.length > 20 ? item.name.slice(0, 20) + "…" : item.name}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: "var(--accent-green-bright)" }}
                    >
                      ${cart.value.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(cart.abandonedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          cart.recoveryEmails > 0
                            ? "rgba(59,130,246,0.12)"
                            : "var(--bg-elevated)",
                        color: cart.recoveryEmails > 0 ? "var(--badge-shipped-color)" : "var(--text-subtle)",
                      }}
                    >
                      {cart.recoveryEmails}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={cart.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(cart.status === "new" || cart.status === "email_sent") && cart.email && (
                        <button
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                          style={{
                            backgroundColor: "rgba(37,99,235,0.1)",
                            color: "var(--accent-green-bright)",
                            border: "1px solid rgba(37,99,235,0.18)",
                          }}
                        >
                          Send Email
                        </button>
                      )}
                      <button
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        View
                      </button>
                    </div>
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
