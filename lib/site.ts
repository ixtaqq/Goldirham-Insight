const PRODUCTION_URL = "https://goldirham-insight.vercel.app";

/** Absolute base for share metadata; preview deployments link to their own images. */
export const SITE_URL = new URL(
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : PRODUCTION_URL,
);
