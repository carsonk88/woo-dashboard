"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import OrderDetailPanel from "./OrderDetailPanel";

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

interface OrdersTableProps {
  orders: Order[];
  compact?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    shipped: {
      label: "Shipped",
      bg: "rgba(59,130,246,0.15)",
      color: "#60a5fa",
      border: "rgba(59,130,246,0.25)",
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
      border: "rgba(202,138,4,0.25)",
    },
    processing: {
      label: "Processing",
      bg: "rgba(147,51,234,0.15)",
      color: "#c084fc",
      border: "rgba(147,51,234,0.25)",
    },
    cancelled: {
      label: "Cancelled",
      bg: "rgba(220,38,38,0.15)",
      color: "#f87171",
      border: "rgba(220,38,38,0.25)",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
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

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Completed", "Cancelled"];

export default function OrdersTable({ orders, compact = false }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchTab =
      activeTab === "All" || o.status.toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div>
      {!compact && (
        <div className="flex flex-col gap-3 mb-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={
                  activeTab === tab
                    ? {
                        backgroundColor: "var(--accent-green)",
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ORDER", "CUSTOMER", "DATE", "TOTAL", "STATUS"].map((h) => (
                <th
                  key={h}
                  className="text-left pb-3 pr-4 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-subtle)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer transition-colors table-row-hover"
                style={{ borderBottom: "1px solid var(--row-border)" }}
              >
                <td className="py-3 pr-4">
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: "#a78bfa" }}
                  >
                    #{order.id.slice(-8)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.customer}
                    </p>
                    {!compact && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {order.email}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {new Date(order.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: "var(--accent-green-bright)" }}
                  >
                    ${order.total.toFixed(2)}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
