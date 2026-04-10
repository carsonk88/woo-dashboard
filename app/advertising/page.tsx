"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Eye, MousePointer, Percent, ShoppingCart, RefreshCw } from "lucide-react";
import { loadTikTokCredentials, isTikTokConnected } from "@/lib/tiktok-api";

const DEMO_CAMPAIGNS = [
  {
    id: 1,
    name: "Peptides — Broad Match",
    platform: "Google",
    status: "active",
    spend: 1245.67,
    revenue: 4891.50,
    roas: 3.93,
    impressions: 48234,
    clicks: 1456,
    conversions: 28,
    ctr: "3.02%",
  },
  {
    id: 2,
    name: "Instagram — Wellness Audience",
    platform: "Meta",
    status: "active",
    spend: 876.32,
    revenue: 2987.00,
    roas: 3.41,
    impressions: 124567,
    clicks: 2341,
    conversions: 18,
    ctr: "1.88%",
  },
  {
    id: 3,
    name: "Facebook — Retargeting",
    platform: "Meta",
    status: "active",
    spend: 543.21,
    revenue: 2654.80,
    roas: 4.89,
    impressions: 34567,
    clicks: 1234,
    conversions: 22,
    ctr: "3.57%",
  },
  {
    id: 4,
    name: "Google Shopping — RUO Peptides",
    platform: "Google",
    status: "paused",
    spend: 234.56,
    revenue: 678.90,
    roas: 2.89,
    impressions: 12345,
    clicks: 456,
    conversions: 7,
    ctr: "3.70%",
  },
];

type PlatformKey = "google" | "meta" | "tiktok";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Campaign = any;

export default function AdvertisingPage() {
  const [connections, setConnections] = useState<Record<PlatformKey, boolean>>({
    google: false,
    meta: false,
    tiktok: false,
  });
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [tiktokCampaigns, setTiktokCampaigns] = useState<Campaign[]>([]);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokError, setTiktokError] = useState("");

  // On mount: check if TikTok creds exist and auto-connect + fetch
  useEffect(() => {
    if (isTikTokConnected()) {
      setConnections((prev) => ({ ...prev, tiktok: true }));
      fetchTikTokCampaigns();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTikTokCampaigns() {
    const creds = loadTikTokCredentials();
    if (!creds) return;
    setTiktokLoading(true);
    setTiktokError("");
    try {
      const res = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: creds.accessToken, advertiserId: creds.advertiserId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setTiktokError(json.error ?? "Failed to fetch TikTok data");
      } else {
        setTiktokCampaigns(json.campaigns ?? []);
      }
    } catch {
      setTiktokError("Network error fetching TikTok campaigns");
    } finally {
      setTiktokLoading(false);
    }
  }

  const anyConnected = Object.values(connections).some(Boolean);

  const handleConnect = (platform: PlatformKey) => {
    setConnecting(platform);
    setTimeout(() => {
      setConnections((prev) => ({ ...prev, [platform]: true }));
      setConnecting(null);
      if (platform === "tiktok") fetchTikTokCampaigns();
    }, 1200);
  };

  const handleDisconnect = (platform: PlatformKey) => {
    setConnections((prev) => ({ ...prev, [platform]: false }));
    if (platform === "tiktok") setTiktokCampaigns([]);
  };

  // Combine demo campaigns (non-TikTok) with live TikTok campaigns
  const mockCampaigns: Campaign[] = [
    ...DEMO_CAMPAIGNS,
    ...tiktokCampaigns,
  ];

  const totalSpend = mockCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = mockCampaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalRoas = totalRevenue / totalSpend;
  const totalImpressions = mockCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);
  const totalConversions = mockCampaigns.reduce((acc, c) => acc + c.conversions, 0);

  const platforms = [
    {
      key: "google" as PlatformKey,
      name: "Google Ads",
      letter: "G",
      color: "#1a73e8",
      bg: "rgba(26,115,232,0.1)",
      border: "rgba(26,115,232,0.2)",
    },
    {
      key: "meta" as PlatformKey,
      name: "Meta Ads",
      letter: "f",
      color: "#1877f2",
      bg: "rgba(24,119,242,0.1)",
      border: "rgba(24,119,242,0.2)",
    },
    {
      key: "tiktok" as PlatformKey,
      name: "TikTok Ads",
      letter: "T",
      color: "#fe2c55",
      bg: "rgba(254,44,85,0.1)",
      border: "rgba(254,44,85,0.2)",
    },
  ];

  if (!anyConnected) {
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
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Advertising
          </h1>
        </div>
        <div className="p-6 max-w-2xl mx-auto mt-8">
          <p className="text-sm font-medium mb-6 text-center" style={{ color: "var(--text-muted)" }}>
            Connect your ad platforms to track campaign performance, ROAS, and revenue attribution.
          </p>
          <div className="space-y-3">
            {platforms.map((p) => (
              <div
                key={p.key}
                className="rounded-xl p-5 flex items-center justify-between"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: p.bg, border: `1px solid ${p.border}`, color: p.color }}
                  >
                    {p.letter}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {connections[p.key] ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {connections[p.key] ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(22,163,74,0.15)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.25)" }}>
                      Connected
                    </span>
                    <button
                      onClick={() => handleDisconnect(p.key)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(p.key)}
                    disabled={connecting === p.key}
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: p.color, color: "#fff", opacity: connecting === p.key ? 0.7 : 1 }}
                  >
                    {connecting === p.key ? "Connecting..." : `Connect ${p.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setConnections({ google: true, meta: true, tiktok: true })}
              className="text-xs underline"
              style={{ color: "var(--text-muted)" }}
            >
              Preview with demo data
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Advertising
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Campaign performance & ROAS tracking
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {platforms.map((p) =>
            connections[p.key] ? (
              <div key={p.key} className="flex items-center gap-1">
                <span
                  className="text-[11px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#4ade80", border: "1px solid rgba(22,163,74,0.2)" }}
                >
                  {p.name}
                </span>
                <button
                  onClick={() => handleDisconnect(p.key)}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: "var(--text-subtle)", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                key={p.key}
                onClick={() => handleConnect(p.key)}
                disabled={connecting === p.key}
                className="text-[11px] px-2 py-1 rounded-full"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                + {p.name}
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Top metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Ad Spend", value: `$${totalSpend.toFixed(2)}`, icon: <DollarSign size={14} />, color: "var(--accent-red)" },
            { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: <TrendingUp size={14} />, color: "var(--accent-green-bright)" },
            { label: "Net Profit", value: `$${(totalRevenue - totalSpend).toFixed(2)}`, icon: <DollarSign size={14} />, color: "var(--accent-green-bright)" },
            { label: "ROAS", value: `${totalRoas.toFixed(2)}x`, icon: <Percent size={14} />, color: totalRoas >= 3 ? "var(--accent-green-bright)" : "#facc15" },
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Impressions", value: totalImpressions.toLocaleString(), icon: <Eye size={14} />, color: "var(--text-primary)" },
            { label: "Clicks", value: totalClicks.toLocaleString(), icon: <MousePointer size={14} />, color: "var(--text-primary)" },
            { label: "CTR", value: `${avgCtr}%`, icon: <Percent size={14} />, color: "#60a5fa" },
            { label: "Conversions", value: totalConversions, icon: <ShoppingCart size={14} />, color: "var(--accent-green-bright)" },
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
          {/* Campaign Breakdown */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Campaign Breakdown
              </h3>
              <div className="flex items-center gap-2">
                {tiktokLoading && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <RefreshCw size={10} className="animate-spin" /> Syncing TikTok...
                  </span>
                )}
                {tiktokError && !tiktokLoading && (
                  <span className="text-[10px]" style={{ color: "#f87171" }} title={tiktokError}>
                    TikTok sync failed
                  </span>
                )}
                {connections.tiktok && !tiktokLoading && !tiktokError && (
                  <button
                    onClick={fetchTikTokCampaigns}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded"
                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <RefreshCw size={9} /> Refresh
                  </button>
                )}
              </div>
            </div>
            <div className="table-scroll">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["CAMPAIGN", "PLATFORM", "SPEND", "REVENUE", "ROAS", "CLICKS", "CONV.", "STATUS"].map((h) => (
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
                {mockCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="table-row-hover"
                    style={{ borderBottom: "1px solid var(--row-border)" }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {campaign.name.length > 28 ? campaign.name.slice(0, 28) + "…" : campaign.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor:
                            campaign.platform === "Google"
                              ? "rgba(59,130,246,0.12)"
                              : campaign.platform === "Meta"
                              ? "rgba(99,102,241,0.12)"
                              : "rgba(0,0,0,0.3)",
                          color:
                            campaign.platform === "Google"
                              ? "#60a5fa"
                              : campaign.platform === "Meta"
                              ? "#818cf8"
                              : "#a1a1aa",
                        }}
                      >
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "#f87171" }}>
                        ${campaign.spend.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--accent-green-bright)" }}>
                        ${campaign.revenue.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{
                          color: campaign.roas >= 3 ? "var(--accent-green-bright)" : campaign.roas >= 2 ? "#facc15" : "#f87171",
                        }}
                      >
                        {campaign.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {campaign.clicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                        {campaign.conversions}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={
                          campaign.status === "active"
                            ? { backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }
                            : { backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }
                        }
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* True P&L sidebar */}
          <div
            className="rounded-xl p-4 h-fit"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              True P&L
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "var(--accent-green-bright)", sign: "+" },
                { label: "Ad Spend", value: `-$${totalSpend.toFixed(2)}`, color: "#f87171", sign: "" },
                { label: "COGS (est. 35%)", value: `-$${(totalRevenue * 0.35).toFixed(2)}`, color: "#f87171", sign: "" },
                { label: "Shipping (est.)", value: "-$234.50", color: "#f87171", sign: "" },
                { label: "Processing Fees", value: `-$${(totalRevenue * 0.029 + mockCampaigns.length * 0.30).toFixed(2)}`, color: "#f87171", sign: "" },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {row.label}
                    </span>
                    <span className="text-xs font-mono font-semibold" style={{ color: row.color }}>
                      {row.value}
                    </span>
                  </div>
                  {i < 4 && (
                    <div className="mt-2" style={{ borderBottom: "1px solid var(--row-border)" }} />
                  )}
                </div>
              ))}
              <div
                className="pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex justify-between">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    Net Profit
                  </span>
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: "var(--accent-green-bright)" }}
                  >
                    ${(totalRevenue - totalSpend - totalRevenue * 0.35 - 234.50 - (totalRevenue * 0.029 + mockCampaigns.length * 0.30)).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                  {((
                    (totalRevenue - totalSpend - totalRevenue * 0.35 - 234.50) /
                    totalRevenue
                  ) * 100).toFixed(1)}% margin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
