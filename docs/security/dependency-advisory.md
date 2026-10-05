# Development dependency advisory and remediation

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
