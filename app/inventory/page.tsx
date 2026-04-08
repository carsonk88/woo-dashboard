"use client";

import { useState, useMemo } from "react";
import { Search, Archive, AlertTriangle, XCircle, DollarSign } from "lucide-react";
// Mock data removed — uses live WooCommerce data only
import { useWooData } from "@/lib/use-woo-data";

function StockBadge({ status }: { status: string }) {
  if (status === "in_stock") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }}>
        In Stock
      </span>
    );
  }
  if (status === "low_stock") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }}>
        Low Stock
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }}>
      Out of Stock
    </span>
  );
}

const adjustmentLog = [
  { date: "Mar 28", product: "BPC-157 5mg Vial", change: "+12", reason: "Restock" },
  { date: "Mar 27", product: "Semaglutide 5mg Vial", change: "-8", reason: "Sale" },
  { date: "Mar 26", product: "Research Bundle Pack", change: "-3", reason: "Sale" },
  { date: "Mar 25", product: "Ipamorelin 5mg Vial", change: "+20", reason: "Restock" },
  { date: "Mar 24", product: "TB-500 2mg Vial", change: "-5", reason: "Sale" },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products, isLive } = useWooData<any>("products", { per_page: 100, stock_status: "any" });

  // Normalize products to inventory shape
  const inventory = useMemo(() => {
    return products.map((p: any) => {
      const managesStock = p.manage_stock === true;
      const stock = managesStock ? (p.stock ?? 0) : null;
      const stockStatus = p.stock_status || "instock";
      const status = !managesStock
        ? (stockStatus === "outofstock" ? "out_of_stock" : "in_stock")
        : (stock === 0 ? "out_of_stock" : (stock !== null && stock < 10) ? "low_stock" : "in_stock");
      return {
        id: p.id,
        product: p.name,
        sku: p.sku || "—",
        category: p.category || "Uncategorized",
        combined: stock,
        stockLabel: managesStock ? String(stock) : (stockStatus === "instock" ? "In Stock" : "Out of Stock"),
        price: p.price || 0,
        costPerUnit: null,
        image: p.image || null,
        status,
      };
    });
  }, [products, isLive]);

  const filtered = inventory.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) =>
      !search ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalSKUs = inventory.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalValue = (inventory as any[]).reduce((acc: number, item: any) => acc + (item.combined || 0) * (item.costPerUnit || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lowStockCount = (inventory as any[]).filter((i: any) => i.status === "low_stock").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outOfStockCount = (inventory as any[]).filter((i: any) => i.status === "out_of_stock").length;

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
            Inventory
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Stock management across all locations
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total SKUs", value: totalSKUs, icon: <Archive size={14} />, color: "var(--text-primary)" },
            {
              label: "Inventory Value",
              value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              icon: <DollarSign size={14} />,
              color: "var(--accent-green-bright)",
            },
            { label: "Low Stock", value: lowStockCount, icon: <AlertTriangle size={14} />, color: "#facc15" },
            { label: "Out of Stock", value: outOfStockCount, icon: <XCircle size={14} />, color: "var(--accent-red)" },
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
          {/* Main table */}
          <div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
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
              <div className="table-scroll">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["PRODUCT", "SKU", "CATEGORY", "PRICE", "STOCK", "STATUS", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(filtered as any[]).map((item: any) => (
                    <tr
                      key={item.id}
                      className="table-row-hover"
                      style={{ borderBottom: "1px solid var(--row-border)" }}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {item.image ? (
                            <img src={item.image} alt={item.product} className="w-7 h-7 rounded object-cover flex-shrink-0" style={{ border: "1px solid var(--border)" }} />
                          ) : (
                            <div className="w-7 h-7 rounded flex-shrink-0" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} />
                          )}
                          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                            {item.product.length > 22 ? item.product.slice(0, 22) + "…" : item.product}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                          ${(Number(item.price) || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-sm font-mono font-semibold"
                          style={{
                            color:
                              item.combined === 0
                                ? "var(--accent-red)"
                                : item.combined !== null && item.combined < 10
                                ? "#facc15"
                                : "var(--text-primary)",
                          }}
                        >
                          {item.stockLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <StockBadge status={item.status} />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                          }}
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Adjustment Log */}
          <div
            className="rounded-xl p-4 h-fit"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Adjustment Log
            </h3>
            <div className="space-y-3">
              {adjustmentLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      backgroundColor: log.change.startsWith("+")
                        ? "var(--accent-green-bright)"
                        : "var(--accent-red)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                      {log.product.length > 20 ? log.product.slice(0, 20) + "…" : log.product}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {log.reason}
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono font-semibold flex-shrink-0"
                    style={{
                      color: log.change.startsWith("+") ? "var(--accent-green-bright)" : "var(--accent-red)",
                    }}
                  >
                    {log.change}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-[11px] text-center" style={{ color: "var(--text-subtle)" }}>
                Showing last 5 adjustments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
