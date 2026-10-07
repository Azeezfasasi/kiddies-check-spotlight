import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kiddies Check Spotlight", template: "%s · Spotlight" },
  description: "School performance at a glance: attendance, assessments and drill-down from network to arm.",
  applicationName: "Spotlight",
  appleWebApp: { capable: true, title: "Spotlight", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#3f78ad",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
