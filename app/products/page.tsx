"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, Edit, ExternalLink, ChevronDown, X, CheckCircle } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span
        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: "var(--badge-shipped-bg)",
          color: "var(--badge-shipped-color)",
          border: "1px solid rgba(37,99,235,0.2)",
        }}
      >
        Active
      </span>
    );
  }
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: "var(--hover-subtle)",
        color: "var(--text-muted)",
        border: "1px solid var(--border)",
      }}
    >
      Draft
    </span>
  );
}

const categories = ["All", "Weight Loss", "Growth Hormone", "Healing & Recovery", "Sexual Health", "Anti-Aging", "Nootropics", "Research Bundles"];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name");
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncWix, setShowSyncWix] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "Weight Loss", price: "", stock: "" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products, loading, isLive, refresh } = useWooData<any>("products");

  const handleSync = (type: "woo" | "wix") => {
    setSyncing(true);
    setSyncDone(false);
    if (type === "wix") setShowSyncWix(true);
    setTimeout(() => { setSyncing(false); setSyncDone(true); setTimeout(() => { setSyncDone(false); if (type === "wix") setShowSyncWix(false); }, 2500); }, 1800);
  };

  const filtered = products
    .filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "stock") return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });

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
            Products
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSync("woo")}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync WooCommerce"}
          </button>
          <button
            onClick={() => handleSync("wix")}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            <RefreshCw size={12} />
            Sync Wix
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
            }}
          >
            <Plus size={12} />
            Add Product
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search products, SKUs..."
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

          {/* Category dropdown */}
          <div className="relative">
            <button
              onClick={() => { setCatOpen(!catOpen); setSortOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                minWidth: "140px",
              }}
            >
              {category}
              <ChevronDown size={12} className="ml-auto" style={{ color: "var(--text-muted)" }} />
            </button>
            {catOpen && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-20"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  minWidth: "160px",
                }}
              >
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setCatOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: category === c ? "var(--accent-green-bright)" : "var(--text-primary)",
                      backgroundColor: category === c ? "rgba(37,99,235,0.08)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (category !== c) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-faint)";
                    }}
                    onMouseLeave={(e) => {
                      if (category !== c) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => { setSortOpen(!sortOpen); setCatOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                minWidth: "140px",
              }}
            >
              {sort === "name" ? "Sort: Name" : sort === "price_asc" ? "Price: Low" : sort === "price_desc" ? "Price: High" : "By Stock"}
              <ChevronDown size={12} className="ml-auto" style={{ color: "var(--text-muted)" }} />
            </button>
            {sortOpen && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg overflow-hidden z-20"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  minWidth: "160px",
                }}
              >
                {[
                  { key: "name", label: "Name A-Z" },
                  { key: "price_asc", label: "Price: Low to High" },
                  { key: "price_desc", label: "Price: High to Low" },
                  { key: "stock", label: "By Stock" },
                ].map((s: any) => (
                  <button
                    key={s.key}
                    onClick={() => { setSort(s.key); setSortOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: sort === s.key ? "var(--accent-green-bright)" : "var(--text-primary)",
                      backgroundColor: sort === s.key ? "rgba(37,99,235,0.08)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (sort !== s.key) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-faint)";
                    }}
                    onMouseLeave={(e) => {
                      if (sort !== s.key) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["PRODUCT", "CATEGORY", "PRICE", "SALE PRICE", "SIZES", "STOCK", "STATUS", "ACTIONS"].map((h) => (
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
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {product.name}
                        </p>
                        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: "var(--hover-faint)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                      ${(Number(product.price) || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.sale_price ? (
                      <span className="text-sm font-mono" style={{ color: "var(--accent-green-bright)" }}>
                        ${(Number(product.sale_price) || 0).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes.slice(0, 2).map((s: any) => (
                        <span
                          key={s}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: "rgba(129,140,248,0.12)",
                            color: "#a5b4fc",
                            border: "1px solid rgba(129,140,248,0.2)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {product.sizes.length > 2 && (
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          +{product.sizes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-mono"
                      style={{
                        color:
                          product.stock === 0
                            ? "var(--accent-red)"
                            : product.stock < 10
                            ? "#facc15"
                            : "var(--text-primary)",
                      }}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-md transition-colors"
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
                        <Edit size={13} />
                      </button>
                      <button
                        className="p-1.5 rounded-md transition-colors"
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
                        <ExternalLink size={13} />
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowAddModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Product Name", key: "name", placeholder: "e.g. BPC-157 5mg Vial" },
                { label: "SKU", key: "sku", placeholder: "e.g. BPC157-5MG" },
                { label: "Price ($)", key: "price", placeholder: "0.00" },
                { label: "Stock Qty", key: "stock", placeholder: "0" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={newProduct[f.key as keyof typeof newProduct]}
                    onChange={(e) => setNewProduct((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  {categories.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button
                onClick={() => { setShowAddModal(false); setNewProduct({ name: "", sku: "", category: "Weight Loss", price: "", stock: "" }); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wix Sync Modal */}
      {showSyncWix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-8 w-full max-w-sm mx-4 text-center" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            {syncing ? (
              <>
                <RefreshCw size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent-green-bright)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Syncing to Wix...</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Pushing product catalog to your Wix store</p>
              </>
            ) : (
              <>
                <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "var(--accent-green-bright)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Wix Sync Complete</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{products.length} products synced successfully</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
