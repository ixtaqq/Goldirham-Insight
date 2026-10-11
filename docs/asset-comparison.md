# Asset comparison

Compare up to three catalog assets at `/compare`. The navigation and each asset
page link to this workspace. Select assets, press **Compare assets**, and share
the resulting URL. Removal, clearing, reload, and browser history preserve the
selected order. The form also works without JavaScript.

## Design decision

Two independent design reviews considered a client-side URL-driven picker and a
server-rendered GET form. The GET form was selected: 26 catalog entries fit native
select controls, existing research components render on the server, and the URL
is the only saved state. The trade-off is a navigation on submission instead of
instant updates. Reading Next.js `searchParams` makes this route dynamic.

`lib/compare.ts` resolves repeated or comma-separated `symbols` parameters against
the catalog, trims and normalizes case, removes duplicates, and caps selection at
three. Invalid or excess selections produce a visible notice. Empty selections
do not choose assets on the user's behalf.

The table reuses catalog scores, thesis, reasons, risks, and research metadata.
No reviewed attribution is created. Actual reviewed entries display their reviewer,
date, sources, and score rationales through `ResearchRecord`. Each record receives
a unique heading ID. On narrow screens only the table scrolls horizontally; row
labels stay visible.

## Verification plan

- Unit tests: normalization, ordering, limits, invalid input, URL round trips.
- Production smoke: empty and populated comparison pages render on the server.
- Browser tests: selection, removal, clearing, history, sharing, invalid URLs,
  navigation entry points, no-JavaScript operation, and responsive overflow.
- Project checks: typecheck, lint, unit tests, production build, smoke, browser suite.

## Work checkpoint

- Blocking first steps: catalog, route, component, and installed Next.js documentation
  inspected before implementation; two independent design proposals compared.
- Independent workstreams: design proposals ran in parallel. Implementation and
  browser verification stay separate so the production build represents one revision.
- Shared mutable state: selection is owned by the URL; there is no second client
  selection store. The implementation reviewer owns production edits while the lead
  runs checks and owns test corrections.
- Smallest safe decomposition: one comparison route and one query boundary, reusing
  the catalog and research record. No provider changes or new dependencies.

The initial implementation was verified locally. Commit, GitHub push, and Vercel
production deployment were subsequently authorized by the user.

## Verification results (2026-10-11)

- `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build` passed.
- `npm.cmd test`: 42 passed, 0 failed.
- `npm.cmd run test:smoke`: passed, including both comparison states.
- `npm.cmd run test:browser`: 25 passed, 0 failed. Comparison checks cover 320,
  768, 1001, and 1440px, keyboard horizontal scrolling, unique IDs, selection,
  removal, clear, reload, history, malformed URLs, and JavaScript disabled.
- Independent implementation review found no production defects. Browser checks
  subsequently caught the existing header CTA being hidden at 1001px; comparison
  now lives in the shared desktop/mobile navigation list.

Initial smoke matching was corrected for React's HTML comment separators.
The horizontal keyboard test now uses ArrowRight instead of End, which scrolls
vertically. Both initial test failures and the navigation regression passed after
these corrections. No real provider requests or reviewed catalog entries were
introduced.
