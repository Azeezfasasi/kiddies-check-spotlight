import { formatPct, STATUS_STYLES, type Status } from "@/lib/kpis";

/** A ring that fills clockwise from the top to `value` percent, coloured by status. */
export function RadialGauge({ value, status, size = 104 }: { value: number | null; status: Status; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = value === null ? 0 : Math.max(0, Math.min(100, value)) / 100;
  const color = STATUS_STYLES[status].text;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${formatPct(value)}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line/60" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${circumference * filled} ${circumference}`}
          className={`${color} transition-[stroke-dasharray] duration-700 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">{formatPct(value)}</span>
    </div>
  );
}
