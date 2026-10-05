# Tailwind 4 visual verification

Recorded 5 October 2026 against the local production server.

- `before-*`: Tailwind 3 baseline.
- `after-*`: first Tailwind 4 render, retained as evidence of the reset regression.
  Research-record padding fell from 24px to 0px because the existing unlayered
  reset overrode layered utility styles.
- `verified-*`: after moving the reference design's element reset into the base
  layer. Research-record padding is 24px again; the original font stack, heading
  sizes, border color and background are retained at 375px and 1280px CSS widths.

These are layout observations, not a pixel-difference test. Browser zoom changed
during the run, so the final viewport override was adjusted to preserve CSS widths.
Live/simulated values and chart data can change between captures. No horizontal
overflow appeared on the home, NVDA or AI Companies pages at either width.

The final browser pass also verified score gradients, chart range selection,
the mobile menu and Enter-to-open asset search. The temporary viewport override
was reset afterward.

```text
Diff:   Tailwind 4 migration, scoped Next lint glob adapter, regression tests and documentation
Build:  pass (npm.cmd run build; npm.cmd run typecheck)
Tests:  pass (npm.cmd test: 25 passed / 0 failed; npm.cmd run test:smoke: 1 passed / 0 failed)
Lint:   pass (npm.cmd run lint)
Ran:    full/production audits, fresh isolated install, directory lookup tests and browser interactions
Verdict: ready - local checks pass; verify GitHub CI for the published commit before claiming remote success
```
