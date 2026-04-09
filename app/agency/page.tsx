"use client";

import { useState, useEffect } from "react";
import { supabase, Client } from "@/lib/supabase";
import {
  Plus,
  ExternalLink,
  Trash2,
  RefreshCw,
  Building2,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Rocket,
} from "lucide-react";

const AGENCY_PASSWORD = process.env.NEXT_PUBLIC_AGENCY_PASSWORD || "admin2024";

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ backgroundColor: "var(--hover-icon)", color: "var(--text-muted)" }}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold font-mono" style={{ color: color || "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function AddClientModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [platform, setPlatform] = useState<"" | "woocommerce" | "wix">("");
  const [form, setForm] = useState({
    name: "",
    store_url: "",
    woo_consumer_key: "",
    woo_consumer_secret: "",
    wix_site_id: "",
    wix_api_key: "",
    notes: "",
    dashboard_password: "",
  });
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<"db" | "deploy" | "">("") ;
  const [error, setError] = useState("");
  const [deployError, setDeployError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showWixKey, setShowWixKey] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isVercelUrl, setIsVercelUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Client name is required."); return; }
    if (platform === "woocommerce" && (!form.store_url || !form.woo_consumer_key || !form.woo_consumer_secret)) {
      setError("Store URL, Consumer Key, and Consumer Secret are required.");
      return;
    }
    if (platform === "wix" && (!form.wix_site_id || !form.wix_api_key)) {
      setError("Wix Site ID and API Key are required.");
      return;
    }
    setSaving(true);
    setSavingStep("db");
    setError("");

    // Step 1: Insert into Supabase
    const { data, error: err } = await supabase.from("clients").insert([
      {
        name: form.name,
        store_url: platform === "woocommerce" ? form.store_url.replace(/\/$/, "") : "",
        woo_consumer_key: platform === "woocommerce" ? form.woo_consumer_key : "",
        woo_consumer_secret: platform === "woocommerce" ? form.woo_consumer_secret : "",
        notes: form.notes || null,
        dashboard_password: form.dashboard_password || null,
        monthly_revenue: 0,
        total_orders: 0,
        wix_site_id: platform === "wix" ? form.wix_site_id : null,
        wix_api_key: platform === "wix" ? form.wix_api_key : null,
        enabled_features: enabledFeatures.length > 0 ? enabledFeatures : null,
      },
    ]).select("id").single();

    if (err || !data) {
      setSaving(false);
      setSavingStep("");
      setError(err?.message || "Failed to create client.");
      return;
    }

    const clientId = data.id;
    onAdded();

    // Step 2: Deploy to Vercel
    setSavingStep("deploy");
    let deployedUrl: string | null = null;

    try {
      const deployRes = await fetch("/api/deploy-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientName: form.name }),
      });
      const deployData = await deployRes.json();

      if (deployRes.ok && deployData.url) {
        deployedUrl = deployData.url;
        setIsVercelUrl(true);
        // Save URL and project ID back to Supabase
        await supabase
          .from("clients")
          .update({
            dashboard_url: deployData.url,
            vercel_project_id: deployData.projectId,
          })
          .eq("id", clientId);
      } else {
        // Vercel deploy failed — fall back to internal URL
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        deployedUrl = `${origin}/c/${clientId}`;
        setDeployError(deployData.error || "Unknown error from Vercel API.");
      }
    } catch (e) {
      // Network error — fall back to internal URL
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      deployedUrl = `${origin}/c/${clientId}`;
      setDeployError(e instanceof Error ? e.message : "Could not reach deploy API.");
    }

    setSaving(false);
    setSavingStep("");
    setCreatedUrl(deployedUrl);
  }

  function copyUrl() {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Success screen
  if (createdUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-7 mx-4 text-center"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: isVercelUrl ? "rgba(22,163,74,0.15)" : "rgba(234,179,8,0.15)",
              border: `1px solid ${isVercelUrl ? "rgba(22,163,74,0.3)" : "rgba(234,179,8,0.3)"}`,
            }}
          >
            <Check size={24} style={{ color: isVercelUrl ? "var(--accent-green-bright)" : "#eab308" }} />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {isVercelUrl ? "Dashboard Deployed!" : "Client Created"}
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            {isVercelUrl
              ? "A dedicated Vercel deployment was created — share this URL with your client"
              : "Saved to Supabase. Vercel deploy failed — using internal URL for now."}
          </p>
          {deployError && (
            <p className="text-[11px] px-3 py-2 rounded-lg mb-3 text-left font-mono" style={{ backgroundColor: "rgba(234,179,8,0.1)", color: "#eab308", border: "1px solid rgba(234,179,8,0.2)" }}>
              {deployError}
            </p>
          )}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-left"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <p className="flex-1 text-xs font-mono truncate" style={{ color: "var(--text-primary)" }}>
              {createdUrl}
            </p>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
              style={{
                backgroundColor: copied ? "rgba(22,163,74,0.15)" : "var(--bg-elevated)",
                color: copied ? "var(--accent-green-bright)" : "var(--text-muted)",
                border: `1px solid ${copied ? "rgba(22,163,74,0.3)" : "var(--border)"}`,
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              Close
            </button>
            <a
              href={createdUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              <ExternalLink size={12} />
              Open Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {platform && (
              <button
                onClick={() => { setPlatform(""); setError(""); }}
                className="p-1 rounded-md"
                style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}
              >
                ←
              </button>
            )}
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {platform === "" ? "Add New Client" : platform === "woocommerce" ? "Connect WooCommerce" : "Connect Wix"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md"
            style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}
          >
            Cancel
          </button>
        </div>

        {/* Step 1: Platform picker */}
        {platform === "" && (
          <div>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Choose the platform this client&apos;s store runs on
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform("woocommerce")}
                className="flex flex-col items-center gap-3 p-5 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,179,74,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,179,74,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-card)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: "rgba(99,179,74,0.12)", color: "#7fc97a" }}
                >
                  Woo
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    WooCommerce
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    WordPress-based store with REST API access
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPlatform("wix")}
                className="flex flex-col items-center gap-3 p-5 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(96,165,250,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(96,165,250,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-card)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: "rgba(96,165,250,0.12)", color: "#60a5fa" }}
                >
                  Wix
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    Wix
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Wix eCommerce store via Site ID &amp; API key
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {platform !== "" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Client / Store Name
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Peptide Research"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {platform === "woocommerce" && (
              <>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Store URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourstore.com"
                    value={form.store_url}
                    onChange={(e) => setForm({ ...form, store_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Consumer Key
                  </label>
                  <input
                    type="text"
                    placeholder="ck_xxxxxxxxxxxxxxxx"
                    value={form.woo_consumer_key}
                    onChange={(e) => setForm({ ...form, woo_consumer_key: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Consumer Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      placeholder="cs_xxxxxxxxxxxxxxxx"
                      value={form.woo_consumer_secret}
                      onChange={(e) => setForm({ ...form, woo_consumer_secret: e.target.value })}
                      className="w-full px-3 py-2 pr-9 rounded-lg text-sm outline-none font-mono"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {platform === "wix" && (
              <>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Wix Site ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                    value={form.wix_site_id}
                    onChange={(e) => setForm({ ...form, wix_site_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-subtle)" }}>
                    Found in your Wix dashboard under Settings → Advanced → Site ID
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                    Wix API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showWixKey ? "text" : "password"}
                      placeholder="IST.eyJ..."
                      value={form.wix_api_key}
                      onChange={(e) => setForm({ ...form, wix_api_key: e.target.value })}
                      className="w-full px-3 py-2 pr-9 rounded-lg text-sm outline-none font-mono"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                      onClick={() => setShowWixKey(!showWixKey)}
                    >
                      {showWixKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-subtle)" }}>
                    Generate under Wix API Keys Manager with eCommerce permissions
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-muted)" }}>
                    Optional Features
                  </label>
                  <p className="text-[11px] mb-2" style={{ color: "var(--text-subtle)" }}>
                    Enable these if the client uses a third-party app for them. Otherwise they&apos;ll be hidden from the sidebar.
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { key: "reviews", label: "Reviews", hint: "e.g. Judge.me, Yotpo" },
                      { key: "discounts", label: "Discounts", hint: "Wix Coupons or third-party" },
                      { key: "shipping", label: "Shipping", hint: "custom shipping methods" },
                      { key: "abandoned-carts", label: "Abandoned Carts", hint: "cart recovery tool" },
                      { key: "affiliates", label: "Affiliates", hint: "affiliate management app" },
                      { key: "affiliate-orders", label: "Affiliate Orders", hint: "affiliate order tracking" },
                      { key: "promo", label: "Promo & Affiliates", hint: "promotional campaigns" },
                    ].map((f) => (
                      <label
                        key={f.key}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
                        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                      >
                        <input
                          type="checkbox"
                          checked={enabledFeatures.includes(f.key)}
                          onChange={() => setEnabledFeatures((prev) =>
                            prev.includes(f.key) ? prev.filter((k) => k !== f.key) : [...prev, f.key]
                          )}
                          className="rounded"
                        />
                        <span className="text-xs font-medium flex-1" style={{ color: "var(--text-primary)" }}>{f.label}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>{f.hint}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Dashboard Password
              </label>
              <input
                type="text"
                placeholder="Set a login password for the client"
                value={form.dashboard_password}
                onChange={(e) => setForm({ ...form, dashboard_password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--text-subtle)" }}>
                Client will use this password to access their dashboard
              </p>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Notes (optional)
              </label>
              <textarea
                placeholder="Any notes about this client..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Rocket size={14} />
              )}
              {savingStep === "db"
                ? "Saving client..."
                : savingStep === "deploy"
                ? "Deploying to Vercel..."
                : "Create & Deploy Dashboard"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ClientCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const dashboardUrl = client.dashboard_url || `${origin}/c/${client.id}`;

  function copyLink() {
    navigator.clipboard.writeText(dashboardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${client.name}? This cannot be undone.`)) return;
    await supabase.from("clients").delete().eq("id", client.id);
    onDelete(client.id);
  }

  const hostname = (() => {
    try { return new URL(client.store_url).hostname; }
    catch { return client.store_url; }
  })();

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {client.name}
              </p>
              {client.wix_site_id && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "rgba(96,165,250,0.15)", color: "#60a5fa" }}
                >
                  Wix
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {client.dashboard_url ? new URL(client.dashboard_url).hostname : hostname}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(239,68,68,0.1)";
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

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
            Revenue
          </p>
          <p className="text-sm font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
            ${client.monthly_revenue.toLocaleString()}
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
            Orders
          </p>
          <p className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
            {client.total_orders.toLocaleString()}
          </p>
        </div>
      </div>

      {(client as any).dashboard_password && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password:</span>
          <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>{(client as any).dashboard_password}</span>
        </div>
      )}

      {client.notes && (
        <p className="text-xs mb-3 px-2 py-1.5 rounded-md" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }}>
          {client.notes}
        </p>
      )}

      <div className="flex gap-2">
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1d4ed8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-green)"; }}
        >
          <ExternalLink size={11} />
          Open Dashboard
        </a>
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: copied ? "var(--accent-green-bright)" : "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy Link"}
        </button>
        <a
          href={client.store_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center p-2 rounded-lg"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

export default function AgencyPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("agency_auth") === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadClients();
  }, [authed]);

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && data) setClients(data as Client[]);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === AGENCY_PASSWORD) {
      sessionStorage.setItem("agency_auth", "1");
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  }

  function removeClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  const totalRevenue = clients.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
  const totalOrders = clients.reduce((sum, c) => sum + (c.total_orders || 0), 0);

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 mx-4"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Agency Portal
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Internal access only
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Enter password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: `1px solid ${pwError ? "#ef4444" : "var(--border)"}`,
                color: "var(--text-primary)",
              }}
            />
            {pwError && (
              <p className="text-xs" style={{ color: "#f87171" }}>
                Incorrect password
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      {showAdd && (
        <AddClientModal
          onClose={() => setShowAdd(false)}
          onAdded={loadClients}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          >
            <Building2 size={15} />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Agency Portal
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {clients.length} client{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadClients}
            disabled={loading}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)"; }}
          >
            <Plus size={13} />
            Add Client
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Aggregate stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Clients"
            value={String(clients.length)}
            sub="Active dashboards"
            icon={<Users size={15} />}
          />
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            sub="Across all clients"
            icon={<DollarSign size={15} />}
            color="var(--accent-green-bright)"
          />
          <StatCard
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            sub="All time combined"
            icon={<ShoppingCart size={15} />}
          />
          <StatCard
            label="Avg Revenue"
            value={clients.length ? `$${Math.round(totalRevenue / clients.length).toLocaleString()}` : "$0"}
            sub="Per client"
            icon={<Building2 size={15} />}
          />
        </div>

        {/* Client Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-xl"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <Building2 size={32} style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              No clients yet
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Add your first client to create a dashboard
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
            >
              <Plus size={13} />
              Add First Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} onDelete={removeClient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
