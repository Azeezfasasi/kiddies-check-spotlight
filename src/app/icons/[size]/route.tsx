import { ImageResponse } from "next/og";
import { SpotlightMark } from "@/components/brand/SpotlightMark";

// Rendered once at build time: /icons/192, /icons/512 and /icons/maskable
export const dynamic = "force-static";
export const generateStaticParams = () => [{ size: "192" }, { size: "512" }, { size: "maskable" }];

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === "192" ? 192 : 512;
  // Maskable icons get cropped to a circle by some launchers, so keep the mark in the safe zone
  return new ImageResponse(<SpotlightMark size={px} padding={size === "maskable" ? 0.2 : 0.1} />, { width: px, height: px });
}
