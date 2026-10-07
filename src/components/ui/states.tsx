import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { OfflineIcon, RefreshIcon } from "./icons";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const offline = error instanceof ApiError && error.isOffline;
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {offline && <OfflineIcon size={32} className="text-muted" />}
      <p className="font-medium">{offline ? "You're offline" : "Couldn't load this view"}</p>
      <p className="max-w-sm text-sm text-muted">
        {offline ? "Views you opened recently are still available. Reconnect to load new data." : message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-canvas"
        >
          <RefreshIcon size={16} /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-6 py-10 text-center text-sm text-muted">{children}</p>;
}
