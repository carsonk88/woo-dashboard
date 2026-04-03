import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Client {
  id: string;
  name: string;
  store_url: string;
  woo_consumer_key: string;
  woo_consumer_secret: string;
  created_at: string;
  notes: string | null;
  monthly_revenue: number;
  total_orders: number;
  last_synced: string | null;
  wix_site_id: string | null;
  wix_api_key: string | null;
  dashboard_url: string | null;
  vercel_project_id: string | null;
  enabled_features: string[] | null;
}
