# Quality checks, research provenance and market diagnostics

Implemented 5 October 2026 as the first follow-up to the project review.

## Local verification

Use Node 22 and run:

```powershell
& 'E:\workspace\Projects\Use-Node22.ps1'
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run typecheck
npm.cmd run test:smoke
```

The 25 regression tests include the original market regressions, structured-log
redaction, review rendering, timestamp display, catalog integrity and Next lint
directory matching. The smoke
test starts a local production server on an available loopback port, disables
optional provider keys, checks all 32 content pages and 26 review disclosures,
exercises five simulated chart ranges and verifies quote deduplication/404 behavior.
It stops its own process afterward. It does not render client JavaScript or replace
browser interaction checks.

No dependency was added for these checks. The existing test loader transpiles
TypeScript/TSX for Node tests; build/typecheck provide the separate type-safety check.

## CI behavior

`.github/workflows/ci.yml` runs on pushes, pull requests and manual dispatch:

- `quality`: reproducible install, lint, regression tests, production build,
  typecheck, then production HTTP smoke tests.
- `dependency-audit`: audits production and all dependencies, then saves an audit
  artifact even when npm reports vulnerabilities.

Actions are pinned to verified commit SHAs. Jobs have read-only repository
permissions, do not retain checkout credentials, and do not deploy or use provider
keys. The full audit is deliberately not suppressed or treated as success.
The dependency remediation and its maintenance requirements are explained in
[the advisory record](security/dependency-advisory.md).

The [initial GitHub run](https://github.com/ixtaqq/Goldirham-Insight/actions/runs/37301685800)
passed application quality checks and failed only the full dependency audit.
The follow-up migration passes both audits locally. Check the run for the exact
pushed commit before claiming GitHub CI passes. Branch protection is configured
separately by a maintainer.

## Recording an editorial review

The current catalog has no recorded editorial reviews. Each of its 26 asset pages
therefore displays **Not reviewed**, with an explicit explanation that reviewer,
review date and citations are missing. Existing thesis prose and scores were
preserved, not retrospectively certified.

After an actual review, add the optional `research` property to that asset in
`lib/assets.ts`. Its `ResearchReview` type requires:

- `reviewedBy`: the real person or explicitly identified reviewing process.
- `reviewedAt`: the actual review date, `YYYY-MM-DD`, never a future date.
- `sources`: at least one titled HTTPS link supporting the thesis. Prefer primary
  filings, official reports or relevant protocol documentation; generic homepages
  do not establish support for specific claims.
- `scoreRationale`: an explanation for each of `upside`, `safety` and `aiExposure`.

The research record renders these values above the thesis. External citations
open in a new tab and are labeled accordingly. React escapes text; no raw HTML
rendering is used. Catalog tests reject incomplete reviews, invalid dates,
non-HTTPS sources, unknown categories and out-of-range scores.

These checks validate structure, not the truth of financial claims or whether a
source actually supports a statement. That remains editorial work. Never insert
placeholder identities, today's date or unrelated citations just to obtain a
“Reviewed” badge.

## Quote time and stale updates

Asset pages now show a machine-readable `<time>` and a visible UTC timestamp:

- Market quotes: **Quote observed**, using the provider's observation time.
- Simulated prices: **Simulation generated**, with an explicit illustration notice.
- Invalid or missing timestamps cannot crash the display; invalid incoming quote
  batches are rejected by the client and the existing retry/stale behavior applies.

Reading a cached response does not advance its observation time. The API response
`ts` remains the response time, which is different. No arbitrary stale threshold
or market-open claim is inferred from elapsed time: overnight/weekend observations
can be legitimate. Failed polling continues to label retained quotes as updates
unavailable. Existing cards and the ticker retain their source/stale labels; the
detailed timestamp appears on the asset page.

## Provider-failure logs

Market adapters emit one JSON warning for a failed cache miss, or one warning
with a rejected-record count for a partially invalid crypto batch. Cache hits and
callers sharing the same pending request do not generate duplicate warnings.
Warnings go to the existing server logging stream; no external logging service,
public diagnostics endpoint, credentials or new paid service was introduced.

Example event:

```json
{"event":"market_data_fallback","provider":"finnhub","operation":"quotes","reason":"http","status":429}
```

| Field | Values |
|---|---|
| `provider` | `coingecko`, `finnhub` |
| `operation` | `quotes`, `chart` |
| `reason` | `http`, `timeout`, `network`, `invalid-response` |
| `status` | HTTP status, present only for HTTP failures |
| `rejectedRecords` | Invalid/missing crypto record count, when applicable |

The event deliberately excludes request URLs, symbols, keys, headers, raw response
bodies, exception messages and stack traces. Redaction tests use secret-shaped
fixtures and confirm none reach the event. An absent Finnhub key is an expected
simulation configuration, so it does not produce a failure warning.

For investigation:

1. Filter server logs on `event=market_data_fallback`, grouped by provider,
   operation, reason and status.
2. For `429`, check the provider account's request quota and deployment instance
   count. The in-memory cache is per process and does not enforce a global quota.
3. For `401`/`403`, inspect the server's provider configuration without copying keys
   into logs. CoinGecko integration supports Demo keys, not Pro keys.
4. For `timeout`/`network`, check provider availability and server connectivity.
5. For `invalid-response`, reproduce using a sanitized fixture and compare the
   official response schema before relaxing validation.

Cached failures last 10–12 seconds for quotes and 30 seconds for charts. Logs are
failure events, not an availability percentage: there is no success denominator,
durable metrics storage or automatic alerting. Those require a separately chosen
operational backend and traffic budget before adding more providers.

## Historical verification: initial implementation, before dependency migration

- Build, typecheck and lint passed.
- 22 regression tests passed; the production smoke suite passed.
- Browser: quote timestamps and unreviewed research records rendered at 320, 768,
  1024 and 1440px without horizontal page overflow.
- Production-only dependency audit reported zero vulnerabilities.
- Full dependency audit remains failing on the documented development-tool chain.
- During the local browser run, CoinGecko returned HTTP 429. The server captured
  the expected redacted event below. Provider quota availability remains an
  external limitation; the source layer selects the existing simulation fallback.

```json
{"event":"market_data_fallback","provider":"coingecko","operation":"quotes","reason":"http","status":429}
```

No changes were committed, pushed or deployed. The GitHub-hosted workflow itself
has not run, and editorial reviews of the 26 theses have not been performed.

```text
Diff:   18 implementation, configuration, test and documentation files in this follow-up, plus a verification screenshot
Build:  pass (npm.cmd run build; npm.cmd run typecheck)
Tests:  pass (npm.cmd test: 22 passed / 0 failed; npm.cmd run test:smoke: 1 passed / 0 failed)
Lint:   pass (npm.cmd run lint)
Ran:    production HTTP smoke suite and browser freshness/research disclosures at four responsive widths
Verdict: not ready - application checks pass, but the development dependency advisory remains open
```
