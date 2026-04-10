import { NextRequest, NextResponse } from "next/server";

const TIKTOK_BASE = "https://business-api.tiktok.com/open_api/v1.3";

function tiktokHeaders(accessToken: string) {
  return {
    "Access-Token": accessToken,
    "Content-Type": "application/json",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCampaign(campaign: any, metrics: any) {
  const spend = parseFloat(metrics?.spend ?? "0");
  const revenue = parseFloat(metrics?.total_purchase_value ?? "0");
  const impressions = parseInt(metrics?.impressions ?? "0", 10);
  const clicks = parseInt(metrics?.clicks ?? "0", 10);
  const conversions = parseInt(metrics?.total_purchase ?? "0", 10);
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + "%" : "0.00%";
  const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;

  return {
    id: campaign.campaign_id,
    name: campaign.campaign_name,
    platform: "TikTok",
    status: campaign.status === "CAMPAIGN_STATUS_ENABLE" ? "active" : "paused",
    spend,
    revenue,
    roas,
    impressions,
    clicks,
    conversions,
    ctr,
  };
}

export async function POST(req: NextRequest) {
  let body: { accessToken?: string; advertiserId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { accessToken, advertiserId } = body;
  if (!accessToken || !advertiserId) {
    return NextResponse.json({ error: "Missing accessToken or advertiserId" }, { status: 400 });
  }

  // 1. Fetch campaigns
  const campaignRes = await fetch(
    `${TIKTOK_BASE}/campaign/get/?advertiser_id=${advertiserId}&fields=["campaign_id","campaign_name","status","budget","budget_mode"]&page_size=50`,
    { headers: tiktokHeaders(accessToken) }
  );

  if (!campaignRes.ok) {
    return NextResponse.json({ error: "TikTok API error fetching campaigns" }, { status: 502 });
  }

  const campaignData = await campaignRes.json();
  if (campaignData.code !== 0) {
    return NextResponse.json(
      { error: campaignData.message ?? "TikTok API error" },
      { status: 502 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaigns: any[] = campaignData.data?.list ?? [];
  if (campaigns.length === 0) {
    return NextResponse.json({ campaigns: [] });
  }

  // 2. Fetch metrics for each campaign via integrated report
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

  const reportParams = new URLSearchParams({
    advertiser_id: advertiserId,
    report_type: "BASIC",
    data_level: "AUCTION_CAMPAIGN",
    dimensions: JSON.stringify(["campaign_id"]),
    metrics: JSON.stringify([
      "campaign_name",
      "spend",
      "impressions",
      "clicks",
      "ctr",
      "total_purchase",
      "total_purchase_value",
    ]),
    start_date: startDate,
    end_date: endDate,
    page_size: "50",
  });

  const reportRes = await fetch(
    `${TIKTOK_BASE}/report/integrated/get/?${reportParams.toString()}`,
    { headers: tiktokHeaders(accessToken) }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let metricsMap: Record<string, any> = {};
  if (reportRes.ok) {
    const reportData = await reportRes.json();
    if (reportData.code === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const row of reportData.data?.list ?? []) {
        const cid = row.dimensions?.campaign_id;
        if (cid) metricsMap[cid] = row.metrics;
      }
    }
  }

  const normalized = campaigns.map((c) =>
    normalizeCampaign(c, metricsMap[c.campaign_id] ?? {})
  );

  return NextResponse.json({ campaigns: normalized });
}
