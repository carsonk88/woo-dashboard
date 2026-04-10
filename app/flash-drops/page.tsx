"use client";

import { useState, useEffect } from "react";
import { Plus, Zap, Clock, Tag, Package, X } from "lucide-react";

interface FlashDrop {
  id: number;
  name: string;
  product: string;
  originalPrice: number;
  salePrice: number;
  discount: string;
  startTime: string;
  endTime: string;
  stock: number;
  sold: number;
  status: "active" | "scheduled" | "ended";
}

const now = Date.now();

const initialDrops: FlashDrop[] = [
  {
    id: 1,
    name: "Weekend Research Sale",
    product: "BPC-157 5mg Vial",
    originalPrice: 74.99,
    salePrice: 49.99,
    discount: "33%",
    startTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(now + 4 * 60 * 60 * 1000 + 23 * 60 * 1000).toISOString(),
    stock: 30,
    sold: 18,
    status: "active",
  },
  {
    id: 2,
    name: "GH Stack Bundle Drop",
    product: "Ipamorelin 5mg + CJC-1295 2mg",
    originalPrice: 139.99,
    salePrice: 89.99,
    discount: "36%",
    startTime: new Date(now - 30 * 60 * 1000).toISOString(),
    endTime: new Date(now + 1 * 60 * 60 * 1000 + 47 * 60 * 1000).toISOString(),
    stock: 15,
    sold: 12,
    status: "active",
  },
  {
    id: 3,
    name: "Sema Flash",
    product: "Semaglutide 5mg Vial",
    originalPrice: 129.99,
    salePrice: 94.99,
    discount: "27%",
    startTime: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(now + 30 * 60 * 60 * 1000).toISOString(),
    stock: 20,
    sold: 0,
    status: "scheduled",
  },
  {
    id: 4,
    name: "Recovery Bundle",
    product: "TB-500 2mg x3 Pack",
    originalPrice: 189.99,
    salePrice: 139.99,
    discount: "26%",
    startTime: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    stock: 25,
    sold: 25,
    status: "ended",
  },
];

function useCountdown(endTime: string) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, new Date(endTime).getTime() - Date.now());
    setRemaining(calc());
    const interval = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const h = Math.floor(remaining / (1000 * 60 * 60));
  const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((remaining % (1000 * 60)) / 1000);
  return { h, m, s, done: remaining === 0 };
}

function CountdownTimer({ endTime, urgent }: { endTime: string; urgent?: boolean }) {
  const { h, m, s, done } = useCountdown(endTime);
  if (done) return <span className="text-xs font-mono" style={{ color: "var(--text-subtle)" }}>Ended</span>;
  return (
    <div className="flex items-center gap-1">
      {[
        { v: h, label: "h" },
        { v: m, label: "m" },
        { v: s, label: "s" },
      ].map(({ v, label }) => (
        <span
          key={label}
          className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: urgent && h === 0 ? "rgba(220,38,38,0.12)" : "var(--bg-elevated)",
            color: urgent && h === 0 ? "var(--accent-red)" : "var(--text-primary)",
            border: `1px solid ${urgent && h === 0 ? "rgba(220,38,38,0.2)" : "var(--border)"}`,
            minWidth: "28px",
            textAlign: "center",
          }}
        >
          {String(v).padStart(2, "0")}{label}
        </span>
      ))}
    </div>
  );
}

function StockBar({ sold, stock }: { sold: number; stock: number }) {
  const pct = stock > 0 ? (sold / stock) * 100 : 0;
  const color = pct >= 80 ? "var(--accent-red)" : pct >= 50 ? "#facc15" : "var(--accent-green-bright)";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
          {sold}/{stock} sold
        </span>
        <span className="text-[10px] font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: FlashDrop["status"] }) {
  const map = {
    active: { label: "Live", bgVar: "var(--badge-completed-bg)", colorVar: "var(--badge-completed-color)", borderVar: "var(--badge-completed-border)" },
    scheduled: { label: "Scheduled", bgVar: "var(--badge-shipped-bg)", colorVar: "var(--badge-shipped-color)", borderVar: "var(--badge-shipped-border)" },
    ended: { label: "Ended", bgVar: "var(--badge-cancelled-bg)", colorVar: "var(--badge-cancelled-color)", borderVar: "var(--badge-cancelled-border)" },
  };
  const s = map[status];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bgVar, color: s.colorVar, border: `1px solid ${s.borderVar}` }}
    >
      {s.label}
    </span>
  );
}

export default function FlashDropsPage() {
  const [drops, setDrops] = useState<FlashDrop[]>(initialDrops);
  const [showForm, setShowForm] = useState(false);

  const activeDrops = drops.filter((d) => d.status === "active");
  const scheduledDrops = drops.filter((d) => d.status === "scheduled");
  const endedDrops = drops.filter((d) => d.status === "ended");
  const totalRevenue = drops.reduce((acc, d) => acc + d.sold * d.salePrice, 0);

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Flash Drops
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Time-limited deals with live countdown timers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)"; }}
        >
          <Plus size={12} />
          New Drop
        </button>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active Drops", value: activeDrops.length, color: "var(--accent-green-bright)", icon: <Zap size={14} /> },
            { label: "Scheduled", value: scheduledDrops.length, color: "var(--badge-shipped-color)", icon: <Clock size={14} /> },
            { label: "Items Sold", value: drops.reduce((acc, d) => acc + d.sold, 0), color: "var(--text-primary)", icon: <Package size={14} /> },
            { label: "Revenue Generated", value: `$${totalRevenue.toFixed(2)}`, color: "var(--accent-green-bright)", icon: <Tag size={14} /> },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{card.icon}</span>
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Active Drops */}
        {activeDrops.length > 0 && (
          <div
            className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <span
                  className="w-2 h-2 rounded-full pulse-green flex-shrink-0"
                  style={{ backgroundColor: "var(--accent-green-bright)" }}
                />
                Active Drops
              </h2>
              <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Zap size={12} style={{ color: "var(--accent-green-bright)" }} />
                Live countdown timers
              </span>
            </div>
            <div className="space-y-3">
              {activeDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusPill status={drop.status} />
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
                          style={{
                            backgroundColor: "rgba(220,38,38,0.1)",
                            color: "var(--accent-red)",
                            border: "1px solid rgba(220,38,38,0.2)",
                          }}
                        >
                          -{drop.discount}
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {drop.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {drop.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1.5 justify-end mb-1">
                        <span className="text-lg font-bold font-mono" style={{ color: "var(--accent-green-bright)" }}>
                          ${(Number(drop.salePrice) || 0).toFixed(2)}
                        </span>
                        <span
                          className="text-xs font-mono line-through"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          ${(Number(drop.originalPrice) || 0).toFixed(2)}
                        </span>
                      </div>
                      <CountdownTimer endTime={drop.endTime} urgent />
                    </div>
                  </div>
                  <StockBar sold={drop.sold} stock={drop.stock} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Drop Form */}
        {showForm && (
          <div
            className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                New Flash Drop
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Drop Name", placeholder: "e.g. Weekend Blowout", type: "text" },
                { label: "Product", placeholder: "e.g. BPC-157 5mg Vial", type: "text" },
                { label: "Sale Price", placeholder: "$0.00", type: "text" },
                { label: "Limited Stock", placeholder: "Number of units", type: "number" },
                { label: "Start Time", placeholder: "", type: "datetime-local" },
                { label: "End Time", placeholder: "", type: "datetime-local" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newDrop: FlashDrop = {
                    id: Date.now(),
                    name: "New Flash Drop",
                    product: "BPC-157 5mg Vial",
                    originalPrice: 74.99,
                    salePrice: 49.99,
                    discount: "33%",
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    stock: 20,
                    sold: 0,
                    status: "active",
                  };
                  setDrops([...drops, newDrop]);
                  setShowForm(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
              >
                Launch Drop
              </button>
            </div>
          </div>
        )}

        {/* Scheduled Drops */}
        {scheduledDrops.length > 0 && (
          <div
            className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Scheduled Drops
            </h2>
            <div className="space-y-3">
              {scheduledDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="rounded-lg p-4 flex items-center justify-between"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusPill status={drop.status} />
                      <span
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--badge-shipped-bg)",
                          color: "var(--badge-shipped-color)",
                          border: "1px solid var(--badge-shipped-border)",
                        }}
                      >
                        -{drop.discount}
                      </span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{drop.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{drop.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-1" style={{ color: "var(--text-subtle)" }}>Starts in</p>
                    <CountdownTimer endTime={drop.startTime} />
                    <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                      ${(Number(drop.salePrice) || 0).toFixed(2)} · {drop.stock} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ended Drops */}
        {endedDrops.length > 0 && (
          <div
            className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Past Drops
            </h2>
            <div className="space-y-2">
              {endedDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", opacity: 0.7 }}
                >
                  <div className="flex items-center gap-3">
                    <StatusPill status={drop.status} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{drop.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{drop.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-semibold" style={{ color: "var(--accent-green-bright)" }}>
                      ${(drop.sold * drop.salePrice).toFixed(2)}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                      {drop.sold}/{drop.stock} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "rgba(22,163,74,0.05)",
            border: "1px solid rgba(37,99,235,0.12)",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--accent-green-bright)" }}
          >
            How Flash Drops Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Set Your Drop", desc: "Choose a product, set the discount, limit the stock, and define the time window." },
              { step: "2", title: "Notify Customers", desc: "Customers who opted in to push notifications or email will be notified automatically." },
              { step: "3", title: "Watch Sales Spike", desc: "A live countdown timer on the product page creates urgency and drives conversions." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                >
                  {item.step}
                </span>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
