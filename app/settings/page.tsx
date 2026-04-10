"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Eye, EyeOff, RefreshCw, Package, ShoppingCart, Users, Tag } from "lucide-react";
import { saveWooCredentials, loadWooCredentials } from "@/lib/woo-api";
import { saveTikTokCredentials, loadTikTokCredentials, clearTikTokCredentials, isTikTokConnected } from "@/lib/tiktok-api";
import SyncStatusPanel from "./sync-status";

type SettingsTab =
  | "payment"
  | "announcement"
  | "store"
  | "shipping"
  | "payments"
  | "compliance"
  | "affiliates"
  | "email";

type SiteMode = "gated" | "open_catalog" | "full_open";

const leftNavItems: { key: SettingsTab; label: string }[] = [
  { key: "payment", label: "Payment Processors" },
  { key: "announcement", label: "Announcement Bar" },
  { key: "store", label: "Store Info" },
  { key: "shipping", label: "Shipping" },
  { key: "payments", label: "Payments" },
  { key: "compliance", label: "Compliance" },
  { key: "affiliates", label: "Affiliates" },
  { key: "email", label: "Email Templates" },
];

const paymentProcessors = [
  { id: "stripe", name: "Stripe", desc: "Credit & debit cards, ACH", enabled: true, icon: "S" },
  { id: "paypal", name: "PayPal", desc: "PayPal balance & cards", enabled: true, icon: "P" },
  { id: "affirm", name: "Affirm", desc: "Buy now, pay later", enabled: false, icon: "A" },
  { id: "afterpay", name: "Afterpay", desc: "4 interest-free payments", enabled: false, icon: "AP" },
  { id: "crypto", name: "Coinbase Commerce", desc: "BTC, ETH, USDC", enabled: false, icon: "₿" },
  { id: "ach", name: "ACH Transfer", desc: "Bank-to-bank transfers", enabled: false, icon: "ACH" },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: enabled ? "var(--accent-green)" : "var(--bg-elevated)", border: `1px solid ${enabled ? "var(--accent-green)" : "var(--border)"}` }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{
          backgroundColor: "#fff",
          left: enabled ? "calc(100% - 1.125rem)" : "0.0625rem",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("payment");
  const [siteMode, setSiteMode] = useState<SiteMode>("gated");
  const [processors, setProcessors] = useState(paymentProcessors);
  const [wooUrl, setWooUrl] = useState("");
  const [wooKey, setWooKey] = useState("");
  const [wooSecret, setWooSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [wooConnected, setWooConnected] = useState(false);
  const [wooSaved, setWooSaved] = useState(false);

  // Wix connection state
  const [wixSiteId, setWixSiteId] = useState("");
  const [wixApiKey, setWixApiKey] = useState("");
  const [showWixKey, setShowWixKey] = useState(false);
  const [wixConnected, setWixConnected] = useState(false);
  const [wixSaving, setWixSaving] = useState(false);
  const [wixSaved, setWixSaved] = useState(false);
  const [wixSyncing, setWixSyncing] = useState<string | null>(null);
  const [wixSyncResults, setWixSyncResults] = useState<Record<string, { done: boolean; count: number }>>({});

  // TikTok connection state
  const [tiktokToken, setTiktokToken] = useState("");
  const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState("");
  const [showTiktokToken, setShowTiktokToken] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [tiktokSaving, setTiktokSaving] = useState(false);
  const [tiktokSaved, setTiktokSaved] = useState(false);

  const handleConnectTikTok = () => {
    if (!tiktokToken || !tiktokAdvertiserId) return;
    setTiktokSaving(true);
    saveTikTokCredentials({ accessToken: tiktokToken, advertiserId: tiktokAdvertiserId });
    setTimeout(() => {
      setTiktokSaving(false);
      setTiktokConnected(true);
      setTiktokSaved(true);
      setTimeout(() => setTiktokSaved(false), 3000);
    }, 800);
  };

  const handleDisconnectTikTok = () => {
    clearTikTokCredentials();
    setTiktokConnected(false);
    setTiktokToken("");
    setTiktokAdvertiserId("");
  };

  const handleConnectWix = () => {
    if (!wixSiteId || !wixApiKey) return;
    setWixSaving(true);
    setTimeout(() => {
      setWixSaving(false);
      setWixConnected(true);
      setWixSaved(true);
      setTimeout(() => setWixSaved(false), 3000);
    }, 1200);
  };

  const handleWixSync = (type: string, count: number) => {
    setWixSyncing(type);
    setWixSyncResults((prev) => ({ ...prev, [type]: { done: false, count: 0 } }));
    setTimeout(() => {
      setWixSyncing(null);
      setWixSyncResults((prev) => ({ ...prev, [type]: { done: true, count } }));
    }, 1800);
  };
  const [storeName, setStoreName] = useState("My Peptide Store");
  const [storeEmail, setStoreEmail] = useState("hello@mystore.com");
  const [announcement, setAnnouncement] = useState("Free shipping on orders over $75! Use code FREESHIP at checkout.");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  useEffect(() => {
    const creds = loadWooCredentials();
    if (creds) {
      setWooUrl(creds.url);
      setWooKey(creds.consumerKey);
      setWooSecret(creds.consumerSecret);
      setWooConnected(true);
    }
    if (isTikTokConnected()) {
      const tt = loadTikTokCredentials()!;
      setTiktokToken(tt.accessToken);
      setTiktokAdvertiserId(tt.advertiserId);
      setTiktokConnected(true);
    }
  }, []);

  const handleConnectWoo = () => {
    if (wooUrl && wooKey && wooSecret) {
      saveWooCredentials({ url: wooUrl, consumerKey: wooKey, consumerSecret: wooSecret });
      setWooConnected(true);
      setWooSaved(true);
      setTimeout(() => setWooSaved(false), 3000);
    }
  };

  const toggleProcessor = (id: string) => {
    setProcessors(processors.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const siteAccessOptions: { key: SiteMode; label: string; desc: string }[] = [
    { key: "gated", label: "Gated", desc: "Login required to view products" },
    { key: "open_catalog", label: "Open Catalog", desc: "Browse freely, login to buy" },
    { key: "full_open", label: "Full Open", desc: "Anyone can browse & purchase" },
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
            Settings
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Store configuration and preferences
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* WooCommerce Connection Card */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: wooConnected ? "rgba(22,163,74,0.06)" : "var(--bg-card)",
            border: `1px solid ${wooConnected ? "rgba(37,99,235,0.25)" : "var(--border)"}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                WooCommerce Connection
              </h2>
              {wooConnected && (
                <span
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(37,99,235,0.12)",
                    color: "var(--accent-green-bright)",
                    border: "1px solid rgba(37,99,235,0.25)",
                  }}
                >
                  <CheckCircle size={10} />
                  Connected
                </span>
              )}
            </div>
            {wooSaved && (
              <span className="text-xs" style={{ color: "var(--accent-green-bright)" }}>
                Saved successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                Store URL
              </label>
              <input
                type="url"
                value={wooUrl}
                onChange={(e) => setWooUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
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
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                Consumer Key
              </label>
              <input
                type="text"
                value={wooKey}
                onChange={(e) => setWooKey(e.target.value)}
                placeholder="ck_..."
                className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
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
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                Consumer Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={wooSecret}
                  onChange={(e) => setWooSecret(e.target.value)}
                  placeholder="cs_..."
                  className="w-full px-3 py-2 pr-9 rounded-lg text-xs font-mono outline-none"
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
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectWoo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)";
            }}
          >
            {wooConnected ? <CheckCircle size={12} /> : <Save size={12} />}
            {wooConnected ? "Update Connection" : "Connect WooCommerce"}
          </button>
        </div>

        {/* Wix Connection Card */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: wixConnected ? "rgba(0,98,255,0.04)" : "var(--bg-card)",
            border: `1px solid ${wixConnected ? "rgba(0,98,255,0.25)" : "var(--border)"}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#0062ff", color: "#fff" }}>W</div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Wix Connection
              </h2>
              {wixConnected && (
                <span
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(0,98,255,0.12)",
                    color: "#60a5fa",
                    border: "1px solid rgba(0,98,255,0.25)",
                  }}
                >
                  <CheckCircle size={10} />
                  Connected
                </span>
              )}
            </div>
            {wixSaved && (
              <span className="text-xs" style={{ color: "#60a5fa" }}>Saved successfully!</span>
            )}
          </div>

          {!wixConnected ? (
            <>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Connect your Wix store to sync products, orders, customers, and inventory between this dashboard and Wix.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Wix Site ID
                  </label>
                  <input
                    type="text"
                    value={wixSiteId}
                    onChange={(e) => setWixSiteId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0062ff"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                  />
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                    Found in Wix Dashboard → Settings → Site ID
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showWixKey ? "text" : "password"}
                      value={wixApiKey}
                      onChange={(e) => setWixApiKey(e.target.value)}
                      placeholder="Your Wix API key"
                      className="w-full px-3 py-2 pr-9 rounded-lg text-xs font-mono outline-none"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#0062ff"; }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                    />
                    <button
                      onClick={() => setShowWixKey(!showWixKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showWixKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                    Found in Wix Dashboard → Settings → Advanced → API Keys
                  </p>
                </div>
              </div>
              <button
                onClick={handleConnectWix}
                disabled={!wixSiteId || !wixApiKey || wixSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: wixSiteId && wixApiKey ? "#0062ff" : "var(--bg-elevated)",
                  color: wixSiteId && wixApiKey ? "#fff" : "var(--text-subtle)",
                  border: wixSiteId && wixApiKey ? "none" : "1px solid var(--border)",
                }}
              >
                {wixSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                {wixSaving ? "Connecting..." : "Connect Wix"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
                Wix store connected. Push data from this dashboard to your Wix store, or pull the latest from Wix.
              </p>

              {/* Sync items */}
              <div className="space-y-3">
                {[
                  { key: "products", label: "Products & Inventory", desc: "Sync product catalog, prices, stock levels, and variants", icon: <Package size={14} />, count: 24 },
                  { key: "orders", label: "Orders", desc: "Pull orders placed on Wix into this dashboard", icon: <ShoppingCart size={14} />, count: 187 },
                  { key: "customers", label: "Customers", desc: "Sync customer accounts and contact info", icon: <Users size={14} />, count: 312 },
                  { key: "discounts", label: "Discounts & Promo Codes", desc: "Push active promo codes to Wix checkout", icon: <Tag size={14} />, count: 8 },
                ].map((item) => {
                  const result = wixSyncResults[item.key];
                  const isSyncing = wixSyncing === item.key;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        backgroundColor: result?.done ? "rgba(0,98,255,0.05)" : "var(--bg-elevated)",
                        border: `1px solid ${result?.done ? "rgba(0,98,255,0.2)" : "var(--border)"}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: result?.done ? "rgba(0,98,255,0.12)" : "var(--bg-card)",
                            color: result?.done ? "#60a5fa" : "var(--text-muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result?.done && (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "#60a5fa" }}>
                            <CheckCircle size={10} />
                            {result.count} synced
                          </span>
                        )}
                        <button
                          onClick={() => handleWixSync(item.key, item.count)}
                          disabled={isSyncing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: isSyncing ? "rgba(0,98,255,0.08)" : "#0062ff",
                            color: isSyncing ? "#60a5fa" : "#fff",
                          }}
                        >
                          <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                          {isSyncing ? "Syncing..." : "Sync Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                  Site ID: {wixSiteId || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
                </p>
                <button
                  onClick={() => { setWixConnected(false); setWixSiteId(""); setWixApiKey(""); setWixSyncResults({}); }}
                  className="text-xs"
                  style={{ color: "var(--text-subtle)" }}
                >
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>

        {/* TikTok Ads Connection Card */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: tiktokConnected ? "rgba(254,44,85,0.04)" : "var(--bg-card)",
            border: `1px solid ${tiktokConnected ? "rgba(254,44,85,0.25)" : "var(--border)"}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#fe2c55", color: "#fff" }}>T</div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                TikTok Ads Connection
              </h2>
              {tiktokConnected && (
                <span
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(37,99,235,0.12)", color: "var(--accent-green-bright)", border: "1px solid rgba(37,99,235,0.25)" }}
                >
                  <CheckCircle size={10} />
                  Connected
                </span>
              )}
            </div>
            {tiktokSaved && (
              <span className="text-xs" style={{ color: "var(--accent-green-bright)" }}>Saved successfully!</span>
            )}
          </div>

          {!tiktokConnected ? (
            <div className="space-y-3">
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Connect your TikTok Ads account to sync campaign performance, spend, and ROAS into the Advertising dashboard.
              </p>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showTiktokToken ? "text" : "password"}
                    value={tiktokToken}
                    onChange={(e) => setTiktokToken(e.target.value)}
                    placeholder="Your TikTok Ads access token"
                    className="w-full px-3 py-2 pr-9 rounded-lg text-xs font-mono outline-none"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#fe2c55"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                  />
                  <button
                    onClick={() => setShowTiktokToken(!showTiktokToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showTiktokToken ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                  Found in TikTok Business Center → Assets → Business Access Tokens
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Advertiser ID
                </label>
                <input
                  type="text"
                  value={tiktokAdvertiserId}
                  onChange={(e) => setTiktokAdvertiserId(e.target.value)}
                  placeholder="1234567890123456789"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#fe2c55"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                />
                <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                  Found in TikTok Ads Manager → Account Info
                </p>
              </div>
              <button
                onClick={handleConnectTikTok}
                disabled={!tiktokToken || !tiktokAdvertiserId || tiktokSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: tiktokToken && tiktokAdvertiserId ? "#fe2c55" : "var(--bg-elevated)",
                  color: tiktokToken && tiktokAdvertiserId ? "#fff" : "var(--text-subtle)",
                  border: tiktokToken && tiktokAdvertiserId ? "none" : "1px solid var(--border)",
                }}
              >
                {tiktokSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                {tiktokSaving ? "Connecting..." : "Connect TikTok Ads"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                TikTok Ads connected. Campaign data will sync to the Advertising dashboard automatically.
                <br />
                <span className="font-mono text-[10px]" style={{ color: "var(--text-subtle)" }}>
                  Advertiser ID: {tiktokAdvertiserId}
                </span>
              </p>
              <button
                onClick={handleDisconnectTikTok}
                className="text-xs ml-4 flex-shrink-0"
                style={{ color: "var(--text-subtle)" }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Site Access Mode */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Site Access Mode
            </h2>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(202,138,4,0.15)",
                color: "#facc15",
                border: "1px solid rgba(202,138,4,0.25)",
              }}
            >
              Live Setting
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {siteAccessOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSiteMode(opt.key)}
                className="p-3 rounded-lg text-left transition-all"
                style={
                  siteMode === opt.key
                    ? { backgroundColor: "var(--badge-pending-bg)", border: "1px solid rgba(202,138,4,0.5)" }
                    : { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }
                }
              >
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: siteMode === opt.key ? "#facc15" : "var(--text-primary)" }}
                >
                  {opt.label}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <SyncStatusPanel />

        {/* Main content with left nav */}
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Left nav */}
          <div
            className="rounded-xl p-2 h-fit"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {leftNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors mb-0.5"
                style={
                  activeTab === item.key
                    ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                    : { color: "var(--text-muted)" }
                }
                onMouseEnter={(e) => {
                  if (activeTab !== item.key)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.key)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div>
            {activeTab === "payment" && (
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Payment Processors
                </h2>
                <div className="space-y-3">
                  {processors.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: p.enabled ? "rgba(22,163,74,0.05)" : "var(--bg-elevated)",
                        border: `1px solid ${p.enabled ? "rgba(37,99,235,0.18)" : "var(--border)"}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: p.enabled ? "var(--accent-green)" : "var(--bg-card)",
                          color: p.enabled ? "#fff" : "var(--text-muted)",
                          border: p.enabled ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {p.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {p.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {p.desc}
                        </p>
                      </div>
                      <Toggle enabled={p.enabled} onChange={() => toggleProcessor(p.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "announcement" && (
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Announcement Bar
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {announcementEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <Toggle enabled={announcementEnabled} onChange={setAnnouncementEnabled} />
                  </div>
                </div>

                <div
                  className="rounded-lg p-3 mb-4 text-center text-xs font-medium"
                  style={{
                    backgroundColor: announcementEnabled ? "var(--accent-green)" : "var(--bg-elevated)",
                    color: announcementEnabled ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${announcementEnabled ? "transparent" : "var(--border)"}`,
                  }}
                >
                  {announcement || "Your announcement text..."}
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Announcement Text
                  </label>
                  <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    rows={3}
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
                </div>

                <button
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                >
                  <Save size={12} />
                  Save Announcement
                </button>
              </div>
            )}

            {activeTab === "store" && (
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Store Info
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Store Name", value: storeName, setter: setStoreName, type: "text" },
                    { label: "Store Email", value: storeEmail, setter: setStoreEmail, type: "email" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
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
                    </div>
                  ))}
                  {[
                    { label: "Store Address", placeholder: "123 Main St" },
                    { label: "City", placeholder: "Tampa" },
                    { label: "State", placeholder: "FL" },
                    { label: "ZIP Code", placeholder: "33601" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
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
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                  >
                    <Save size={12} />
                    Save Store Info
                  </button>
                </div>
              </div>
            )}

            {(activeTab === "shipping" || activeTab === "payments" || activeTab === "compliance" || activeTab === "affiliates" || activeTab === "email") && (
              <div
                className="rounded-xl p-12 text-center"
                style={{ backgroundColor: "var(--bg-card)", border: "1px dashed var(--border)" }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  {leftNavItems.find((i) => i.key === activeTab)?.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Configuration settings for this section coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
