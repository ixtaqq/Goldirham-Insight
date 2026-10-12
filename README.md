<div align="center">

# Goldirham Insight

**AI-era investment research with source-labeled market data**

[![Quality checks](https://github.com/ixtaqq/Goldirham-Insight/actions/workflows/ci.yml/badge.svg)](https://github.com/ixtaqq/Goldirham-Insight/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

[**Live site**](https://goldirham-insight.vercel.app) · [Compare assets](https://goldirham-insight.vercel.app/compare) · [Documentation](#documentation)

<img src="https://goldirham-insight.vercel.app/opengraph-image" alt="Goldirham Insight: AI-era investment research" width="720" />

</div>

Goldirham Insight is an educational research and demonstration platform covering the companies and assets behind the AI build-out. It pairs written investment theses with a consistent three-factor scoring model, and every price and chart states whether it comes from a market feed or a simulation.

> [!IMPORTANT]
> This is an educational project, not financial advice. See the [disclaimer](#disclaimer).

## Contents

- [Features](#features)
- [Scoring model](#scoring-model)
- [Coverage](#coverage)
- [Data and provenance](#data-and-provenance)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Testing and CI](#testing-and-ci)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Disclaimer](#disclaimer)

## Features

| Feature | Description |
| --- | --- |
| **Research desk** | Search by company or ticker, filter by theme or Tier 1, and rank by upside, safety, or AI exposure. Assets listed in more than one theme appear under each. |
| **Custom blend** | Weight the three scores from 0 to 5 to rank assets your way. Each card shows its blended score next to its review status. |
| **Shareable views** | The URL stores search, filters, ranking, and blend weights, so reloads, shared links, and the Back button restore the same results. |
| **Asset comparison** | Compare up to three assets side by side on scores, thesis, risks, and review status at [`/compare`](https://goldirham-insight.vercel.app/compare). |
| **Asset research pages** | A full thesis, tier rating, research record, source-labeled quote, and historical chart for every asset. |
| **Share previews** | Generated link previews for the site, every asset, and every comparison. They show scores and review status, never prices. |
| **Live desk** | A market ticker with a pause control, a feed of the day's largest moves, an interactive research radar, a framework scorecard, and header search that opens any asset's research directly. |

## Scoring model

Every asset, from a regulated utility to a volatile token, is scored from 0 to 10 on the same three factors, so very different opportunities can be compared like-for-like.

| Factor | Question | Considers |
| --- | --- | --- |
| **Upside** | What could go right? | Return potential if the thesis plays out, and the catalysts that could get it there |
| **Safety** | What could go wrong? | Balance-sheet strength, business-model resilience, and drawdown behavior |
| **AI exposure** | How deep is the connection? | How structurally tied the asset is to the AI build-out |

Scores are editorial opinions. An asset is shown as **Reviewed** only when its record includes a named reviewer, an actual review date, supporting sources, and a rationale for all three scores. Every other asset is labeled **Not reviewed**. No authors, dates, or citations are invented.

## Coverage

| Category | Assets | Focus |
| --- | :---: | --- |
| **AI Utilities** | 6 | Nuclear, gas, and renewable operators signing power deals with hyperscalers |
| **AI Companies** | 12 | GPUs, foundries, HBM memory, and analytics platforms |
| **Mega Stocks** | 8 | Trillion-dollar compounders turning AI into durable earnings growth |
| **AI & Growth ETFs** | 4 | One-ticket thematic exposure without single-stock risk |
| **Crypto** | 5 | Bitcoin, Ethereum, and decentralized-compute tokens |

**26 assets** across **5 categories**. All 26 have local brand logos in `public/logos/`, with provenance recorded in [`sources.json`](public/logos/sources.json).

## Data and provenance

| Data | Source | Fallback |
| --- | --- | --- |
| Crypto quotes and charts | [CoinGecko](https://www.coingecko.com/) public API | Labeled simulation |
| Stock and ETF quotes | [Finnhub](https://finnhub.io/) (optional key) | Labeled simulation |
| Stock and ETF chart history, card sparklines | Simulated illustrations | None needed |
| Charts | [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) | — |

Every quote and chart identifies its source. Simulated quotes show their generation time and an explicit illustration label. Asset pages show quote observation times in UTC. Historical charts keep their own source data; current quotes never overwrite past chart points.

**Reliability**

- External requests time out after 5 seconds and fall back to labeled simulation.
- Quotes are polled 6 seconds after each completed request. Hidden tabs cancel pending requests and pause polling, and returning to the tab refreshes immediately.
- If the quote endpoint fails, the interface keeps the last prices, marks them stale, and retries automatically. Chart failures show an explicit retry action.

**Provider limits (per server process)**

| Setting | Value |
| --- | --- |
| Successful quote cache | 60 seconds |
| Chart cache | 30 seconds |
| Failed quote retry | 10 seconds (stocks), 12 seconds (crypto) |
| Failed chart retry | 30 seconds |
| Provider attempts per rolling minute | 5 CoinGecko, 30 Finnhub |
| Pending requests / cache entries | 32 / 128 |

Provider responses are validated before caching, and cache misses share one in-flight request. Cache hits do not use the attempt budget. Denied attempts return labeled simulation and are not cached as failures. These caps apply per process, not across server instances.

Failure logs contain only structured provider, operation, reason, and status fields. They never include raw errors, request URLs, credentials, or response bodies. To summarize exported logs, run `npm run market:health -- logs.ndjson`.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) App Router, React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 via PostCSS, theme in `tailwind.config.ts` |
| Charts | TradingView Lightweight Charts 4 |
| Icons | Lucide |
| Share images | `next/og` `ImageResponse` |
| Testing | Node test runner, Playwright (Chromium) |
| Hosting | Vercel |

Inter, JetBrains Mono, and Manrope are bundled in `app/fonts/` with their licenses, so builds never depend on an external font service. Supported browsers are Safari 16.4+, Chrome 111+, and Firefox 128+, following [Tailwind's requirements](https://tailwindcss.com/docs/upgrade-guide#browser-requirements).

## Getting started

**Prerequisites:** Node.js 22 and npm.

```bash
git clone https://github.com/ixtaqq/Goldirham-Insight.git
cd Goldirham-Insight
npm ci
npm run dev
```

Open http://localhost:3000. No API keys are required; every data source has a labeled fallback.

> [!TIP]
> On Windows PowerShell 5.1, use `npm.cmd` in place of `npm` if script execution is restricted. If you move the checkout, reinstall dependencies: the local `fast-glob` adapter is a junction that can keep pointing at the old path, which makes lint report `Cannot find module 'fast-glob'`.

### Environment variables

Both keys are optional and server-only. Copy [`.env.example`](.env.example) to `.env.local` and fill in what you need.

| Variable | Purpose |
| --- | --- |
| `FINNHUB_API_KEY` | Live stock and ETF quotes. Without it, quotes use labeled simulation. |
| `COINGECKO_API_KEY` | CoinGecko **Demo** key. Pro keys need a different host and are not supported. |

Never expose either key through a `NEXT_PUBLIC_` variable.

## Testing and CI

| Command | What it checks |
| --- | --- |
| `npm run lint` | ESLint with the Next.js config |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Market adapters, route handlers, catalog provenance, explorer and comparison logic, with mocked providers. Tests transpile TypeScript without type checking, so run `typecheck` too. |
| `npm run build` | Production build |
| `npm run test:smoke` | All content routes, review disclosures, simulated market routes, and share-preview metadata against a temporary production server |
| `npm run test:browser` | Playwright interaction suite against a production server on port 3101 |

Build before running the smoke or browser suites. Install the browser once with `npx playwright install chromium` (set `PLAYWRIGHT_SKIP_BROWSER_GC=1` to keep other cached browsers). The browser suite blocks external requests and serves fixture APIs. It covers search, filters, shareable views, custom blends, comparisons, menu breakpoints, anchor stability while quotes load, chart recovery, and quote polling.

[GitHub Actions](.github/workflows/ci.yml) runs lint, tests, build, typecheck, smoke tests, and the Chromium suite on every push and pull request. A separate job audits the full dependency tree and runs every Monday at 01:00 UTC.

## Project structure

```text
app/              Routes: home, asset and category pages, /compare, API handlers, share images
components/       UI components: research desk, cards, charts, ticker, live market provider
lib/              Catalog (assets, categories), explorer and comparison logic, market adapters
public/logos/     Asset logos with provenance records
tests/            Node unit and smoke tests; tests/browser holds the Playwright suite
tools/            Log summarizer and the scoped ESLint glob adapter
docs/             Design notes, reviews, and operational guides
```

## Documentation

| Guide | Covers |
| --- | --- |
| [Quality and provenance](docs/quality-and-provenance.md) | Editing research records, review metadata, and diagnosing fallbacks |
| [Shareable research views](docs/shareable-views.md) | URL parameters, history behavior, and the custom blend |
| [Share previews](docs/share-previews.md) | Preview image routes, caching, and metadata |
| [Asset comparison](docs/asset-comparison.md) | Comparison design and verification |
| [Dependency advisory](docs/security/dependency-advisory.md) | Dependency remediation and the remaining security limitation |

## Disclaimer

Goldirham Insight is an educational research and demonstration project. **Nothing here is financial advice**, a recommendation, or an offer to buy or sell any security or digital asset. Scores and theses are editorial opinions for illustration, and prices may be simulated where live feeds are unavailable. Always do your own research and consult a licensed advisor before investing.

© 2026 Goldirham Insight
