"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

function AccountTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    vip: {
      label: "VIP",
      bg: "var(--badge-pending-bg)",
      color: "var(--badge-pending-color)",
      border: "var(--badge-pending-border)",
    },
    registered: {
      label: "Registered",
      bg: "var(--badge-shipped-bg)",
          color: "var(--badge-shipped-color)",
      border: "var(--badge-shipped-border)",
    },
    guest: {
      label: "Guest",
      bg: "var(--hover-subtle)",
      color: "var(--text-muted)",
      border: "var(--border)",
    },
  };
  const s = map[type] || map.guest;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customers, loading, isLive, refresh } = useWooData<any>("customers");

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

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
            Customers
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {customers.length} customers
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-card)",
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

        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["CUSTOMER", "ORDERS", "LIFETIME VALUE", "AVG ORDER", "LAST ORDER", "TYPE"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="table-row-hover cursor-pointer"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                      >
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {customer.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                      {customer.orders}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                      ${customer.lifetime_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                      ${(Number(customer.avg_order) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {customer.last_order || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AccountTypeBadge type={customer.account_type} />
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
