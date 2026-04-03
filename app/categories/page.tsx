"use client";

import { useState } from "react";
import { Plus, Tag, FolderOpen, Package, X } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

const CATEGORY_COLORS = ["#4ade80", "#facc15", "#60a5fa", "#c084fc", "#f97316", "#a78bfa", "#f87171", "#34d399", "#fb923c", "#818cf8"];

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories, loading, isLive } = useWooData<any>("categories", { per_page: 100, hide_empty: 0 });
  const { data: products } = useWooData<any>("products", { per_page: 100 });

  const topLevel = categories.filter((c: any) => c.parent === 0);
  // Use actual product count rather than summing category counts (which double-counts products in multiple categories)
  const totalProducts = products.length;

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
            Categories
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `${topLevel.length} categories · ${totalProducts} products`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
        >
          <Plus size={12} />
          New Category
        </button>
      </div>

      <div className="p-6">
        {!isLive && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <p className="text-xs" style={{ color: "#60a5fa" }}>
              Showing demo data — connect WooCommerce in Settings to sync real categories.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Categories", value: topLevel.length },
            { label: "Total Products", value: totalProducts },
            { label: "Subcategories", value: categories.length - topLevel.length },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
              <p className="text-2xl font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Category grid */}
        {topLevel.length === 0 && !loading ? (
          <div
            className="rounded-xl p-16 flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: "var(--bg-card)", border: "1px dashed var(--border)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <FolderOpen size={28} style={{ color: "var(--text-subtle)" }} />
            </div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No categories yet
            </h3>
            <p className="text-xs max-w-xs mb-6" style={{ color: "var(--text-muted)" }}>
              Connect your WooCommerce store to sync categories, or create your first category manually.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                <Plus size={12} />
                Create Category
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <Tag size={12} />
                Sync from WooCommerce
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {topLevel.map((cat: any, i: number) => {
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              const subcats = categories.filter((c: any) => c.parent !== 0 && String(c.parent) === String(cat.id));
              return (
                <div
                  key={cat.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                      style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
                    >
                      /{cat.slug}
                    </span>
                  </div>

                  {cat.description && (
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      {cat.description.length > 60 ? cat.description.slice(0, 60) + "…" : cat.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Package size={11} style={{ color: "var(--text-subtle)" }} />
                      <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                        {cat.count} products
                      </span>
                    </div>
                    {subcats.length > 0 && (
                      <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                        {subcats.length} subcategories
                      </span>
                    )}
                  </div>

                  {subcats.length > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--row-border)" }}>
                      <div className="flex flex-wrap gap-1.5">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {subcats.slice(0, 4).map((sub: any) => (
                          <span
                            key={sub.id}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                          >
                            {sub.name}
                          </span>
                        ))}
                        {subcats.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "var(--text-subtle)" }}>
                            +{subcats.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Category</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Category Name", key: "name", placeholder: "e.g. Peptides" },
                { label: "Slug", key: "slug", placeholder: "e.g. peptides" },
                { label: "Description", key: "description", placeholder: "Optional description..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={newCat[f.key as keyof typeof newCat]}
                    onChange={(e) => setNewCat((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button
                onClick={() => { setShowModal(false); setNewCat({ name: "", slug: "", description: "" }); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
