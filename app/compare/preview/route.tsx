import { comparisonPreviewHref, resolveComparison } from "@/lib/compare";
import { renderComparisonImage } from "@/lib/share-image";

// Review status can change without a URL change, so previews are cached briefly instead of ImageResponse's immutable year.
const CACHE_CONTROL = "public, max-age=300, s-maxage=3600";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { assets } = resolveComparison(url.searchParams.getAll("symbols"));
  if (!assets.length) return new Response("No comparison assets", { status: 404 });
  const canonical = comparisonPreviewHref(assets.map((asset) => asset.symbol));
  if (url.pathname + url.search !== canonical) return Response.redirect(new URL(canonical, url), 308);
  const image = await renderComparisonImage(assets);
  image.headers.set("Cache-Control", CACHE_CONTROL);
  return image;
}
