"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/api/hooks";
import type { SearchResult, SearchResultType } from "@/lib/api/types";
import { ArmsIcon, CloseIcon, PersonIcon, PupilsIcon, SchoolIcon, SearchIcon, TeacherIcon } from "@/components/ui/icons";

const GROUPS: { type: SearchResultType; label: string; Icon: typeof SchoolIcon }[] = [
  { type: "school", label: "Schools", Icon: SchoolIcon },
  { type: "leader", label: "School leaders", Icon: PersonIcon },
  { type: "arm", label: "Classes", Icon: ArmsIcon },
  { type: "teacher", label: "Teachers", Icon: TeacherIcon },
  { type: "pupil", label: "Pupils", Icon: PupilsIcon },
];

/**
 * Search across everything in the user's scope. Opens with Ctrl/⌘+K or "/",
 * arrow keys move through results, Enter opens one, Escape closes.
 */
export function SearchBox({ hrefFor }: { hrefFor(result: SearchResult): string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Wait for a pause in typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), 250);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, error, isLoading } = useSearch(query);
  const trimmed = text.trim();
  const results = useMemo(() => (trimmed.length >= 2 ? data?.results ?? [] : []), [data, trimmed]);
  // Group in a fixed order; keyboard order follows the same order
  const grouped = GROUPS.map((g) => ({ ...g, items: results.filter((r) => r.type === g.type) })).filter((g) => g.items.length);
  const ordered = grouped.flatMap((g) => g.items);

  useEffect(() => setActive(0), [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const choose = (result: SearchResult) => {
    setOpen(false);
    setText("");
    setQuery("");
    inputRef.current?.blur();
    router.push(hrefFor(result));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (ordered.length) setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + ordered.length) % ordered.length);
    } else if (e.key === "Enter" && ordered[active]) {
      e.preventDefault();
      choose(ordered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && trimmed.length > 0;
  const searching = trimmed.length >= 2 && (isLoading || text !== query);

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1 basis-full sm:basis-64 lg:max-w-md">
      <div className="flex h-11 items-center gap-2 rounded-full bg-surface px-4 shadow-sm focus-within:ring-2 focus-within:ring-brand/30">
        <SearchIcon size={18} className="shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={showPanel && ordered[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label="Search schools, leaders, classes, teachers and pupils"
          placeholder="Search schools, leaders, classes, pupils…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {text ? (
          <button
            onClick={() => {
              setText("");
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded p-1 text-muted hover:text-ink"
          >
            <CloseIcon size={16} />
          </button>
        ) : (
          <kbd className="hidden rounded border border-line px-1.5 text-[11px] text-muted sm:block">Ctrl K</kbd>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="scroll-thin absolute inset-x-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface py-2 shadow-lg"
        >
          {trimmed.length < 2 ? (
            <p className="px-4 py-3 text-sm text-muted">Type at least 2 characters.</p>
          ) : error ? (
            <p className="px-4 py-3 text-sm text-bad">Search failed: {error.message}</p>
          ) : ordered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{searching ? "Searching…" : `No matches for “${trimmed}”.`}</p>
          ) : (
            grouped.map(({ type, label, Icon, items }) => (
              <div key={type} role="group" aria-label={label}>
                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</p>
                {items.map((result) => {
                  const index = ordered.indexOf(result);
                  return (
                    <div
                      key={`${type}-${result.id}`}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === active}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(result)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${index === active ? "bg-brand-soft" : ""}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/70 text-white">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{result.name}</span>
                        {result.subtitle && <span className="block truncate text-xs text-muted">{result.subtitle}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          {searching && ordered.length > 0 && <p className="px-4 pt-1 text-xs text-muted">Updating…</p>}
        </div>
      )}
    </div>
  );
}
