"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, Client } from "@/lib/supabase";
import { saveWooCredentials } from "@/lib/woo-api";
import Sidebar from "@/components/Sidebar";
import {
  RefreshCw,
  AlertCircle,
  Building2,
} from "lucide-react";

// Lazy-import the full dashboard page content
import DashboardPage from "@/app/page";

export default function ClientDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (err || !data) {
        setError("Client not found.");
        setLoading(false);
        return;
      }

      const c = data as Client;
      setClient(c);

      // Save WooCommerce credentials to localStorage so useWooData picks them up
      saveWooCredentials({
        url: c.store_url,
        consumerKey: c.woo_consumer_key,
        consumerSecret: c.woo_consumer_secret,
      });

      // Save Wix credentials if present
      if (c.wix_site_id && c.wix_api_key) {
        localStorage.setItem("wix_site_id", c.wix_site_id);
        localStorage.setItem("wix_api_key", c.wix_api_key);
      }

      setLoading(false);
      setReady(true);
    }
    load();
  }, [clientId]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <RefreshCw size={20} className="animate-spin mr-2" style={{ color: "var(--text-muted)" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading client dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#f87171" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{error}</p>
          <a
            href="/agency"
            className="text-xs"
            style={{ color: "var(--accent-green-bright)" }}
          >
            Back to Agency Portal
          </a>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Sidebar with client label */}
      <div className="relative">
        <Sidebar />
        {client && (
          <div
            className="fixed left-0 bottom-16 w-[220px] px-3 py-2 text-center"
            style={{
              backgroundColor: "var(--bg-sidebar)",
              borderTop: "1px solid var(--border)",
              zIndex: 51,
            }}
          >
            <div className="flex items-center gap-2 px-1">
              <Building2 size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span
                className="text-[10px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {client.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard content */}
      <main
        className="flex-1 overflow-y-auto min-h-screen"
        style={{ marginLeft: "220px" }}
      >
        <DashboardPage />
      </main>
    </div>
  );
}
