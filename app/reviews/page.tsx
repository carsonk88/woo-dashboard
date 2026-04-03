"use client";

import { useState } from "react";
import { Search, Star, CheckCircle, Trash2 } from "lucide-react";
import { useWooData } from "@/lib/use-woo-data";

type ReviewTab = "all" | "approved" | "pending" | "spam" | "trash";


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={11}
          className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [tab, setTab] = useState<ReviewTab>("all");
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews } = useWooData<any>("reviews", { per_page: 100 });

  const tabs: { key: ReviewTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending" },
    { key: "spam", label: "Spam" },
    { key: "trash", label: "Trash" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = reviews.filter((r: any) => {
    const matchTab = tab === "all" || r.status === tab;
    const matchSearch =
      !search ||
      r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

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
            Reviews
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {reviews.length} total reviews
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {tabs.map((t) => {
              const count =
                t.key === "all"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ? reviews.length
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : reviews.filter((r: any) => r.status === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={
                    tab === t.key
                      ? { backgroundColor: "var(--accent-green)", color: "#fff" }
                      : {
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className="text-[10px] px-1 py-0.5 rounded-full"
                      style={{
                        backgroundColor: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--hover-btn)",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg text-xs outline-none"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                width: "220px",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "var(--border)";
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["REVIEWER", "PRODUCT", "RATING", "REVIEW", "DATE", "STATUS", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr
                  key={review.id}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid var(--row-border)" }}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {review.reviewer}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {review.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {review.product.length > 28 ? review.product.slice(0, 28) + "…" : review.product}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-4 py-3" style={{ maxWidth: "300px" }}>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.text}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {new Date(review.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={
                        review.status === "approved"
                          ? { backgroundColor: "rgba(37,99,235,0.12)", color: "#4ade80", border: "1px solid rgba(37,99,235,0.25)" }
                          : review.status === "pending"
                          ? { backgroundColor: "rgba(202,138,4,0.15)", color: "#facc15", border: "1px solid rgba(202,138,4,0.25)" }
                          : review.status === "spam"
                          ? { backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }
                          : { backgroundColor: "var(--hover-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                      }
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {review.status === "pending" && (
                        <button
                          className="p-1.5 rounded-md transition-colors"
                          title="Approve"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(37,99,235,0.1)";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-green-bright)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                          }}
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-md transition-colors"
                        title="Trash"
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
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
