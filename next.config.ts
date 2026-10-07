import type { NextConfig } from "next";

// Spotlight has no backend of its own. Requests to /api/kc/* are proxied to the
// Kiddies Check API, so the browser stays same-origin (no CORS) and the
// service worker can cache API responses.
const KIDDIES_CHECK_URL = (process.env.KIDDIES_CHECK_URL || "https://www.kiddiescheck.org").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/kc/:path*", destination: `${KIDDIES_CHECK_URL}/api/:path*` }];
  },
  async headers() {
    return [
      {
        // The service worker must never be served stale, or updates never reach users
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
