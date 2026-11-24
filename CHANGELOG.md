# Changelog

Notable changes to Goldirham Insight. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.2] - 2026-11-24

### Fixed

- Stock quotes no longer fall back to simulation because Finnhub rejects requests with HTTP 429. Finnhub allows 30 calls a second per account, and each server instance used to send up to 30 quote requests at once when it started. Each instance now starts at most five a second. Right after a server starts, the first poll shows 5 live stock quotes instead of 30, and all 145 are live within about four and a half minutes.

## [1.0.1] - 2026-11-23

### Fixed

- Feed status no longer marks every stock "Older than expected. Possibly a trading halt" for the first 30 minutes of a NYSE session. Until a stock's first trade of the day arrives, its last price reads "Market just opened. Last price is the previous close."

### Changed

- Simulated price history is drawn as percent change from its first point instead of on a dollar axis. A simulated path ends at a static seed price, which could contradict the observed price in the page header (NVDA showed $125.53 above a chart ending at $178.00). Charts of observed CoinGecko history keep the dollar axis.
- "Today's largest moves" states how many observed quotes it ranks, for example "Ranked across 111 observed quotes of 234 assets." Finnhub quotes rotate through the catalog over about four minutes after a server starts, so the ranking covers part of the catalog until the rotation completes.

## [1.0.0] - 2026-11-09

First tagged release: the version in production before 1.0.1, at commit `54effd8`.

[1.0.2]: https://github.com/ixtaqq/Goldirham-Insight/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/ixtaqq/Goldirham-Insight/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ixtaqq/Goldirham-Insight/releases/tag/v1.0.0
