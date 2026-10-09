# Baseline failures and reproduction evidence

These are exact relevant output excerpts, not complete command transcripts.

`npm.cmd run lint` failed before the junction repair:

```text
Oops! Something went wrong! :(

ESLint: 9.39.5

Error: Cannot find module 'fast-glob'
Require stack:
- E:\Workspace\Project\web\Goldirham-Insight\node_modules\@next\eslint-plugin-next\dist\utils\get-root-dirs.js
- E:\Workspace\Project\web\Goldirham-Insight\node_modules\@next\eslint-plugin-next\dist\rules\no-html-link-for-pages.js
- E:\Workspace\Project\web\Goldirham-Insight\node_modules\@next\eslint-plugin-next\dist\index.js
- E:\Workspace\Project\web\Goldirham-Insight\node_modules\eslint-config-next\dist\core-web-vitals.js
```

`npm.cmd test` failed for the same missing module in tests/lint-root-dirs.test.cjs:

```text
# tests 23
# suites 0
# pass 22
# fail 1
```

`npm.cmd audit --json` exited 1 before updates. Its vulnerability totals were:

```json
{"info":0,"low":0,"moderate":0,"high":2,"critical":0,"total":2}
```

Affected entries were next 16.3.6 and source-map-js 1.2.1. The Next entry listed
GHSA-3w37-wq28-93x7, GHSA-4jqv-mc3x-m676, GHSA-39w2-rjm5-chcv,
GHSA-f87g-xv8r-7p7x, GHSA-mcj8-r9mp-w47p and GHSA-cjq9-62q9-8jv4.
source-map-js listed GHSA-68fv-2mgg-jv7q.

`node --test --test-name-pattern='chart histories without' tests/market.test.cjs`
exited 1 before the provider validation fix:

```text
Expected values to be strictly equal:
+ actual - expected

+ 'coingecko'
- 'simulated'
```

An initial server start raced the dependency installation. The command
`npm.cmd start -- --hostname 127.0.0.1 --port 3100` failed with:

```text
'next' is not recognized as an internal or external command,
operable program or batch file.
```

Starting again after installation completed succeeded. No application change was
needed for that orchestration error. Final verification logs are stored beside
this file.
