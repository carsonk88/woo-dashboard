import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const META_API = "https://graph.facebook.com/v21.0";

export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "No client ID" }, { status: 400 });

  const platform = req.nextUrl.searchParams.get("platform") || "meta";
  const datePreset = req.nextUrl.searchParams.get("date_preset") || "last_7d";

  const { data: client } = await supabase
    .from("clients")
    .select("meta_ads_account_id, meta_ads_access_token, google_ads_customer_id, google_ads_refresh_token, tiktok_ads_advertiser_id, tiktok_ads_access_token")
    .eq("id", clientId)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  if (platform === "meta") {
    return fetchMetaAds(client, datePreset);
  }

  return NextResponse.json({ error: "Platform not supported yet", platform });
}

async function fetchMetaAds(client: any, datePreset: string) {
  const accountId = client.meta_ads_account_id;
  const token = client.meta_ads_access_token;

  if (!accountId || !token) {
    return NextResponse.json({ error: "Meta Ads not connected" }, { status: 400 });
  }

  const acctId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

  try {
    // Fetch in parallel: account info, campaigns with insights, account-level insights
    const [acctRes, campaignsRes, insightsRes] = await Promise.all([
      fetch(`${META_API}/${acctId}?fields=name,account_status,currency&access_token=${token}`),
      fetch(`${META_API}/${acctId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,insights.date_preset(${datePreset}){spend,impressions,clicks,cpc,cpm,ctr,actions,action_values,purchase_roas}&limit=50&access_token=${token}`),
      fetch(`${META_API}/${acctId}/insights?fields=spend,impressions,clicks,cpc,cpm,ctr,actions,action_values,purchase_roas,cost_per_action_type&date_preset=${datePreset}&access_token=${token}`),
    ]);

    const [account, campaignsData, insightsData] = await Promise.all([
      acctRes.json(),
      campaignsRes.json(),
      insightsRes.json(),
    ]);

    // Parse campaign data
    const campaigns = (campaignsData.data || []).map((c: any) => {
      const ins = c.insights?.data?.[0] || {};
      const purchases = (ins.actions || []).find((a: any) => a.action_type === "purchase")?.value || 0;
      const purchaseValue = (ins.action_values || []).find((a: any) => a.action_type === "purchase")?.value || 0;
      const roas = (ins.purchase_roas || [])[0]?.value || 0;

      return {
        id: c.id,
        name: c.name,
        status: c.status?.toLowerCase(),
        objective: c.objective,
        spend: parseFloat(ins.spend || "0"),
        impressions: parseInt(ins.impressions || "0"),
        clicks: parseInt(ins.clicks || "0"),
        cpc: parseFloat(ins.cpc || "0"),
        cpm: parseFloat(ins.cpm || "0"),
        ctr: parseFloat(ins.ctr || "0"),
        conversions: parseInt(purchases),
        revenue: parseFloat(purchaseValue),
        roas: parseFloat(roas),
      };
    });

    // Parse account-level insights
    const acctInsights = insightsData.data?.[0] || {};
    const totalPurchases = (acctInsights.actions || []).find((a: any) => a.action_type === "purchase")?.value || 0;
    const totalRevenue = (acctInsights.action_values || []).find((a: any) => a.action_type === "purchase")?.value || 0;
    const totalRoas = (acctInsights.purchase_roas || [])[0]?.value || 0;

    const summary = {
      spend: parseFloat(acctInsights.spend || "0"),
      impressions: parseInt(acctInsights.impressions || "0"),
      clicks: parseInt(acctInsights.clicks || "0"),
      cpc: parseFloat(acctInsights.cpc || "0"),
      cpm: parseFloat(acctInsights.cpm || "0"),
      ctr: parseFloat(acctInsights.ctr || "0"),
      conversions: parseInt(totalPurchases),
      revenue: parseFloat(totalRevenue),
      roas: parseFloat(totalRoas),
    };

    return NextResponse.json({
      platform: "meta",
      account: { name: account.name, status: account.account_status, currency: account.currency },
      summary,
      campaigns,
      datePreset,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Meta API error" },
      { status: 500 }
    );
  }
}
