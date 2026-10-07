"use client";

import useSWR, { preload, type Cache, type SWRConfiguration } from "swr";
import { getData } from "./client";
import type { Level, MeResponse, PeriodType, SearchResponse, SpotlightView } from "./types";

export interface ViewParams {
  level: Level;
  id: string | null;
  period: PeriodType;
  date: string | null;
}

export const viewPath = ({ level, id, period, date }: ViewParams) => {
  const q = new URLSearchParams({ level, period });
  if (id) q.set("id", id);
  if (date) q.set("date", date);
  return `/spotlight/view?${q}`;
};

const fetcher = <T,>(path: string) => getData<T>(path);

export const swrConfig: SWRConfiguration = {
  fetcher,
  // Keep showing the last view while the next level or period loads
  keepPreviousData: true,
  dedupingInterval: 30_000,
  revalidateOnFocus: true,
  shouldRetryOnError: (error) => !(error?.status >= 400 && error?.status < 500),
  errorRetryCount: 2,
};

export function useMe() {
  return useSWR<MeResponse>("/spotlight/me", fetcher, { revalidateOnFocus: false });
}

export function useView(params: ViewParams | null) {
  return useSWR<SpotlightView>(params ? viewPath(params) : null, fetcher);
}

/** Warm the cache for a view the user is likely to open next (hovering a row). */
export const prefetchView = (params: ViewParams) => {
  preload(viewPath(params), fetcher).catch(() => {});
};

// ---------------------------------------------------------------------------
// Persisted cache: the most recently viewed data survives reloads and offline use.

const CACHE_KEY = "spotlight.cache";
const MAX_ENTRIES = 40;

export function persistentCache(): Cache {
  let entries: [string, unknown][] = [];
  try {
    entries = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  } catch {
    entries = [];
  }
  const map = new Map<string, unknown>(entries);

  const save = () => {
    try {
      // Only settled data is worth keeping; newest entries last
      const keep = [...map.entries()]
        .filter(([key, state]) => !key.startsWith("/spotlight/search") && (state as { data?: unknown })?.data !== undefined)
        .slice(-MAX_ENTRIES)
        .map(([key, state]) => [key, { data: (state as { data: unknown }).data }]);
      localStorage.setItem(CACHE_KEY, JSON.stringify(keep));
    } catch {
      // Storage full or blocked: the in-memory cache still works
    }
  };
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && save());

  return map as unknown as Cache;
}

export const clearPersistedCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
};

/** Search across schools, leaders, teachers, arms and pupils in the user's scope. */
export function useSearch(query: string) {
  const q = query.trim();
  return useSWR<SearchResponse>(q.length >= 2 ? `/spotlight/search?q=${encodeURIComponent(q)}` : null, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  });
}
