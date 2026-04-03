"use client";

import { X, Package, MapPin, CreditCard, ExternalLink } from "lucide-react";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
  shipping: {
    address: string;
    method: string;
    tracking: string;
  };
}

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    shipped: {
      label: "Shipped",
      bg: "rgba(59,130,246,0.15)",
      color: "#60a5fa",
      border: "rgba(59,130,246,0.3)",
    },
    completed: {
      label: "Completed",
      bg: "rgba(37,99,235,0.12)",
      color: "#4ade80",
      border: "rgba(37,99,235,0.25)",
    },
    pending: {
      label: "Pending",
      bg: "rgba(202,138,4,0.15)",
      color: "#facc15",
      border: "rgba(202,138,4,0.3)",
    },
    processing: {
      label: "Processing",
      bg: "rgba(147,51,234,0.15)",
      color: "#c084fc",
      border: "rgba(147,51,234,0.3)",
    },
    cancelled: {
      label: "Cancelled",
      bg: "rgba(220,38,38,0.15)",
      color: "#f87171",
      border: "rgba(220,38,38,0.3)",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  if (!order) return null;

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = order.total - subtotal > 0 ? order.total - subtotal : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen w-[440px] z-50 flex flex-col overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-sm font-mono font-medium"
                style={{ color: "#a78bfa" }}
              >
                #{order.id}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(order.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-btn)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Customer */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Customer
            </h3>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {order.customer}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {order.email}
            </p>
          </div>

          {/* Items */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Package size={13} style={{ color: "var(--text-muted)" }} />
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Order Items ({order.items.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Qty: {item.qty}
                    </p>
                  </div>
                  <span
                    className="text-sm font-mono ml-3 flex-shrink-0"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mt-4 pt-3 space-y-1.5"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>Shipping</span>
                  <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                    ${shipping.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: "var(--text-primary)" }}>Total</span>
                <span
                  className="font-mono"
                  style={{ color: "var(--accent-green-bright)" }}
                >
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} style={{ color: "var(--text-muted)" }} />
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Shipping
              </h3>
            </div>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {order.shipping.address}
            </p>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              {order.shipping.method}
            </p>
            {order.shipping.tracking && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Tracking:
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "#60a5fa" }}
                >
                  {order.shipping.tracking}
                </span>
                <ExternalLink
                  size={10}
                  style={{ color: "#60a5fa" }}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Payment */}
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={13} style={{ color: "var(--text-muted)" }} />
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Payment
              </h3>
            </div>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              Credit Card (ending 4242)
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Payment captured
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="p-4 flex gap-2 sticky bottom-0"
          style={{
            backgroundColor: "var(--bg-card)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent-green)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
            }}
          >
            Mark as Shipped
          </button>
          <button
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--hover-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,0,0,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-subtle)";
            }}
          >
            Refund Order
          </button>
        </div>
      </div>
    </>
  );
}
