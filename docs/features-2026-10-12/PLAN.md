# Showcase features, 12 October 2026

Three features ship in order, each as its own commit, push, and Vercel deploy.
Every push and deploy waits for a separate approval. The 9 October review's
proposals and roadmap remain in [the project review](../review-2026-10-09/REVIEW.md).

## Constraints

- Audience: people skimming the live site and engineers reading the repo, equally.
- Client-side and URL state only. No backend, database, login, or added monthly cost.
- No new runtime dependencies. `next/og` ships with Next and is allowed.
- No feature may depend on reviewed research. All catalog entries remain unreviewed.
- Each feature meets the `/compare` bar: unit tests, production smoke, Chromium
  checks at 320, 768, 1001, and 1440px, and a design note in `docs/`.

Deferred: local watchlist, data-quality panel, research revisions, alerts, and
portfolio scenarios. The watchlist is the least distinctive and adds storage
failure modes. The data-quality panel is the largest, and every quote already
identifies its source.

## 1. Shareable research views

The explorer in `components/AssetExplorer.tsx` keeps its search, category, and
ranking in local React state. Links and Back therefore lose context.

- Read state with `useSearchParams`. The homepage stays static. Per the installed
  `use-search-params.md`, a static page must wrap the hook in `Suspense`; the
  fallback renders the explorer with default state so the HTML still lists cards.
- Parameters are `q`, `category`, and `rank`. Defaults are omitted, so `/` stays
  clean. "Show all" is display state and stays out of the URL.
- Search typing replaces the history entry after a debounce. Category and ranking
  changes push an entry. A link carrying state scrolls to `#markets`.
- A pure `lib/explorer.ts` parses and serializes the query, mirroring
  `lib/compare.ts`. Invalid values are dropped with a visible notice.

Success: reload, a shared link, and Back reproduce the same results.

## 2. Custom score weighting

`FILTERS` mixes three rankings with two filters in one exclusive control, so
crypto cannot be ranked by safety.

- Split the control. Ranking becomes one group; Tier 1 and Crypto become chips
  that combine with any ranking.
- One function ranks by normalized weights. Presets are weight settings: Top
  upside is 1-0-0, Safest 0-1-0, Top AI exposure 0-0-1. "Custom" reveals three
  0–5 integer sliders, stored as `w=3-1-2`.
- Cards show the composite beside the existing review status. The control states
  that scores are editorial and unreviewed, and that the ranking is a lens, not a
  recommendation.

Success: every preset reproduces today's single-factor order, custom weights
survive reload and sharing, and filters combine with any ranking.

## 3. Share previews

No route defines Open Graph images, and `app/layout.tsx` sets no `metadataBase`.

- Set `metadataBase` to `https://goldirham-insight.vercel.app`, using `VERCEL_URL`
  on preview deployments. Fix the README live-site link's trailing `//`.
- Add a site-wide default image and per-asset images generated at build.
- `opengraph-image` receives route params but not search params. Comparison
  previews therefore use a route handler that reuses `resolveComparison`, linked
  from `generateMetadata` on `/compare`.
- Images show name, ticker, logo, the three scores, and review status. They never
  show prices: a cached image cannot state whether a quote is live or simulated.

Success: the default, an asset, and a three-asset comparison each produce a valid
image whose absolute URL appears in the page metadata.

## Verification per feature

Run with Node 22 from this checkout: typecheck, lint, `npm.cmd test`,
`npm.cmd run build`, `npm.cmd run test:smoke`, and `npm.cmd run test:browser`.
Exercise the changed page in a browser before reporting completion. Record results
and remaining limits in that feature's design note.
