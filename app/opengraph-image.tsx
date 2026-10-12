import { ASSETS } from "@/lib/assets";
import { CATEGORIES } from "@/lib/categories";
import { renderSiteImage, SHARE_IMAGE_SIZE } from "@/lib/share-image";

export const alt = "Goldirham Insight: AI-era investment research with editorial scores";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderSiteImage(ASSETS.length, CATEGORIES.length);
}
