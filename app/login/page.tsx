"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem("dash_auth", "true");
        sessionStorage.setItem("dash_client_name", data.name || "");
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (clientId) {
          router.push(`/c/${clientId}`);
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#050f1e" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(14,168,121,0.12)", border: "1px solid rgba(14,168,121,0.3)" }}
          >
            <Lock size={24} style={{ color: "#0ea879" }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#fff" }}>
            Dashboard Login
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Enter your password to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: "#0a1628", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(255,255,255,0.6)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                  placeholder="Enter password"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none pr-10"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-xs mt-2" style={{ color: "#f87171" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password.trim() || loading}
              className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: password.trim() ? "#0ea879" : "rgba(255,255,255,0.05)",
                color: password.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                border: password.trim() ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {loading ? "Verifying..." : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] mt-6" style={{ color: "rgba(255,255,255,0.25)" }}>
          Contact your admin if you need access
        </p>
      </div>
    </div>
  );
}
