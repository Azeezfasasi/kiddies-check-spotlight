"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icons";

interface Props {
  icon: ReactNode;
  title: ReactNode;
  count?: number | string | null;
  defaultOpen?: boolean;
  children?: ReactNode;
}

/** A rounded card whose body opens and closes; without children it's a plain summary row. */
export function Collapsible({ icon, title, count, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const header = (
    <>
      <span className="text-brand">{icon}</span>
      {count !== undefined && count !== null && <span className="font-semibold">{count}</span>}
      <span className="flex-1 text-left">{title}</span>
    </>
  );

  if (!children) {
    return <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-4 text-sm shadow-sm">{header}</div>;
  }
  return (
    <div className="rounded-2xl border border-line bg-surface text-sm shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 hover:bg-canvas/60"
      >
        {header}
        <ChevronDown size={18} className={`text-ink/70 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={bodyId} className="border-t border-line px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
