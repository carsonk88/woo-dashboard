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

  if (platform === "tiktok") {
    return fetchTikTokAds(client, datePreset);
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

const TIKTOK_BASE = "https://business-api.tiktok.com/open_api/v1.3";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTikTokAds(client: any, datePreset: string) {
  const advertiserId = client.tiktok_ads_advertiser_id;
  const token = client.tiktok_ads_access_token;

  if (!advertiserId || !token) {
    return NextResponse.json({ error: "TikTok Ads not connected" }, { status: 400 });
  }

  const headers = { "Access-Token": token, "Content-Type": "application/json" };

  // Map date preset to start/end dates
  const now = new Date();
  let startDate: string;
  const endDate = now.toISOString().split("T")[0];
  if (datePreset === "today") {
    startDate = endDate;
  } else if (datePreset === "yesterday") {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    startDate = d.toISOString().split("T")[0];
  } else if (datePreset === "last_7d") {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    startDate = d.toISOString().split("T")[0];
  } else if (datePreset === "last_14d") {
    const d = new Date(now); d.setDate(d.getDate() - 14);
    startDate = d.toISOString().split("T")[0];
  } else if (datePreset === "last_30d") {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    startDate = d.toISOString().split("T")[0];
  } else {
    // this_month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  }

  try {
    const reportParams = new URLSearchParams({
      advertiser_id: advertiserId,
      report_type: "BASIC",
      data_level: "AUCTION_CAMPAIGN",
      dimensions: JSON.stringify(["campaign_id", "stat_time_day"]),
      metrics: JSON.stringify(["campaign_name", "spend", "impressions", "clicks", "ctr", "total_purchase", "total_purchase_value", "cpc", "cpm"]),
      start_date: startDate,
      end_date: endDate,
      page_size: "50",
    });

    const [campaignRes, reportRes] = await Promise.all([
      fetch(`${TIKTOK_BASE}/campaign/get/?advertiser_id=${advertiserId}&fields=["campaign_id","campaign_name","status"]&page_size=50`, { headers }),
      fetch(`${TIKTOK_BASE}/report/integrated/get/?${reportParams.toString()}`, { headers }),
    ]);

    const [campaignData, reportData] = await Promise.all([
      campaignRes.json(),
      reportRes.json(),
    ]);

    if (campaignData.code !== 0) {
      return NextResponse.json({ error: campaignData.message ?? "TikTok API error" }, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaignList: any[] = campaignData.data?.list ?? [];

    // Aggregate report rows by campaign
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metricsMap: Record<string, any> = {};
    for (const row of reportData.data?.list ?? []) {
      const cid = row.dimensions?.campaign_id;
      if (!cid) continue;
      if (!metricsMap[cid]) {
        metricsMap[cid] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, cpc_sum: 0, cpm_sum: 0, rows: 0 };
      }
      const m = metricsMap[cid];
      m.spend += parseFloat(row.metrics?.spend ?? "0");
      m.impressions += parseInt(row.metrics?.impressions ?? "0", 10);
      m.clicks += parseInt(row.metrics?.clicks ?? "0", 10);
      m.conversions += parseInt(row.metrics?.total_purchase ?? "0", 10);
      m.revenue += parseFloat(row.metrics?.total_purchase_value ?? "0");
      m.cpc_sum += parseFloat(row.metrics?.cpc ?? "0");
      m.cpm_sum += parseFloat(row.metrics?.cpm ?? "0");
      m.rows += 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaigns = campaignList.map((c: any) => {
      const m = metricsMap[c.campaign_id] ?? {};
      const spend = m.spend ?? 0;
      const revenue = m.revenue ?? 0;
      const clicks = m.clicks ?? 0;
      const impressions = m.impressions ?? 0;
      const rows = m.rows || 1;
      return {
        id: c.campaign_id,
        name: c.campaign_name,
        status: c.status === "CAMPAIGN_STATUS_ENABLE" ? "active" : "paused",
        spend,
        impressions,
        clicks,
        cpc: m.cpc_sum / rows,
        cpm: m.cpm_sum / rows,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        conversions: m.conversions ?? 0,
        revenue,
        roas: spend > 0 ? revenue / spend : 0,
      };
    });

    const summary = campaigns.reduce(
      (acc, c) => ({
        spend: acc.spend + c.spend,
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        conversions: acc.conversions + c.conversions,
        revenue: acc.revenue + c.revenue,
        cpc: 0,
        cpm: 0,
        ctr: 0,
        roas: 0,
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, cpc: 0, cpm: 0, ctr: 0, roas: 0 }
    );
    if (summary.impressions > 0) summary.ctr = (summary.clicks / summary.impressions) * 100;
    if (summary.clicks > 0) summary.cpc = summary.spend / summary.clicks;
    if (summary.impressions > 0) summary.cpm = (summary.spend / summary.impressions) * 1000;
    if (summary.spend > 0) summary.roas = summary.revenue / summary.spend;

    return NextResponse.json({
      platform: "tiktok",
      account: { name: `Advertiser ${advertiserId}` },
      summary,
      campaigns,
      datePreset,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TikTok API error" },
      { status: 500 }
    );
  }
}
