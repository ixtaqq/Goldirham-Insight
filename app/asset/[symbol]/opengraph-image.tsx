import { notFound } from "next/navigation";
import { ASSETS, getAsset } from "@/lib/assets";
import { renderAssetImage, SHARE_IMAGE_SIZE } from "@/lib/share-image";

export const alt = "Goldirham Insight research scorecard with upside, safety, and AI exposure scores";
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return ASSETS.map((asset) => ({ symbol: asset.symbol }));
}

export default async function Image({ params }: { params: Promise<{ symbol: string }> }) {
  const asset = getAsset((await params).symbol);
  if (!asset) notFound();
  return renderAssetImage(asset);
}
