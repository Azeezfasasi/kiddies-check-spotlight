"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KPI_BY_KEY, STATUS_STYLES, bandOf, formatPct, statusOf, type BandKey } from "@/lib/kpis";
import type { KpiKey, ViewRow } from "@/lib/api/types";
import { ArmsIcon, ArrowDown, ArrowUp, ChevronRight, CloseIcon, PersonIcon, SchoolIcon, SearchIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/states";

interface Props {
  title: string;
  kind: "school" | "arm" | "pupil" | "person";
  kpi: KpiKey;
  rows: ViewRow[];
  band: BandKey | null;
  hrefFor(row: ViewRow): string | null;
  onPrefetch?(row: ViewRow): void;
}

const PAGE = 50;

/** Searchable list sorted by the active KPI (worst first, like the reference design). */
export function DataTable({ title, kind, kpi, rows, band, hrefFor, onPrefetch }: Props) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [ascending, setAscending] = useState(true);
  const [shown, setShown] = useState(PAGE);
  const columns = KPI_BY_KEY[kpi].columns;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (!band || bandOf(kpi, r.kpis[kpi]) === band) &&
        (!q || r.name.toLowerCase().includes(q) || r.subtitle?.toLowerCase().includes(q))
    );
    // Rows with no data always sink to the bottom
    return filtered.sort((a, b) => {
      const av = a.kpis[kpi], bv = b.kpis[kpi];
      if (av === null && bv === null) return a.name.localeCompare(b.name);
      if (av === null) return 1;
      if (bv === null) return -1;
      return ascending ? av - bv : bv - av;
    });
  }, [rows, search, band, kpi, ascending]);

  const Avatar = kind === "school" ? SchoolIcon : kind === "arm" ? ArmsIcon : PersonIcon;

  return (
    <section className="min-w-0 flex-1">
      <div className="flex items-center gap-2 border-b border-line px-3 py-3">
        {searching ? (
          <label className="flex flex-1 items-center gap-2 rounded-md border border-line px-2">
            <SearchIcon size={16} className="text-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
              className="h-9 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={() => {
                setSearch("");
                setSearching(false);
              }}
              aria-label="Close search"
            >
              <CloseIcon size={16} className="text-muted" />
            </button>
          </label>
        ) : (
          <>
            <h3 className="flex-1 text-sm text-muted">
              {title} ({visible.length === rows.length ? rows.length : `${visible.length} of ${rows.length}`})
            </h3>
            <button onClick={() => setSearching(true)} aria-label={`Search ${title}`} className="rounded p-1.5 hover:bg-canvas">
              <SearchIcon size={18} className="text-muted" />
            </button>
          </>
        )}
        <div className="flex shrink-0 items-center">
          {columns.map((col, i) =>
            i === 0 ? (
              <button
                key={col.key}
                onClick={() => setAscending((a) => !a)}
                className="flex w-24 items-center justify-center gap-1 text-sm hover:text-brand"
                aria-label={`Sort by ${col.label}, ${ascending ? "lowest first" : "highest first"}`}
              >
                {ascending ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {col.label}
              </button>
            ) : (
              <span key={col.key} className="hidden w-24 text-center text-sm text-muted sm:block">
                {col.label}
              </span>
            )
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState>{rows.length === 0 ? `No ${title.toLowerCase()} yet.` : "Nothing matches this filter."}</EmptyState>
      ) : (
        <ul>
          {visible.slice(0, shown).map((row) => {
            const href = hrefFor(row);
            const content = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/70 text-white">
                  <Avatar size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{row.name}</span>
                  {(row.subtitle || row.detail) && (
                    <span className="block truncate text-xs text-muted">{[row.subtitle, row.detail].filter(Boolean).join(" · ")}</span>
                  )}
                </span>
                <ChevronRight size={16} className={`shrink-0 text-muted ${href ? "" : "invisible"}`} />
                <span className="flex shrink-0 items-center">
                  {columns.map((col, i) => {
                    const value = row.kpis[col.key];
                    const status = statusOf(col.key, value);
                    const style = STATUS_STYLES[status];
                    return (
                      <span key={col.key} className={`w-24 justify-center px-1.5 ${i === 0 ? "flex" : "hidden sm:flex"}`}>
                        <span
                          className={`flex h-9 w-full items-center justify-center rounded-md text-sm ${
                            i === 0 && status !== "none" ? style.solid : `border bg-surface ${style.outline}`
                          }`}
                        >
                          {formatPct(value)}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </>
            );
            const className = "flex items-center gap-3 border-b border-line px-3 py-3";
            return (
              <li key={row.id}>
                {href ? (
                  <Link
                    href={href}
                    onMouseEnter={() => onPrefetch?.(row)}
                    onFocus={() => onPrefetch?.(row)}
                    className={`${className} hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {visible.length > shown && (
        <button onClick={() => setShown((n) => n + PAGE)} className="w-full py-3 text-sm font-medium text-brand hover:bg-canvas">
          Show {Math.min(PAGE, visible.length - shown)} more
        </button>
      )}
    </section>
  );
}
