# Implement the review improvements

## Frame

- [x] Read the Principles section of the poteto-mode skill.
- [x] Phase A: Frame.
- [x] Phase B: Design the workflow.
- [x] Phase C: Run the loop.
- [x] Phase D: Keep the audit trail.
- [x] Phase E: Verify and hand back.

Completion requires passing lint, typecheck, adapter tests, production build,
HTTP smoke tests, and the new Chromium interaction suite. Each improvement needs
an observed result or an explicit remaining limit. Earlier uncommitted fixes
remain in place. No publishing or paid infrastructure is part of this run.

## Throughput checkpoint

- Blocking first steps. Inspect the current tree, preserve earlier work, read the
  installed Next.js test guide, compare designs, and install browser tooling.
- Independent workstreams. Browser tests, source adapters and UI components have
  separate file ownership. Shared package, CI and documentation edits stay with
  the primary agent.
- Shared mutable state. Only one agent writes each file. Build and full test runs
  wait for implementation checkpoints. Browser output uses a new temporary
  directory for each run.
- Smallest safe decomposition. Three implementation slices share the existing
  domain models. No generic provider framework or distributed service is needed.

## Work units

1. Browser regression gate. Exercise navigation, search, filtering, provenance,
   chart recovery and visible polling against the production app with fixture APIs.
2. Provider limits. Bound cache and pending work, admit requests against rolling
   application budgets, and retain labeled fallback and safe failure logging.
3. Polling and provenance. Pause hidden-tab work, ignore obsolete responses, and
   show review status wherever the catalog presents scores.
4. Structure. Use domain types for filters and put navigation visibility under
   one stylesheet's breakpoint.
5. Operations. Aggregate safe failure logs, schedule the existing dependency audit,
   and document limits and developer commands.
6. Verify. Run all project checks and Chromium scenarios; inspect the final diff
   and independent review results.

## Scope decisions

The user selected human editorial review. Catalog entries remain unreviewed.
The implementation will expose that state instead of creating attribution.

Provider limits are application policies per process. They cannot promise an
account-wide cap across deployments or enforce a monthly subscription allowance.
Shared admission and durable monitoring remain infrastructure decisions.

A Playwright browser install unexpectedly garbage-collected older browser caches
before downloading the required Chromium version. No project content was removed.
Future local install commands set PLAYWRIGHT_SKIP_BROWSER_GC=1 to preserve caches.

The multi-phase-plan playbook was inspected and rejected because it only produces
a plan. The user's current instruction explicitly asks for implementation. This
run follows the Figure It Out phases with feature design and verification gates.

## Completion record

Implementation workers stopped at the account usage limit after leaving browser
tests and part of the provider implementation. The primary agent inspected that
work, completed the remaining changes, and resumed after the user requested it.
A fresh same-model reviewer inspected provider admission, polling cancellation,
log redaction, and browser configuration. Its focused eight-test run passed.
No actionable correctness or added-comment findings remained in that scope.

The first Chromium run passed 12 tests and failed two test assumptions. One
expected whitespace where the heading uses CSS spacing. The other expected NVDA
among the first nine safest assets, although the captured page showed its quote
elsewhere. Corrected assertions passed. The full output remains in
browser-first.txt.

Final cache inspection found that a crypto batch with no valid records returned
an empty object. The new success TTL would then delay recovery for 60 seconds.
A targeted test reproduced the failure in rejected-batch-before.txt. Returning
null for wholly rejected batches selects the existing 12-second failure delay.
Partial batches still preserve valid records and their rejection counts.

The final Node suite passed 37 tests. Chromium passed 17 scenarios, including
score disclosures at three viewport widths with no horizontal page overflow.
Lint, typecheck, build, production smoke tests, and the full dependency audit
passed. See REPORT.md for commands, evidence, and remaining limits.
