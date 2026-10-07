/**
 * The one place Spotlight talks to Kiddies Check. Every request goes through
 * the /api/kc proxy (see next.config.ts) with the signed-in user's token.
 */

const BASE = "/api/kc";
const TOKEN_KEY = "spotlight.token";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
  get isAuth() {
    return this.status === 401;
  }
  get isOffline() {
    return this.status === 0;
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Private mode: the session lasts until the tab closes
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

/** Listeners told when the API rejects the token, so the app can sign out. */
const unauthorizedListeners = new Set<() => void>();
export const onUnauthorized = (listener: () => void) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

export async function apiRequest<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (rest.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = auth ? tokenStore.get() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { ...rest, headers, signal: rest.signal ?? AbortSignal.timeout(30_000) });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    // fetch also fails when online, e.g. the proxy target redirects to another domain (CORS)
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new ApiError(
      timedOut ? "Kiddies Check took too long to respond" : offline ? "You appear to be offline" : "Couldn't reach Kiddies Check. Please try again.",
      offline ? 0 : 503
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const message = body?.error || body?.message || `Request failed (${response.status})`;
    if (response.status === 401 && auth) unauthorizedListeners.forEach((l) => l());
    throw new ApiError(message, response.status);
  }
  return body as T;
}

/** GET helper that unwraps the `{ success, data }` envelope. */
export async function getData<T>(path: string): Promise<T> {
  const body = await apiRequest<{ data: T }>(path);
  return body.data;
}
