"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { prefetchView, useView } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { Breadcrumb, KpiKey, Level, PeriodType, ViewRow } from "@/lib/api/types";
import { hrefFor, query, readState, type DashState, type Tab } from "@/lib/nav";
import type { BandKey } from "@/lib/kpis";
import { TopBar } from "./layout/TopBar";
import { Drawer } from "./layout/Drawer";
import { KpiPanel } from "./kpi/KpiPanel";
import { MetricView } from "./metric/MetricView";
import { PerformanceBands } from "./table/PerformanceBands";
import { DataTable } from "./table/DataTable";
import { InfoPanel } from "./info/InfoPanel";
import { ErrorState, Skeleton } from "./ui/states";
import { OfflineIcon } from "./ui/icons";

const ROW_TITLES = { school: "Schools", arm: "Arms", pupil: "Pupils" } as const;

export function Dashboard({ level, id }: { level: Level; id: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { logout } = useAuth();
  const state = readState(params);

  const { data: view, error, isValidating, mutate } = useView({ level, id, period: state.period, date: state.date });
  // keepPreviousData can briefly show the previous level; only trust data for this level
  const current = view && view.level === level && (level === "network" || view.entity.id === id) ? view : undefined;

  const [kpiDrawer, setKpiDrawer] = useState(false);
  const [infoDrawer, setInfoDrawer] = useState(false);
  const [band, setBand] = useState<BandKey | null>(null);

  // Following a link inside a drawer should reveal the new view, not leave the drawer over it
  useEffect(() => {
    setKpiDrawer(false);
    setInfoDrawer(false);
    setBand(null);
  }, [pathname]);

  const update = useCallback(
    (overrides: Partial<DashState>, mode: "push" | "replace" = "push") => {
      const href = `${pathname}?${query(state, overrides)}`;
      if (mode === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [pathname, router, state]
  );

  const selectKpi = (kpi: KpiKey) => {
    setBand(null);
    setKpiDrawer(false);
    update({ kpi }, "replace");
  };
  // Switching Day/Week/Term keeps the date the user is looking at
  const selectPeriod = (period: PeriodType) => update({ period, date: current?.period.date ?? state.date });
  const selectDate = (date: string) => update({ date });
  const drillToDate = (date: string, period: "day" | "week") => update({ date, period });
  const selectTab = (tab: Tab) => {
    setBand(null);
    update({ tab }, "replace");
  };

  const rowHref = (row: ViewRow) => (row.href ? hrefFor(row.href.level, row.href.id, state) : null);
  const crumbHref = (c: Breadcrumb) => hrefFor(c.level, c.id, state);
  const prefetch = (row: ViewRow) =>
    row.href && prefetchView({ level: row.href.level, id: row.href.id, period: state.period, date: state.date });

  const rowsTitle = current ? ROW_TITLES[current.rows.kind] : "Schools";
  const tableRows = current ? (state.tab === "team" ? current.team : current.rows.items) : [];
  const offline = error instanceof ApiError && error.isOffline;

  if (error && !view) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-surface shadow-sm">
          <ErrorState error={error} onRetry={() => mutate()} />
        </div>
      </div>
    );
  }

  const kpiPanel = <KpiPanel kpis={current?.kpis} active={state.kpi} onSelect={selectKpi} />;
  const infoPanel = <InfoPanel view={current} hrefFor={rowHref} />;

  return (
    <div className="flex min-h-screen flex-col pb-4">
      <TopBar
        breadcrumbs={current?.breadcrumbs}
        crumbHref={crumbHref}
        period={current?.period}
        periodType={state.period}
        onPeriodType={selectPeriod}
        onDate={selectDate}
        onOpenKpis={() => setKpiDrawer(true)}
        onOpenInfo={() => setInfoDrawer(true)}
        onLogout={logout}
        refreshing={isValidating && !!current}
      />

      {error && view && (
        <p role="status" className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-warn/10 px-4 py-2 text-sm text-ink sm:mx-5">
          {offline && <OfflineIcon size={16} />}
          {offline ? "You're offline. Showing the last data loaded for this view." : `Couldn't refresh: ${error.message}`}
        </p>
      )}

      <div className="mt-4 grid flex-1 gap-4 px-3 sm:px-5 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        <div className="scroll-thin hidden self-start rounded-xl bg-surface shadow-sm lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          {kpiPanel}
        </div>

        <main className="min-w-0 overflow-hidden rounded-xl bg-surface shadow-sm">
          <MetricView kpi={state.kpi} value={current?.kpis[state.kpi]} period={current?.period} onDrill={drillToDate} />

          <div role="tablist" className="grid grid-cols-2 border-b border-line text-sm tracking-wide uppercase">
            {(["rows", "team"] as Tab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={state.tab === tab}
                onClick={() => selectTab(tab)}
                className={`py-3 ${state.tab === tab ? "border-b-2 border-brand text-brand" : "text-muted hover:text-ink"}`}
              >
                {tab === "rows" ? rowsTitle : "Team"}
              </button>
            ))}
          </div>

          {current ? (
            <div className="flex flex-col gap-4 p-3 sm:p-5 xl:flex-row xl:items-start">
              <div className="xl:w-64 xl:shrink-0">
                <PerformanceBands kpi={state.kpi} rows={tableRows} selected={band} onSelect={setBand} />
              </div>
              <DataTable
                key={`${level}-${id}-${state.tab}`}
                title={state.tab === "team" ? "Team" : rowsTitle}
                kind={state.tab === "team" ? "person" : current.rows.kind}
                kpi={state.kpi}
                rows={tableRows}
                band={band}
                hrefFor={rowHref}
                onPrefetch={prefetch}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}
        </main>

        <div className="scroll-thin hidden self-start rounded-xl bg-surface shadow-sm lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          {infoPanel}
        </div>
      </div>

      <Drawer open={kpiDrawer} side="left" label="KPIs" onClose={() => setKpiDrawer(false)}>
        {kpiPanel}
      </Drawer>
      <Drawer open={infoDrawer} side="right" label="Info" onClose={() => setInfoDrawer(false)}>
        {infoPanel}
      </Drawer>
    </div>
  );
}
