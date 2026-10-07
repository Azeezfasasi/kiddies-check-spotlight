import { ImageResponse } from "next/og";
import { SpotlightMark } from "@/components/brand/SpotlightMark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<SpotlightMark size={64} padding={0.06} />, size);
}
