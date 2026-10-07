import type { KpiKey } from "./api/types";

/**
 * KPI catalogue and targets. Targets are product decisions, not API data, so
 * they live here; change a number and every card, gauge, bar and band follows.
 */

export type Status = "good" | "warn" | "bad" | "none";

export interface KpiDefinition {
  key: KpiKey;
  group: "Teachers" | "Pupils";
  label: string;
  /** Column headings in the schools / team tables when this KPI is active. */
  columns: { key: KpiKey; label: string }[];
  /** Green at or above `meeting`, amber at or above `approaching`, red below. */
  targets: { exceeds: number; meeting: number; approaching: number };
  description: string;
}

export const KPIS: KpiDefinition[] = [
  {
    key: "assessments",
    group: "Teachers",
    label: "Assessment Records",
    columns: [{ key: "assessments", label: "Assessments" }],
    targets: { exceeds: 90, meeting: 75, approaching: 50 },
    description: "Teachers who recorded at least one assessment in the period. For an arm, pupils with at least one assessment.",
  },
  {
    key: "present",
    group: "Pupils",
    label: "Present",
    columns: [
      { key: "present", label: "Present" },
      { key: "attendanceMarked", label: "Marked" },
    ],
    targets: { exceeds: 95, meeting: 85, approaching: 70 },
    description: "Pupils marked present or late, out of attendance records taken.",
  },
  {
    key: "attendanceMarked",
    group: "Pupils",
    label: "Attendance Marked",
    columns: [
      { key: "attendanceMarked", label: "Marked" },
      { key: "present", label: "Present" },
    ],
    targets: { exceeds: 98, meeting: 90, approaching: 70 },
    description: "Attendance records taken, out of active pupils for each working day.",
  },
];

export const KPI_BY_KEY = Object.fromEntries(KPIS.map((k) => [k.key, k])) as Record<KpiKey, KpiDefinition>;
export const DEFAULT_KPI: KpiKey = "present";
export const isKpiKey = (v: unknown): v is KpiKey => typeof v === "string" && v in KPI_BY_KEY;

export function statusOf(key: KpiKey, value: number | null | undefined): Status {
  if (value === null || value === undefined) return "none";
  const t = KPI_BY_KEY[key].targets;
  if (value >= t.meeting) return "good";
  if (value >= t.approaching) return "warn";
  return "bad";
}

export const BANDS = [
  { key: "exceeds", label: "Exceeds Expectations", status: "good" as Status },
  { key: "meeting", label: "Meeting Expectations", status: "good" as Status },
  { key: "approaching", label: "Approaching Expectations", status: "warn" as Status },
  { key: "below", label: "Below Expectations", status: "bad" as Status },
  { key: "none", label: "No Data Available", status: "none" as Status },
] as const;
export type BandKey = (typeof BANDS)[number]["key"];

export function bandOf(key: KpiKey, value: number | null | undefined): BandKey {
  if (value === null || value === undefined) return "none";
  const t = KPI_BY_KEY[key].targets;
  if (value >= t.exceeds) return "exceeds";
  if (value >= t.meeting) return "meeting";
  if (value >= t.approaching) return "approaching";
  return "below";
}

/** Tailwind classes per status, for solid fills, outlines and text. */
export const STATUS_STYLES: Record<Status, { solid: string; outline: string; text: string; bar: string }> = {
  good: { solid: "bg-good text-white", outline: "border-good text-good", text: "text-good", bar: "fill-good" },
  warn: { solid: "bg-warn text-white", outline: "border-warn text-warn", text: "text-warn", bar: "fill-warn" },
  bad: { solid: "bg-bad text-white", outline: "border-bad text-bad", text: "text-bad", bar: "fill-bad" },
  none: { solid: "bg-none-fill text-muted", outline: "border-line text-muted", text: "text-muted", bar: "fill-none-fill" },
};

export const formatPct = (v: number | null | undefined) => (v === null || v === undefined ? "–" : `${Math.round(v)}%`);
