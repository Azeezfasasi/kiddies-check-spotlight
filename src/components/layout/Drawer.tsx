"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";

/** Slide-in panel used for the KPI and Info panels below the large breakpoint. */
export function Drawer({ open, side, label, onClose, children }: { open: boolean; side: "left" | "right"; label: string; onClose(): void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`scroll-thin absolute top-0 bottom-0 w-[86vw] max-w-sm overflow-y-auto bg-surface shadow-xl transition-transform duration-200 ${
          side === "left" ? "left-0" : "right-0"
        } ${open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"}`}
      >
        <button onClick={onClose} aria-label={`Close ${label}`} className="absolute top-3 right-3 rounded p-1.5 hover:bg-canvas">
          <CloseIcon size={20} />
        </button>
        {open && children}
      </div>
    </div>
  );
}
