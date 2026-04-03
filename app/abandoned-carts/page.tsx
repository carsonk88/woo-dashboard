"use client";

import { useMemo } from "react";
import { ShoppingCart, DollarSign, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { abandonedCarts as mockCarts } from "@/lib/mock-data";
import { useWooData } from "@/lib/use-woo-data";

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
  const then = new Date(date);
  if (isNaN(then.getTime())) return date;
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD}d ago`;
  if (diffH > 0) return `${diffH}h ago`;
  return "recently";
}

export default function AbandonedCartsPage() {
  const { data: rawOrders, isLive } = useWooData<any>("orders", { status: "pending", per_page: 50 });

  const carts = useMemo(() => {
    if (!isLive) return mockCarts;
    return rawOrders.map((o: any) => ({
      id: o.id,
      customer: o.customer?.name || o.customer || "Unknown",
      email: o.customer?.email || o.email || "",
      items: (o.items || []).map((i: any) => ({ qty: i.quantity ?? i.qty ?? 1, name: i.name })),
      value: parseFloat(String(o.total).replace("$", "")) || 0,
      abandonedAt: o.date,
      status: "new" as const,
      recoveryEmails: 0,
    }));
  }, [rawOrders, isLive]);

  const totalValue = carts.reduce((acc, c) => acc + c.value, 0);
  const recovered = carts.filter((c) => c.status === "recovered");
  const recoveryRate = carts.length > 0 ? (recovered.length / carts.length) * 100 : 0;
  const recoveredValue = recovered.reduce((acc, c) => acc + c.value, 0);
  const pendingValue = carts
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
            {isLive ? `${carts.length} pending orders` : "Recovery and cart analytics"}
          </p>
        </div>
      </div>

      <div className="p-6">
        {isLive && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
            style={{
              backgroundColor: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <ShoppingCart size={14} style={{ color: "#60a5fa", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing <span style={{ color: "#60a5fa" }}>pending orders</span> from WooCommerce as potential abandoned carts.
            </p>
          </div>
        )}

        {!isLive && (
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
        )}

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
              value: carts.length,
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
              value: carts.reduce((acc, c) => acc + (c.recoveryEmails || 0), 0),
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
              {carts.map((cart) => (
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {cart.items.map((item: any, i: number) => (
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
                          (cart.recoveryEmails || 0) > 0
                            ? "rgba(59,130,246,0.12)"
                            : "var(--bg-elevated)",
                        color: (cart.recoveryEmails || 0) > 0 ? "var(--badge-shipped-color)" : "var(--text-subtle)",
                      }}
                    >
                      {cart.recoveryEmails || 0}
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
              {carts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {isLive ? "No pending orders found" : "No abandoned carts"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
