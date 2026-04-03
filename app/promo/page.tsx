"use client";

import { useState } from "react";
import { Plus, Edit, Pause, Trash2, BarChart2, X, Play } from "lucide-react";
import { discounts as initialDiscounts, affiliates as initialAffiliates } from "@/lib/mock-data";

type PromoTab = "codes" | "affiliates" | "analytics";

export default function PromoPage() {
  const [tab, setTab] = useState<PromoTab>("codes");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discounts, setDiscounts] = useState<any[]>(initialDiscounts);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [affiliates, setAffiliates] = useState<any[]>(initialAffiliates);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showAffModal, setShowAffModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editCode, setEditCode] = useState<any | null>(null);
  const [newCode, setNewCode] = useState({ code: "", type: "percentage", value: "", maxUses: "" });
  const [newAff, setNewAff] = useState({ name: "", email: "", code: "", rate: "15%" });

  const tabs: { key: PromoTab; label: string; icon: React.ReactNode }[] = [
    { key: "codes", label: "Promo Codes", icon: null },
    { key: "affiliates", label: "Affiliates", icon: null },
    { key: "analytics", label: "Analytics", icon: <BarChart2 size={13} /> },
  ];

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
            Promo & Affiliates
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Manage promotions, affiliate codes, and performance
          </p>
        </div>
        <button
          onClick={() => tab === "affiliates" ? setShowAffModal(true) : setShowCodeModal(true)}
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
          {tab === "affiliates" ? "New Affiliate" : "Create Code"}
        </button>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors"
              style={
                tab === t.key
                  ? {
                      color: "var(--accent-green-bright)",
                      borderBottom: "2px solid var(--accent-green-bright)",
                      marginBottom: "-1px",
                    }
                  : { color: "var(--text-muted)" }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "codes" && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["CODE", "TYPE", "VALUE", "AFFILIATE", "COMMISSION", "USES", "REVENUE", "STATUS", "EXPIRY", "ACTIONS"].map((h) => (
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
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: "var(--accent-green-bright)" }}
                      >
                        {d.value}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: "var(--text-subtle)" }}>—</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {d.uses}
                        {d.maxUses ? `/${d.maxUses}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                        ${(d.uses * 45).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={
                          d.status === "active"
                            ? {
                                backgroundColor: "rgba(37,99,235,0.12)",
                                color: "#4ade80",
                                border: "1px solid rgba(37,99,235,0.25)",
                              }
                            : {
                                backgroundColor: "rgba(220,38,38,0.15)",
                                color: "#f87171",
                                border: "1px solid rgba(220,38,38,0.25)",
                              }
                        }
                      >
                        {d.status === "active" ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {d.endDate ? new Date(d.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No expiry"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditCode(d); setNewCode({ code: d.code, type: d.type, value: d.value, maxUses: d.maxUses || "" }); setShowCodeModal(true); }}
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
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x))}
                          className="p-1.5 rounded-md transition-colors"
                          title={d.status === "active" ? "Pause" : "Resume"}
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
                          {d.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                          onClick={() => setDiscounts((prev) => prev.filter((x) => x.id !== d.id))}
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
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "affiliates" && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["AFFILIATE", "CODE", "RATE", "CONVERSIONS", "TOTAL SALES", "PENDING PAYOUT", "STATUS", "ACTIONS"].map((h) => (
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
                {affiliates.map((aff) => (
                  <tr
                    key={aff.id}
                    className="table-row-hover"
                    style={{ borderBottom: "1px solid var(--row-border)" }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {aff.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {aff.email}
                        </p>
                      </div>
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
                        {aff.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {aff.rate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {aff.conversions}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                        ${aff.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {aff.pendingPayout > 0 ? (
                        <span className="text-xs font-mono font-semibold" style={{ color: "#facc15" }}>
                          ${aff.pendingPayout.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>$0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={
                          aff.status === "active"
                            ? { backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }
                            : aff.status === "pending"
                            ? { backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }
                            : { backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }
                        }
                      >
                        {aff.status.charAt(0).toUpperCase() + aff.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {aff.status === "pending" && (
                          <button
                            className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
                            style={{
                              backgroundColor: "rgba(37,99,235,0.1)",
                              color: "var(--accent-green-bright)",
                              border: "1px solid rgba(37,99,235,0.18)",
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {aff.pendingPayout > 0 && (
                          <button
                            className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
                            style={{
                              backgroundColor: "rgba(202,138,4,0.12)",
                              color: "#facc15",
                              border: "1px solid rgba(202,138,4,0.2)",
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                        {aff.status === "active" && aff.pendingPayout === 0 && (
                          <button
                            className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
                            style={{
                              backgroundColor: "var(--bg-elevated)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Affiliate Revenue", value: "$34,651.53", sub: "All time" },
              { label: "Total Commissions Paid", value: "$5,847.00", sub: "All time" },
              { label: "Active Affiliates", value: "4", sub: "Currently active" },
              { label: "Avg Commission Rate", value: "17.5%", sub: "Across all affiliates" },
              { label: "Top Affiliate", value: "Jake Outdoors", sub: "$12,450.00 in sales" },
              { label: "Pending Payouts", value: "$847.50", sub: "Ready to pay" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </p>
                <p className="text-xl font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                  {card.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => { setShowCodeModal(false); setEditCode(null); }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{editCode ? "Edit Code" : "Create Promo Code"}</h2>
              <button onClick={() => { setShowCodeModal(false); setEditCode(null); }} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Code</label>
                <input type="text" placeholder="e.g. SAVE20" value={newCode.code} onChange={(e) => setNewCode((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
                <select value={newCode.type} onChange={(e) => setNewCode((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Value</label>
                <input type="text" placeholder={newCode.type === "percentage" ? "e.g. 20%" : "e.g. $15"} value={newCode.value} onChange={(e) => setNewCode((p) => ({ ...p, value: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Max Uses (optional)</label>
                <input type="number" placeholder="Unlimited" value={newCode.maxUses} onChange={(e) => setNewCode((p) => ({ ...p, maxUses: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowCodeModal(false); setEditCode(null); }} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button
                onClick={() => {
                  if (editCode) {
                    setDiscounts((prev) => prev.map((d) => d.id === editCode.id ? { ...d, code: newCode.code, type: newCode.type, value: newCode.value } : d));
                  } else {
                    setDiscounts((prev) => [...prev, { id: Date.now(), code: newCode.code, type: newCode.type, value: newCode.value, uses: 0, maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : null, status: "active", startDate: new Date().toISOString(), endDate: null, minOrder: 0 }]);
                  }
                  setShowCodeModal(false); setEditCode(null); setNewCode({ code: "", type: "percentage", value: "", maxUses: "" });
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                {editCode ? "Save Changes" : "Create Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Affiliate Modal */}
      {showAffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowAffModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Affiliate</h2>
              <button onClick={() => setShowAffModal(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "name", placeholder: "Jane Smith" },
                { label: "Email", key: "email", placeholder: "jane@example.com" },
                { label: "Promo Code", key: "code", placeholder: "e.g. JANE15" },
                { label: "Commission Rate", key: "rate", placeholder: "e.g. 15%" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={newAff[f.key as keyof typeof newAff]} onChange={(e) => setNewAff((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAffModal(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button
                onClick={() => {
                  setAffiliates((prev) => [...prev, { id: Date.now(), name: newAff.name, email: newAff.email, code: newAff.code.toUpperCase(), rate: newAff.rate, conversions: 0, totalSales: 0, pendingPayout: 0, status: "pending" }]);
                  setShowAffModal(false); setNewAff({ name: "", email: "", code: "", rate: "15%" });
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                Add Affiliate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
