/**
 * The Spotlight mark: a radial gauge on the brand blue. Written with inline
 * styles only, because next/og renders it to PNG for the app icons.
 */
export function SpotlightMark({ size, padding }: { size: number; padding: number }) {
  const inner = size * (1 - padding * 2);
  const stroke = inner * 0.14;
  const r = (inner - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#3f78ad" }}>
      <svg width={inner} height={inner} viewBox={`0 0 ${inner} ${inner}`}>
        <circle cx={inner / 2} cy={inner / 2} r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={stroke} />
        <circle
          cx={inner / 2}
          cy={inner / 2}
          r={r}
          fill="none"
          stroke="#ffffff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.68} ${c}`}
          transform={`rotate(-90 ${inner / 2} ${inner / 2})`}
        />
        <circle cx={inner / 2} cy={inner / 2} r={inner * 0.12} fill="#ffffff" />
      </svg>
    </div>
  );
}
