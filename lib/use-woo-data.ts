"use client";

import { useState, useEffect } from "react";
import { getWooAPI, isWooConnected } from "./woo-api";
import { getClientPlatform, isWixConnected, loadWixCredentials } from "./wix-api";
import {
  orders as mockOrders,
  products as mockProducts,
  customers as mockCustomers,
  discounts as mockDiscounts,
} from "./mock-data";

const mockReviews = [
  { id: "1", reviewer: "James H.", email: "james.h@gmail.com", product: "BPC-157 5mg Vial", rating: 5, text: "Absolutely amazing product! Consistent quality, ships fast.", date: "2026-03-27", status: "approved" },
  { id: "2", reviewer: "Sarah M.", email: "sarah.m@outlook.com", product: "Semaglutide 5mg Vial", rating: 4, text: "Great results after several weeks of use.", date: "2026-03-26", status: "approved" },
  { id: "3", reviewer: "Mike T.", email: "miket@yahoo.com", product: "Epithalon 10mg Vial", rating: 5, text: "Peptide quality confirmed via HPLC. Excellent.", date: "2026-03-25", status: "pending" },
  { id: "4", reviewer: "Emily C.", email: "emily.c@icloud.com", product: "TB-500 2mg Vial", rating: 3, text: "Decent product but I expected more.", date: "2026-03-25", status: "approved" },
  { id: "5", reviewer: "Anonymous", email: "spam@example.com", product: "Tirzepatide 15mg Vial", rating: 1, text: "Buy cheap meds here!!! [SPAM]", date: "2026-03-24", status: "spam" },
];

const mockCategories = [
  { id: "1", name: "Weight Loss", slug: "weight-loss", count: 8, description: "Semaglutide, Tirzepatide and GLP-1 peptides", parent: 0 },
  { id: "2", name: "Healing & Recovery", slug: "healing-recovery", count: 12, description: "BPC-157, TB-500 and repair peptides", parent: 0 },
  { id: "3", name: "Growth Hormone", slug: "growth-hormone", count: 6, description: "CJC-1295, Ipamorelin, GHRP-6", parent: 0 },
  { id: "4", name: "Anti-Aging", slug: "anti-aging", count: 5, description: "Epithalon, GHK-Cu, Selank", parent: 0 },
  { id: "5", name: "Research Bundles", slug: "research-bundles", count: 4, description: "Pre-configured research peptide kits", parent: 0 },
  { id: "6", name: "Nootropics", slug: "nootropics", count: 3, description: "Semax, Selank and cognitive peptides", parent: 0 },
];

// Normalize WooCommerce order to our internal format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrder(o: any) {
  const firstName = o.billing?.first_name || "";
  const lastName = o.billing?.last_name || "";
  const shippingAddr = [
    o.shipping?.address_1,
    o.shipping?.city,
    o.shipping?.state,
    o.shipping?.postcode,
  ].filter(Boolean).join(", ") || "N/A";

  return {
    id: String(o.id),
    number: `#${o.number || o.id}`,
    customer: `${firstName} ${lastName}`.trim() || "Guest",
    email: o.billing?.email || "",
    total: parseFloat(o.total || "0"),
    status: o.status,
    date: new Date(o.date_created).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isoDate: o.date_created || "",
    items: (o.line_items || []).map((i: any) => ({
      name: i.name,
      qty: i.quantity,
      price: parseFloat(i.price || "0"),
    })),
    shipping: {
      address: shippingAddr,
      method: o.shipping_lines?.[0]?.method_title || "Standard",
      tracking: o.meta_data?.find((m: any) => m.key === "_tracking_number")?.value || "",
    },
    shippingCost: `$${parseFloat(o.shipping_total || "0").toFixed(2)}`,
    discount: o.discount_total !== "0.00" ? `-$${(Number(o.discount_total) || 0).toFixed(2)}` : null,
    paymentMethod: o.payment_method_title || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(p: any) {
  const managesStock = p.manage_stock === true;
  const stockQty = managesStock ? (p.stock_quantity ?? 0) : null;
  const stockStatus = p.stock_status || "instock";
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    category: p.categories?.[0]?.name || "Uncategorized",
    price: parseFloat(p.price || "0"),
    sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
    status: p.status === "publish" ? "active" : "draft",
    sku: p.sku || "",
    stock: stockQty,
    stock_status: stockStatus,
    manage_stock: managesStock,
    total_sales: p.total_sales || 0,
    sizes: p.attributes?.find((a: any) => a.name === "Size" || a.name === "Sizes")?.options || [],
    image: p.images?.[0]?.src || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeReview(r: any) {
  return {
    id: String(r.id),
    reviewer: r.reviewer || "Anonymous",
    email: r.reviewer_email || "",
    product: r.product_id ? `Product #${r.product_id}` : "Unknown Product",
    rating: r.rating || 0,
    text: r.review?.replace(/<[^>]*>/g, "") || "",
    date: r.date_created ? new Date(r.date_created).toISOString().split("T")[0] : "",
    status: r.status || "approved",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCategory(c: any) {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    count: c.count || 0,
    description: c.description || "",
    parent: c.parent || 0,
    image: c.image?.src || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCustomer(c: any) {
  const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
  const billingName = `${c.billing?.first_name || ""} ${c.billing?.last_name || ""}`.trim();
  const displayName = fullName || billingName || c.username || c.email || "Unknown";
  const orderCount = c.orders_count || 0;
  const totalSpent = parseFloat(c.total_spent || "0");
  return {
    id: String(c.id),
    name: displayName,
    email: c.email || c.billing?.email || "",
    orders: orderCount,
    lifetime_value: `$${totalSpent.toFixed(2)}`,
    avg_order: orderCount > 0 ? (totalSpent / orderCount) : 0,
    last_order: c._last_order_date
      ? new Date(c._last_order_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    account: c.is_paying_customer ? "Paying" : c.role === "customer" ? "Registered" : "Guest",
    date_created: c.date_created || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCoupon(c: any) {
  const isExpired = c.date_expires ? new Date(c.date_expires) <= new Date() : false;
  return {
    id: String(c.id),
    code: c.code?.toUpperCase(),
    type:
      c.discount_type === "percent"
        ? "percentage"
        : c.discount_type === "fixed_cart"
        ? "fixed"
        : "free_shipping",
    value: c.discount_type === "percent" ? `${c.amount}%` : `$${c.amount}`,
    uses: c.usage_count || 0,
    maxUses: c.usage_limit || null,
    minOrder: parseFloat(c.minimum_amount || "0"),
    status: isExpired ? "expired" : "active",
    startDate: c.date_created || new Date().toISOString(),
    endDate: c.date_expires || null,
    expiry: c.date_expires
      ? new Date(c.date_expires).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Never",
    description: c.description || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeShippingMethod(zone: any, method: any) {
  const title = method.title || method.method_title || "Shipping";
  const methodId = method.method_id || "";
  const carrier =
    methodId === "flat_rate" ? "Flat Rate"
    : methodId === "free_shipping" ? "Auto"
    : methodId === "local_pickup" ? "N/A"
    : title.includes("USPS") ? "USPS"
    : title.includes("FedEx") ? "FedEx"
    : title.includes("UPS") ? "UPS"
    : "Carrier";
  const badges: string[] = [];
  if (zone.name && zone.name !== "Locations not covered by your other zones") badges.push(zone.name);
  const cost = method.settings?.cost?.value;
  if (cost) badges.push(`$${cost}`);
  return {
    id: method.instance_id || method.id,
    name: title,
    carrier,
    description: method.settings?.title?.description || `${title} shipping method`,
    badges,
    isDefault: false,
    enabled: method.enabled !== false,
    _woo: true,
  };
}

type DataType = "orders" | "products" | "customers" | "discounts" | "reviews" | "categories" | "shipping";

interface UseWooDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  refresh: () => void;
}

export function useWooData<T>(type: DataType, params?: Record<string, string | number>): UseWooDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const platform = getClientPlatform();
      const mockMap: Record<DataType, unknown[]> = {
        orders: mockOrders,
        products: mockProducts,
        customers: mockCustomers,
        discounts: mockDiscounts,
        reviews: mockReviews,
        categories: mockCategories,
        shipping: [],
      };

      // --- Wix path ---
      if (platform === "wix" && isWixConnected()) {
        const creds = loadWixCredentials()!;
        const wixTypes: DataType[] = ["orders", "products", "customers", "categories"];
        if (!wixTypes.includes(type)) {
          // discounts / reviews / categories not in Wix API — use mock
          if (!cancelled) { setData(mockMap[type] as T[]); setIsLive(false); setLoading(false); }
          return;
        }
        try {
          const res = await fetch(
            `/api/wix/${type}?site_id=${encodeURIComponent(creds.siteId)}&api_key=${encodeURIComponent(creds.apiKey)}`
          );
          const raw = await res.json();
          if (!cancelled) {
            if (!res.ok || raw.error) {
              setError(raw.error || "Wix API error");
              setData(mockMap[type] as T[]);
              setIsLive(false);
            } else {
              setIsLive(true);
              setData(Array.isArray(raw) ? raw as T[] : mockMap[type] as T[]);
            }
            setLoading(false);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to fetch Wix data");
            setData(mockMap[type] as T[]);
            setLoading(false);
          }
        }
        return;
      }

      // --- WooCommerce path ---
      const connected = isWooConnected();
      setIsLive(connected);

      if (!connected) {
        if (!cancelled) {
          setData([] as T[]);
          setLoading(false);
        }
        return;
      }

      try {
        const api = getWooAPI()!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let raw: any[] = [];

        if (type === "orders") {
          raw = (await api.getOrders(params)) as any[];
          raw = raw.map(normalizeOrder);
        } else if (type === "products") {
          raw = (await api.getProducts(params)) as any[];
          raw = raw.map(normalizeProduct);
        } else if (type === "customers") {
          // Fetch customers AND orders to compute real stats
          const [rawCustomers, rawOrders] = await Promise.all([
            api.getCustomers({ ...params, per_page: 100 }) as Promise<any[]>,
            api.getOrders({ per_page: 100, status: "any" }) as Promise<any[]>,
          ]);
          // Build order stats per customer email
          const orderStats: Record<string, { count: number; total: number; lastDate: string }> = {};
          for (const o of rawOrders) {
            const email = (o.billing?.email || "").toLowerCase();
            if (!email) continue;
            if (!orderStats[email]) orderStats[email] = { count: 0, total: 0, lastDate: "" };
            orderStats[email].count++;
            orderStats[email].total += parseFloat(o.total || "0");
            if (o.date_created > orderStats[email].lastDate) orderStats[email].lastDate = o.date_created;
          }
          raw = rawCustomers.map((c: any) => {
            const email = (c.email || "").toLowerCase();
            const stats = orderStats[email];
            return normalizeCustomer({
              ...c,
              orders_count: stats?.count || c.orders_count || 0,
              total_spent: stats ? String(stats.total) : c.total_spent || "0",
              _last_order_date: stats?.lastDate || null,
            });
          });
        } else if (type === "discounts") {
          raw = (await api.getCoupons(params)) as any[];
          raw = raw.map(normalizeCoupon);
        } else if (type === "reviews") {
          raw = (await api.getReviews(params)) as any[];
          raw = raw.map(normalizeReview);
        } else if (type === "categories") {
          raw = (await api.getCategories(params)) as any[];
          raw = raw.map(normalizeCategory);
        } else if (type === "shipping") {
          const zones = (await api.getShippingZones()) as any[];
          const allMethods: any[] = [];
          for (const zone of zones) {
            const methods = (await api.getShippingZoneMethods(zone.id)) as any[];
            for (const method of methods) {
              allMethods.push(normalizeShippingMethod(zone, method));
            }
          }
          raw = allMethods;
        }

        if (!cancelled) {
          setData(raw as T[]);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setData([] as T[]);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [type, tick, JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    isLive,
    refresh: () => setTick((t) => t + 1),
  };
}
