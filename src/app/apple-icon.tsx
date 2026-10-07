import { ImageResponse } from "next/og";
import { SpotlightMark } from "@/components/brand/SpotlightMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<SpotlightMark size={180} padding={0.12} />, size);
}
