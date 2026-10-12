# Shareable research views

The homepage research desk keeps its search, theme, Tier 1 filter, and ranking
in the URL. Reload, a shared link, and browser Back restore the same results.
A link that carries a view opens at the desk.

| Parameter | Values | Default (omitted) |
| --- | --- | --- |
| `q` | Search text, at most 80 characters | Empty |
| `category` | A catalog category slug | All themes |
| `rank` | `upside`, `safety`, `ai`, `custom` | Featured order |
| `tier` | `1` | All tiers |
| `w` | Upside, safety, and AI exposure weights from 0 to 5, such as `3-1-2`; only with `rank=custom` | `3-3-3` |

Examples: `/?category=crypto&rank=safety&tier=1#markets` and
`/?rank=custom&w=1-0-2#markets`.

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
`history.pushState`, which Next.js syncs into `useSearchParams`. Choosing the
active ranking again adds no entry. Typing stays in local state and replaces the
current entry after a 250ms pause, so Back skips keystrokes. The explorer records
each URL it writes. When the URL changes to one it did not write, such as after
Back, Forward, or a link to `/`, the URL replaces the typed text. Next.js applies
history writes in a transition, so the comparison runs only when the URL itself
changes. The search box stops at the 80-character link limit.

Known limit: a card opened within 250ms of the last keystroke leaves the previous
search in that history entry. Writing the URL during unmount would overwrite the
asset page's new entry instead.

Ranking and filtering are separate controls. The former Crypto ranking button
duplicated the Crypto theme, and Tier 1 could not combine with a ranking.

## Custom blend

**Custom** ranks by a weighted average of the three editorial scores. Each preset
is a fixed weight table, so presets and blends share one ranking function, and a
blend of `0-4-0` orders assets exactly as **Safest** does. Weights must sum to more
than zero. The parser rejects `0-0-0`, and the last weighted slider cannot reach
zero. Slider changes update the URL the same way typing does.

Each card shows its blend beside the existing review status. The control states
that blends weight unreviewed editorial scores and are not recommendations.
Presets show no blend because it would repeat a score already on the card.

Invalid parameter values fall back to their defaults and show a notice until
the next change. Weights without `rank=custom` count as invalid. Unknown
parameters, such as campaign tags, are ignored.

## Anchor and layout fix

Loading `/#markets` previously stayed at the top of the page. Smooth scrolling
turned the load-time fragment scroll into an animation that hydration
interrupted. Smooth scrolling now applies under `html:focus-within`, which keeps
it for in-page link clicks in browsers that focus clicked links. Safari and macOS
Firefox jump instead. The ticker, pulse ratio, and pulse feed also grew by up to
277px when quotes arrived. Until quotes first arrive or fail, they now reserve
their loaded height, and failure messages stay on one line. Below 360px, feed
rows hide their decorative logo so each row fits on one line like its placeholder.

## Verification of shareable views (2026-10-12)

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

## Review follow-up (2026-10-12)

An independent review of the first three commits found no blocking defects.
Fixed findings: typed text surviving a link to `/`, the failed-quote layout shift,
the missing input length limit, duplicate history entries, the misnamed loading
text, and a viewport assertion that accepted a 1px overlap. The anchor test now
covers quotes arriving and failing at 320, 360, 375, and 1280px. Before the
logo change it reproduced a 138px shift at 320px and a 47px shift on failure.

## Verification of the custom blend (2026-10-12)

- `tsc`, lint, build, and smoke passed; `/` remains static.
- `npm.cmd test`: 53 passed, 0 failed. New cases cover weighted order, scale
  invariance, preset equivalence, URL round trips, and seven malformed weights.
- Browser suite: 40 passed, 0 failed. The blend test drives the sliders with the
  keyboard and checks the URL, card order, blend text, the nonzero floor,
  reload, and Back. Overflow checks cover 320 and 1440px.
