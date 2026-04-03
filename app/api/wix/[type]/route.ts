import { NextRequest, NextResponse } from "next/server";

const WIX_BASE = "https://www.wixapis.com";

function wixHeaders(apiKey: string, siteId: string): Record<string, string> {
  return {
    Authorization: apiKey,
    "wix-site-id": siteId,
    "wix-auth-type": "apikey",
    "Content-Type": "application/json",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWixOrder(o: any) {
  const contact = o.billingInfo?.contactDetails || {};
  const name =
    `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
    o.buyerInfo?.email ||
    "Guest";
  const fulfillment = o.fulfillmentStatus || "NOT_FULFILLED";
  const payment = o.paymentStatus || "NOT_PAID";

  let status = "processing";
  if (o.status === "CANCELED") status = "cancelled";
  else if (payment === "NOT_PAID") status = "pending";
  else if (fulfillment === "FULFILLED") status = "completed";

  const addr =
    o.shippingInfo?.logistics?.deliveryDetails?.address ||
    o.shippingInfo?.shippingDestination?.address ||
    {};

  return {
    id: o.id,
    number: `#${o.number}`,
    customer: { name, email: o.buyerInfo?.email || "" },
    total: `$${parseFloat(o.priceSummary?.total?.amount || "0").toFixed(2)}`,
    status,
    date: o.createdDate
      ? new Date(o.createdDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "",
    isoDate: o.createdDate || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (o.lineItems || []).map((i: any) => ({
      name: i.productName?.original || i.name || "Item",
      quantity: i.quantity || 1,
      price: `$${parseFloat(i.price?.amount || String(i.price) || "0").toFixed(2)}`,
    })),
    shippingAddress: {
      address1: addr.addressLine || addr.addressLine1 || "",
      address2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.subdivision || "",
      postcode: addr.postalCode || "",
    },
    tracking: "",
    shippingMethod: o.shippingInfo?.title || "Standard",
    shippingCost: `$${parseFloat(o.priceSummary?.shipping?.amount || "0").toFixed(2)}`,
    discount:
      parseFloat(o.priceSummary?.discount?.amount || "0") > 0
        ? `-$${parseFloat(o.priceSummary.discount.amount).toFixed(2)}`
        : null,
    paymentMethod: o.paymentInfo?.paymentMethod || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWixProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || "",
    category: p.collections?.[0]?.name || "Uncategorized",
    price: parseFloat(p.price?.price ?? p.priceData?.price ?? "0"),
    sale_price: p.price?.discountedPrice
      ? parseFloat(p.price.discountedPrice)
      : null,
    status: p.visible !== false ? "active" : "draft",
    sku: p.sku || "",
    stock: p.stock?.quantity ?? 0,
    sizes: [],
    image: p.media?.mainMedia?.image?.url || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWixCollection(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug || (c.name || "").toLowerCase().replace(/\s+/g, "-"),
    count: c.numberOfProducts || 0,
    description: c.description || "",
    parent: 0,
    image: c.media?.mainMedia?.image?.url || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWixContact(c: any) {
  const first = c.info?.name?.first || "";
  const last = c.info?.name?.last || "";
  const name = `${first} ${last}`.trim() || c.primaryInfo?.email || "Unknown";
  return {
    id: c.id,
    name,
    email: c.primaryInfo?.email || "",
    orders: 0,
    lifetime_value: "$0.00",
    avg_order: "$0.00",
    last_order: "—",
    account: "Registered",
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const siteId = req.nextUrl.searchParams.get("site_id");
  const apiKey = req.nextUrl.searchParams.get("api_key");

  if (!siteId || !apiKey) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const headers = wixHeaders(apiKey, siteId);

  try {
    if (type === "debug") {
      const res = await fetch(`${WIX_BASE}/ecom/v1/orders/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: { paging: { limit: 5, offset: 0 } } }),
      });
      const text = await res.text();
      return NextResponse.json({ status: res.status, headers: Object.fromEntries(res.headers), body: text });
    }

    if (type === "orders") {
      const res = await fetch(`${WIX_BASE}/ecom/v1/orders/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: { paging: { limit: 50, offset: 0 } } }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message || "Wix API error", details: data },
          { status: res.status }
        );
      return NextResponse.json((data.orders || []).map(normalizeWixOrder));
    }

    if (type === "products") {
      const res = await fetch(`${WIX_BASE}/stores/v1/products/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: { paging: { limit: 50, offset: 0 } } }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message || "Wix API error" },
          { status: res.status }
        );
      return NextResponse.json((data.products || []).map(normalizeWixProduct));
    }

    if (type === "customers") {
      const res = await fetch(`${WIX_BASE}/contacts/v4/contacts/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: { paging: { limit: 50, offset: 0 } } }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message || "Wix API error" },
          { status: res.status }
        );
      return NextResponse.json((data.contacts || []).map(normalizeWixContact));
    }

    if (type === "categories") {
      const res = await fetch(`${WIX_BASE}/stores/v1/collections/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: { paging: { limit: 100, offset: 0 } } }),
      });
      const data = await res.json();
      if (!res.ok)
        return NextResponse.json(
          { error: data.message || "Wix API error" },
          { status: res.status }
        );
      // Filter out "All Products" default collection
      const collections = (data.collections || []).filter((c: any) => c.id !== "00000000-000000-000000-000000000001");
      return NextResponse.json(collections.map(normalizeWixCollection));
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 500 }
    );
  }
}
