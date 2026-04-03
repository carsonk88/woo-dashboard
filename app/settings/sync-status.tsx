"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

type DataTypeKey = "orders" | "products" | "customers" | "categories" | "reviews" | "discounts" | "shipping";

const DATA_TYPES: { key: DataTypeKey; label: string; unit: string }[] = [
  { key: "orders",     label: "Orders",     unit: "orders"    },
  { key: "products",   label: "Products",   unit: "products"  },
  { key: "customers",  label: "Customers",  unit: "customers" },
  { key: "categories", label: "Categories", unit: "categories"},
  { key: "reviews",    label: "Reviews",    unit: "reviews"   },
  { key: "discounts",  label: "Discounts",  unit: "coupons"   },
  { key: "shipping",   label: "Shipping",   unit: "methods"   },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SyncRow({ label, unit, type }: { label: string; unit: string; type: DataTypeKey }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, isLive, error } = useWooData<any>(type, { per_page: 100 });

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg"
      style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader size={13} className="animate-spin flex-shrink-0" style={{ color: "var(--text-subtle)" }} />
        ) : isLive ? (
          <CheckCircle size={13} className="flex-shrink-0" style={{ color: "#4ade80" }} />
        ) : (
          <AlertCircle size={13} className="flex-shrink-0" style={{ color: "#facc15" }} />
        )}
        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      </div>

      <div className="flex items-center gap-3">
        {error && !loading && (
          <span
            className="text-[10px] font-mono max-w-[200px] truncate"
            style={{ color: "#f87171" }}
            title={error}
          >
            {error.replace("WooCommerce API Error: ", "").slice(0, 40)}
          </span>
        )}
        {!loading && !error && (
          <span
            className="text-[11px] font-mono"
            style={{ color: isLive ? "#4ade80" : "var(--text-subtle)" }}
          >
            {isLive ? `${data.length}${data.length === 100 ? "+" : ""} ${unit}` : "demo data"}
          </span>
        )}
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={
            loading
              ? { backgroundColor: "var(--bg-card)", color: "var(--text-subtle)" }
              : isLive
              ? { backgroundColor: "rgba(22,163,74,0.12)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.25)" }
              : { backgroundColor: "rgba(202,138,4,0.12)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }
          }
        >
          {loading ? "checking…" : isLive ? "Live" : "Demo"}
        </span>
      </div>
    </div>
  );
}

export default function SyncStatusPanel() {
  const [tick, setTick] = useState(0);

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Data Sync Status
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Live vs demo for each data type
          </p>
        </div>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {DATA_TYPES.map((dt) => (
          <SyncRow key={`${dt.key}-${tick}`} label={dt.label} unit={dt.unit} type={dt.key} />
        ))}
      </div>
    </div>
  );
}
