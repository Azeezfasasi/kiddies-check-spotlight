"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, onUnauthorized, tokenStore } from "./api/client";
import { clearPersistedCache } from "./api/hooks";
import type { LoginResponse } from "./api/types";

interface AuthContextValue {
  /** null until the stored token has been read on the client. */
  signedIn: boolean | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Removes everything cached for the previous user: token, data cache and service worker API cache. */
async function clearSession() {
  tokenStore.clear();
  clearPersistedCache();
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("spotlight-api")).map((n) => caches.delete(n)));
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => setSignedIn(!!tokenStore.get()), []);

  const logout = useCallback(() => {
    // Tell Kiddies Check too, so the logout appears in its activity log
    apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    clearSession().finally(() => {
      setSignedIn(false);
      // A full reload drops the in-memory data cache as well
      window.location.replace("/login");
    });
  }, []);

  // Any 401 from the API means the token expired or was revoked
  useEffect(
    () =>
      onUnauthorized(() => {
        clearSession().finally(() => {
          setSignedIn(false);
          router.replace(`/login?expired=1&next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        });
      }),
    [router]
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    if (!result.token) throw new Error(result.message || "Sign in failed");
    await clearSession();
    tokenStore.set(result.token);
    setSignedIn(true);
  }, []);

  return <AuthContext.Provider value={{ signedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
