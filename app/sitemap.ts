import type { MetadataRoute } from "next";
import { ASSETS } from "@/lib/assets";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

// No lastModified: the catalog records no per-page edit dates, and the build time would misstate them.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/compare",
    ...CATEGORIES.map((category) => `/category/${category.slug}`),
    ...ASSETS.map((asset) => `/asset/${asset.symbol}`),
  ].map((path) => ({ url: new URL(path, SITE_URL).href }));
}
