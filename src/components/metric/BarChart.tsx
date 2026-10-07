import { STATUS_STYLES, formatPct, type Status } from "@/lib/kpis";

export interface Bar {
  key: string;
  label: string;
  value: number | null;
  highlighted: boolean;
  status: Status;
}

const GRID = [20, 40, 60, 80, 100];

/**
 * Percent bars for each day (or term week) of the period. The highlighted bar
 * is coloured by status; others stay neutral. Bars are buttons for drilling in.
 */
export function BarChart({ bars, axisLabel, onSelect }: { bars: Bar[]; axisLabel: string; onSelect?(key: string): void }) {
  const height = 120;
  const anyHighlight = bars.some((b) => b.highlighted);
  return (
    <figure className="w-full max-w-md">
      <div className="flex">
        <div className="relative mr-2 w-9 shrink-0 text-right text-[11px] text-muted" style={{ height }}>
          {GRID.map((g) => (
            <span key={g} className="absolute right-0 -translate-y-1/2" style={{ top: height - (g / 100) * height }}>
              {g}%
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height }}>
          {GRID.map((g) => (
            <div key={g} className="absolute inset-x-0 border-t border-line" style={{ top: height - (g / 100) * height }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around gap-1.5 px-1">
            {bars.map((bar) => {
              const pct = bar.value === null ? 0 : Math.max(2, Math.min(100, bar.value));
              const tone = bar.highlighted
                ? STATUS_STYLES[bar.status].solid.split(" ")[0]
                : anyHighlight
                  ? "bg-line"
                  : "bg-ink/60";
              return (
                <button
                  key={bar.key}
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(bar.key)}
                  title={`${bar.label}: ${formatPct(bar.value)}`}
                  aria-label={`${bar.label}: ${formatPct(bar.value)}`}
                  className="group flex h-full max-w-10 flex-1 items-end focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span
                    className={`block w-full rounded-t-sm transition-[height] duration-500 group-hover:opacity-80 ${bar.value === null ? "bg-transparent" : tone}`}
                    style={{ height: `${pct}%` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 flex text-[11px] text-muted">
        <span className="mr-2 w-9 shrink-0 text-right">{axisLabel}</span>
        <span className="flex flex-1 justify-around gap-1.5 px-1">
          {bars.map((b) => (
            <span key={b.key} className="max-w-10 flex-1 text-center">
              {b.label}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
