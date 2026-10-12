# Shareable research views

The homepage research desk keeps its search, theme, Tier 1 filter, and ranking
in the URL. Reload, a shared link, and browser Back restore the same results.
A link that carries a view opens at the desk.

| Parameter | Values | Default (omitted) |
| --- | --- | --- |
| `q` | Search text, at most 80 characters | Empty |
| `category` | A catalog category slug | All themes |
| `rank` | `upside`, `safety`, `ai` | Featured order |
| `tier` | `1` | All tiers |

Example: `/?category=crypto&rank=safety&tier=1#markets`.

## Design decisions

The homepage stays prerendered. `AssetExplorer` reads the URL with
`useSearchParams` inside a `Suspense` boundary, as the installed Next.js
`use-search-params.md` requires for static routes. The fallback renders the desk
in its default view, so the static HTML lists research without JavaScript. The
desk's controls already required JavaScript, so a server-rendered GET form would
have made the homepage dynamic without making the controls work without it.

`lib/explorer.ts` owns the view. `parseExplorerView` and `explorerHref` convert
between the URL and the view; `exploreAssets` filters and ranks. Rankings are a
table of score weights, so each preset ranks by the same composite function.
Ties keep the featured order.

Theme, tier, and ranking changes push a history entry with
`history.pushState`, which Next.js syncs into `useSearchParams`. Typing stays in
local state and replaces the current entry after a 250ms pause, so Back skips
keystrokes. A `popstate` listener restores typed text after Back and Forward.

Ranking and filtering are separate controls. The former Crypto ranking button
duplicated the Crypto theme, and Tier 1 could not combine with a ranking.

Invalid parameter values fall back to their defaults and show a notice until
the next change. Unknown parameters, such as campaign tags, are ignored.

## Anchor and layout fix

Loading `/#markets` previously stayed at the top of the page. Smooth scrolling
turned the load-time fragment scroll into an animation that hydration
interrupted. Smooth scrolling now applies under `html:focus-within`, which keeps
it for in-page link clicks. The ticker, pulse ratio, and pulse feed also grew by
up to 277px when quotes arrived. While quotes load, they now reserve their
loaded height.

## Verification (2026-10-12)

Commands ran with Node 22.23.3.

- `tsc --noEmit --incremental false`, `npm.cmd run lint`, and
  `npm.cmd run build` passed. The build lists `/` as static.
- `npm.cmd test`: 50 passed, 0 failed. `tests/explorer.test.cjs` covers
  filtering, tie order, combined filters, link round trips, invalid values, and
  the query length limit.
- `npm.cmd run test:smoke`: passed.
- Browser suite: 37 passed, 0 failed. It covers reload, Back and Forward,
  search history, shared links, invalid links, clearing, JavaScript disabled,
  and overflow at 320, 768, 1001, and 1440px. The anchor test held quotes and
  reproduced a 277px shift before the fix. Afterward it passed 10 repeated runs
  at 375 and 1280px.

The cached Playwright Chromium build 1248 was missing locally. The browser suite
ran against installed Google Chrome through a temporary config with
`channel: "chrome"`. The project config is unchanged; CI still uses Chromium.
