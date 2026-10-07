import { KPIS } from "@/lib/kpis";
import type { KpiKey, KpiValue } from "@/lib/api/types";
import { ChartIcon, PupilsIcon, TeacherIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/states";
import { KpiCard } from "./KpiCard";

const GROUP_ICONS = { Teachers: TeacherIcon, Pupils: PupilsIcon };

interface Props {
  kpis: Record<KpiKey, KpiValue> | undefined;
  active: KpiKey;
  onSelect(kpi: KpiKey): void;
}

export function KpiPanel({ kpis, active, onSelect }: Props) {
  const groups = [...new Set(KPIS.map((k) => k.group))];
  return (
    <nav aria-label="KPIs" className="flex flex-col gap-6 p-5">
      <h2 className="flex items-center justify-center gap-2 text-lg font-semibold">
        <ChartIcon size={18} className="text-brand" /> KPIs
      </h2>
      {groups.map((group) => {
        const Icon = GROUP_ICONS[group];
        return (
          <section key={group} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm text-muted">
              <Icon size={16} /> {group}
            </h3>
            {KPIS.filter((k) => k.group === group).map((k) =>
              kpis ? (
                <KpiCard
                  key={k.key}
                  kpi={k.key}
                  label={k.label}
                  value={kpis[k.key].value}
                  active={k.key === active}
                  onSelect={() => onSelect(k.key)}
                />
              ) : (
                <Skeleton key={k.key} className="h-11" />
              )
            )}
          </section>
        );
      })}
    </nav>
  );
}
