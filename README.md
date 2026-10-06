# Goldirham Insight

**AI-era investment research with source-labeled market data.**

Goldirham Insight is an educational research and demonstration platform that tracks the companies and assets powering the AI build-out. It combines deep-dive theses, a consistent 3-factor scoring model, and market or simulated prices across five categories. Each quote and chart identifies its source.

🔗 **Live site:** https://goldirham-insight.vercel.app//

---

## What it does

Every asset — from a regulated utility to a volatile token — is scored on the same three factors so very different opportunities can be compared like-for-like:

- **Upside** — return potential if the thesis plays out
- **Safety** — resilience to drawdowns (balance sheet, business model, volatility)
- **AI exposure** — how structurally tied the asset is to the AI build-out

Each asset also gets a full written thesis, a tier rating, a price quote, and a historical chart.

## Categories

| Category | Assets | Focus |
|---|---|---|
| **AI Utilities** | 6 | Power the buildout — nuclear, gas & renewable operators signing deals with hyperscalers |
| **AI Companies** | 12 | Compute & intelligence — GPUs, foundries, HBM memory, analytics platforms |
| **Mega Stocks** | 8 | Trillion-dollar compounders turning AI into durable earnings growth |
| **AI & Growth ETFs** | 4 | One-ticket thematic exposure without single-stock risk |
| **Crypto** | 5 | Bitcoin, Ethereum, and decentralised-compute tokens |

**26 researched assets · 5 categories · source-labeled data · 3-factor scoring model**

## Data sources

- **Crypto:** CoinGecko
- **Stocks:** Finnhub (simulated where live feeds are unavailable)
- **Charts:** TradingView Lightweight Charts

Stock and ETF chart history, card sparklines, and fallback quotes are simulated
illustrations, not actual market history. Crypto chart history comes from CoinGecko
when available. Historical charts keep their own source data; current quotes do not
overwrite past chart points.

External data requests time out after five seconds and use the existing simulated
fallback. Quote polling waits six seconds after each completed request. If the
quote endpoint fails, the UI marks retained prices as stale and retries
automatically. Chart failures and empty results show an explicit retry action.

## Tech

Deployed on Vercel.

Styles use Tailwind CSS 4.3.3 with its PostCSS plugin and the existing theme in
`tailwind.config.ts`. Supported browsers are Safari 16.4+, Chrome 111+ and Firefox
128+, following [Tailwind's browser requirements](https://tailwindcss.com/docs/upgrade-guide#browser-requirements).

The interface follows the supplied research-desk design: a cool gray canvas,
green accents, interactive research radar, and dark framework panels.
Inter and JetBrains Mono are bundled locally in `app/fonts/` with their licenses,
so builds do not depend on Google Fonts being reachable.
The research library supports company/ticker search, category filters (including
cross-listed assets), and ranking by upside, safety, or AI exposure, plus Tier 1 and crypto filters.
The radar and framework scorecard switch between researched assets. The desk feed
uses source-labeled quotes, and the market ticker includes a pause control. Header search opens
asset research directly; type a name or ticker and press Enter, or select a result.
Charts use the existing open-source
[TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts)
dependency. The redesign adds no new runtime dependencies.

All 26 assets have local brand logos in `public/logos/`, reused across cards,
search, the ticker, radar, scorecards, and research headers. Logo provenance is
recorded in `public/logos/README.md` and `public/logos/sources.json`.

## Local development and verification

Use Node.js 22. On this Windows workspace, enable it with
`& 'E:\Workspace\Project\Use-Node22.ps1'`, then run:

```powershell
npm.cmd ci
npm.cmd run dev
```

No API keys are required. Optional server-only keys are documented in `.env.example`;
put your own values in `.env.local`. `COINGECKO_API_KEY` supports a Demo key only.
Do not use a Pro key with the public API host. Never expose these keys through
`NEXT_PUBLIC_` variables.

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:smoke
npm.cmd start
```

The Node test suite runs the actual TypeScript market adapters and route handlers
with mocked provider responses. It adds no test dependencies, uses no real API keys,
and covers malformed data, simulation fallbacks, cache concurrency and expiry,
duplicate symbols, quote timestamps, credential transport, and chart responses.
TypeScript checking remains a separate step because the test loader only transpiles.
The smoke test starts and stops its own production server on a temporary loopback
port. It checks all content routes, review disclosures and simulated market routes
without provider keys or external market-data calls. Build before running it.
Exercise search, filters, navigation, and chart ranges in the browser after UI changes.

The GitHub Actions workflow in `.github/workflows/ci.yml` runs lint, regression tests,
build, typecheck and smoke tests. A separate dependency-audit job checks the full
dependency tree and preserves audit JSON as an artifact. Both full and production
audits pass after the Tailwind migration and scoped Next ESLint glob replacement.
Required branch checks must still be configured separately on GitHub.

Market adapters validate provider values before caching them. Quote `updatedAt`
is the provider timestamp in milliseconds; the response `ts` is the API response time.
Cache misses share an in-flight request within one server process. Failures use
the same short TTL (quotes: 10–12 seconds; charts: 30 seconds), then retry. This can
delay recovery briefly and does not enforce an account-wide provider quota across
multiple server instances. Source labels continue to distinguish market and simulated data.

Asset pages show quote observation times in UTC. Simulated quotes display their
generation time and an explicit illustration label. Provider delays and closed
markets are not inferred from quote age alone.

Every thesis has a research record. Catalog entries without recorded review
metadata display **Not reviewed**; no authors, dates or citations are fabricated.
The optional `Asset.research` field holds a reviewer, actual review date, supporting
HTTPS sources and the reasoning behind all three scores. Catalog tests check that
recorded reviews are complete. See [the quality and provenance guide](docs/quality-and-provenance.md)
for editing and operational instructions, and [the dependency remediation record](docs/security/dependency-advisory.md)
for the remaining security limitation.

## Disclaimer

Goldirham Insight is an educational research and demonstration project. **Nothing here is financial advice**, a recommendation, or an offer to buy or sell any security or digital asset. Scores and theses are editorial opinions for illustration. Prices may be simulated where live feeds are unavailable. Always do your own research and consult a licensed advisor before investing.

© 2026 Goldirham Insight
