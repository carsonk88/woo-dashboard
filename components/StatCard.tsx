import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  valueColor?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  valueColor,
  className = "",
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </span>
        {icon && (
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{
              backgroundColor: "var(--hover-faint)",
              color: "var(--text-muted)",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div
        className="text-2xl font-semibold font-mono tabular-nums mb-1"
        style={{ color: valueColor || "var(--text-primary)" }}
      >
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium`}
              style={{
                color: isPositive ? "var(--accent-green-bright)" : "var(--accent-red)",
              }}
            >
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
