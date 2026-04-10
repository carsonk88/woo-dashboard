"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Eye, MousePointer, Plus, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdAccount {
  platform: "google" | "meta" | "tiktok";
  label: string;
  icon: string;
  color: string;
  idField: string;
  tokenField: string;
  idLabel: string;
  tokenLabel: string;
  helpUrl: string;
}

const AD_PLATFORMS: AdAccount[] = [
  {
    platform: "google",
    label: "Google Ads",
    icon: "G",
    color: "#4285f4",
    idField: "google_ads_customer_id",
    tokenField: "google_ads_refresh_token",
    idLabel: "Customer ID",
    tokenLabel: "API Key / Refresh Token",
    helpUrl: "https://ads.google.com",
  },
  {
    platform: "meta",
    label: "Meta Ads",
    icon: "M",
    color: "#1877f2",
    idField: "meta_ads_account_id",
    tokenField: "meta_ads_access_token",
    idLabel: "Ad Account ID",
    tokenLabel: "Access Token",
    helpUrl: "https://business.facebook.com",
  },
  {
    platform: "tiktok",
    label: "TikTok Ads",
    icon: "T",
    color: "#000000",
    idField: "tiktok_ads_advertiser_id",
    tokenField: "tiktok_ads_access_token",
    idLabel: "Advertiser ID",
    tokenLabel: "Access Token",
    helpUrl: "https://business.tiktok.com",
  },
];

export default function AdvertisingPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Record<string, { id: string; token: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState("");
  const [formToken, setFormToken] = useState("");

  const clientId = typeof window !== "undefined" ? localStorage.getItem("woo_client_id") : null;

  // Load existing ad account connections
  useEffect(() => {
    async function load() {
      const cid = process.env.NEXT_PUBLIC_CLIENT_ID;
      if (!cid) { setLoading(false); return; }

      const { data } = await supabase
        .from("clients")
        .select("google_ads_customer_id, google_ads_refresh_token, meta_ads_account_id, meta_ads_access_token, tiktok_ads_advertiser_id, tiktok_ads_access_token")
        .eq("id", cid)
        .single();

      if (data) {
        const accts: Record<string, { id: string; token: string }> = {};
        if (data.google_ads_customer_id) accts.google = { id: data.google_ads_customer_id, token: data.google_ads_refresh_token || "" };
        if (data.meta_ads_account_id) accts.meta = { id: data.meta_ads_account_id, token: data.meta_ads_access_token || "" };
        if (data.tiktok_ads_advertiser_id) accts.tiktok = { id: data.tiktok_ads_advertiser_id, token: data.tiktok_ads_access_token || "" };
        setAccounts(accts);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveAccount(platform: AdAccount) {
    if (!formId.trim()) return;
    setSaving(true);
    const cid = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!cid) { setSaving(false); return; }

    const update: Record<string, string> = {};
    update[platform.idField] = formId.trim();
    update[platform.tokenField] = formToken.trim();

    await supabase.from("clients").update(update).eq("id", cid);

    setAccounts((prev) => ({ ...prev, [platform.platform]: { id: formId.trim(), token: formToken.trim() } }));
    setSaving(false);
    setSaved(platform.platform);
    setConnecting(null);
    setFormId("");
    setFormToken("");
    setTimeout(() => setSaved(null), 3000);
  }

  async function disconnectAccount(platform: AdAccount) {
    const cid = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!cid) return;

    const update: Record<string, null> = {};
    update[platform.idField] = null;
    update[platform.tokenField] = null;

    await supabase.from("clients").update(update).eq("id", cid);
    setAccounts((prev) => {
      const next = { ...prev };
      delete next[platform.platform];
      return next;
    });
  }

  const connectedCount = Object.keys(accounts).length;

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Header */}
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
            Advertising
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {connectedCount > 0 ? `${connectedCount} platform${connectedCount > 1 ? "s" : ""} connected` : "Connect your ad accounts to see real data"}
          </p>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <>
            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {AD_PLATFORMS.map((platform) => {
                const connected = !!accounts[platform.platform];
                return (
                  <div
                    key={platform.platform}
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: connected ? `1px solid ${platform.color}40` : "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${platform.color}18`, color: platform.color, border: `1px solid ${platform.color}30` }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {platform.label}
                          </p>
                          {connected && (
                            <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                              ID: {accounts[platform.platform].id}
                            </p>
                          )}
                        </div>
                      </div>
                      {connected ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={14} style={{ color: "var(--accent-green-bright)" }} />
                          <span className="text-[11px] font-medium" style={{ color: "var(--accent-green-bright)" }}>
                            Connected
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px]" style={{ color: "var(--text-subtle)" }}>
                          Not connected
                        </span>
                      )}
                    </div>

                    {connected ? (
                      <div className="flex gap-2">
                        <a
                          href={platform.helpUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-center text-[11px] font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                        >
                          <ExternalLink size={10} /> Open Platform
                        </a>
                        <button
                          onClick={() => disconnectAccount(platform)}
                          className="text-[11px] font-medium px-3 py-2 rounded-lg"
                          style={{ color: "#f87171", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConnecting(platform.platform); setFormId(""); setFormToken(""); }}
                        className="w-full text-[11px] font-medium px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: `${platform.color}15`, color: platform.color, border: `1px solid ${platform.color}30` }}
                      >
                        <Plus size={12} /> Connect {platform.label}
                      </button>
                    )}

                    {saved === platform.platform && (
                      <p className="text-[10px] text-center mt-2" style={{ color: "var(--accent-green-bright)" }}>
                        Saved successfully
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connect Modal */}
            {connecting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                <div
                  className="rounded-xl p-6 w-full max-w-md"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  {(() => {
                    const platform = AD_PLATFORMS.find((p) => p.platform === connecting)!;
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-5">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: `${platform.color}18`, color: platform.color }}
                          >
                            {platform.icon}
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              Connect {platform.label}
                            </h2>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Enter your credentials to sync ad data
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-5">
                          <div>
                            <label className="text-[11px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>
                              {platform.idLabel}
                            </label>
                            <input
                              type="text"
                              value={formId}
                              onChange={(e) => setFormId(e.target.value)}
                              placeholder={`Enter ${platform.idLabel.toLowerCase()}`}
                              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                              style={{
                                backgroundColor: "var(--bg-elevated)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)",
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>
                              {platform.tokenLabel}
                            </label>
                            <input
                              type="password"
                              value={formToken}
                              onChange={(e) => setFormToken(e.target.value)}
                              placeholder={`Enter ${platform.tokenLabel.toLowerCase()}`}
                              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                              style={{
                                backgroundColor: "var(--bg-elevated)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setConnecting(null)}
                            className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveAccount(platform)}
                            disabled={!formId.trim() || saving}
                            className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg"
                            style={{
                              backgroundColor: formId.trim() ? "var(--accent-green)" : "var(--bg-elevated)",
                              color: formId.trim() ? "#fff" : "var(--text-muted)",
                              border: formId.trim() ? "none" : "1px solid var(--border)",
                            }}
                          >
                            {saving ? "Saving..." : "Save & Connect"}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Dashboard area */}
            {connectedCount > 0 ? (
              <AdPerformanceDashboard accounts={accounts} />
            ) : (
              <div
                className="rounded-xl p-8 text-center"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <Eye size={40} className="mx-auto mb-4" style={{ color: "var(--text-subtle)" }} />
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  No Ad Accounts Connected
                </h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
                  Connect your Google Ads, Meta Ads, or TikTok Ads accounts above to see real campaign performance, spend, revenue, and ROAS data in this dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// --- Ad Performance Dashboard ---
function AdPerformanceDashboard({ accounts }: { accounts: Record<string, { id: string; token: string }> }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("last_7d");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      // For now, fetch Meta if connected
      if (accounts.meta) {
        try {
          const res = await fetch(`/api/ads?platform=meta&date_preset=${datePreset}`);
          const json = await res.json();
          if (json.error) { setError(json.error); }
          else { setData(json); }
        } catch { setError("Failed to fetch ad data"); }
      }
      setLoading(false);
    }
    load();
  }, [datePreset, accounts]);

  const periods = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last_7d", label: "Last 7 Days" },
    { key: "last_14d", label: "Last 14 Days" },
    { key: "last_30d", label: "Last 30 Days" },
    { key: "this_month", label: "This Month" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Loading ad performance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  const s = data?.summary || { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0, ctr: 0, conversions: 0, revenue: 0, roas: 0 };
  const campaigns = data?.campaigns || [];
  const hasData = s.spend > 0 || campaigns.length > 0;

  return (
    <div>
      {/* Date filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setDatePreset(p.key)}
            className="text-[11px] px-3 py-1.5 rounded-md font-medium"
            style={
              datePreset === p.key
                ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                : { backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <DollarSign size={32} className="mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Ad Data Yet</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your {data?.account?.name || "Meta Ads"} account is connected but has no campaigns or spend for this period. Data will appear once campaigns are running.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Ad Spend", value: `$${s.spend.toFixed(2)}`, icon: <DollarSign size={14} />, color: "#f87171" },
              { label: "Revenue", value: `$${s.revenue.toFixed(2)}`, icon: <TrendingUp size={14} />, color: "var(--accent-green-bright)" },
              { label: "ROAS", value: `${s.roas.toFixed(2)}x`, icon: <TrendingUp size={14} />, color: s.roas >= 3 ? "var(--accent-green-bright)" : "#facc15" },
              { label: "Conversions", value: String(s.conversions), icon: <MousePointer size={14} />, color: "#60a5fa" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <p className="text-xl font-semibold font-mono" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Impressions", value: s.impressions.toLocaleString() },
              { label: "Clicks", value: s.clicks.toLocaleString() },
              { label: "CTR", value: `${s.ctr.toFixed(2)}%` },
              { label: "CPC", value: `$${s.cpc.toFixed(2)}` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <p className="text-lg font-semibold font-mono" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Campaigns Table */}
          {campaigns.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["CAMPAIGN", "STATUS", "SPEND", "IMPRESSIONS", "CLICKS", "CTR", "CONVERSIONS", "REVENUE", "ROAS"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c: any) => (
                      <tr key={c.id} className="table-row-hover" style={{ borderBottom: "1px solid var(--row-border)" }}>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {c.name.length > 30 ? c.name.slice(0, 30) + "…" : c.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: c.status === "active" ? "rgba(14,168,121,0.12)" : "rgba(255,255,255,0.06)",
                              color: c.status === "active" ? "var(--accent-green-bright)" : "var(--text-muted)",
                              border: `1px solid ${c.status === "active" ? "rgba(14,168,121,0.3)" : "var(--border)"}`,
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "#f87171" }}>${c.spend.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>{c.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>{c.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>{c.ctr.toFixed(2)}%</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "#60a5fa" }}>{c.conversions}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--accent-green-bright)" }}>${c.revenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: c.roas >= 3 ? "var(--accent-green-bright)" : "#facc15" }}>{c.roas.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
