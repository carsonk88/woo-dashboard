"use client";

import { useState } from "react";
import { Users, DollarSign, TrendingUp, Clock, Plus, X } from "lucide-react";
import { affiliates as initialAffiliates } from "@/lib/mock-data";

type AffTab = "all" | "active" | "pending" | "suspended";

export default function AffiliatesPage() {
  const [tab, setTab] = useState<AffTab>("all");
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [showModal, setShowModal] = useState(false);
  const [newAff, setNewAff] = useState({ name: "", email: "", code: "", rate: "15%" });

  const filtered = affiliates.filter((a) => tab === "all" || a.status === tab);

  const totalSales = affiliates.reduce((acc, a) => acc + a.totalSales, 0);
  const pendingPayout = affiliates.reduce((acc, a) => acc + a.pendingPayout, 0);
  const activeCount = affiliates.filter((a) => a.status === "active").length;
  const pendingCount = affiliates.filter((a) => a.status === "pending").length;

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
            Affiliates
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Manage affiliate partners
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
        >
          <Plus size={12} />
          Add Affiliate
        </button>
      </div>

      <div className="p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Affiliates", value: affiliates.length, icon: <Users size={14} />, color: "var(--text-primary)" },
            { label: "Total Sales", value: `$${(totalSales / 1000).toFixed(1)}k`, icon: <TrendingUp size={14} />, color: "var(--accent-green-bright)" },
            { label: "Pending Payout", value: `$${pendingPayout.toFixed(2)}`, icon: <DollarSign size={14} />, color: "#facc15" },
            { label: "Pending Approval", value: pendingCount, icon: <Clock size={14} />, color: "#60a5fa" },
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

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {(["all", "active", "pending", "suspended"] as AffTab[]).map((t) => {
            const count = t === "all" ? affiliates.length : affiliates.filter((a) => a.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={
                  tab === t
                    ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                    : {
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span
                  className="text-[10px] px-1 py-0.5 rounded-full"
                  style={{
                    backgroundColor: tab === t ? "rgba(255,255,255,0.2)" : "var(--hover-btn)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["AFFILIATE", "CODE", "RATE", "CONVERSIONS", "TOTAL SALES", "PENDING PAYOUT", "STATUS", "ACTIONS"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((aff) => (
                <tr
                  key={aff.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            aff.status === "active"
                              ? "rgba(37,99,235,0.18)"
                              : aff.status === "pending"
                              ? "var(--badge-pending-border)"
                              : "rgba(220,38,38,0.2)",
                          color:
                            aff.status === "active"
                              ? "var(--accent-green-bright)"
                              : aff.status === "pending"
                              ? "#facc15"
                              : "#f87171",
                        }}
                      >
                        {aff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {aff.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {aff.email}
                        </p>
                      </div>
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
                    <span className="text-sm font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                      ${aff.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: aff.pendingPayout > 0 ? "#facc15" : "var(--text-subtle)" }}
                    >
                      ${aff.pendingPayout.toFixed(2)}
                    </span>
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
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium"
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
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium"
                          style={{
                            backgroundColor: "rgba(202,138,4,0.12)",
                            color: "#facc15",
                            border: "1px solid rgba(202,138,4,0.2)",
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {aff.status !== "pending" && aff.pendingPayout === 0 && (
                        <button
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium"
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
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add Affiliate</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
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
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button
                onClick={() => {
                  setAffiliates((prev) => [...prev, { id: Date.now(), name: newAff.name, email: newAff.email, code: newAff.code.toUpperCase(), rate: newAff.rate, conversions: 0, totalSales: 0, pendingPayout: 0, status: "pending", joinDate: new Date().toISOString() }]);
                  setShowModal(false); setNewAff({ name: "", email: "", code: "", rate: "15%" });
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
