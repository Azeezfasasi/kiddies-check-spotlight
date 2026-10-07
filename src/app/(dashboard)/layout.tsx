"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMe } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { ErrorState, Spinner } from "@/components/ui/states";

/** Every dashboard page requires a signed-in user with Spotlight access. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { signedIn, logout } = useAuth();

  useEffect(() => {
    if (signedIn === false) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [signedIn, router]);

  if (!signedIn) return <Spinner label="Checking your session" />;
  return <AccessGate onSignOut={logout}>{children}</AccessGate>;
}

function AccessGate({ children, onSignOut }: { children: ReactNode; onSignOut(): void }) {
  const { data, error, mutate } = useMe();

  if (error && !data) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl bg-surface p-2 text-center shadow-sm">
          {forbidden ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10">
              <p className="font-medium">Spotlight isn&apos;t available for your account</p>
              <p className="text-sm text-muted">{error.message}</p>
            </div>
          ) : (
            <ErrorState error={error} onRetry={() => mutate()} />
          )}
          <button onClick={onSignOut} className="mb-6 text-sm font-medium text-brand hover:underline">
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }
  if (!data) return <Spinner label="Loading Spotlight" />;
  return <>{children}</>;
}
