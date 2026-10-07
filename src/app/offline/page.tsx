import Link from "next/link";
import { OfflineIcon } from "@/components/ui/icons";

export const metadata = { title: "Offline" };

/** Served by the service worker for pages that were never opened while online. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-xl bg-surface px-8 py-12 text-center shadow-sm">
        <OfflineIcon size={36} className="text-muted" />
        <h1 className="text-lg font-semibold">You&apos;re offline</h1>
        <p className="text-sm text-muted">
          This page hasn&apos;t been opened on this device yet. Views you opened recently are still available.
        </p>
        <Link href="/" className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Back to Spotlight
        </Link>
      </div>
    </main>
  );
}
