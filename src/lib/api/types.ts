/**
 * Response types for the Kiddies Check endpoints Spotlight reads.
 * Mirrors kiddies-check/src/app/api/spotlight/* and /api/auth/login.
 */

export type KpiKey = "assessments" | "present" | "attendanceMarked";
export type Level = "network" | "school" | "arm";
export type PeriodType = "day" | "week" | "term";

export interface SpotlightUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleLabel: string;
}

export interface MeResponse {
  user: SpotlightUser;
  schoolCount: number;
  landing: { level: "network"; id: null } | { level: "school"; id: string };
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface TermInfo {
  id: string;
  session: string;
  term: "first" | "second" | "third";
  label: string;
  start: string;
  end: string;
}

export interface Period {
  type: PeriodType;
  date: string;
  start: string;
  end: string;
  days: string[];
  label: string;
  term: TermInfo | null;
  weekNumber: number | null;
  prevDate: string | null;
  nextDate: string | null;
  comparison: { label: string; days: string[] } | null;
  series: { key: string; label: string; days: string[] }[];
}

export interface KpiValue {
  value: number | null;
  previous: number | null;
  series: { key: string; label: string; value: number | null }[];
  detail: { label: string; value: string }[];
}

export interface ViewRow {
  id: string;
  name: string;
  subtitle: string | null;
  href: { level: Level; id: string } | null;
  kpis: Record<KpiKey, number | null>;
  detail?: string;
}

export interface Entity {
  kind: "person" | "school" | "arm";
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  memberSince: string | null;
  headTeacher: { id: string; name: string | null; email: string | null; label?: string } | null;
  location: string | null;
}

export interface Counts {
  schools: number | null;
  teachers: number | null;
  arms: number | null;
  pupils: number | null;
  ptr: number | null;
}

export interface Breadcrumb {
  level: Level;
  id: string | null;
  name: string;
}

export interface SpotlightView {
  level: Level;
  period: Period;
  breadcrumbs: Breadcrumb[];
  entity: Entity;
  counts: Counts;
  kpis: Record<KpiKey, KpiValue>;
  rows: { kind: "school" | "arm" | "pupil"; items: ViewRow[] };
  team: ViewRow[];
}

export type SearchResultType = "school" | "leader" | "teacher" | "arm" | "pupil";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  subtitle: string | null;
  href: { level: "school" | "arm"; id: string };
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
