"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const noSidebar = pathname.startsWith("/agency") || pathname.startsWith("/c/");

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (noSidebar) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto min-h-screen lg:ml-[220px]">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{
            backgroundColor: "var(--bg-header)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
          >
            <Menu size={18} />
          </button>
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--text-primary)", letterSpacing: "0.12em" }}
          >
            ADMIN PANEL
          </span>
        </div>
        {children}
      </main>
    </>
  );
}
