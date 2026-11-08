# Development dependency advisory and remediation

## Update on 8 November 2026

Next runtime and `eslint-config-next` are now 16.4.5. `@next/eslint-plugin-next@16.4.5`
still depends on `fast-glob` 3.3.1, and its only use is still
`globSync(rootDir, { onlyDirectories: true })` in `get-root-dirs.js`, so the override moved
to `@next/eslint-plugin-next@16.4.5` with the adapter unchanged. `npm ls fast-glob` resolves
only to `tools/next-eslint-glob`, and the three adapter regression tests pass.
`npm audit --omit=dev` reports zero vulnerabilities. The full audit still reports 8 moderate
`minimatch` entries through `typescript-eslint` and ESLint 9, below CI's
`--audit-level=high`; the lint upgrade did not change them.

`lightweight-charts` moved to 5.2.1 (`addAreaSeries` became `addSeries(AreaSeries, …)`) and
`lucide-react` to 1.68.0 (every imported icon still exists). TypeScript stays at 5: 7.x
ships without the JavaScript API that `tests/load-ts.cjs` and the Next build type check use.

npm 10 drops the `libc` fields from lockfile entries when it rewrites the lockfile. They were
restored from the previous lockfile so Linux installs keep choosing the glibc or musl binary.

## Update on 1 November 2026

Next runtime is now 16.4.3. Next 16.0.0 through 16.4.0 match two critical advisories,
[GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) and
[GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr), and one high
advisory, [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r). No
16.3.x patch exists. The app has no `use cache`, Server Actions or `dangerouslyAllowSVG`,
so exploitability here was not demonstrated; the version match alone justified the patch.
`npm audit --omit=dev` reports zero vulnerabilities. The full audit reports moderate
`minimatch` entries in the ESLint toolchain, below CI's `--audit-level=high`. The ESLint
configuration and plugin remain at 16.3.6 with the scoped adapter unchanged.

The same day, development-only `zod` moved from 4.6.5 to 4.6.7 within its declared range,
clearing the high-severity [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
that failed CI's full audit. A recheck of the lint tooling found:

- `@next/eslint-plugin-next@16.4.3` still depends on `fast-glob` 3.3.1, so moving the lint
  configuration to 16.4.3 would need the scoped adapter override widened. It stays at 16.3.6.
- All 16 remaining moderate entries trace to `minimatch` <11.0.1, used at 3.1.5 by ESLint 9
  and its plugins. npm's suggested fixes are major downgrades (`eslint@4.0.0`,
  `eslint-config-next@0.2.4`) and were not applied. ESLint 10 is the current major; recheck
  when `eslint-config-next` supports it.

## Update on 9 October 2026

Next runtime is now 16.3.8 and `source-map-js` is 1.2.2. The full audit reports
zero vulnerabilities in [the current verification record](../review-2026-10-09/audit.json).
This addresses the new [Next advisories](https://github.com/advisories/GHSA-cjq9-62q9-8jv4)
and [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
An audit identifies affected dependency versions; it does not establish that an
application-specific exploit succeeded.

The ESLint configuration and plugin remain at 16.3.6. Their scoped glob adapter
and its regression tests are unchanged. The runtime patch does not widen that
override. The 5 October verification and remediation history follows below.

Status: **Removed from the local dependency graph; full and production audits pass.**

Verified 5 October 2026. The upstream advisory remains unpatched. This project
removes the affected implementation from both tooling paths instead of suppressing
the audit. GitHub CI must be checked for the exact commit after publishing.

## Remediation

- Upgrade `tailwindcss` from 3.4.19 to 4.3.3 and use `@tailwindcss/postcss` 4.3.3.
  This removes Tailwind's `braces`, `micromatch`, `chokidar` and `fast-glob` path.
- Keep Next and its ESLint configuration at 16.3.6. Its plugin's only `fast-glob`
  use is `globSync(pattern, { onlyDirectories: true })` in `get-root-dirs.js`.
  Replace that dependency with the local `@goldirham/next-eslint-glob` adapter,
  backed by `tinyglobby` 0.2.17. No vulnerable source is copied into the adapter.
- The adapter preserves relative/absolute paths, stops implicit recursive directory
  expansion and strips trailing separators. Direct substitution failed two tests
  by returning nested directories and relative paths for absolute patterns.
- The root `fast-glob` development dependency supplies the local package; the
  version-scoped override references it using npm's `$fast-glob` syntax. The local
  package is not a general replacement for the full `fast-glob` API. Do not use it
  elsewhere or widen the override. Reassess it when updating Next lint tooling,
  and remove the adapter once upstream uses a safe dependency.
- Keep the existing Tailwind theme through `@config`, explicitly scan app,
  components and lib, and migrate the score gradient utility. Put the existing
  reference design's element reset in `@layer base`: leaving it unlayered caused
  padding utilities to lose to the reset. Border and placeholder defaults retain
  the v3 values.
- Declare the root package as ESM for the existing TypeScript theme config.
  CommonJS test and adapter files retain their explicit `.cjs` extension.

The user approved the major migration. Tailwind 4 requires Safari 16.4+, Chrome
111+ or Firefox 128+. Older browsers are outside this migration's support target.

## Follow-up verification

- `npm.cmd audit --audit-level=high`: `found 0 vulnerabilities`.
- `npm.cmd audit --omit=dev --audit-level=high`: `found 0 vulnerabilities`.
- Fresh isolated `npm.cmd ci --ignore-scripts` from the changed lockfile passes;
  `npm.cmd ls fast-glob tinyglobby` reports a valid tree and all 25 tests pass there.
- Build, typecheck, lint and all 25 regression tests pass in the working checkout.
- Production smoke test passes: 32 pages, 26 disclosures, five chart ranges,
  quote deduplication and unknown-symbol 404.
- Browser checks cover the homepage, NVDA and AI Companies at 375px and 1280px CSS
  widths, with no horizontal overflow. Font families, heading sizes, background,
  research-record borders and 24px bottom padding are retained. Measurements are
  not a pixel-perfect screenshot comparison; browser zoom changed during the run.
- Score gradients render, chart range selection updates, and the mobile menu opens.
  Enter in mobile search navigates to `/asset/AMD` with the correct heading.
  Verification captures are in `tailwind-migration/`.
- The original GitHub run passed quality checks and failed the full audit with
  `Process completed with exit code 1`:
  [run 37301685800](https://github.com/ixtaqq/Goldirham-Insight/actions/runs/37301685800).

Sources: [Tailwind migration guide](https://tailwindcss.com/docs/upgrade-guide),
[tinyglobby](https://github.com/SuperchupuDev/tinyglobby),
[npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides).

## Historical evidence: before remediation

- Advisory: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- Affected: `braces <=3.0.3`; the advisory lists no patched version.
- `npm.cmd view braces version` returned `3.0.3` during this pass.
- The previous [full audit output](../review-2026-10-05/dependency-audit.json)
  records seven high-severity entries in one transitive chain.
- `npm.cmd audit --omit=dev` returned `found 0 vulnerabilities` on this pass.

The follow-up command `npm.cmd audit --audit-level=high` exited 1. Exact output:

```text
# npm audit report

braces  *
Severity: high
braces vulnerable to stack-exhaustion denial of service through deeply nested patterns - https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
fix available via `npm audit fix --force`
Will install tailwindcss@4.3.3, which is a breaking change
node_modules/braces
  chokidar  2.0.0 - 3.6.0
  Depends on vulnerable versions of braces
  node_modules/chokidar
    tailwindcss  <=0.0.0-oxide-insiders.ff2c25f || 2.1.0-canary.1 - 3.4.19
    Depends on vulnerable versions of chokidar
    Depends on vulnerable versions of fast-glob
    Depends on vulnerable versions of micromatch
    node_modules/tailwindcss
  micromatch  >=0.2.0
  Depends on vulnerable versions of braces
  node_modules/micromatch
    fast-glob  *
    Depends on vulnerable versions of micromatch
    node_modules/@next/eslint-plugin-next/node_modules/fast-glob
    node_modules/fast-glob
      @next/eslint-plugin-next  >=14.3.0-canary.0
      Depends on vulnerable versions of fast-glob
      node_modules/@next/eslint-plugin-next
        eslint-config-next  >=14.3.0-canary.0
        Depends on vulnerable versions of @next/eslint-plugin-next
        node_modules/eslint-config-next

7 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```

The chain runs through development tooling (`micromatch`, `fast-glob`, `chokidar`,
Tailwind 3 and the Next ESLint configuration). The advisory concerns deeply nested
brace patterns exhausting the stack. Production audit results do not make build
and development tooling safe; do not feed untrusted glob patterns into that tooling.

## Historical decision: initial implementation

No forced audit fix, major Tailwind migration, Next lint downgrade, replacement
fork or silent override was applied. npm's previously suggested changes involve
Tailwind 4 and an older Next ESLint configuration and require compatibility work.
The existing runtime stack and lockfile remain unchanged.

The separate CI audit job runs without `continue-on-error` and preserves evidence.
It is expected to fail until the advisory is genuinely remediated. The application
quality job can still report its own results independently.

## Original remediation acceptance criteria

1. Confirm a patched compatible release, or propose an explicitly reviewed tooling
   migration with exact versions and its source evidence.
2. Obtain approval before undertaking the large migration required by the original
   review request; do not infer that a clean audit justifies unrelated rewrites.
3. Verify lint, all regression tests, production build, typecheck and HTTP smoke
   tests; visually verify generated styles if Tailwind changes.
4. Run the full npm audit and confirm this chain is absent. Do not suppress it,
   rename it or describe a dependency swap alone as remediation.

The original issue was not risk-accepted. The follow-up removes the affected code
and leaves the full CI audit enforced.
