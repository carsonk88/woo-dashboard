"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";
import OrdersTable from "@/components/OrdersTable";

export default function OrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, loading, error, isLive, refresh } = useWooData<any>("orders");

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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Orders
            </h1>
            {isLive ? (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                <Wifi size={10} /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
                <WifiOff size={10} /> Demo
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)"; }}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {isLive ? "Refresh" : "Sync WooCommerce"}
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-xs" style={{ backgroundColor: "var(--error-bg)", color: "#dc2626", border: "1px solid #7f1d1d" }}>
          WooCommerce error: {error} — showing demo data
        </div>
      )}

      <div className="p-6">
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
              <RefreshCw size={20} className="animate-spin mr-2" /> Loading orders...
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>
      </div>
    </div>
  );
}
