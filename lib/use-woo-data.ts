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
  return {
    id: String(o.id),
    number: `#${o.number || o.id}`,
    customer: {
      name: `${firstName} ${lastName}`.trim() || "Guest",
      email: o.billing?.email || "",
    },
    total: `$${parseFloat(o.total || "0").toFixed(2)}`,
    status: o.status,
    date: new Date(o.date_created).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    items: (o.line_items || []).map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      price: `$${parseFloat(i.price || "0").toFixed(2)}`,
    })),
    shippingAddress: {
      address1: o.shipping?.address_1 || "",
      address2: o.shipping?.address_2 || "",
      city: o.shipping?.city || "",
      state: o.shipping?.state || "",
      postcode: o.shipping?.postcode || "",
    },
    tracking: o.meta_data?.find((m: any) => m.key === "_tracking_number")?.value || "",
    shippingMethod: o.shipping_lines?.[0]?.method_title || "Standard",
    shippingCost: `$${parseFloat(o.shipping_total || "0").toFixed(2)}`,
    discount: o.discount_total !== "0.00" ? `-$${parseFloat(o.discount_total).toFixed(2)}` : null,
    paymentMethod: o.payment_method_title || "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(p: any) {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    category: p.categories?.[0]?.name || "Uncategorized",
    price: parseFloat(p.price || "0"),
    sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
    status: p.status === "publish" ? "active" : "draft",
    sku: p.sku || "",
    stock: p.stock_quantity ?? 0,
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
  return {
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`.trim() || c.email,
    email: c.email,
    orders: c.orders_count || 0,
    lifetime_value: `$${parseFloat(c.total_spent || "0").toFixed(2)}`,
    avg_order:
      c.orders_count > 0
        ? `$${(parseFloat(c.total_spent || "0") / c.orders_count).toFixed(2)}`
        : "$0.00",
    last_order: c.last_order?.date_created
      ? new Date(c.last_order.date_created).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    account: c.role === "customer" ? "Registered" : "Guest",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCoupon(c: any) {
  return {
    id: String(c.id),
    code: c.code?.toUpperCase(),
    type:
      c.discount_type === "percent"
        ? "Percent Off"
        : c.discount_type === "fixed_cart"
        ? "Fixed Amount"
        : "Free Shipping",
    value: c.discount_type === "percent" ? `${c.amount}%` : `$${c.amount}`,
    uses: c.usage_count || 0,
    limit: c.usage_limit || null,
    status: c.date_expires
      ? new Date(c.date_expires) > new Date()
        ? "Active"
        : "Expired"
      : "Active",
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

type DataType = "orders" | "products" | "customers" | "discounts" | "reviews" | "categories";

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
      };

      // --- Wix path ---
      if (platform === "wix" && isWixConnected()) {
        const creds = loadWixCredentials()!;
        const wixTypes: DataType[] = ["orders", "products", "customers"];
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
          setData(mockMap[type] as T[]);
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
          raw = (await api.getCustomers(params)) as any[];
          raw = raw.map(normalizeCustomer);
        } else if (type === "discounts") {
          raw = (await api.getCoupons(params)) as any[];
          raw = raw.map(normalizeCoupon);
        } else if (type === "reviews") {
          raw = (await api.getReviews(params)) as any[];
          raw = raw.map(normalizeReview);
        } else if (type === "categories") {
          raw = (await api.getCategories(params)) as any[];
          raw = raw.map(normalizeCategory);
        }

        if (!cancelled) {
          setData(raw as T[]);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setData(mockMap[type] as T[]);
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
