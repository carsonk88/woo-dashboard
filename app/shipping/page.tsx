"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Edit, Trash2, CheckCircle, Plus, X } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  description: string;
  badges: string[];
  isDefault: boolean;
  enabled: boolean;
}

const initialMethods: ShippingMethod[] = [
  {
    id: 1,
    name: "USPS Priority Mail",
    carrier: "USPS",
    description: "2-3 business days. Includes tracking and up to $100 insurance.",
    badges: ["2-3 Days", "Tracking", "Insurance"],
    isDefault: true,
    enabled: true,
  },
  {
    id: 2,
    name: "USPS First Class",
    carrier: "USPS",
    description: "3-5 business days for packages under 1 lb.",
    badges: ["3-5 Days", "Tracking"],
    isDefault: false,
    enabled: true,
  },
  {
    id: 3,
    name: "FedEx Ground",
    carrier: "FedEx",
    description: "5-7 business days. Reliable ground shipping.",
    badges: ["5-7 Days", "Tracking"],
    isDefault: false,
    enabled: true,
  },
  {
    id: 4,
    name: "FedEx Express 2-Day",
    carrier: "FedEx",
    description: "Guaranteed 2 business day delivery by end of day.",
    badges: ["2 Days", "Guaranteed", "Signature"],
    isDefault: false,
    enabled: true,
  },
  {
    id: 5,
    name: "Free Shipping",
    carrier: "Auto",
    description: "Free shipping on orders over $75. Uses least-cost carrier.",
    badges: ["Orders $75+", "Auto-assign"],
    isDefault: false,
    enabled: true,
  },
  {
    id: 6,
    name: "Local Pickup",
    carrier: "N/A",
    description: "Customer picks up from store location.",
    badges: ["No Cost", "Tampa & Melbourne"],
    isDefault: false,
    enabled: false,
  },
];

export default function ShippingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: liveMethods, isLive } = useWooData<any>("shipping");
  const [methods, setMethods] = useState<ShippingMethod[]>(initialMethods);

  // Populate with live data when available
  useEffect(() => {
    if (isLive && liveMethods.length > 0) {
      setMethods(liveMethods as ShippingMethod[]);
    }
  }, [isLive, liveMethods]);
  const [showModal, setShowModal] = useState(false);
  const [editMethod, setEditMethod] = useState<ShippingMethod | null>(null);
  const [form, setForm] = useState({ name: "", carrier: "", description: "", badges: "" });

  const openAdd = () => { setEditMethod(null); setForm({ name: "", carrier: "", description: "", badges: "" }); setShowModal(true); };
  const openEdit = (m: ShippingMethod) => { setEditMethod(m); setForm({ name: m.name, carrier: m.carrier, description: m.description, badges: m.badges.join(", ") }); setShowModal(true); };
  const saveMethod = () => {
    const badges = form.badges.split(",").map((b) => b.trim()).filter(Boolean);
    if (editMethod) {
      setMethods((prev) => prev.map((m) => m.id === editMethod.id ? { ...m, name: form.name, carrier: form.carrier, description: form.description, badges } : m));
    } else {
      setMethods((prev) => [...prev, { id: Date.now(), name: form.name, carrier: form.carrier, description: form.description, badges, isDefault: false, enabled: true }]);
    }
    setShowModal(false); setEditMethod(null);
  };
  const deleteMethod = (id: number) => setMethods((prev) => prev.filter((m) => m.id !== id));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...methods];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setMethods(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === methods.length - 1) return;
    const arr = [...methods];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setMethods(arr);
  };

  const setDefault = (id: number) => {
    setMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));
  };

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
            Shipping
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Manage shipping methods and zones
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
        >
          <Plus size={12} />
          Add Method
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Shipping Methods
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Drag or use arrows to reorder
            </p>
          </div>

          <div className="space-y-2">
            {methods.map((method, idx) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{
                  backgroundColor: method.isDefault ? "rgba(22,163,74,0.06)" : "var(--bg-elevated)",
                  border: method.isDefault
                    ? "1px solid rgba(37,99,235,0.25)"
                    : "1px solid var(--border)",
                  opacity: method.enabled ? 1 : 0.5,
                }}
              >
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(idx)}
                    className="p-0.5 rounded transition-colors"
                    style={{ color: idx === 0 ? "var(--text-subtle)" : "var(--text-muted)" }}
                    disabled={idx === 0}
                    onMouseEnter={(e) => {
                      if (idx !== 0) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        idx === 0 ? "var(--text-subtle)" : "var(--text-muted)";
                    }}
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    className="p-0.5 rounded transition-colors"
                    style={{
                      color: idx === methods.length - 1 ? "var(--text-subtle)" : "var(--text-muted)",
                    }}
                    disabled={idx === methods.length - 1}
                    onMouseEnter={(e) => {
                      if (idx !== methods.length - 1)
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        idx === methods.length - 1 ? "var(--text-subtle)" : "var(--text-muted)";
                    }}
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {method.name}
                    </p>
                    {method.isDefault && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: "rgba(37,99,235,0.12)",
                          color: "var(--accent-green-bright)",
                          border: "1px solid rgba(37,99,235,0.25)",
                        }}
                      >
                        <CheckCircle size={9} />
                        Default
                      </span>
                    )}
                    {!method.enabled && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--hover-subtle)",
                          color: "var(--text-subtle)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    {method.description}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: "var(--hover-subtle)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {method.carrier}
                    </span>
                    {method.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(59,130,246,0.1)",
                          color: "#93c5fd",
                          border: "1px solid rgba(59,130,246,0.2)",
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefault(method.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-green-bright)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      }}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(method)}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-btn)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                    }}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(220,38,38,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Settings */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Global Settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Free Shipping Threshold", value: "$75.00", desc: "Orders above this amount qualify for free shipping" },
              { label: "Default Weight Unit", value: "lbs", desc: "Used for shipping calculations" },
              { label: "Package Dimensions", value: "12 x 8 x 4 in", desc: "Default box dimensions" },
              { label: "Shipping Origin", value: "Tampa, FL 33601", desc: "Your warehouse location" },
            ].map((setting) => (
              <div
                key={setting.label}
                className="p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {setting.label}
                  </p>
                  <button className="text-xs" style={{ color: "var(--accent-green-bright)" }}>
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {setting.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                  {setting.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => { setShowModal(false); setEditMethod(null); }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{editMethod ? "Edit Shipping Method" : "Add Shipping Method"}</h2>
              <button onClick={() => { setShowModal(false); setEditMethod(null); }} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Method Name", key: "name", placeholder: "e.g. USPS Priority Mail" },
                { label: "Carrier", key: "carrier", placeholder: "e.g. USPS" },
                { label: "Description", key: "description", placeholder: "Brief description of this method" },
                { label: "Badges (comma-separated)", key: "badges", placeholder: "e.g. 2-3 Days, Tracking, Insurance" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowModal(false); setEditMethod(null); }} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
              <button onClick={saveMethod} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}>
                {editMethod ? "Save Changes" : "Add Method"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
