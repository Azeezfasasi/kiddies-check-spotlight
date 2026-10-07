import { formatPct, STATUS_STYLES, statusOf } from "@/lib/kpis";
import type { KpiKey } from "@/lib/api/types";

interface Props {
  kpi: KpiKey;
  label: string;
  value: number | null;
  active: boolean;
  onSelect(): void;
}

/** A KPI as a coloured percentage block plus its label; the active KPI fills with its status colour. */
export function KpiCard({ kpi, label, value, active, onSelect }: Props) {
  const status = statusOf(kpi, value);
  const styles = STATUS_STYLES[status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex w-full overflow-hidden rounded-md border text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active ? `${styles.solid} border-transparent` : "border-line bg-surface"
      }`}
    >
      <span className={`flex w-24 shrink-0 items-center justify-center py-2.5 text-lg font-bold ${styles.solid}`}>
        {formatPct(value)}
      </span>
      <span className={`flex items-center px-3 text-sm leading-tight ${active ? "font-semibold" : "text-ink/80"}`}>{label}</span>
    </button>
  );
}
