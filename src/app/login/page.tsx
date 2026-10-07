"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SpotlightMark } from "@/components/brand/SpotlightMark";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

/** Only same-site paths are allowed as a post-login destination. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, signedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Until React has hydrated, a click would do a plain form submit and just reload the page
  const [ready, setReady] = useState(false);
  const next = safeNext(params.get("next"));

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (signedIn) router.replace(next);
  }, [signedIn, next, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="overflow-hidden rounded-2xl">
            <SpotlightMark size={56} padding={0.12} />
          </span>
          <h1 className="text-xl font-bold">Kiddies Check Spotlight</h1>
          <p className="text-sm text-muted">Sign in with your Kiddies Check account</p>
        </div>

        {params.get("expired") && !error && (
          <p role="status" className="mb-4 rounded-lg bg-warn/10 px-3 py-2 text-sm">Your session ended. Please sign in again.</p>
        )}
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-line px-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            <label htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-line pr-11 pl-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !ready}
            className="h-11 rounded-lg bg-brand font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">
          Forgotten your password? Reset it on{" "}
          <a href="https://www.kiddiescheck.org/forgot-password" className="text-brand hover:underline">kiddiescheck.org</a>.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
