"use client";

import Link from "next/link";
import type { SpotlightView, ViewRow } from "@/lib/api/types";
import {
  ArmsIcon, ChevronRight, InfoIcon, MapPinIcon, PersonIcon, PupilsIcon, RatioIcon, SchoolIcon, TeacherIcon, TeamIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/states";
import { Collapsible } from "./Collapsible";

interface Props {
  view: SpotlightView | undefined;
  hrefFor(row: ViewRow): string | null;
}

const LIST_LIMIT = 30;
const fmt = (n: number | null | undefined) => (n === null || n === undefined ? null : n.toLocaleString("en-US"));
const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-break-word">{value}</dd>
    </div>
  );
}

function RowList({ rows, hrefFor }: { rows: ViewRow[]; hrefFor: Props["hrefFor"] }) {
  if (rows.length === 0) return <p className="text-muted">None recorded.</p>;
  return (
    <ul className="-mx-2 flex flex-col">
      {rows.slice(0, LIST_LIMIT).map((r) => {
        const href = hrefFor(r);
        const label = (
          <>
            <span className="min-w-0 flex-1 truncate">{r.name}</span>
            {href && <ChevronRight size={14} className="text-muted" />}
          </>
        );
        return (
          <li key={r.id}>
            {href ? (
              <Link href={href} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-canvas">
                {label}
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-2 py-1.5">{label}</span>
            )}
          </li>
        );
      })}
      {rows.length > LIST_LIMIT && <li className="px-2 py-1.5 text-muted">+ {rows.length - LIST_LIMIT} more in the main list</li>}
    </ul>
  );
}

export function InfoPanel({ view, hrefFor }: Props) {
  if (!view) {
    return (
      <div className="flex flex-col items-center gap-4 p-5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  const { entity, counts, rows, team } = view;
  const HeaderIcon = entity.kind === "school" ? SchoolIcon : entity.kind === "arm" ? ArmsIcon : PersonIcon;
  const mapQuery = entity.kind === "school" ? [entity.name, entity.location].filter(Boolean).join(", ") : null;

  return (
    <aside aria-label="Info" className="flex flex-col gap-4 p-5">
      <h2 className="flex items-center justify-center gap-2 text-lg font-semibold">
        <InfoIcon size={18} className="text-brand" /> Info
      </h2>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
          <HeaderIcon size={32} />
        </span>
        <p className="text-xl leading-tight font-bold">{entity.name}</p>
        <p className="text-xs tracking-wide text-muted uppercase">{entity.role}</p>
      </div>

      {entity.headTeacher && (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-white">
            <PersonIcon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{entity.headTeacher.name ?? "Unnamed"}</span>
            <span className="block text-xs text-muted">{entity.headTeacher.label ?? "Head Teacher"}</span>
          </span>
        </div>
      )}

      <Collapsible icon={<InfoIcon size={18} />} title="Information" defaultOpen>
        <dl>
          <Field label="Email" value={entity.email} />
          <Field label="Phone" value={entity.phone} />
          <Field label="Location" value={entity.location} />
          <Field label="Member since" value={date(entity.memberSince)} />
          {entity.kind === "school" && entity.headTeacher?.email && <Field label="Head teacher email" value={entity.headTeacher.email} />}
        </dl>
        {mapQuery && entity.location && (
          <div className="mt-2 flex flex-col gap-2">
            <iframe
              title={`Map of ${entity.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
              className="h-44 w-full rounded-lg border border-line"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <MapPinIcon size={16} /> Open in Google Maps
            </a>
          </div>
        )}
      </Collapsible>

      <Collapsible icon={<TeamIcon size={18} />} title="Team" count={team.length}>
        <RowList rows={team} hrefFor={hrefFor} />
      </Collapsible>

      {counts.schools !== null && (
        <Collapsible icon={<SchoolIcon size={18} />} title="Schools" count={fmt(counts.schools)}>
          <RowList rows={rows.kind === "school" ? rows.items : []} hrefFor={hrefFor} />
        </Collapsible>
      )}
      {counts.teachers !== null && <Collapsible icon={<TeacherIcon size={18} />} title="Teachers" count={fmt(counts.teachers)} />}
      {counts.arms !== null && (
        <Collapsible icon={<ArmsIcon size={18} />} title="Arms" count={fmt(counts.arms)}>
          {rows.kind === "arm" ? <RowList rows={rows.items} hrefFor={hrefFor} /> : undefined}
        </Collapsible>
      )}
      {counts.pupils !== null && (
        <Collapsible icon={<PupilsIcon size={18} />} title="Pupils" count={fmt(counts.pupils)}>
          {rows.kind === "pupil" ? <RowList rows={rows.items} hrefFor={hrefFor} /> : undefined}
        </Collapsible>
      )}
      {counts.ptr !== null && (
        <Collapsible icon={<RatioIcon size={18} />} title="Active PTR" count={counts.ptr}>
          <p className="text-muted">
            Active pupils per active teacher: {fmt(counts.pupils)} pupils ÷ {fmt(counts.teachers)} teachers.
          </p>
        </Collapsible>
      )}
    </aside>
  );
}
