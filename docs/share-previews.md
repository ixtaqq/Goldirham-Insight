# Share previews

Links to the site, an asset page, or a comparison show a generated 1200 by 630
preview image on social sites and chat apps. Images show names, tickers, logos,
the three editorial scores, and review status. They never show prices.

| Page | Image route | Generated |
| --- | --- | --- |
| Every page without its own image | `app/opengraph-image.tsx` | At build |
| `/asset/[symbol]` | `app/asset/[symbol]/opengraph-image.tsx` | At build, 26 images |
| `/compare?symbols=…` | `app/compare/preview/route.tsx` | On request |

## Design decisions

A cached image cannot say whether a quote is live or simulated, so previews
omit prices. The project requires every price to identify its source.

`opengraph-image` files receive route params but not search params. Comparison
images therefore come from a route handler that reuses `resolveComparison`.
`generateMetadata` on `/compare` links it only when the selection resolves to at
least one asset, and titles the page "NVDA vs CEG vs BTC". An empty comparison
keeps the site image. The handler returns 404 when nothing resolves and redirects
other spellings, such as `symbols=nvda,ceg`, to the canonical URL so each
selection renders once. Share titles keep the site name.

`ImageResponse` defaults to an immutable one-year cache. Review status can change
without a URL change, so comparison previews send
`public, max-age=300, s-maxage=3600`. Build-time images get a new content hash
on each deploy.

`lib/share-image.tsx` renders all three layouts with `next/og`, which ships with
Next.js, so no runtime dependency was added. Logos come from `public/logos`.
The repository's Inter font is variable, and `ImageResponse` failed on it with
`Cannot read properties of undefined (reading '256')` for every asset. Images use
the font bundled with `next/og` instead.

`metadataBase` comes from `lib/site.ts`. Production uses
`https://goldirham-insight.vercel.app`. Vercel preview deployments use their own
`VERCEL_URL`, so preview links never point at production images. The root layout
also sets `twitter:card` to `summary_large_image`.

## Verification (2026-10-12)

- `npm.cmd run build` lists `/opengraph-image` as static, 26 prerendered asset
  images, and `/compare/preview` as dynamic.
- `npm.cmd run test:smoke` checks that `/`, `/asset/NVDA`, and a three-asset
  comparison each publish an absolute `og:image` under the production URL and a
  `summary_large_image` card. Each image returns `image/png` at 1200 by 630. An
  empty comparison has no comparison image, and unknown symbols return 404. It
  also checks the comparison `og:title`, the preview cache header, and the 308
  redirect from a non-canonical query.
- The site, ICLN, and NVDA vs ICLN vs BTC images were inspected visually.

Not verified: how each social network crops or caches the images. That needs
the deployed URL and each network's preview debugger.
