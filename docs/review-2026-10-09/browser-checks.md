# Browser checks

Tested the local production build on 127.0.0.1:3100 with optional provider keys
blank. Crypto requests may use CoinGecko's public endpoint. No paid data path was
used. Browser observations came from the Codex in-app browser.

| Scenario | Before | After |
| --- | --- | --- |
| Open menu at 900px | expanded=true, panelDisplay=none | expanded=true, panelDisplay=block, visible search |
| Search NVDA, Escape, type BTC without blur | resultsAfterEscape=false | resultsAfterEscape=true |
| Search NVDA, Enter, type AMD | Source indicated same state risk | Navigated to /asset/NVDA; resultsAfterNavigation=true |
| Open menu at 850px | Not recorded | One visible search field |
| Navigation at 1001px | Not recorded | Desktop search visible; menu toggle hidden |
| Switch NVDA chart to 1D | Not recorded | aria-pressed=true; labeled simulated 1D chart visible |

The first screenshot, tablet-menu.png, captured stale visual content despite the
updated DOM. It is retained but is not proof of the menu fix. The second capture,
verified-tablet-menu.png, visibly shows the expanded menu and AMD result. The DOM
also measured the panel as display:block with height 122.1875px. Temporary viewport
overrides were reset after verification.

A screenshot attempt initially closed an already open menu and then timed out
looking for its search field. Inspecting the current state and reopening the menu
resolved this automation error. This was not an application failure.
