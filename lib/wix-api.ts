export interface WixCredentials {
  siteId: string;
  apiKey: string;
}

const WIX_KEY = "wix_credentials";

export function saveWixCredentials(creds: WixCredentials): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WIX_KEY, JSON.stringify(creds));
}

export function loadWixCredentials(): WixCredentials | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(WIX_KEY);
  if (stored) {
    try { return JSON.parse(stored) as WixCredentials; } catch { /* fall through */ }
  }
  // legacy keys
  const siteId = localStorage.getItem("wix_site_id");
  const apiKey = localStorage.getItem("wix_api_key");
  if (siteId && apiKey) return { siteId, apiKey };
  return null;
}

export function clearWixCredentials(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WIX_KEY);
  localStorage.removeItem("wix_site_id");
  localStorage.removeItem("wix_api_key");
}

export function isWixConnected(): boolean {
  const c = loadWixCredentials();
  return !!(c?.siteId && c?.apiKey);
}

export function getClientPlatform(): "woocommerce" | "wix" | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("client_platform") as "woocommerce" | "wix" | null;
}

export function setClientPlatform(platform: "woocommerce" | "wix"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("client_platform", platform);
}
