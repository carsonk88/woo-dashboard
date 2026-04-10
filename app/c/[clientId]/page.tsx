"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Client } from "@/lib/supabase";
import { saveWooCredentials, clearWooCredentials } from "@/lib/woo-api";
import { saveWixCredentials, clearWixCredentials, setClientPlatform } from "@/lib/wix-api";
import { saveTikTokCredentials, clearTikTokCredentials } from "@/lib/tiktok-api";
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
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Auth check — redirect to login if not authenticated
  useEffect(() => {
    const isAuthed = sessionStorage.getItem("dash_auth");
    if (!isAuthed) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    async function load() {
      if (!sessionStorage.getItem("dash_auth")) return;
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

      const isWixClient = !!(c.wix_site_id && c.wix_api_key) && !c.woo_consumer_key;

      if (isWixClient) {
        setClientPlatform("wix");
        clearWooCredentials();
        saveWixCredentials({ siteId: c.wix_site_id!, apiKey: c.wix_api_key! });
      } else {
        setClientPlatform("woocommerce");
        clearWixCredentials();
        saveWooCredentials({
          url: c.store_url,
          consumerKey: c.woo_consumer_key,
          consumerSecret: c.woo_consumer_secret,
        });
      }

      // Always clear TikTok creds first, then set only if this client has them
      clearTikTokCredentials();
      if (c.tiktok_access_token && c.tiktok_advertiser_id) {
        saveTikTokCredentials({
          accessToken: c.tiktok_access_token,
          advertiserId: c.tiktok_advertiser_id,
        });
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
        <Sidebar enabledFeatures={client?.enabled_features ?? []} />
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
