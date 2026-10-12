import { resolveComparison } from "@/lib/compare";
import { renderComparisonImage } from "@/lib/share-image";

export async function GET(request: Request) {
  const { assets } = resolveComparison(new URL(request.url).searchParams.getAll("symbols"));
  if (!assets.length) return new Response("No comparison assets", { status: 404 });
  return renderComparisonImage(assets);
}
