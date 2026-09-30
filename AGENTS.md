# Goldirham

Investment research demo built with Next.js 16 App Router, React 19,
strict TypeScript, Tailwind CSS 3, and lightweight-charts 4.

## Layout and conventions

- `app/` contains routes, including asset and category pages.
- `components/` contains reusable UI and charts; use PascalCase component names.
- `lib/assets.ts` and `lib/categories.ts` define the catalog; reuse their helpers.
- `lib/market.ts` provides simulated market data; keep simulated and live data
  clearly distinguished in the UI.
- Follow existing double quotes, semicolons, and the `@/*` root import alias.
- Read the relevant installed Next.js docs under `node_modules/next/dist/docs/`
  before changing framework behavior.

## Verified local checks

Run from this repository in PowerShell with dependencies installed:

```powershell
& 'E:\workspace\Projects\Use-Node22.ps1'
npm.cmd run lint
& '.\node_modules\.bin\tsc.cmd' --noEmit --incremental false
```

Both checks passed during setup. No automated test script is configured.
For UI changes, also exercise the affected page and interactions; lint and
TypeScript checks do not establish that the UI works.

## Shared agent workflow

Read `E:\workspace\agent-homebase\PROJECT-WORKFLOW.md` for the shared workflow.
Use the globally available skills that match the task and the project checks below or above.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
