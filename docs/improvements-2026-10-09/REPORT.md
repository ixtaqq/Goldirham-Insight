# Implemented review improvements, 9 October 2026

Readers now see review status beside scores, and hidden tabs pause quote requests.
Developers have a Chromium regression gate. Operators have bounded provider work
and a local tool for safe fallback-event summaries. All catalog entries remain
unreviewed, as the user requested, until a human supplies the review metadata.

The original architecture, bug table, feature proposals, and roadmap remain in
[the project review](../review-2026-10-09/REVIEW.md). This report records the
implementation of its seven ranked improvements and the limits that remain.

## Delivered changes

| Rank | Improvement | Implementation and evidence | Remaining limit |
| --- | --- | --- | --- |
| 1 | Browser regression gate | `playwright.config.ts` and `tests/browser/markets.spec.ts` run 17 production UI scenarios. CI runs them after building and preserves failure evidence. | Chromium only. The modified GitHub workflow has not run remotely. |
| 2 | Discoverable review status | `lib/card.ts` projects a review union. `ResearchStatus` appears in catalog cards, the research strip, hero radar, and framework scorecard. Tests cover all catalog cards and responsive score disclosures. | No editorial review was performed. Actual reviewer, date, sources, and score rationales are required before an entry becomes reviewed. |
| 3 | Bound provider work | `lib/sources.ts:18` defines cache and pending capacities. Shared rolling admission permits five CoinGecko and 30 Finnhub attempts per minute. `app/api/quotes/route.ts:11` rejects oversized input. Seven mocked tests cover admission, sharing, expiry, pending capacity, fallback, and rejected batches. | Limits are per process. Distributed quotas, monthly allowance enforcement, and deployment-wide abuse controls need an infrastructure decision. |
| 4 | Pause hidden-tab polling | `components/LiveMarketProvider.tsx:44` owns request generations and cancellation. Hide preserves quotes and cancels work. Show immediately resumes one poll. Chromium verifies initial-hidden, hidden-in-flight, repeated-visible, stale, and recovery behavior. | Visibility events are controlled in tests. No CPU benchmark or React render profiling was performed; splitting the context remains a profiling decision. |
| 5 | Narrow state and breakpoint ownership | `AssetExplorer` derives filter state from a constant tuple and categories from `CategorySlug`. `app/globals.css` owns navigation visibility at 1000px. Tests cover 850, 900, 1000, and 1001px plus category ranking and cross-listing. | Broader style consolidation would increase scope and was not performed. |
| 6 | Summarize safe fallback logs | `tools/market-health.cjs` accepts NDJSON, rejects unsupported fields and values, and reports grouped counts. Two CLI tests verify aggregation, redaction, and unreadable input. | Fallback logs have no success denominator. The tool cannot report failure percentages or exact admission-denial counts because denial warnings are sampled. |
| 7 | Scheduled dependency audit and setup docs | `.github/workflows/ci.yml` adds Monday 01:00 UTC audit runs. README and the quality guide document browser setup, provider caps, polling, provenance, and diagnostics. The full local audit reports zero vulnerabilities. | The schedule activates after the workflow reaches the default branch. Branch protection and deployment remain maintainer actions. |

Successful quotes now cache for 60 seconds while preserving provider observation
timestamps. Charts cache for 30 seconds. Failed stock quotes retry after 10 seconds;
failed crypto quotes retry after 12 seconds. Admission denials return labeled
simulation without caching the denial. Bursts can therefore increase simulated
fallback, and multiple server instances retain separate budgets.

## Cache edge case found during verification

| Severity | File | Root cause | Minimal fix | Verification |
| --- | --- | --- | --- | --- |
| Medium | `lib/sources.ts:149` | A wholly invalid crypto batch returned `{}` and received the new 60-second success TTL. | Return `null` when no records survive validation. | The regression reproduces `{} !== null` before the fix, then verifies recovery at 12 seconds. All 37 Node tests pass afterward. |

```diff
-      return out;
+      return Object.keys(out).length ? out : null;
```

The failure command was
`node --test --test-name-pattern='wholly rejected' tests/provider-limits.test.cjs`.
Its relevant output was:

```text
Expected values to be strictly equal:

{} !== null
```

Full output is saved in [the reproduction log](rejected-batch-before.txt).
The initial browser run had two incorrect test expectations. Their complete
errors remain in [the first browser log](browser-first.txt). The corrected suite
passed before adding responsive disclosure checks.

## Verification evidence

All commands ran from this checkout with Node 22.23.3. The final checks were:

| Command | Observed result | Saved evidence |
| --- | --- | --- |
| `npm.cmd run lint` | Pass after the responsive test additions. | [Lint output](lint-responsive.txt) |
| `npm.cmd run typecheck` | Pass after the responsive test additions. | [Typecheck output](typecheck-responsive.txt) |
| `npm.cmd test` | 37 passed, 0 failed. | [Node test output](tests-complete.txt) |
| `npm.cmd run build` | Pass with Next.js 16.3.8. | [Build output](build-complete.txt) |
| `npm.cmd run test:smoke` | 1 passed, 0 failed. Covers 32 pages, 26 review disclosures, five chart ranges, and quote deduplication. | [Smoke output](smoke-complete.txt) |
| `npm.cmd run test:browser` | 17 passed, 0 failed. | [Chromium output](browser-responsive.txt) |
| `npm.cmd audit --json` | Zero reported vulnerabilities across all dependencies. | [Audit JSON](audit-final.json) |

Browser fixtures replace quote and chart APIs and block external browser traffic.
Provider tests control clocks and network boundaries. No real market-data call or
provider subscription was needed for these checks. Audit results describe the
current advisory database and do not establish that all dependencies are bug-free.

The primary agent visually inspected the responsive screenshots. The scorecard
review label remains readable at [320px](provenance-320.png) and
[1440px](provenance-1440.png). The screenshots show fixture data and simulated
source labels; they are verification artifacts, not market observations.

A fresh same-model independent reviewer found no actionable defects in the
provider, polling, diagnostics, and browser files. It independently passed eight
focused tests. The final one-line rejected-batch fix and responsive tests were
reviewed and executed by the primary agent after that review. No different-model
review or deployed-environment verification was performed. Comment review found
no added comments or suppressions in the scoped files; no files were removed.

The Playwright install unexpectedly removed older browser-cache versions before
the preservation flag was set. Project content was preserved. Future documented
install commands set `PLAYWRIGHT_SKIP_BROWSER_GC=1`. At the implementation handoff,
the changes were local and uncommitted. No push or deployment had occurred.

## Principles that shaped the implementation

Model the Domain made review status a discriminated union and provider budgets a
fixed registry. Boundary Discipline placed validation at API, provider, and log
inputs. Laziness Protocol kept the cache and polling lifecycle in their existing
owners instead of adding one-consumer runtime modules.

Test Behavior, Not Implementation drove assertions through adapters, routes,
rendered UI, and the CLI. Sequence Work into Verifiable Units separated provider,
provenance, browser, and diagnostics checks. Prove It Works required production
browser execution after the build passed. Type System Discipline narrowed catalog
filter state to allowed values. Make Operations Idempotent prevented repeated
visible events from creating duplicate polling. Separate Before Serializing
Shared State gave agents distinct file ownership during implementation.

```text
Diff:   66 files staged for publication, including earlier fixes and saved evidence
Build:  pass (npm.cmd run build; npm.cmd run typecheck)
Tests:  pass (npm.cmd test: 37/0; npm.cmd run test:smoke: 1/0; npm.cmd run test:browser: 17/0)
Lint:   pass (npm.cmd run lint)
Ran:    production routes, Chromium interactions, adapter limits, and the diagnostics CLI
Verdict: ready - local checks pass; human research review and remote CI remain pending
```

## Recommended next steps

1. Arrange the human research pilot. Actual supporting sources and score rationales
   establish credibility that a UI badge cannot provide.
2. Review and publish the local changes through the normal repository process.
   Confirm the new CI job on the exact pushed commit before enabling required checks.
3. Choose provider limits for the intended deployment. Shared admission becomes
   necessary if multiple instances must respect one account-wide allowance.
