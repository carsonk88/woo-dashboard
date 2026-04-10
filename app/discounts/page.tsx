"use client";
import { useState } from "react";

import { Plus, Edit, Slash, Trash2, X, Play } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

export default function DiscountsPage() {
  const { data: wooDiscounts, loading, isLive, refresh } = useWooData<any>("discounts");
  const [localDiscounts, setLocalDiscounts] = useState<any[]>([]);
  const discounts = [...wooDiscounts, ...localDiscounts];
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minOrder: "", maxUses: "" });

  const openCreate = () => { setEditItem(null); setForm({ code: "", type: "percentage", value: "", minOrder: "", maxUses: "" }); setShowModal(true); };
  const openEdit = (d: any) => { setEditItem(d); setForm({ code: d.code, type: d.type, value: d.value, minOrder: String(d.minOrder || ""), maxUses: String(d.maxUses || "") }); setShowModal(true); };
  const saveForm = () => {
    if (editItem) {
      setLocalDiscounts((prev) => prev.map((d) => d.id === editItem.id ? { ...d, code: form.code, type: form.type, value: form.value, minOrder: parseFloat(form.minOrder) || 0 } : d));
    } else {
      setLocalDiscounts((prev) => [...prev, { id: Date.now(), code: form.code.toUpperCase(), type: form.type, value: form.value, minOrder: parseFloat(form.minOrder) || 0, uses: 0, maxUses: form.maxUses ? parseInt(form.maxUses) : null, status: "active", startDate: new Date().toISOString(), endDate: null }]);
    }
    setShowModal(false); setEditItem(null);
  };
  const deleteDiscount = (id: any) => setLocalDiscounts((prev) => prev.filter((d) => d.id !== id));
  const toggleStatus = (id: any) => setLocalDiscounts((prev) => prev.map((d) => d.id === id ? { ...d, status: d.status === "active" ? "disabled" : "active" } : d));
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
            Discounts
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {discounts.length} discount codes
          </p>
        </div>
        <button
          onClick={openCreate}
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
          New Discount
        </button>
      </div>

      <div className="p-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["CODE", "TYPE", "VALUE", "MIN ORDER", "USES", "DATES", "STATUS", "ACTIONS"].map((h) => (
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
              {discounts.map((d) => (
                <tr
                  key={d.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.2)",
                      }}
                    >
                      {d.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          d.type === "percentage"
                            ? "rgba(59,130,246,0.12)"
                            : d.type === "fixed"
                            ? "rgba(37,99,235,0.1)"
                            : "rgba(202,138,4,0.12)",
                        color:
                          d.type === "percentage"
                            ? "#60a5fa"
                            : d.type === "fixed"
                            ? "var(--accent-green-bright)"
                            : "#facc15",
                      }}
                    >
                      {d.value}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {d.minOrder > 0 ? `$${(Number(d.minOrder) || 0).toFixed(2)}` : "None"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                        {d.uses.toLocaleString()}
                      </span>
                      {d.maxUses && (
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          /{d.maxUses}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {new Date(d.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      {d.endDate && (
                        <p className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>
                          → {new Date(d.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={
                        d.status === "active"
                          ? {
                              backgroundColor: "rgba(22,163,74,0.12)",
                              color: "#4ade80",
                              border: "1px solid rgba(22,163,74,0.25)",
                            }
                          : {
                              backgroundColor: "rgba(220,38,38,0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(220,38,38,0.25)",
                            }
                      }
                    >
                      {d.status === "active" ? "Active" : d.status === "expired" ? "Expired" : d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(d)}
                        className="p-1.5 rounded-md transition-colors"
                        title="Edit"
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
                        onClick={() => toggleStatus(d.id)}
                        className="p-1.5 rounded-md transition-colors"
                        title={d.status === "active" ? "Disable" : "Enable"}
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-btn)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#facc15";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                        }}
                      >
                        {d.status === "active" ? <Slash size={13} /> : <Play size={13} />}
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        className="p-1.5 rounded-md transition-colors"
                        title="Delete"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(220,38,38,0.1)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => { setShowModal(false); setEditItem(null); }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{editItem ? "Edit Discount" : "New Discount"}</h2>
              <button onClick={() => { setShowModal(false); setEditItem(null); }} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Code</label>
                <input type="text" placeholder="e.g. SAVE20" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Value</label>
                <input type="text" placeholder={form.type === "percentage" ? "e.g. 20%" : "e.g. $15"} value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Min Order ($)</label>
                <input type="number" placeholder="0" value={form.minOrder} onChange={(e) => setForm((p) => ({ ...p, minOrder: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Max Uses (optional)</label>
                <input type="number" placeholder="Unlimited" value={form.maxUses} onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowModal(false); setEditItem(null); }} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button onClick={saveForm} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}>
                {editItem ? "Save Changes" : "Create Discount"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
