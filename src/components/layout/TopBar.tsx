"use client";

import Image from "next/image";
import Link from "next/link";
import type { Breadcrumb, Period, PeriodType, SearchResult } from "@/lib/api/types";
import { SearchBox } from "./SearchBox";
import { ChevronLeft, ChevronRight, InfoIcon, LogoutIcon, MenuIcon } from "@/components/ui/icons";

interface Props {
  breadcrumbs: Breadcrumb[] | undefined;
  crumbHref(crumb: Breadcrumb): string;
  searchHref(result: SearchResult): string;
  period: Period | undefined;
  periodType: PeriodType;
  onPeriodType(type: PeriodType): void;
  onDate(date: string): void;
  onOpenKpis(): void;
  onOpenInfo(): void;
  onLogout(): void;
  refreshing: boolean;
}

const TYPES: { key: PeriodType; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "term", label: "Term" },
];

export function TopBar(props: Props) {
  const { breadcrumbs, period } = props;
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 px-3 pt-3 sm:px-5">
      <button onClick={props.onOpenKpis} aria-label="Open KPIs" className="rounded p-2 hover:bg-surface lg:hidden">
        <MenuIcon size={24} />
      </button>

      <Link href="/" aria-label="Kiddies Check Spotlight home" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-brand">
        <Image src="/kiddieschecklogo.png" alt="Kiddies Check" width={614} height={245} priority className="h-9 w-auto sm:h-11" />
      </Link>

      {/* Below lg the info and sign-out buttons share the logo's row */}
      <div className="ml-auto flex items-center lg:hidden">
        <button onClick={props.onOpenInfo} aria-label="Open info" className="rounded p-2 hover:bg-surface">
          <InfoIcon size={22} />
        </button>
        <button onClick={props.onLogout} aria-label="Sign out" title="Sign out" className="rounded p-2 text-muted hover:bg-surface hover:text-ink">
          <LogoutIcon size={20} />
        </button>
      </div>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 basis-60">
        <ol className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-surface px-4 py-2.5 text-sm shadow-sm">
          {breadcrumbs?.map((crumb, i) => {
            const last = i === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.level}-${crumb.id}`} className="flex shrink-0 items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="text-muted" />}
                {last ? (
                  <span aria-current="page" className="max-w-56 truncate font-medium">{crumb.name}</span>
                ) : (
                  <Link href={props.crumbHref(crumb)} className="max-w-40 truncate text-brand hover:underline">
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          }) ?? <li className="h-5 w-48 animate-pulse rounded bg-line" />}
        </ol>
      </nav>

      <SearchBox hrefFor={props.searchHref} />

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Period" className="flex overflow-hidden rounded-md border border-line bg-surface">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => props.onPeriodType(t.key)}
              aria-pressed={props.periodType === t.key}
              className={`w-16 py-1.5 text-sm sm:w-24 ${props.periodType === t.key ? "bg-brand text-white" : "hover:bg-canvas"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-sm text-muted">
          <button
            onClick={() => period?.prevDate && props.onDate(period.prevDate)}
            disabled={!period?.prevDate}
            aria-label="Previous period"
            className="rounded p-1.5 hover:bg-surface disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-44 text-center" aria-live="polite">
            {period?.label ?? "…"}
            {props.refreshing && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-brand align-middle" title="Updating" />}
          </span>
          <button
            onClick={() => period?.nextDate && props.onDate(period.nextDate)}
            disabled={!period?.nextDate}
            aria-label="Next period"
            className="rounded p-1.5 hover:bg-surface disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button onClick={props.onLogout} aria-label="Sign out" title="Sign out" className="hidden rounded p-2 text-muted hover:bg-surface hover:text-ink lg:block">
          <LogoutIcon size={20} />
        </button>
      </div>
    </header>
  );
}
