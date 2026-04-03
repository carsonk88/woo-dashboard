interface WooAPIConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

interface WooAPIParams {
  per_page?: number;
  page?: number;
  status?: string;
  search?: string;
  [key: string]: string | number | undefined;
}

export class WooAPI {
  private url: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor({ url, consumerKey, consumerSecret }: WooAPIConfig) {
    this.url = url.replace(/\/$/, "");
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  private buildURL(endpoint: string, params: WooAPIParams = {}): string {
    const base = `${this.url}/wp-json/wc/v3${endpoint}`;
    const query = new URLSearchParams({
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });
    return `${base}?${query.toString()}`;
  }

  private async request<T>(endpoint: string, params: WooAPIParams = {}): Promise<T> {
    const url = this.buildURL(endpoint, params);
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`WooCommerce API Error: ${error.message || response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async getOrders(params: WooAPIParams = {}) {
    return this.request("/orders", { per_page: 20, ...params });
  }

  async getProducts(params: WooAPIParams = {}) {
    return this.request("/products", { per_page: 20, ...params });
  }

  async getCustomers(params: WooAPIParams = {}) {
    return this.request("/customers", { per_page: 20, ...params });
  }

  async getCategories(params: WooAPIParams = {}) {
    return this.request("/products/categories", { per_page: 100, ...params });
  }

  async getReviews(params: WooAPIParams = {}) {
    return this.request("/products/reviews", { per_page: 20, ...params });
  }

  async getCoupons(params: WooAPIParams = {}) {
    return this.request("/coupons", { per_page: 20, ...params });
  }

  async getShippingZones() {
    return this.request("/shipping/zones");
  }

  async getShippingZoneMethods(zoneId: number | string) {
    return this.request(`/shipping/zones/${zoneId}/methods`);
  }

  async getOrderById(id: number | string) {
    return this.request(`/orders/${id}`);
  }

  async getProductById(id: number | string) {
    return this.request(`/products/${id}`);
  }

  async getReports(type: string, params: WooAPIParams = {}) {
    return this.request(`/reports/${type}`, params);
  }
}

const STORAGE_KEY = "woo_credentials";

export interface WooCredentials {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export function saveWooCredentials(credentials: WooCredentials): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }
}

export function loadWooCredentials(): WooCredentials | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as WooCredentials;
  } catch {
    return null;
  }
}

export function clearWooCredentials(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getWooAPI(): WooAPI | null {
  const credentials = loadWooCredentials();
  if (!credentials || !credentials.url || !credentials.consumerKey || !credentials.consumerSecret) {
    return null;
  }
  return new WooAPI(credentials);
}

export function isWooConnected(): boolean {
  const credentials = loadWooCredentials();
  return !!(credentials?.url && credentials?.consumerKey && credentials?.consumerSecret);
}
