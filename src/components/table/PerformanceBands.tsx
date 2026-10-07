import { BANDS, bandOf, STATUS_STYLES, type BandKey } from "@/lib/kpis";
import type { KpiKey, ViewRow } from "@/lib/api/types";

interface Props {
  kpi: KpiKey;
  rows: ViewRow[];
  selected: BandKey | null;
  onSelect(band: BandKey | null): void;
}

/** How many rows fall in each band for the active KPI. Clicking a band filters the table. */
export function PerformanceBands({ kpi, rows, selected, onSelect }: Props) {
  const counts = Object.fromEntries(BANDS.map((b) => [b.key, 0])) as Record<BandKey, number>;
  rows.forEach((r) => counts[bandOf(kpi, r.kpis[kpi])]++);
  const max = Math.max(1, ...Object.values(counts));

  return (
    <section aria-label="Performance" className="rounded-lg bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-muted">Performance</h3>
        {selected && (
          <button onClick={() => onSelect(null)} className="text-xs text-brand hover:underline">
            Clear filter
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {BANDS.filter((b) => counts[b.key] > 0 || b.key !== "exceeds").map((band) => {
          const count = counts[band.key];
          const isSelected = selected === band.key;
          return (
            <li key={band.key}>
              <button
                type="button"
                disabled={count === 0}
                onClick={() => onSelect(isSelected ? null : band.key)}
                aria-pressed={isSelected}
                className={`w-full rounded-md px-2 py-1 text-left transition hover:bg-canvas disabled:cursor-default disabled:hover:bg-transparent ${isSelected ? "bg-brand-soft" : ""}`}
              >
                <span className="block text-sm">{band.label}</span>
                <span className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-4 rounded-r-full ${STATUS_STYLES[band.status].solid.split(" ")[0]}`}
                    style={{ width: `${count === 0 ? 3 : Math.max(10, (count / max) * 100)}%`, maxWidth: "calc(100% - 3rem)" }}
                  />
                  <span className="text-sm font-medium">{count}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
