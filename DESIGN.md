# Design system: Specimen & Seal

Goldirham Insight's interface borrows from modern security printing. Its one idea is
provenance you can see: every figure shows what it is before anyone reads its label.

| Mark | Meaning | Implementation |
| --- | --- | --- |
| Solid figure | Observed quote (CoinGecko, Finnhub) | `.quote-figure` |
| Hatched figure | Simulated price; never market data | `.quote-figure[data-source="simulated"]` |
| "Simulated" overprint | Simulated price history | `.chart-canvas[data-source="simulated"]` |
| Dashed seal | Thesis not reviewed | `.research-status[data-review="unreviewed"]` |
| Solid seal | Reviewed: named reviewer, date, sources, three rationales | `.research-status[data-review="reviewed"]` |
| Denomination ink | The asset's primary theme, named in text | `[data-denom="<category slug>"]` |

Only show the solid seal for a record that meets the `Asset.research` rules in `AGENTS.md`.

## Colour

All tokens live in `app/globals.css` as OKLCH. The site is monochrome: white paper, black ink
and neutral greys, whatever the visitor's system setting. Green and red are the only hues, and
they mean price direction. Components never branch on theme.

| Role | Tokens |
| --- | --- |
| Ground and surfaces | `--paper`, `--paper-raised`, `--paper-sunken` |
| Text | `--ink` (primary), `--ink-2` (secondary), `--ink-3` (meta, ≥4.5:1 on every surface) |
| Lines | `--rule`, `--rule-strong` |
| Ink band (ticker, framework) | `--band`, `--band-ink`, `--band-ink-2`, `--band-rule` |
| Market direction | `--gain`, `--gain-tint`, `--loss`, `--loss-tint` |
| Seal and simulated status (grey and black despite the name) | `--gold`, `--gold-ink` |
| Themes | `--denom`, `--denom-tint`, `--denom-deep`, the same ink for every theme |

Scores are drawn in black ink and never tinted good or bad.

Mix colours with `transparent` in sRGB, not OKLCH. Chromium shifts the hue toward red otherwise.

## Type

- **Manrope** (variable 200–800) for everything, including figures with `tabular-nums`.
- **JetBrains Mono** only for codes: tickers (`.ticker`) and the search shortcut hint.
- Scale: `--text-micro` 12px (floor for any functional text), `--text-meta` 13, `--text-ui` 14,
  `--text-body` 16, `--text-lead` 18. Section titles use `clamp(1.75rem, …, 2.5rem)`; the hero
  title is the only display size.
- Tracking never tighter than -0.035em. Prose measure stays at or under 64ch.
- No eyebrow or kicker labels above headings, and no numbered section labels.

## Space and shape

4px base. Radii: `--radius-xs` 4, `-sm` 7, `-md` 10, `-lg` 14, `-pill`. Containers are
`.container-x` (1200px plus `--gutter`). Cards have a hairline edge and only gain a short
offset shadow on hover; panels use a double hairline frame instead of a wide shadow.

## Motion

Tokens: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`; durations 120 / 180 / 260 / 420 / 700ms.

- **Focal moment:** the hero rosette (`GuillocheField`) blooms from the centre once, then two
  canvas layers counter-rotate (320s and 460s) for a slow moiré. It pauses off screen.
- **State only, everywhere else:** score bars scale to new values, the seal re-stamps when the
  featured asset changes, observed prices flash on a real move (`usePriceTick`; simulated
  prices never flash), and the research desk re-deals with a capped 30ms stagger after a
  ranking or filter change. Typing and blend steps update in place.
- Animate `transform`, `opacity`, colour and `clip-path`; no layout properties.
- `prefers-reduced-motion`: no rotation, bloom, stagger or hover lift; colour and opacity
  feedback stay.

## Layout rules

- One-column grids declare `minmax(0, 1fr)` so truncated (`nowrap`) text cannot widen the page.
- Cards keep the score triad as their lead element; price is secondary and always labelled.
- Rows that can load late (feed, ticker, quotes) hold a fixed height so `#markets` anchors do
  not shift.
