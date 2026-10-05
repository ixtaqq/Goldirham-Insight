# Open development dependency advisory

Status: **Open — not remediated and not marked risk-accepted.**

Verified 5 October 2026. Ownership: repository maintainer; no individual assigned
by this implementation. Revisit before a production release and whenever the
dependency-audit CI check changes.

## Evidence

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

## Decision for this implementation

No forced audit fix, major Tailwind migration, Next lint downgrade, replacement
fork or silent override was applied. npm's previously suggested changes involve
Tailwind 4 and an older Next ESLint configuration and require compatibility work.
The existing runtime stack and lockfile remain unchanged.

The separate CI audit job runs without `continue-on-error` and preserves evidence.
It is expected to fail until the advisory is genuinely remediated. The application
quality job can still report its own results independently.

## Remediation acceptance criteria

1. Confirm a patched compatible release, or propose an explicitly reviewed tooling
   migration with exact versions and its source evidence.
2. Obtain approval before undertaking the large migration required by the original
   review request; do not infer that a clean audit justifies unrelated rewrites.
3. Verify lint, all regression tests, production build, typecheck and HTTP smoke
   tests; visually verify generated styles if Tailwind changes.
4. Run the full npm audit and confirm this chain is absent. Do not suppress it,
   rename it or describe a dependency swap alone as remediation.

This record is an open issue and a release consideration, not a security waiver.
