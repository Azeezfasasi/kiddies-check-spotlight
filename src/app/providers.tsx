"use client";

import { useEffect, type ReactNode } from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/lib/auth";
import { persistentCache, swrConfig } from "@/lib/api/hooks";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((error) => console.warn("Service worker registration failed", error));
    }
  }, []);

  return (
    <SWRConfig value={{ ...swrConfig, provider: typeof window === "undefined" ? undefined : persistentCache }}>
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  );
}
