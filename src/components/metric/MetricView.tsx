import { KPI_BY_KEY, statusOf } from "@/lib/kpis";
import type { KpiKey, KpiValue, Period } from "@/lib/api/types";
import { TrendDown, TrendUp } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/states";
import { RadialGauge } from "./RadialGauge";
import { BarChart } from "./BarChart";

interface Props {
  kpi: KpiKey;
  value: KpiValue | undefined;
  period: Period | undefined;
  /** Called with the date to open when a bar is clicked. */
  onDrill(date: string, period: "day" | "week"): void;
}

function Trend({ value, previous, label }: { value: number | null; previous: number | null; label: string }) {
  if (value === null || previous === null) return <p className="text-xs text-muted">No comparison data {label}</p>;
  const diff = Math.round(value - previous);
  const Icon = diff > 0 ? TrendUp : TrendDown;
  return (
    <p className={`flex items-center gap-1 text-xs ${diff > 0 ? "text-good" : diff < 0 ? "text-bad" : "text-muted"}`}>
      {diff === 0 ? <span aria-hidden>=</span> : <Icon size={14} />}
      <span>
        {diff > 0 ? "+" : diff < 0 ? "−" : ""}
        {Math.abs(diff)} {label}
      </span>
    </p>
  );
}

export function MetricView({ kpi, value, period, onDrill }: Props) {
  const def = KPI_BY_KEY[kpi];
  if (!value || !period) {
    return (
      <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:justify-around">
        <Skeleton className="h-28 w-64" />
        <Skeleton className="h-36 w-full max-w-md" />
      </div>
    );
  }

  const status = statusOf(kpi, value.value);
  const bars = value.series.map((b, i) => ({
    key: b.key,
    label: b.label,
    value: b.value,
    status: statusOf(kpi, b.value),
    highlighted: period.type === "day" ? period.series[i]?.days.includes(period.date) ?? false : false,
  }));

  const drill = (key: string) => {
    const bucket = period.series.find((b) => b.key === key);
    const day = bucket?.days[0];
    if (day) onDrill(day, period.type === "term" ? "week" : "day");
  };

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6 lg:flex-row lg:justify-around">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <RadialGauge value={value.value} status={status} />
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold" title={def.description}>
              {def.label}
            </h2>
            {period.comparison ? (
              <Trend value={value.value} previous={value.previous} label={period.comparison.label} />
            ) : (
              <p className="text-xs text-muted">No earlier period to compare</p>
            )}
          </div>
        </div>
        {value.detail.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2">
            {value.detail.map((d) => (
              <li key={d.label} className="flex items-baseline gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 shadow-sm">
                <span className="text-sm font-semibold">{d.value}</span>
                <span className="text-xs text-muted">{d.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {bars.length > 0 && (
        <BarChart bars={bars} axisLabel={period.type === "term" ? "Week" : "Day"} onSelect={drill} />
      )}
    </div>
  );
}
