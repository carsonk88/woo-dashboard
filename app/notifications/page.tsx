"use client";

import { useState } from "react";
import { Send, Sparkles, Users, Bell } from "lucide-react";

const audienceSegments = [
  { id: "all", label: "All Customers", count: 1247 },
  { id: "vip", label: "VIP Customers", count: 134 },
  { id: "past30", label: "Purchased Last 30 Days", count: 89 },
  { id: "abandoned", label: "Abandoned Cart", count: 8 },
  { id: "no_purchase_90", label: "No Purchase in 90 Days", count: 412 },
  { id: "repeat", label: "Repeat Buyers (3+)", count: 203 },
];

const aiSuggestions = [
  { title: "Weekend Sale Alert 🔥", body: "Don't miss our weekend sale! Get 20% off all peptide vials — limited time only." },
  { title: "New Arrivals Just Dropped", body: "We've just restocked your favorites and added new products. Check them out now!" },
  { title: "You left something behind", body: "Your cart is waiting! Complete your order today and get free shipping on orders over $75." },
  { title: "Exclusive VIP Discount Inside", body: "As a valued customer, here's a private 30% discount code just for you: VIP30" },
];

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [sent, setSent] = useState(false);

  const selectedSeg = audienceSegments.find((s) => s.id === selectedAudience);

  const applyAISuggestion = (suggestion: { title: string; body: string }) => {
    setTitle(suggestion.title);
    setBody(suggestion.body);
  };

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
            Push Notifications
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Send push notifications to your customers
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* Composer */}
          <div className="space-y-4">
            {/* Title field */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Compose Notification
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title..."
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
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
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-subtle)" }}>
                    {title.length}/65
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Message Body
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your notification message..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent-green)";
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)";
                    }}
                  />
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-subtle)" }}>
                    {body.length}/240
                  </p>
                </div>
              </div>
            </div>

            {/* AI Compose */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: "#a78bfa" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  AI Suggestions
                </h3>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applyAISuggestion(s)}
                    className="w-full text-left p-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(167,139,250,0.4)";
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(167,139,250,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)";
                    }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#c4b5fd" }}>
                      {s.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {s.body.length > 80 ? s.body.slice(0, 80) + "…" : s.body}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Audience + Send */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} style={{ color: "var(--text-muted)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Audience Segment
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {audienceSegments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedAudience(seg.id)}
                    className="p-3 rounded-lg text-left transition-all"
                    style={
                      selectedAudience === seg.id
                        ? {
                            backgroundColor: "rgba(37,99,235,0.1)",
                            border: "1px solid rgba(22,163,74,0.4)",
                          }
                        : {
                            backgroundColor: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    <p
                      className="text-xs font-medium mb-0.5"
                      style={{ color: selectedAudience === seg.id ? "var(--accent-green-bright)" : "var(--text-primary)" }}
                    >
                      {seg.label}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {seg.count.toLocaleString()} subscribers
                    </p>
                  </button>
                ))}
              </div>

              {sent ? (
                <div
                  className="rounded-lg p-4 text-center"
                  style={{
                    backgroundColor: "rgba(37,99,235,0.1)",
                    border: "1px solid rgba(37,99,235,0.25)",
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                    Notification sent!
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Delivered to {selectedSeg?.count.toLocaleString()} subscribers
                  </p>
                  <button
                    onClick={() => { setSent(false); setTitle(""); setBody(""); }}
                    className="text-xs mt-2 underline"
                    style={{ color: "var(--accent-green-bright)" }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (title && body) setSent(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: title && body ? "var(--accent-green)" : "var(--hover-btn)",
                    color: title && body ? "#fff" : "var(--text-subtle)",
                    cursor: title && body ? "pointer" : "not-allowed",
                  }}
                  onMouseEnter={(e) => {
                    if (title && body) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    if (title && body) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
                  }}
                >
                  <Send size={14} />
                  Send to {selectedSeg?.count.toLocaleString()} Subscribers
                </button>
              )}
            </div>
          </div>

          {/* Preview + Stats */}
          <div className="space-y-4">
            {/* Preview */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Preview
              </h3>
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#1c1c1e",
                  border: "1px solid var(--row-border)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--accent-green)" }}
                  >
                    <Bell size={18} style={{ color: "#fff" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#fff" }}>
                      {title || "Your notification title"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {body || "Your notification message will appear here..."}
                    </p>
                    <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Your Store • now
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-subtle)" }}>
                Mobile notification preview
              </p>
            </div>

            {/* Notification Stats */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Notification Stats
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Total Subscribers", value: "1,247" },
                  { label: "Opted In", value: "934 (74.9%)" },
                  { label: "Avg Open Rate", value: "42.3%" },
                  { label: "Avg Click Rate", value: "12.8%" },
                  { label: "Notifications Sent (30d)", value: "6" },
                  { label: "Revenue Attributed", value: "$1,234.50" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {stat.label}
                    </span>
                    <span className="text-xs font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Recent Sends
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Spring Sale 25% Off!", date: "Mar 20", opens: "38%", clicks: "11%" },
                  { title: "New: BPC-157 Recovery Bundle", date: "Mar 15", opens: "44%", clicks: "14%" },
                  { title: "Weekend Flash Drop", date: "Mar 08", opens: "51%", clicks: "18%" },
                ].map((n, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {n.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {n.date} · {n.opens} opens · {n.clicks} clicks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
