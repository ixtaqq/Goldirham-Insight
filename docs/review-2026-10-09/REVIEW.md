# Goldirham review, 9 October 2026

The review covered the local repository, starting from a clean working tree. No
commit, push or deployment was requested or performed. This is an educational
investment-research demo according to README.md and its disclosures. Production
readiness, live deployment state and audience demand were not established.

## 1. Architecture summary

1. Next.js App Router serves the homepage, 26 asset pages and five category pages.
2. Asset and category routes are pre-rendered from the TypeScript catalog.
3. React 19 client components handle search, filtering, radar, ticker and charts.
4. A root LiveMarketProvider polls the quote API six seconds after each response.
5. Two dynamic route handlers provide quotes and historical chart points.
6. CoinGecko and optional Finnhub adapters validate responses and cache per process.
7. Deterministic simulated data supplies explicitly labeled fallbacks.
8. Tailwind 4 and two global stylesheets define the interface; Lightweight Charts renders history.
9. No database, authentication or transaction execution exists in the reviewed code.

### Baseline and final checks

| Check | Baseline | Final evidence |
| --- | --- | --- |
| Lint | Failed resolving fast-glob | Passed, lint.txt |
| TypeScript | Passed | Passed, typecheck.txt |
| Regression tests | 22 passed, one test-file failure | 26 passed, tests.txt |
| Production build | Passed on Next 16.3.6 | Passed on 16.3.8, build.txt |
| HTTP smoke | Passed | Passed, smoke.txt |
| Full dependency audit | Two high-severity package entries | Zero reported vulnerabilities, audit.json |
| Browser | Two defects reproduced | Both fixed, browser-checks.md |

The missing test file contained three tests, explaining why the baseline reported
23 tests while the repaired baseline reported 25. One new chart regression brings
the final total to 26. Smoke checks cover 32 content pages, 26 review disclosures,
five chart ranges, quote deduplication and unknown-symbol 404.

See failures.md for exact failure excerpts. A passing audit is a dependency
database result, not a penetration test. Linux CI, a fresh clean install, Safari,
Firefox, provider credential paths and the deployed site were not exercised.

## 2. Error and fix table

Line references identify the current files unless marked baseline.

| Severity | File | Problem and root cause | Minimal fix | Status and verification |
| --- | --- | --- | --- | --- |
| High | package.json:19 | Next 16.3.6 matches six current advisories, including image-optimization SSRF. Version exposure is confirmed; exploitability was not demonstrated. | Pin runtime to 16.3.8 and update associated lock entries. | Fixed locally. Full audit, build and smoke pass. |
| High | package-lock.json:6091 | Transitive source-map-js 1.2.1 matches indexed source-map denial-of-service advisory. | Resolve 1.2.2 within existing dependency ranges. | Fixed locally. Full audit reports zero. |
| Medium | package.json:28; node_modules/fast-glob | Local adapter junction targets E:/Workspace/Project/Goldirham-Insight/tools/next-eslint-glob, outside the relocated checkout. | Preserve the old junction as fast-glob-old-location and create the correct junction. Add relocation guidance to README. | Fixed locally. Lint and all three glob tests pass. No adapter code changed. |
| Medium | app/globals.css:251; app/reference-design.css:425 | Desktop nav is hidden at 1000px but mobile panel was only displayed at 850px. | Move only the mobile panel rules into the 1000px media query. | Fixed. At 900px expanded panel changes from display:none to block. Also checked 850px and 1001px. |
| Medium | components/AssetSearch.tsx:37 | Escape clears React focus state without moving DOM focus. Subsequent typing did not restore state. | Set focused=true when query changes. | Fixed. Search results reopen after Escape and after Enter navigation. |
| Medium | lib/sources.ts:147 | Provider history validated each timestamp separately but allowed duplicate seconds, descending times and dates outside the JS date range. Client could reduce accepted history to one point and show unavailable instead of fallback. | Reuse isQuoteTimestamp and require strictly increasing whole seconds before caching. | Fixed. New regression fails before fix and passes after, including three malformed histories. Existing valid-history test still passes. |
| Low | docs/quality-and-provenance.md:12 | Setup command referenced nonexistent E:/workspace/Projects instead of E:/Workspace/Project. | Correct the documented path. | Fixed. Correct command ran throughout this review. |

The application, dependency and documentation diffs are in fixes.patch. The
junction repair is local installation state and does not appear in git diff.
The old junction is preserved. No source or user data files were deleted.

The ESLint plugin intentionally remains at 16.3.6 with its existing scoped
adapter. Upgrading the runtime does not require widening that override. npm
removed libc metadata during lockfile rewriting; it was restored so unrelated
platform metadata does not enter this patch.

Security sources are the [Next advisory](https://github.com/advisories/GHSA-cjq9-62q9-8jv4)
and [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

## 3. Improvements ranked by impact versus effort

Effort is relative engineering scope, not a delivery commitment. S is a small
isolated change, M spans several components, and L needs infrastructure or a
product design decision. Impact is an assessment based on the reviewed code.

| Rank | Area and concrete improvement | Impact | Effort | Evidence and trade-off |
| --- | --- | --- | --- | --- |
| 1 | Add browser regression checks for search, breakpoint navigation, filters and chart recovery. | High | M | tests/smoke.cjs checks HTTP responses only; both UI bugs escaped existing tests. Adds browser tooling and CI maintenance. |
| 2 | Extend review status to asset cards and ranking views, then complete a real editorial review for an initial subset. | High | M | lib/card.ts:8 omits research metadata; all catalog entries remain unreviewed. Requires actual reviewer and sources, not generated attribution. |
| 3 | Introduce provider quota accounting, bounded caching and abuse controls before traffic growth. | High | M | lib/sources.ts:44 caches per process; quote ID subsets create separate entries. Shared infrastructure needs an explicit cost and hosting decision. |
| 4 | Pause quote polling in hidden tabs and measure visible-consumer updates before splitting context. | Medium | S | components/LiveMarketProvider.tsx:31 polls continuously and broadcasts whole maps. Saves unnecessary requests; resume behavior must remain fresh. No speedup was measured. |
| 5 | Consolidate navigation breakpoint ownership and narrow catalog filter types. | Medium | M | Two global CSS files diverged; AssetExplorer.tsx stores category/filter as broad strings. Do this separately from bug fixes to control visual risk. |
| 6 | Aggregate existing fallback logs into provider health and failure-rate metrics. | Medium | M | lib/sources.ts reportFailure already redacts errors. Preserve that allowlist and avoid raw URLs or provider bodies. |
| 7 | Add scheduled dependency review and keep setup/security records dated. | Medium | S | Audit changed since the 5 October clean result; relocated adapter broke local tooling. No schedule was created in this review. |

No tracked environment files beyond the example were found. Keys remain server
side and provider headers carry credentials. This was code inspection, not a
complete secret-history scan or security audit.

## 4. Feature proposals

These are proposals, not implemented functionality. Validate demand before
committing to the larger items.

| Feature | What it does and user problem | Effort | Impact | Risks or dependencies |
| --- | --- | --- | --- | --- |
| Personal watchlist | Save assets locally so repeat visitors can resume research. | S | High | Browser storage can be cleared; cross-device sync is separate scope. |
| Side-by-side comparison | Compare up to four assets, scores, risks, sources and review status. | M | High | Scores are editorial, not calibrated forecasts; explain comparisons. |
| Shareable research views | Put search, category and ranking in the URL so links and Back restore context. | S | Medium | Query validation, URL compatibility and navigation tests. |
| Research revisions | Show dated thesis and score changes with supporting citations. | M | High | Needs a real editorial process and durable version records. |
| Data-quality panel | Show source, observation age and fallback status in one place. | M | High | Define provider-specific freshness without calling closed-market data broken. |
| Watchlist alerts | Notify users about published research changes or supported price thresholds. | L | Medium | Reliable data, consent, scheduler, delivery service and approved recurring costs. Never trigger market alerts from simulation. |
| Portfolio scenarios | Let readers explore hypothetical allocations and concentration. | L | Medium | Licensed historical data and clear assumptions; simulated charts cannot support backtested returns. |

## 5. Roadmap

| Horizon | Title | Description | Effort | Success criterion |
| --- | --- | --- | --- | --- |
| Now, this week | Review and ship the patch | Review the seven findings and publish through the existing release process. | S | CI passes on the exact commit; deployed menu/search reproduce the local pass. Local work is complete; publishing remains unrequested. |
| Now, this week | Start an evidence-backed research pilot | Select three assets for real editorial review and complete metadata. | M | Three pages show actual reviewer/date, primary supporting sources and all score rationales. |
| Next, 2 to 4 weeks | Browser regression gate | Automate search, menu breakpoints, filters and chart failure/retry. | M | CI catches the two old UI defects and passes recovery scenarios. |
| Next, 2 to 4 weeks | Market-data operating limits | Define provider quotas, caching bounds and fallback monitoring; pause hidden-tab polling. | M | An agreed load test stays within provider limits and proves recovery after failure. |
| Next, 2 to 4 weeks | Discoverable review status | Carry provenance into catalog cards and ranking results. | M | Every scored result exposes reviewed/unreviewed state without opening its detail page. |
| Next, 2 to 4 weeks | Shareable filters | Persist filters and sorting in URLs. | S | Reload, shared link and browser Back reproduce the same results. |
| Later, 1 to 3 months | Watchlist and comparison | Add local saved assets and consistent side-by-side research. | M | Watchlist survives reload; comparisons retain citations and source labels for each asset. |
| Later, 1 to 3 months | Revision history and data quality | Publish research changes and make feed status inspectable. | M | Each published revision has a dated diff; every quote exposes observation time and source. |
| Later still, 3+ months | Optional alerts | Add opt-in alerts after feed reliability and costs are agreed. | L | Idempotent delivery, unsubscribe, and zero simulated-price alerts in acceptance tests. |
| Later still, 3+ months | Portfolio scenarios | Add hypothetical allocation analysis after securing suitable data. | L | Results reproduce against a reference dataset and disclose all assumptions. |

## 6. Top three next actions

1. Review and ship the patch. It removes two audited vulnerable dependencies and
   restores navigation and search paths. Deployment still requires your release action.
2. Add browser regression coverage. The current backend checks could not detect
   the interaction failures reproduced here.
3. Review a small research subset with real citations before expanding the catalog.
   More features cannot establish the credibility of unreviewed scores.

## Workflow and verification limits

The sequence was analysis, baseline checks, security fixes, isolated behavioral
fixes, final checks, then proposals and roadmap. Completion means each confirmed
defect has a minimal local fix and an observed verification result, with remaining
limits recorded. No broad architecture rewrite was needed. Independent UI
exploration ran while the primary review handled adapters and tooling; edits
remained serial. This was a same-model independent review, not a cross-model panel.

Model the Domain kept chart data as the existing LinePoint array with an explicit
time-order invariant. Prove It Works required failing route evidence and actual
browser interaction checks, not just compilation. Comments review found no new
or changed comments to remove. decisions.tsv records the decisions.

Attention: a machine-readable run transcript and a different model-family reviewer
were unavailable for the skill's requested trail audit. An independent same-model
review inspected the code diff and saved command logs without finding an actionable
regression. Fresh-install and deployment verification remain open.
