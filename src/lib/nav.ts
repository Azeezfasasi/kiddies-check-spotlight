import type { KpiKey, Level, PeriodType } from "./api/types";
import { DEFAULT_KPI, isKpiKey } from "./kpis";

/**
 * Dashboard state lives in the URL, so the active KPI, period and date carry
 * through every drill-down link, survive reloads and can be shared.
 */

export type Tab = "rows" | "team";

export interface DashState {
  kpi: KpiKey;
  period: PeriodType;
  date: string | null;
  tab: Tab;
}

const PERIODS: PeriodType[] = ["day", "week", "term"];

export function readState(params: URLSearchParams | { get(key: string): string | null }): DashState {
  const kpi = params.get("kpi");
  const period = params.get("period");
  const date = params.get("date");
  return {
    kpi: isKpiKey(kpi) ? kpi : DEFAULT_KPI,
    period: PERIODS.includes(period as PeriodType) ? (period as PeriodType) : "day",
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    tab: params.get("tab") === "team" ? "team" : "rows",
  };
}

export function query(state: DashState, overrides: Partial<DashState> = {}) {
  const s = { ...state, ...overrides };
  const q = new URLSearchParams({ kpi: s.kpi, period: s.period });
  if (s.date) q.set("date", s.date);
  if (s.tab === "team") q.set("tab", "team");
  return q.toString();
}

export function levelPath(level: Level, id: string | null) {
  if (level === "school") return `/schools/${id}`;
  if (level === "arm") return `/arms/${id}`;
  return "/network";
}

/** A link one level deeper keeps the KPI, period and date but starts on the main tab. */
export const hrefFor = (level: Level, id: string | null, state: DashState, overrides: Partial<DashState> = {}) =>
  `${levelPath(level, id)}?${query(state, { tab: "rows", ...overrides })}`;
