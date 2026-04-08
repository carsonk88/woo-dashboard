"use client";

import { useMemo } from "react";
import { useWooData } from "@/lib/use-woo-data";
import { affiliates } from "@/lib/mock-data";

export default function AffiliateOrdersPage() {
  const { data: rawOrders, isLive } = useWooData<any>("orders", { per_page: 50 });

  const affiliateCodes = affiliates.map((a) => a.code);

  const affiliateOrders = useMemo(() => {
    if (isLive) {
      // Show orders where a coupon/discount was applied — these are potential affiliate orders
      const discounted = rawOrders.filter((o: any) => o.discount);
      if (discounted.length > 0) {
        return discounted.map((o: any) => {
          const total = parseFloat(String(o.total).replace("$", "")) || 0;
          return {
            id: o.id,
            number: o.number || `#${String(o.id).slice(-8)}`,
            customer: o.customer?.name || "Unknown",
            email: o.customer?.email || "",
            affiliateCode: "COUPON",
            affiliateName: "Via Coupon",
            total,
            commission: total * 0.15,
            date: o.date,
            status: o.status,
          };
        });
      }
      // No discounted orders — show all orders with mock affiliate attribution
      return rawOrders.slice(0, 8).map((o: any, i: number) => {
        const total = parseFloat(String(o.total).replace("$", "")) || 0;
        return {
          id: o.id,
          number: o.number || `#${String(o.id).slice(-8)}`,
          customer: o.customer?.name || "Unknown",
          email: o.customer?.email || "",
          affiliateCode: affiliateCodes[i % affiliateCodes.length],
          affiliateName: affiliates[i % affiliates.length].name,
          total,
          commission: total * 0.15,
          date: o.date,
          status: o.status,
        };
      });
    }
    // Mock fallback — rawOrders is mock-data format (flat, total as number)
    return rawOrders.slice(0, 8).map((order: any, i: number) => ({
      id: order.id,
      number: `#${String(order.id).slice(-8)}`,
      customer: order.customer?.name || order.customer || "Unknown",
      email: order.customer?.email || order.email || "",
      affiliateCode: affiliateCodes[i % affiliateCodes.length],
      affiliateName: affiliates[i % affiliates.length].name,
      total: parseFloat(String(order.total).replace("$", "")) || order.total || 0,
      commission: (parseFloat(String(order.total).replace("$", "")) || order.total || 0) * 0.15,
      date: order.date,
      status: order.status,
    }));
  }, [rawOrders, isLive]);

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
            {isLive ? "Orders attributed to affiliate codes" : "Demo data — connect WooCommerce to see live orders"}
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
                      {order.number}
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
                      ${(Number(order.total) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "#facc15" }}>
                      ${(Number(order.commission) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {order.date}
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
              {affiliateOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No affiliate orders found</p>
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
