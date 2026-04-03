"use client";
import { isWooConnected } from "@/lib/woo-api";
import { isWixConnected, getClientPlatform } from "@/lib/wix-api";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Star,
  FileText,
  Users,
  Archive,
  Gift,
  Link2,
  ShoppingBag,
  Percent,
  Truck,
  BarChart2,
  Circle,
  MessageSquare,
  Megaphone,
  Search,
  Bell,
  Zap,
  Settings,
  X,
  Sun,
  Moon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  featureKey?: string;
  wixHidden?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={15} />,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: <ShoppingCart size={15} />,
  },
  {
    label: "Products",
    href: "/products",
    icon: <Package size={15} />,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: <Tag size={15} />,
  },
  {
    label: "Reviews",
    href: "/reviews",
    icon: <Star size={15} />,
    featureKey: "reviews",
    wixHidden: true,
  },
  {
    label: "COA",
    href: "/coa",
    icon: <FileText size={15} />,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: <Users size={15} />,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Archive size={15} />,
  },
  {
    label: "Promo & Affiliates",
    href: "/promo",
    icon: <Gift size={15} />,
    featureKey: "promo",
    wixHidden: true,
  },
  {
    label: "Affiliates",
    href: "/affiliates",
    icon: <Link2 size={15} />,
    featureKey: "affiliates",
    wixHidden: true,
  },
  {
    label: "Affiliate Orders",
    href: "/affiliate-orders",
    icon: <ShoppingBag size={15} />,
    featureKey: "affiliate-orders",
    wixHidden: true,
  },
  {
    label: "Discounts",
    href: "/discounts",
    icon: <Percent size={15} />,
    featureKey: "discounts",
    wixHidden: true,
  },
  {
    label: "Abandoned Carts",
    href: "/abandoned-carts",
    icon: (
      <span className="relative inline-flex">
        <ShoppingCart size={15} />
        <X size={8} className="absolute -top-0.5 -right-1" />
      </span>
    ),
    featureKey: "abandoned-carts",
    wixHidden: true,
  },
  {
    label: "Shipping",
    href: "/shipping",
    icon: <Truck size={15} />,
    featureKey: "shipping",
    wixHidden: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart2 size={15} />,
  },
  {
    label: "Live",
    href: "/live",
    icon: (
      <span className="relative inline-flex items-center">
        <Circle size={15} className="fill-green-500 text-green-500 pulse-green" />
      </span>
    ),
  },
  {
    label: "Live Chat",
    href: "/live-chat",
    icon: <MessageSquare size={15} />,
  },
  {
    label: "Advertising",
    href: "/advertising",
    icon: <Megaphone size={15} />,
  },
  {
    label: "Leak Detector",
    href: "/leak-detector",
    icon: <Search size={15} />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell size={15} />,
  },
  {
    label: "Flash Drops",
    href: "/flash-drops",
    icon: <Zap size={15} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={15} />,
  },
];

export default function Sidebar({ isOpen, onClose, enabledFeatures }: { isOpen?: boolean; onClose?: () => void; enabledFeatures?: string[] }) {
  const pathname = usePathname();
  const [connected, setConnected] = useState(false);
  const [platform, setPlatform] = useState<"woocommerce" | "wix" | null>(null);
  const { theme, toggle } = useTheme();
  useEffect(() => {
    const p = getClientPlatform();
    setPlatform(p);
    setConnected(p === "wix" ? isWixConnected() : isWooConnected());
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const visibleItems = navItems.filter((item) => {
    if (platform === "wix" && item.wixHidden) {
      return (enabledFeatures ?? []).includes(item.featureKey!);
    }
    return true;
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-[220px] flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 pulse-green"
          style={{ backgroundColor: "var(--accent-green-bright)" }}
        />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--text-primary)", letterSpacing: "0.12em" }}
        >
          ADMIN PANEL
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 text-xs font-medium transition-all
                ${active
                  ? "text-white"
                  : "hover:text-white"
                }
              `}
              style={
                active
                  ? {
                      backgroundColor: "var(--accent-green)",
                      color: "#ffffff",
                    }
                  : {
                      color: "var(--text-muted)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--hover-subtle)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(220,38,38,0.2)",
                    color: "#f87171",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-medium mb-2 transition-all"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-btn)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
          {theme === "light" ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        <div className="text-xs mb-2 text-center" style={{ color: connected ? "var(--accent-green-bright)" : "var(--text-subtle)" }}>
          {connected
            ? `● Live Data${platform === "wix" ? " (Wix)" : ""}`
            : "○ Demo Mode"}
        </div>
        {platform !== "wix" && (
          <Link
            href="/settings"
            className="block w-full text-center text-xs py-2 px-3 rounded-md font-medium transition-all"
            style={{
              backgroundColor: "var(--badge-shipped-bg)",
              color: "var(--accent-green-bright)",
              border: "1px solid var(--badge-shipped-border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--hover-faint)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--badge-shipped-bg)";
            }}
          >
            {connected ? "WooCommerce Settings" : "Connect WooCommerce"}
          </Link>
        )}
      </div>
    </aside>
  );
}
