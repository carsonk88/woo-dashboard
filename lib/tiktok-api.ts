export interface TikTokCredentials {
  accessToken: string;
  advertiserId: string;
}

const TIKTOK_KEY = "tiktok_credentials";

export function saveTikTokCredentials(creds: TikTokCredentials): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIKTOK_KEY, JSON.stringify(creds));
}

export function loadTikTokCredentials(): TikTokCredentials | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TIKTOK_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TikTokCredentials;
  } catch {
    return null;
  }
}

export function clearTikTokCredentials(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TIKTOK_KEY);
}

export function isTikTokConnected(): boolean {
  const c = loadTikTokCredentials();
  return !!(c?.accessToken && c?.advertiserId);
}
