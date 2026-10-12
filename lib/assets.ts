import type { Asset, CategorySlug } from "./types";
import { mergeCatalog } from "./catalog";

/**
 * Curated research universe for Goldirham.
 *
 * Editorial, educational research — NOT investment advice. Prices are seeds
 * for the live feed; crypto is overridden with real CoinGecko data at runtime.
 */
const RESEARCH_ASSETS: Asset[] = [
  // ───────────────────────────── AI UTILITIES ─────────────────────────────
  {
    symbol: "CEG",
    name: "Constellation Energy",
    assetClass: "stock",
    category: "ai-utilities",
    tier: 1,
    tierLabel: "Tier 1 — Core AI Utility Compounder",
    theme: "Nuclear baseload AI power king",
    tagline: "The largest US fleet of carbon-free nuclear, contracted to hyperscalers.",
    entryRange: "15–20x forward earnings",
    valuationNotes: [
      "Fair entry range: 15–20x forward earnings",
      "Best accumulation zones historically: pullbacks to pre-breakout consolidation",
    ],
    whyItWins: [
      "Structural shortage of always-on nuclear power",
      "AI requires 24/7 carbon-free electricity — nuclear is the premium product",
      "Premium pricing power vs. ordinary grid electricity",
      "Long-term contracted deals with Microsoft / Meta ecosystem",
    ],
    stage: "Already re-rated BUT not fully priced in — still a mid-cycle compounder.",
    risks: [
      "Regulatory and licensing timelines on uprates / restarts",
      "Power-price normalisation if the AI capex cycle cools",
      "Rich valuation leaves little room for execution slips",
    ],
    scores: { upside: 7.5, safety: 9, aiExposure: 10 },
    basePrice: 322,
    vol: 0.4,
    accent: "#22d39a",
    article: `## The thesis in one line
Artificial intelligence is, before anything else, an **electricity problem** — and Constellation owns the most valuable kind of electrons on the grid.

## Why nuclear is the premium AI fuel
Training and serving frontier models requires power that is **always on, carbon-free and co-locatable**. Solar and wind are cheap but intermittent; gas is dispatchable but carries carbon. Nuclear is the rare asset that is simultaneously baseload, zero-carbon and high-density. As the largest operator of US nuclear capacity, Constellation sells exactly the product hyperscalers are scrambling to lock up for the next two decades.

## The contract machine
The landmark deal to restart Three Mile Island Unit 1 for Microsoft re-rated how the market values nuclear cash flows: from a sleepy regulated yield into a **contracted growth asset**. Twenty-year power purchase agreements convert volatile merchant power into bond-like, inflation-protected revenue — the kind of visibility that justifies a higher multiple.

## What you are actually buying
- A **structural shortage**: you cannot permit and build new nuclear quickly, so the existing fleet commands scarcity pricing.
- **Pricing power**: AI customers will pay a premium for clean, reliable, co-located power.
- **Optionality**: uprates, restarts and new SMR partnerships are all free call options on top of the base business.

## Stage of the cycle
CEG has already re-rated off its lows — this is no longer a hidden idea. But with multi-decade demand visibility and a contract pipeline still being signed, it reads as a **mid-cycle compounder** rather than a finished trade. The historically best entries have come on pullbacks into prior consolidation zones, not on breakouts.

## Scorecard
Upside **7.5/10** · Safety **9/10** · AI exposure **10/10**. The lowest-risk way to own the AI power theme.`,
  },
  {
    symbol: "VST",
    name: "Vistra",
    assetClass: "stock",
    category: "ai-utilities",
    tier: 1,
    tierLabel: "Tier 1 — Core AI Utility Compounder",
    theme: "Hybrid nuclear + gas + trading optionality",
    tagline: "Merchant power with leveraged exposure to PJM and Texas AI load growth.",
    entryRange: "12–16x forward earnings",
    valuationNotes: [
      "Attractive when: 12–16x forward earnings",
      "Volatility creates frequent entry points",
    ],
    whyItWins: [
      "Direct beneficiary of grid scarcity pricing",
      "Optionality = pricing spikes in tight power markets",
      "Heavy exposure to PJM + Texas (ERCOT) AI load growth",
      "Merchant power model captures upside contracted peers give away",
    ],
    stage: "Partially priced in but still cyclical → opportunity exists.",
    risks: [
      "Merchant exposure cuts both ways — weak power prices hurt",
      "Higher beta and sharper drawdowns than regulated peers",
      "Commodity and weather sensitivity",
    ],
    scores: { upside: 8.5, safety: 7, aiExposure: 9 },
    basePrice: 176,
    vol: 0.5,
    accent: "#22d39a",
    article: `## The thesis in one line
Vistra is the **highest-torque** way to own tightening US power markets — a merchant fleet that keeps the upside its regulated peers are forced to give away.

## Merchant model = leverage to scarcity
Regulated utilities earn a fixed return on capital; merchant generators sell into the spot and forward markets. When AI data centres tighten supply in **PJM and Texas (ERCOT)**, prices spike — and Vistra captures that directly. Its acquisition of Energy Harbor bolted a nuclear fleet onto its gas portfolio, giving it both baseload clean power and dispatchable peakers.

## Why the optionality matters
Power markets are non-linear. A few hundred hours of scarcity pricing each year can drive a disproportionate share of annual profit. As reserve margins shrink, the **value of optionality rises** — every new data centre interconnection request is, in effect, a bid for Vistra's output.

## The trade-off
This is a **cyclical, higher-beta** name. The same merchant exposure that powers the upside makes drawdowns sharper when power prices soften or weather is mild. That is precisely why volatility "creates frequent entry points": patient buyers get repeated chances in the 12–16x forward-earnings zone.

## Stage of the cycle
Partially priced in, still cyclical — the opportunity is to use the swings rather than chase strength. Pair it with a regulated name like CEG or NEE to balance the book.

## Scorecard
Upside **8.5/10** · Safety **7/10** · AI exposure **9/10**. Own it for the upside; size it for the volatility.`,
  },
  {
    symbol: "NEE",
    name: "NextEra Energy",
    assetClass: "stock",
    category: "ai-utilities",
    tier: 1,
    tierLabel: "Tier 1 — Core AI Utility Compounder",
    theme: "Renewable + regulated AI grid-scale leader",
    tagline: "The largest US clean-energy developer — a steady compounder with a fortress profile.",
    entryRange: "16–20x forward earnings",
    valuationNotes: [
      "Attractive at 16–20x earnings",
      "Often trades a premium due to its defensive profile",
    ],
    whyItWins: [
      "Largest clean-energy developer in the US",
      "AI needs both clean AND scale energy — NEE delivers both",
      "Massive renewable + storage development pipeline",
      "Regulated Florida utility (FPL) provides a stable earnings core",
    ],
    stage: "More a steady compounder than an explosive re-rating story.",
    risks: [
      "Rate-sensitive — higher-for-longer rates pressure the multiple",
      "Renewable returns depend on tax-credit policy",
      "Slower upside than merchant peers",
    ],
    scores: { upside: 6.5, safety: 10, aiExposure: 7.5 },
    basePrice: 78,
    vol: 0.3,
    accent: "#22d39a",
    article: `## The thesis in one line
NextEra is the **sleep-at-night** way to own the energy build-out — a regulated utility wrapped around the largest renewables developer in America.

## Two engines, one stock
NEE is really two businesses. **Florida Power & Light** is a best-in-class regulated utility delivering predictable, rate-base-driven earnings. **NextEra Energy Resources** is the country's biggest developer of wind, solar and battery storage. AI doesn't only need clean power — it needs *scale*, fast — and no one builds gigawatts faster than NEE.

## Why scale is the moat
Interconnection queues, supply chains and financing all reward the largest player. NextEra's pipeline of renewables-plus-storage lets it sign data-centre supply deals that smaller developers simply cannot underwrite. Storage, in particular, turns intermittent renewables into something closer to the firm, around-the-clock power AI demands.

## The honest trade-off
This is a **compounder, not a rocket**. NEE typically trades at a premium because of its defensive profile, and it is more rate-sensitive than merchant peers — higher-for-longer interest rates pressure the multiple and the cost of its growth capital. You are buying durability and a growing dividend, not a violent re-rating.

## Stage of the cycle
Steady. Use it as the **anchor** of an AI-utility sleeve, balancing the cyclicality of names like Vistra.

## Scorecard
Upside **6.5/10** · Safety **10/10** · AI exposure **7.5/10**. The defensive backbone of the theme.`,
  },
  {
    symbol: "AES",
    name: "AES Corporation",
    assetClass: "stock",
    category: "ai-utilities",
    tier: 2,
    tierLabel: "Tier 2 — Higher Upside / Moderate Safety",
    theme: "Hyperscaler contract machine",
    tagline: "A pure-play 'build power for the AI customer' model with direct hyperscaler integration.",
    entryRange: "10–14x forward earnings",
    valuationNotes: [
      "10–14x forward earnings is the typical attractiveness zone",
      "Cheaper multiple than Tier 1 peers reflects higher leverage",
    ],
    whyItWins: [
      "9+ GW contracted with hyperscalers (Google, etc.)",
      "Co-located generation model = an AI-native utility",
      "Pure-play 'build power for AI customer' business",
      "Direct hyperscaler integration de-risks demand",
    ],
    stage: "Undervalued relative to its contract pipeline → still early cycle.",
    risks: [
      "Higher balance-sheet leverage than Tier 1 names",
      "Emerging-market exposure adds FX and political risk",
      "Execution risk on a large development backlog",
    ],
    scores: { upside: 8, safety: 7, aiExposure: 9 },
    basePrice: 16.4,
    vol: 0.45,
    accent: "#598bff",
    article: `## The thesis in one line
AES has quietly become a **hyperscaler contract machine** — building generation specifically, and contractually, for the world's biggest AI buyers.

## The co-located model
Most utilities sell power into a shared grid. AES increasingly **co-locates generation with the customer**, signing renewables-plus-storage deals dedicated to a single hyperscaler's data-centre campus. That makes it function like an *AI-native utility*: demand is contracted before the steel goes in the ground. The company has signalled **9+ GW** of capacity tied to large technology customers including Google.

## Why the market may be mispricing it
AES trades at a **lower multiple** than Tier 1 peers — partly fair (more leverage, more emerging-market exposure) and partly opportunity. If you believe the contracted pipeline converts on schedule, the current valuation under-credits a multi-year backlog of de-risked, take-or-pay-style revenue. That gap between *pipeline* and *price* is the whole bull case.

## The risks you're paid to take
Higher financial leverage amplifies both returns and stress. International operations add currency and political risk. And a large development backlog is only as good as its execution. This is a **Tier 2** name for a reason — more upside, less margin for error.

## Stage of the cycle
Early relative to the contract book. The re-rating happens as signed gigawatts turn into reported cash flow.

## Scorecard
Upside **8/10** · Safety **7/10** · AI exposure **9/10**. The contrarian's AI-power pick.`,
  },
  {
    symbol: "NI",
    name: "NiSource",
    assetClass: "stock",
    category: "ai-utilities",
    tier: 2,
    tierLabel: "Tier 2 — Higher Upside / Moderate Safety",
    theme: "Regulated utility quietly signing AI deals",
    tagline: "A mid-cap regulated utility landing Alphabet + Amazon data-centre load.",
    entryRange: "14–18x forward earnings",
    valuationNotes: [
      "Mid-cap regulated multiple, typically 14–18x",
      "Re-rates as data-centre load is added to the rate base",
    ],
    whyItWins: [
      "Signed data-centre contracts with Alphabet + Amazon",
      "Regulated model converts AI load into rate-base growth",
      "Mid-cap = more room to surprise than mega-cap utilities",
      "Constructive regulatory geographies (Indiana / Midwest)",
    ],
    stage: "Mid-cap re-rating story as AI load lifts the capital plan.",
    risks: [
      "Smaller and less liquid than Tier 1 utilities",
      "Execution risk on an expanding capex plan",
      "Rate-case and regulatory dependency",
    ],
    scores: { upside: 7, safety: 8, aiExposure: 7.5 },
    basePrice: 38.5,
    vol: 0.32,
    accent: "#598bff",
    article: `## The thesis in one line
NiSource is the **quiet** AI-utility story: a regulated Midwest utility turning hyperscaler data-centre demand into a bigger, faster-growing rate base.

## How regulated utilities win from AI
A regulated utility earns a return on the capital it invests ("rate base"). When **Alphabet and Amazon** sign up to build data centres in your service territory, you get to invest in the poles, wires and substations to serve them — and earn a regulated return on every dollar. AI load doesn't just raise revenue; it **expands the capital plan**, which compounds earnings for years.

## Why mid-cap matters here
A few hundred megawatts of new data-centre load barely moves a mega-cap utility. For a **mid-cap** like NiSource, the same load is needle-moving — it can meaningfully lift the growth rate. Smaller names have more room to surprise to the upside as contracts are announced and capex guidance is raised.

## The safety wrapper
Because the model is regulated, NiSource carries **less commodity risk** than merchant names like Vistra. You give up some explosive upside in exchange for visibility and a defendable earnings base in constructive regulatory jurisdictions.

## The trade-off
It is smaller and less liquid, and the story depends on a growing capex plan being approved in rate cases. Execution and regulatory outcomes are the swing factors.

## Stage of the cycle
A re-rating in progress — repriced higher each time AI load is formally added to the plan.

## Scorecard
Upside **7/10** · Safety **8/10** · AI exposure **7.5/10**. Regulated safety with a growth kicker.`,
  },

  // ───────────────────────────── AI COMPANIES ─────────────────────────────
  {
    symbol: "NVDA",
    name: "NVIDIA",
    coingeckoId: undefined,
    assetClass: "stock",
    category: "ai-companies",
    alsoIn: ["mega-stocks"],
    tier: 1,
    tierLabel: "Tier 1 — The AI Compute Standard",
    theme: "The platform every AI model runs on",
    tagline: "GPUs, CUDA, networking and software — the full-stack toll road for AI compute.",
    entryRange: "25–35x forward earnings",
    valuationNotes: [
      "Premium multiple justified by data-centre growth",
      "Best entries historically on broad market or capex-scare pullbacks",
    ],
    whyItWins: [
      "CUDA software moat locks in developers and frameworks",
      "Owns compute AND networking (NVLink, Spectrum, InfiniBand)",
      "Annual product cadence keeps competitors a generation behind",
      "~80%+ share of AI training accelerators",
    ],
    stage: "Cycle leader; debate is about durability of data-centre capex, not direction.",
    risks: [
      "Customer concentration — a few hyperscalers drive most revenue",
      "Custom silicon (in-house ASICs) chips away at the long-term moat",
      "Any AI-capex 'digestion' phase hits the multiple hard",
    ],
    scores: { upside: 8, safety: 7.5, aiExposure: 10 },
    basePrice: 178,
    vol: 0.5,
    accent: "#598bff",
    article: `## The thesis in one line
NVIDIA is the **toll road of artificial intelligence** — almost every frontier model is trained and served on its hardware and software stack.

## The real moat is software
It is tempting to see NVIDIA as a chip company. The durable advantage is **CUDA** — the software layer that two decades of developers, libraries and frameworks have been built on top of. Competitors can match a transistor count; they cannot easily replicate the ecosystem. On top of that, NVIDIA owns the **networking** (NVLink, InfiniBand, Spectrum-X) that stitches thousands of GPUs into a single training cluster. It sells the *system*, not just the silicon.

## Why it keeps winning
- An **annual cadence** (Hopper → Blackwell → next) keeps rivals a generation behind.
- **Full-stack integration** means performance-per-watt advantages compound at the data-centre level.
- Dominant share of AI **training** accelerators gives pricing power funding the next R&D cycle.

## The honest risks
Revenue is **concentrated** in a handful of hyperscalers, several of which are designing their own in-house ASICs to reduce dependence. The biggest swing factor is the **durability of data-centre capex**: if the hyperscalers enter a digestion phase, a premium-multiple stock corrects fast. The bull case isn't that there are no risks — it's that demand visibility still outruns them.

## Stage of the cycle
The undisputed leader. The market debate is no longer *whether* NVIDIA dominates, but *how long* the capex super-cycle runs. Historically the best entries came on broad-market or capex-scare pullbacks, not on breakouts.

## Scorecard
Upside **8/10** · Safety **7.5/10** · AI exposure **10/10**. The benchmark every other AI investment is measured against.`,
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    assetClass: "stock",
    category: "ai-companies",
    tier: 2,
    tierLabel: "Tier 2 — The Credible Challenger",
    theme: "The #2 GPU merchant with room to take share",
    tagline: "MI-series accelerators give hyperscalers a real second source to NVIDIA.",
    entryRange: "25–35x forward earnings",
    valuationNotes: [
      "Multiple swings with AI-GPU traction quarter to quarter",
      "Cheaper than NVIDIA on a share-gain optionality basis",
    ],
    whyItWins: [
      "Hyperscalers actively want a credible second source",
      "MI300/MI350 accelerators close the hardware gap",
      "Leadership in server CPUs (EPYC) funds the AI push",
      "ROCm software stack improving each release",
    ],
    stage: "Early in its AI-accelerator ramp — optionality, not yet dominance.",
    risks: [
      "Software (ROCm) still trails CUDA in maturity",
      "Execution must be flawless to take share from NVIDIA",
      "Valuation already embeds meaningful AI success",
    ],
    scores: { upside: 8, safety: 6.5, aiExposure: 8.5 },
    basePrice: 166,
    vol: 0.55,
    accent: "#598bff",
    article: `## The thesis in one line
AMD is the **second source** the entire industry wants to exist — and even modest share gains in AI accelerators are worth a fortune.

## Why a #2 matters so much
Hyperscalers do not want to depend on a single supplier for the most strategic component in their capex budget. That structural desire for a **credible alternative** is AMD's opening. Its MI300/MI350-class accelerators have closed much of the hardware gap, and its **EPYC** server CPUs already win share from Intel — throwing off the cash to fund the GPU assault.

## The math of share gains
The AI-accelerator market is enormous. AMD doesn't need to beat NVIDIA; capturing even **low-double-digit share** of a market this large transforms its earnings. That asymmetry — limited need to "win," large reward if it merely participates — is the core of the bull case.

## The gap to close
The honest weakness is **software**. NVIDIA's CUDA is a decade-plus ahead; AMD's ROCm is improving fast but still demands more engineering effort from customers. Until that gap narrows, AMD competes hardest where buyers have the in-house talent to optimise their own stacks.

## Stage of the cycle
**Early** in the accelerator ramp. This is an optionality story: you are buying the probability of share gains, not an established franchise. That means sharper swings around each earnings print.

## Scorecard
Upside **8/10** · Safety **6.5/10** · AI exposure **8.5/10**. The highest-conviction "second horse" in AI compute.`,
  },
  {
    symbol: "AVGO",
    name: "Broadcom",
    assetClass: "stock",
    category: "ai-companies",
    alsoIn: ["mega-stocks"],
    tier: 1,
    tierLabel: "Tier 1 — Custom Silicon & Networking",
    theme: "Custom AI chips + the networking that connects them",
    tagline: "The quiet winner: designs the custom ASICs hyperscalers use to escape NVIDIA.",
    entryRange: "25–32x forward earnings",
    valuationNotes: [
      "Blends high-growth AI with sticky software (VMware)",
      "Dividend + buyback support the valuation",
    ],
    whyItWins: [
      "Designs custom AI accelerators (XPUs) for Google, Meta and others",
      "Dominant in AI data-centre networking silicon",
      "VMware adds recurring, high-margin software revenue",
      "Best-in-class capital returns to shareholders",
    ],
    stage: "Compounding — diversified across AI hardware and enterprise software.",
    risks: [
      "Lumpy custom-silicon revenue tied to a few mega-customers",
      "Integration and debt from large acquisitions",
      "Less 'pure-play' than a merchant GPU vendor",
    ],
    scores: { upside: 7.5, safety: 8, aiExposure: 9 },
    basePrice: 242,
    vol: 0.45,
    accent: "#598bff",
    article: `## The thesis in one line
Broadcom wins **both sides** of the AI-compute debate: when hyperscalers buy NVIDIA, Broadcom sells the networking; when they build their own chips to *avoid* NVIDIA, Broadcom designs those chips too.

## The custom-silicon angle
The biggest cloud players want to reduce dependence on merchant GPUs, so they design **custom accelerators (XPUs)** — and they overwhelmingly partner with Broadcom to do it. That makes Broadcom a beneficiary of the exact trend that threatens NVIDIA's long-term moat. Add its dominant position in **AI data-centre networking** (the switches and SerDes that move data between chips) and Broadcom touches almost every cluster regardless of whose GPU sits inside.

## Diversification is the feature
Unlike a pure GPU vendor, Broadcom blends explosive AI hardware with **sticky enterprise software** (VMware) and a broad semiconductor franchise. The result is a smoother growth profile, fat margins, and the cash flow to fund a generous **dividend and buyback** — capital returns that put a floor under the valuation.

## The risks
Custom-silicon revenue is **lumpy** and concentrated among a few mega-customers, so quarters can be volatile. The VMware acquisition added debt and integration work. And the diversified model means it will never feel as "pure" as owning the GPU leader directly.

## Stage of the cycle
A **compounder** — less about a single product cycle, more about steady share gains across AI hardware and software.

## Scorecard
Upside **7.5/10** · Safety **8/10** · AI exposure **9/10**. The hedged way to own AI compute.`,
  },
  {
    symbol: "TSM",
    name: "Taiwan Semiconductor",
    assetClass: "stock",
    category: "ai-companies",
    tier: 1,
    tierLabel: "Tier 1 — The Foundry Everyone Depends On",
    theme: "The factory that manufactures the AI revolution",
    tagline: "Every leading-edge AI chip — NVIDIA, AMD, Apple, Broadcom — is built here.",
    entryRange: "18–24x forward earnings",
    valuationNotes: [
      "Cheaper multiple than its fabless customers despite owning the bottleneck",
      "Geopolitical discount embedded in the valuation",
    ],
    whyItWins: [
      "Effective monopoly on leading-edge (3nm/2nm) manufacturing",
      "Manufactures for NVIDIA, AMD, Apple, Broadcom — the whole field",
      "Advanced packaging (CoWoS) is a second, scarce bottleneck",
      "Decades of process leadership and yield expertise",
    ],
    stage: "Indispensable — a toll on the entire semiconductor industry.",
    risks: [
      "Taiwan geopolitical risk is the dominant overhang",
      "Cyclical demand swings in the broader chip market",
      "Enormous capex intensity to stay ahead",
    ],
    scores: { upside: 7.5, safety: 7.5, aiExposure: 9.5 },
    basePrice: 206,
    vol: 0.45,
    accent: "#598bff",
    article: `## The thesis in one line
You can argue about which chip designer wins — but they **all** manufacture at TSMC. Own the foundry and you own the bottleneck.

## The ultimate picks-and-shovels
NVIDIA, AMD, Apple, Broadcom and the hyperscalers' custom silicon share one thing: they are **fabless**. The actual leading-edge manufacturing happens at TSMC, which holds an effective monopoly on the most advanced (3nm, 2nm) process nodes. Whoever wins the design wars, TSMC collects the toll. There is no more diversified way to own "AI compute" than owning the factory that prints all of it.

## A second scarce bottleneck
Beyond wafers, AI accelerators need **advanced packaging** (CoWoS) to bond logic and high-bandwidth memory together. Packaging capacity has been a genuine constraint on AI-chip supply — and TSMC dominates it. That gives the company *two* points of leverage over the entire industry's output.

## The discount and the reason
TSMC consistently trades at a **lower multiple** than the fabless designers it enables. The reason is one word: **Taiwan**. The geopolitical overhang is real and won't disappear, which is why diversification into Arizona and Japan fabs matters. For investors who can stomach that tail risk, you are buying the most indispensable company in technology at a discount to its customers.

## Stage of the cycle
Indispensable and compounding — capex-heavy, but every dollar extends a near-monopoly.

## Scorecard
Upside **7.5/10** · Safety **7.5/10** · AI exposure **9.5/10**. The single most irreplaceable link in the AI chain.`,
  },
  {
    symbol: "PLTR",
    name: "Palantir",
    assetClass: "stock",
    category: "ai-companies",
    tier: 3,
    tierLabel: "Tier 3 — High Upside / High Volatility",
    theme: "Turning enterprise AI into deployed software",
    tagline: "AIP puts large language models to work inside governments and enterprises.",
    entryRange: "Valuation-agnostic buyers only",
    valuationNotes: [
      "Trades at an extreme revenue multiple — momentum-driven",
      "Position sizing matters more than entry price",
    ],
    whyItWins: [
      "AIP (AI Platform) operationalises LLMs on real enterprise data",
      "Sticky government + defence contracts provide a base",
      "Rapid US commercial customer growth",
      "Software margins and accelerating free cash flow",
    ],
    stage: "Hyper-growth and hyper-valued — a story stock with real revenue.",
    risks: [
      "Valuation leaves no margin for a growth stumble",
      "High volatility and sentiment sensitivity",
      "Stock-based compensation dilution",
    ],
    scores: { upside: 8.5, safety: 4.5, aiExposure: 9 },
    basePrice: 146,
    vol: 0.7,
    accent: "#a78bfa",
    article: `## The thesis in one line
Palantir is the rare software company turning generative-AI hype into **deployed, paid-for production systems** — at a valuation that demands you respect the risk.

## What AIP actually does
Most enterprises have models but no way to safely point them at their messy, sensitive internal data. Palantir's **AIP (Artificial Intelligence Platform)** is the connective tissue: it lets organisations operationalise LLMs against real operational data with governance, security and an auditable workflow. Its famous "bootcamps" compress sales cycles by getting customers to a working use-case in days.

## Two engines
- **Government & defence**: sticky, long-duration contracts that provide a stable revenue base and credibility.
- **US commercial**: the fast-growing engine, where customer counts and deal sizes have accelerated as AIP lands.

The combination is producing genuine **software margins and accelerating free cash flow** — this is not a pre-revenue story.

## The catch: valuation
Palantir trades at an **extreme multiple** of revenue. The growth is real, but so is the price — there is essentially **no margin for error**. A single soft quarter can trigger a violent de-rating. This is a **Tier 3** position for a reason: own it small, expect turbulence, and treat position sizing as more important than the entry price.

## Stage of the cycle
Hyper-growth, hyper-valued — a momentum-driven story stock backed by accelerating fundamentals. The thesis is binary on execution.

## Scorecard
Upside **8.5/10** · Safety **4.5/10** · AI exposure **9/10**. High reward, high variance — size accordingly.`,
  },
  {
    symbol: "MU",
    name: "Micron Technology",
    assetClass: "stock",
    category: "ai-companies",
    tier: 2,
    tierLabel: "Tier 2 — The Memory Bottleneck",
    theme: "HBM memory is the scarce ingredient in every AI GPU",
    tagline: "High-bandwidth memory demand turns a cyclical commodity into a growth story.",
    entryRange: "Buy the cycle, not the multiple",
    valuationNotes: [
      "Deeply cyclical — earnings multiples mislead at turns",
      "Best bought when sentiment is washed out, sold into euphoria",
    ],
    whyItWins: [
      "HBM (high-bandwidth memory) is sold out and supply-constrained",
      "Every AI accelerator needs stacks of premium memory",
      "Memory pricing inflecting up through the AI cycle",
      "One of only three credible HBM suppliers globally",
    ],
    stage: "Cyclical upswing powered by AI memory demand.",
    risks: [
      "Classic boom-bust memory cycle can reverse hard",
      "Capital intensity and pricing are out of the company's control",
      "Timing the cycle is notoriously difficult",
    ],
    scores: { upside: 8, safety: 5.5, aiExposure: 8 },
    basePrice: 132,
    vol: 0.6,
    accent: "#598bff",
    article: `## The thesis in one line
Every AI GPU is stacked with **high-bandwidth memory** — and HBM is sold out. Micron is one of just three companies on earth that can make it.

## Why memory became a growth story
Memory has always been a brutal commodity cycle. AI changed the mix. Modern accelerators need **HBM** — expensive, hard-to-manufacture stacks of DRAM bonded right next to the logic die. Demand has run ahead of supply, HBM capacity is **booked out**, and that scarcity is dragging the *entire* memory market's pricing higher. A commodity business suddenly has a premium, supply-constrained product at its centre.

## The oligopoly
There are effectively **three** credible HBM suppliers worldwide. That concentration gives the survivors real pricing leverage during an up-cycle — a very different dynamic from the cut-throat commodity DRAM of the past.

## Respect the cycle
Here is the discipline this name demands: memory is **deeply cyclical**, and reported P/E ratios are misleading at the turns (the multiple looks "expensive" at the bottom and "cheap" at the top — the opposite of intuition). The right mental model is to **buy when sentiment is washed out and supply is being cut**, and to take profits into euphoria. Get the cycle right and the returns are spectacular; get it wrong and the drawdowns are severe.

## Stage of the cycle
A cyclical **upswing** driven by AI memory demand. The debate is about how long the up-cycle runs before supply catches up.

## Scorecard
Upside **8/10** · Safety **5.5/10** · AI exposure **8/10**. A cyclical bet on the scarcest ingredient in AI hardware.`,
  },

  // ───────────────────────────── MEGA STOCKS ─────────────────────────────
  {
    symbol: "MSFT",
    name: "Microsoft",
    assetClass: "stock",
    category: "mega-stocks",
    alsoIn: ["ai-companies"],
    tier: 1,
    tierLabel: "Tier 1 — Core AI Platform Compounder",
    theme: "Enterprise AI distribution at planetary scale",
    tagline: "Azure + OpenAI + Copilot — AI monetisation across the entire software stack.",
    entryRange: "28–34x forward earnings",
    valuationNotes: [
      "Premium multiple for durable, high-quality growth",
      "Best entries on market-wide pullbacks, not company-specific weakness",
    ],
    whyItWins: [
      "Azure is the on-ramp for enterprise AI workloads",
      "Deep OpenAI partnership and first-party models",
      "Copilot monetises AI across Office, GitHub and Windows",
      "Fortress balance sheet and recurring revenue base",
    ],
    stage: "Core compounder — AI is an accelerant on an already-great business.",
    risks: [
      "Heavy AI capex pressures near-term margins",
      "Cloud growth deceleration would hit the multiple",
      "Big-tech regulatory scrutiny",
    ],
    scores: { upside: 7, safety: 9.5, aiExposure: 9 },
    basePrice: 476,
    vol: 0.28,
    accent: "#f5b945",
    article: `## The thesis in one line
Microsoft has the **widest distribution** in enterprise software — and it is wiring AI into every product a billion knowledge workers already use.

## Three monetisation layers
1. **Azure** — the cloud platform where enterprises run AI workloads. Every model trained or served in Azure is consumption revenue, and AI is now a measurable driver of Azure growth.
2. **Models** — a deep partnership with OpenAI plus first-party models give Microsoft frontier capability without betting the company on any single lab.
3. **Copilot** — AI assistants embedded across Office, GitHub, Windows and Dynamics. This is the per-seat upsell layer: turning AI into recurring subscription revenue across an installed base no competitor can match.

## Why it's a "sleep well" compounder
Microsoft pairs the AI growth option with a **fortress balance sheet**, enormous recurring revenue, and some of the best margins in software. AI here is an **accelerant on an already-excellent business**, not a bet-the-farm pivot. That is why it anchors so many core portfolios.

## The honest risks
The AI build-out is **capital-intensive** — surging capex pressures near-term free-cash-flow margins, and the market watches Azure's growth rate like a hawk; any deceleration pressures a premium multiple. Big-tech regulatory scrutiny is a persistent background risk.

## Stage of the cycle
A **core compounder**. You're not buying a re-rating; you're buying durable mid-teens growth with an AI tailwind and very little chance of permanent capital loss.

## Scorecard
Upside **7/10** · Safety **9.5/10** · AI exposure **9/10**. The lowest-drama way to own enterprise AI.`,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    assetClass: "stock",
    category: "mega-stocks",
    alsoIn: ["ai-companies"],
    tier: 1,
    tierLabel: "Tier 1 — Full-Stack AI at a Reasonable Price",
    theme: "Owns the models, the chips, the cloud and the data",
    tagline: "Gemini, TPUs, DeepMind and Search — the most vertically integrated AI player.",
    entryRange: "20–26x forward earnings",
    valuationNotes: [
      "Often the cheapest mega-cap relative to its AI assets",
      "Search-disruption fear creates recurring entry points",
    ],
    whyItWins: [
      "Full stack: Gemini models, custom TPUs, Google Cloud, DeepMind",
      "Unmatched proprietary data and distribution (Search, YouTube, Android)",
      "TPUs reduce reliance on merchant GPUs",
      "Cloud growing and inflecting to profitability",
    ],
    stage: "Re-rating as the market re-prices it from 'Search risk' to 'AI winner'.",
    risks: [
      "Generative AI could disrupt the core Search ad model",
      "Regulatory and antitrust overhang",
      "Capex intensity competing with NVIDIA-class buildouts",
    ],
    scores: { upside: 7.5, safety: 9, aiExposure: 9 },
    basePrice: 186,
    vol: 0.32,
    accent: "#f5b945",
    article: `## The thesis in one line
Alphabet is the most **vertically integrated** company in AI — it owns the research lab, the models, the chips, the cloud and the data — and it often trades at the **cheapest** multiple of the mega-caps.

## The full stack, in-house
- **Models**: Gemini, developed by the combined Google DeepMind — frontier-class research under one roof.
- **Silicon**: custom **TPUs** mean Alphabet can train and serve at scale without paying the full NVIDIA tax — a structural cost advantage few rivals have.
- **Cloud**: Google Cloud is growing fast and inflecting to real profitability, the commercial channel for all of the above.
- **Data & distribution**: Search, YouTube, Android, Maps, Gmail — proprietary data and a path to a billion-plus users for any AI feature it ships.

## The fear that creates the opportunity
The bear case is simple: generative AI could **disrupt Search**, the profit engine. That fear is exactly why Alphabet periodically trades at a discount to peers. The bull counter is that Alphabet is *also* the company best positioned to deliver AI-native search and monetise it — it is both the most-threatened and best-armed incumbent. Every time the "Search is dead" narrative flares up, patient buyers get an entry.

## The risks
Genuine Search-disruption risk, a persistent **antitrust** overhang, and the same capex intensity facing all hyperscalers. None of these are trivial — but they are why the valuation stays reasonable.

## Stage of the cycle
A **re-rating** in progress as the market shifts its frame from "Search at risk" to "full-stack AI winner."

## Scorecard
Upside **7.5/10** · Safety **9/10** · AI exposure **9/10**. The best risk-adjusted value among the AI mega-caps.`,
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    assetClass: "stock",
    category: "mega-stocks",
    alsoIn: ["ai-companies"],
    tier: 1,
    tierLabel: "Tier 1 — AI-Monetised Advertising Machine",
    theme: "AI that directly compounds ad revenue",
    tagline: "Recommendation AI lifts engagement and ad pricing across 3B+ users.",
    entryRange: "20–26x forward earnings",
    valuationNotes: [
      "Reasonable multiple for the growth and cash generation",
      "Reality Labs losses create periodic sentiment dips to buy",
    ],
    whyItWins: [
      "AI directly improves ad targeting and content ranking → revenue",
      "3B+ daily users = unmatched distribution for AI features",
      "Llama open-model strategy builds an ecosystem moat",
      "Aggressive buybacks shrink the share count",
    ],
    stage: "Compounding — the clearest line from AI spend to ad dollars.",
    risks: [
      "Massive AI + Reality Labs capex tests investor patience",
      "Ad-market cyclicality",
      "Regulatory and privacy headwinds",
    ],
    scores: { upside: 7.5, safety: 8.5, aiExposure: 8.5 },
    basePrice: 722,
    vol: 0.38,
    accent: "#f5b945",
    article: `## The thesis in one line
Meta has the **shortest, clearest path** from an AI dollar spent to an ad dollar earned — every model improvement immediately lifts engagement and pricing across three billion users.

## AI you can see in the revenue
For most companies, AI ROI is a promise. For Meta it is already in the P&L. Better **recommendation models** keep users scrolling longer (more inventory), and better **ad-ranking models** raise the price of each impression (more yield). With 3B+ daily users across Facebook, Instagram, WhatsApp and Threads, even small percentage gains in engagement or targeting compound into billions in incremental revenue.

## The open-model gambit
Meta's **Llama** strategy — releasing capable open-weight models — is a deliberate ecosystem play. It commoditises the model layer (where rivals hope to charge rent), builds developer goodwill, and ensures the AI world is fluent in Meta's tools. It also means Meta is never hostage to another lab's API.

## Capital discipline
Meta pairs the growth with **aggressive buybacks**, steadily shrinking the share count so per-share earnings grow even faster than the business.

## The risks
The build-out is **expensive**: combined AI infrastructure and Reality Labs spending is enormous, and investors periodically lose patience with the metaverse losses — which is precisely when the stock gets cheap. Add ad-market cyclicality and ever-present privacy/regulatory pressure.

## Stage of the cycle
A **compounder** with the most legible AI-to-revenue story in big tech.

## Scorecard
Upside **7.5/10** · Safety **8.5/10** · AI exposure **8.5/10**. AI monetisation you can already measure.`,
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    assetClass: "stock",
    category: "mega-stocks",
    alsoIn: ["ai-companies"],
    tier: 1,
    tierLabel: "Tier 1 — Cloud + Commerce Re-Acceleration",
    theme: "AWS is the AI cloud; retail margins are inflecting",
    tagline: "The biggest cloud franchise plus a structurally more profitable retail engine.",
    entryRange: "26–34x forward earnings",
    valuationNotes: [
      "Valued on free cash flow as capex normalises",
      "Two profit engines re-accelerating at once",
    ],
    whyItWins: [
      "AWS is the largest cloud — a primary on-ramp for AI workloads",
      "Custom AI silicon (Trainium / Inferentia) lowers cost to serve",
      "Retail margins structurally improving (logistics, ads, automation)",
      "Advertising is a high-margin, fast-growing third engine",
    ],
    stage: "Re-accelerating — AWS AI growth plus rising retail profitability.",
    risks: [
      "AWS growth and AI-capex timing drive the stock",
      "Consumer-spending sensitivity in retail",
      "Heavy investment cycles compress near-term FCF",
    ],
    scores: { upside: 7.5, safety: 8.5, aiExposure: 8 },
    basePrice: 216,
    vol: 0.34,
    accent: "#f5b945",
    article: `## The thesis in one line
Amazon is two compounding stories in one stock: the **largest AI cloud** (AWS) and a retail business whose **margins are structurally inflecting** higher.

## AWS: the AI on-ramp
AWS remains the biggest cloud platform, which makes it a primary destination for enterprise AI workloads. Crucially, Amazon designs its **own AI chips** — Trainium for training, Inferentia for inference — which lowers its cost to serve and lets it offer customers a cheaper alternative to merchant GPUs. In a world where compute cost is the constraint, owning the silicon is a durable edge.

## The retail engine nobody models correctly
The market still thinks of Amazon's retail as low-margin. That is changing. **Regionalised logistics**, **automation/robotics**, and an enormous **advertising** business (high-margin, growing fast) are structurally lifting retail profitability. Advertising in particular is a third engine that drops almost straight to the bottom line.

## Why it can re-accelerate
With both engines improving at once — AWS riding AI, retail margins expanding — Amazon's **free cash flow** can inflect sharply as the current heavy investment cycle normalises. The stock is best valued on that normalised FCF, not on trailing margins.

## The risks
The stock lives and dies by **AWS growth** and the timing of AI capex. Retail carries consumer-spending sensitivity, and Amazon's habit of heavy reinvestment compresses near-term cash flow (a feature for long-term owners, a frustration for traders).

## Stage of the cycle
**Re-accelerating** — a classic "two engines firing" setup.

## Scorecard
Upside **7.5/10** · Safety **8.5/10** · AI exposure **8/10**. Cloud growth with a retail-margin kicker.`,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    assetClass: "stock",
    category: "mega-stocks",
    tier: 1,
    tierLabel: "Tier 1 — The AI Distribution Endpoint",
    theme: "On-device AI across 2B+ active devices",
    tagline: "Owns the world's most valuable install base — the endpoint where AI meets users.",
    entryRange: "26–32x forward earnings",
    valuationNotes: [
      "Premium multiple for unmatched ecosystem and capital returns",
      "Buy on demand-scare dips rather than chasing strength",
    ],
    whyItWins: [
      "2B+ active devices = unrivalled AI distribution",
      "On-device AI and silicon leadership protect privacy and margins",
      "Services revenue is a high-margin, recurring compounder",
      "Best capital-return program in mega-cap tech",
    ],
    stage: "Steady compounder; the AI device-refresh cycle is the call option.",
    risks: [
      "Perceived as an AI laggard on frontier models",
      "China demand and geopolitical exposure",
      "Slower hardware-replacement cycles",
    ],
    scores: { upside: 6, safety: 9.5, aiExposure: 6.5 },
    basePrice: 226,
    vol: 0.27,
    accent: "#f5b945",
    article: `## The thesis in one line
Apple may not build the frontier model, but it owns the **endpoint** — 2B+ devices where AI actually reaches consumers — and distribution is its own kind of moat.

## Why the endpoint matters
The frontier-model race gets the headlines, but models are only useful when they reach users. Apple controls the **most valuable install base in the world** and the silicon inside it. Its strategy — **on-device AI** wherever possible, with privacy as the selling point — plays to two structural strengths: best-in-class custom chips and a brand that monetises trust. Owning the hardware, the OS and the App Store means Apple can distribute AI features to billions overnight.

## The Services compounder
Beneath the hardware story sits **Services** — the App Store, iCloud, payments, advertising and subscriptions — a high-margin, recurring revenue stream that grows regardless of the hardware cycle and steadily lifts the company's overall margin profile.

## Capital returns
Apple runs arguably the **best capital-return program** in mega-cap tech, buying back enormous quantities of stock every year. Even modest growth translates into healthy per-share gains.

## The honest risks
Apple is widely perceived as an **AI laggard** on frontier capability, which weighs on sentiment. It carries real **China** demand and geopolitical exposure, and elongating hardware-replacement cycles can stall growth. The bull case is that a genuinely useful AI feature set triggers a **device-refresh super-cycle** — that's the embedded call option.

## Stage of the cycle
A **steady compounder** with optionality on an AI-driven upgrade wave.

## Scorecard
Upside **6/10** · Safety **9.5/10** · AI exposure **6.5/10**. Lower AI beta, maximum durability.`,
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    assetClass: "stock",
    category: "mega-stocks",
    tier: 3,
    tierLabel: "Tier 3 — AI/Robotics Optionality, High Volatility",
    theme: "Real-world AI: autonomy, robotaxi and humanoid robots",
    tagline: "Priced as an AI/robotics platform, not a carmaker — for better and worse.",
    entryRange: "Story-driven; valuation-agnostic",
    valuationNotes: [
      "Valuation reflects autonomy/robot optionality, not auto fundamentals",
      "Extreme volatility — a trading and conviction vehicle",
    ],
    whyItWins: [
      "Full Self-Driving and a potential robotaxi network",
      "Optimus humanoid-robot optionality",
      "Real-world AI data advantage from its vehicle fleet",
      "Energy storage is a fast-growing, underrated segment",
    ],
    stage: "Binary, narrative-driven — autonomy execution decides the outcome.",
    risks: [
      "Autonomy timelines have repeatedly slipped",
      "Auto fundamentals (margins, competition) under pressure",
      "Extreme valuation and key-person risk",
    ],
    scores: { upside: 8, safety: 4, aiExposure: 8 },
    basePrice: 342,
    vol: 0.7,
    accent: "#f5b945",
    article: `## The thesis in one line
Tesla is no longer priced as a car company — it is priced as a bet on **real-world AI**: autonomy, a robotaxi network and humanoid robots. Treat it accordingly.

## The optionality stack
- **Full Self-Driving / robotaxi**: if Tesla cracks scalable autonomy, a robotaxi network is a software-margin business layered on hardware it already sells. This is the core of the bull case.
- **Optimus**: a humanoid robot aimed at labour markets vastly larger than autos. Pure optionality today, enormous if it works.
- **Real-world data**: a large vehicle fleet generates the edge-case driving data that training autonomy arguably requires — a genuine moat if autonomy is a data problem.
- **Energy storage**: the quietly excellent, fast-growing segment the narrative ignores.

## Why it's Tier 3
The valuation **already embeds** success in autonomy and robotics — the auto business alone cannot justify it. That makes Tesla **binary and narrative-driven**: progress on FSD sends it soaring; slipped timelines or a margin scare send it crashing. Autonomy timelines have **repeatedly slipped**, core auto margins face real price competition, and there is meaningful **key-person risk**.

## How to think about owning it
This is a **conviction-and-volatility** vehicle, not a sleep-at-night holding. Position it small, expect 30%+ swings, and accept that you are underwriting a technological bet, not a stable earnings stream.

## Stage of the cycle
**Binary.** The next leg depends almost entirely on autonomy execution.

## Scorecard
Upside **8/10** · Safety **4/10** · AI exposure **8/10**. The market's purest public bet on physical-world AI.`,
  },

  // ───────────────────────────────── ETFs ─────────────────────────────────
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    assetClass: "etf",
    category: "etf",
    tier: 1,
    tierLabel: "Core — The Nasdaq-100",
    theme: "One ticket to the mega-cap growth complex",
    tagline: "The simplest broad exposure to the companies driving the AI economy.",
    entryRange: "Accumulate on broad-market pullbacks",
    valuationNotes: [
      "Dollar-cost averaging suits a core holding",
      "Concentrated in mega-cap tech — a feature and a risk",
    ],
    whyItWins: [
      "Holds the AI mega-caps in one liquid, low-cost wrapper",
      "Deep liquidity and tight spreads",
      "No single-stock blow-up risk",
      "Decades of structural-growth track record",
    ],
    stage: "Core building block — the default AI/growth allocation.",
    risks: [
      "Heavy concentration in the largest tech names",
      "Falls hard in growth-stock drawdowns",
      "Not diversified outside tech/growth",
    ],
    scores: { upside: 6.5, safety: 8, aiExposure: 8 },
    basePrice: 542,
    vol: 0.25,
    accent: "#a78bfa",
    article: `## The thesis in one line
QQQ is the **default one-ticket** way to own the AI economy — the Nasdaq-100's mega-cap growth leaders in a single, cheap, ultra-liquid fund.

## What you own
QQQ tracks the **Nasdaq-100**: Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Broadcom and the rest of the mega-cap growth complex. In other words, most of the names in this research platform — bundled, rebalanced and wrapped in one of the most liquid securities on earth. For an investor who believes in the theme but doesn't want to pick individual winners, this is the building block.

## Why a core ETF makes sense
- **No blow-up risk**: one company can disappoint without wrecking your position.
- **Liquidity**: tight spreads and deep options markets make it easy to scale in and out.
- **Track record**: decades of structural-growth outperformance through multiple cycles.
- **Simplicity**: dollar-cost-average and let the index do the rebalancing.

## The trade-off: concentration
QQQ is **not** truly diversified. It is heavily weighted toward a handful of mega-cap tech names, so when growth stocks sell off, QQQ falls hard. That concentration is the *source* of its returns and its risk — own it knowing you are making a tech-growth bet, not buying broad-market insurance. Pair it with a total-market or value fund for balance.

## Stage of the cycle
A **core building block** suited to steady accumulation rather than timing.

## Scorecard
Upside **6.5/10** · Safety **8/10** · AI exposure **8/10**. The lowest-effort way to own the whole theme.`,
  },
  {
    symbol: "SMH",
    name: "VanEck Semiconductor ETF",
    assetClass: "etf",
    category: "etf",
    tier: 1,
    tierLabel: "Thematic — Pure Semiconductor Play",
    theme: "Concentrated exposure to the AI chip supply chain",
    tagline: "NVIDIA, TSMC, Broadcom, AMD and the rest of the silicon stack in one fund.",
    entryRange: "Higher beta — size smaller than a core fund",
    valuationNotes: [
      "More volatile than QQQ; the purest chip exposure",
      "Cyclical — best accumulated through the chip cycle",
    ],
    whyItWins: [
      "Owns the entire AI compute supply chain at once",
      "Top holdings are the indispensable chip leaders",
      "Captures the theme without single-stock timing",
      "Liquid and widely held",
    ],
    stage: "Thematic satellite — concentrated bet on AI silicon.",
    risks: [
      "Highly cyclical and volatile",
      "Concentrated in a few top holdings",
      "Geopolitical (Taiwan) exposure via TSMC",
    ],
    scores: { upside: 7.5, safety: 6.5, aiExposure: 9.5 },
    basePrice: 286,
    vol: 0.4,
    accent: "#a78bfa",
    article: `## The thesis in one line
If AI compute is the trade, SMH is the **purest basket** — the entire semiconductor supply chain, from designers to the foundry, in one fund.

## What you own
SMH concentrates on the names that *are* the AI hardware story: **NVIDIA, TSMC, Broadcom, AMD** and the broader chip ecosystem. Rather than guessing whether the designer, the foundry or the memory maker captures the most value in a given year, you own the whole chain and let the winners pull the basket up.

## Why pros use it
Picking the right semiconductor stock at the right point in the cycle is genuinely hard — leadership rotates between designers, equipment makers and memory. A focused ETF lets you express **high conviction in the theme** while diversifying the single-name risk. It is liquid, widely held, and the cleanest way to overweight silicon.

## The trade-off: volatility
Semis are **highly cyclical**. SMH swings harder than a broad fund like QQQ in both directions, and it is **concentrated** in a few top holdings, so it is not low-risk. It also inherits **Taiwan geopolitical risk** through its large TSMC weighting. Treat it as a **satellite** position sized smaller than your core, accumulated through the cycle rather than chased at the top.

## Stage of the cycle
A **thematic satellite** — the high-octane expression of the AI-compute view.

## Scorecard
Upside **7.5/10** · Safety **6.5/10** · AI exposure **9.5/10**. Maximum chip exposure, maximum cyclicality.`,
  },
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    assetClass: "etf",
    category: "etf",
    tier: 1,
    tierLabel: "Core — The Whole Market",
    theme: "The broad-market anchor every portfolio needs",
    tagline: "Ultra-low-cost S&P 500 exposure — the ballast around your thematic bets.",
    entryRange: "Always-on core; dollar-cost average",
    valuationNotes: [
      "Rock-bottom expense ratio",
      "The benchmark most active strategies fail to beat",
    ],
    whyItWins: [
      "Diversified across 500 leading US companies",
      "Captures AI upside via its mega-cap weightings",
      "Among the lowest fees available anywhere",
      "The definition of a 'sleep well' holding",
    ],
    stage: "The portfolio anchor — broad, cheap and durable.",
    risks: [
      "Increasingly top-heavy in mega-cap tech",
      "Falls with the broad market in a recession",
      "Lower upside than focused thematic funds",
    ],
    scores: { upside: 5.5, safety: 9.5, aiExposure: 6 },
    basePrice: 582,
    vol: 0.18,
    accent: "#a78bfa",
    article: `## The thesis in one line
VOO is the **ballast** — the diversified, ultra-cheap core that lets you take focused AI bets elsewhere without betting the whole portfolio on them.

## Why a broad-market core comes first
Before the exciting thematic positions, every durable portfolio needs an **anchor**: something diversified, low-cost and resilient enough to hold through any cycle. VOO tracks the **S&P 500** — 500 of the largest US companies — at one of the lowest expense ratios available anywhere. Decades of evidence show most active strategies **fail to beat it** over time, which is why it's the default core for professionals and beginners alike.

## You still get AI exposure
Because the S&P 500 is market-cap weighted, its largest holdings *are* the AI mega-caps — Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta. So VOO already captures a large share of the theme's upside, just diluted across the rest of the economy. That dilution is the point: it smooths the ride.

## The honest trade-offs
The index has become **top-heavy** — the biggest tech names now drive a large share of returns, so VOO is less diversified than it used to be. It will still **fall with the market** in a recession, and by design it offers **less upside** than a focused fund like SMH. You hold it for durability, not fireworks.

## Stage of the cycle
The **permanent core**. Buy it continuously, hold it forever, build your satellites around it.

## Scorecard
Upside **5.5/10** · Safety **9.5/10** · AI exposure **6/10**. The foundation the rest of the portfolio stands on.`,
  },
  {
    symbol: "ICLN",
    name: "iShares Global Clean Energy ETF",
    assetClass: "etf",
    category: "etf",
    alsoIn: ["ai-utilities"],
    tier: 2,
    tierLabel: "Thematic — Clean Energy for the AI Grid",
    theme: "The power-supply side of the AI build-out",
    tagline: "Diversified clean-energy exposure as data centres strain the grid.",
    entryRange: "Contrarian — beaten down, rate-sensitive",
    valuationNotes: [
      "Out of favour after a rate-driven de-rating",
      "A contrarian play on AI-driven power demand",
    ],
    whyItWins: [
      "AI's electricity demand needs every megawatt, including renewables",
      "Diversified across solar, wind and clean-power names globally",
      "Deeply out of favour — potential mean-reversion setup",
      "Leverage to falling rates and policy support",
    ],
    stage: "Contrarian / early — a bombed-out theme with an AI demand tailwind.",
    risks: [
      "Highly rate-sensitive — hurt by higher-for-longer",
      "Policy and subsidy dependency",
      "Has badly underperformed for years",
    ],
    scores: { upside: 7, safety: 5.5, aiExposure: 6.5 },
    basePrice: 14.2,
    vol: 0.35,
    accent: "#a78bfa",
    article: `## The thesis in one line
ICLN is the **contrarian** corner of the AI trade: a beaten-down basket of clean-energy names that the market forgot AI is going to need.

## The supply-side story
Everyone is buying the *compute* side of AI. Fewer are positioned for the *power* side. Data centres are straining grids, and meeting that demand requires **every available megawatt** — including the solar, wind and storage developers ICLN holds. The same structural electricity shortage that re-rated nuclear names like Constellation should, eventually, lift the broader clean-energy complex.

## Why it's cheap
Clean energy has been one of the market's **worst-performing themes** for years. The culprit is interest rates: renewable projects are capital-intensive and financed with debt, so **higher-for-longer rates** crushed both project economics and stock valuations. ICLN de-rated hard. That is the bear case — and the contrarian opportunity. If rates ease and AI power demand becomes undeniable, a bombed-out, out-of-favour theme has room to mean-revert.

## Respect the risks
This is **not** a safe holding. It is highly **rate-sensitive**, **policy-dependent** (subsidies and tax credits matter), and has a track record of disappointing. It belongs in a portfolio as a **small, contrarian satellite**, not a core position — a bet that the power side of AI eventually gets re-rated like the compute side already has.

## Stage of the cycle
**Early / contrarian** — maximum pessimism, optionality on a turn.

## Scorecard
Upside **7/10** · Safety **5.5/10** · AI exposure **6.5/10**. A value-style bet on the AI grid.`,
  },

  // ──────────────────────────────── CRYPTO ────────────────────────────────
  {
    symbol: "BTC",
    name: "Bitcoin",
    coingeckoId: "bitcoin",
    assetClass: "crypto",
    category: "crypto",
    tier: 1,
    tierLabel: "Tier 1 — Digital Gold",
    theme: "The scarce, neutral reserve asset of the internet",
    tagline: "Fixed 21M supply, now institutionally owned via spot ETFs.",
    entryRange: "Accumulate through volatility; think in cycles",
    valuationNotes: [
      "Four-year halving cycle historically frames the trend",
      "Position-size for 50%+ drawdowns",
    ],
    whyItWins: [
      "Hard-capped 21M supply — credibly scarce",
      "Spot ETFs opened institutional and advisor allocation",
      "Deepest liquidity and longest track record in crypto",
      "A macro hedge / 'digital gold' narrative with growing adoption",
    ],
    stage: "Maturing into an institutional asset class.",
    risks: [
      "Brutal volatility and deep drawdowns",
      "Regulatory shifts and macro-liquidity sensitivity",
      "Still correlated with risk assets in stress",
    ],
    scores: { upside: 8, safety: 6, aiExposure: 3 },
    basePrice: 104000,
    vol: 0.6,
    accent: "#f7931a",
    article: `## The thesis in one line
Bitcoin is the **scarcest, most neutral** monetary asset ever created — and the launch of spot ETFs turned it from a fringe trade into an allocatable asset class.

## The case for digital gold
Bitcoin's supply is **capped at 21 million**, enforced by code and the most secure computing network on earth. In a world of expanding fiat balance sheets, a credibly scarce, borderless, censorship-resistant asset has a clear role: a **macro hedge** and long-term store of value — "digital gold," but more portable and verifiable.

## What changed: the ETF era
For a decade, owning Bitcoin meant exchanges, wallets and key management — friction that kept institutions out. **Spot Bitcoin ETFs** removed that friction. Pensions, advisors and corporates can now allocate through a normal brokerage line, unlocking a structurally new pool of demand against a fixed supply. That is the single most important shift in Bitcoin's investment case.

## The cycle and the volatility
Bitcoin has historically traded in **~four-year cycles** loosely anchored to its "halving" (the periodic cut to new supply). Within those cycles it suffers **brutal drawdowns** — 50%+ corrections are normal, not exceptional. The discipline is to **think in cycles**, accumulate through volatility, and size the position so a violent drawdown doesn't force a sale.

## The honest risks
Extreme volatility, sensitivity to **macro liquidity** (it still sells off with risk assets in a crunch), and shifting **regulation**. The AI-exposure score is deliberately low — Bitcoin's thesis is monetary, not technological.

## Stage of the cycle
**Maturing** into an institutional asset class, with ETF demand a new structural buyer.

## Scorecard
Upside **8/10** · Safety **6/10** · AI exposure **3/10**. The reserve asset of digital portfolios.`,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    coingeckoId: "ethereum",
    assetClass: "crypto",
    category: "crypto",
    tier: 1,
    tierLabel: "Tier 1 — Settlement Layer of Web3",
    theme: "The programmable base layer for on-chain finance",
    tagline: "The leading smart-contract platform — stablecoins, DeFi and tokenisation run here.",
    entryRange: "Accumulate on cycle drawdowns",
    valuationNotes: [
      "Now a yield-bearing asset via staking",
      "ETH/BTC ratio frames relative-value entries",
    ],
    whyItWins: [
      "Dominant smart-contract platform and developer base",
      "Settlement layer for stablecoins, DeFi and tokenised assets",
      "Staking turns ETH into a yield-bearing asset",
      "Spot ETFs broaden access",
    ],
    stage: "Core infrastructure of on-chain finance, scaling via L2s.",
    risks: [
      "Competition from rival L1s (e.g. Solana)",
      "Complexity and smart-contract risk",
      "High correlation to Bitcoin and macro",
    ],
    scores: { upside: 8, safety: 5.5, aiExposure: 4 },
    basePrice: 3900,
    vol: 0.7,
    accent: "#f7931a",
    article: `## The thesis in one line
If Bitcoin is digital gold, Ethereum is the **digital settlement layer** — the programmable base on which stablecoins, DeFi and tokenised assets actually run.

## What you're buying
Ethereum is the dominant **smart-contract platform**, with by far the largest developer ecosystem and the deepest pool of on-chain applications. The two killer use-cases driving real volume today are **stablecoins** (digital dollars that settle globally in seconds) and **tokenisation** (moving traditional assets like treasuries and funds on-chain). Most of that activity settles, directly or indirectly, on Ethereum.

## ETH as a productive asset
Since moving to proof-of-stake, ETH can be **staked** to help secure the network and earn a yield. That turns it from a pure commodity into something closer to a **yield-bearing infrastructure asset** — a meaningful difference from Bitcoin's design. Spot ETH ETFs have further widened access for traditional allocators.

## How to frame entries
Many investors watch the **ETH/BTC ratio** to judge relative value, accumulating ETH when it's cheap versus Bitcoin. As with all crypto, the right approach is to **buy cycle drawdowns** rather than chase strength.

## The risks
Ethereum faces real **competition** from faster rival chains like Solana, carries **smart-contract and complexity risk**, and remains highly **correlated to Bitcoin** and macro liquidity. Its scaling increasingly happens on **Layer-2** networks, which is powerful but adds moving parts.

## Stage of the cycle
**Core infrastructure** of on-chain finance, scaling through its L2 ecosystem.

## Scorecard
Upside **8/10** · Safety **5.5/10** · AI exposure **4/10**. The base layer of the on-chain economy.`,
  },
  {
    symbol: "SOL",
    name: "Solana",
    coingeckoId: "solana",
    assetClass: "crypto",
    category: "crypto",
    tier: 2,
    tierLabel: "Tier 2 — High-Performance L1",
    theme: "The fast, cheap chain for consumer-scale apps",
    tagline: "High throughput and low fees — the venue for high-velocity on-chain activity.",
    entryRange: "Higher-beta than ETH; size accordingly",
    valuationNotes: [
      "More volatile than BTC/ETH — a higher-octane bet",
      "Network activity and uptime are the key tells",
    ],
    whyItWins: [
      "Very high throughput and very low transaction fees",
      "Thriving consumer, payments and DeFi ecosystem",
      "Fast-growing developer and user activity",
      "Often outperforms in crypto up-cycles",
    ],
    stage: "Maturing challenger with strong momentum and real usage.",
    risks: [
      "History of network outages (improving but a scar)",
      "Higher volatility than ETH/BTC",
      "Intense L1 competition",
    ],
    scores: { upside: 8.5, safety: 4.5, aiExposure: 4 },
    basePrice: 176,
    vol: 0.85,
    accent: "#f7931a",
    article: `## The thesis in one line
Solana is the **performance bet** in smart contracts — fast enough and cheap enough to host consumer-scale apps that simply don't work on slower chains.

## The speed advantage
Solana's design prioritises **high throughput and very low fees**. In practice that means sub-cent transactions confirmed in moments, which unlocks use-cases — consumer payments, high-frequency DeFi, on-chain order books — that are impractical when fees spike. That performance has attracted a **vibrant ecosystem** and some of the fastest-growing user and developer activity in crypto.

## Why it outperforms in up-cycles
When risk appetite returns to crypto, capital tends to chase the chains with the most **activity and momentum**. Solana's high beta means it frequently **outperforms ETH and BTC** in rallies — and, by the same token, falls harder in drawdowns. It is the higher-octane way to express a bullish crypto view.

## The scar tissue
Solana's reputation was dented by a series of **network outages** in its earlier years. Reliability has improved markedly, but the memory keeps a risk premium attached — uptime is the metric the market watches most closely. Add the highest **volatility** of the major L1s and fierce **competition**, and this is clearly a Tier 2, size-it-smaller position.

## Stage of the cycle
A **maturing challenger** with genuine usage and strong momentum — past the experimental phase, not yet blue-chip.

## Scorecard
Upside **8.5/10** · Safety **4.5/10** · AI exposure **4/10**. The high-beta L1 for risk-on cycles.`,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    coingeckoId: "chainlink",
    assetClass: "crypto",
    category: "crypto",
    alsoIn: ["ai-companies"],
    tier: 2,
    tierLabel: "Tier 2 — The Oracle & Data Layer",
    theme: "The bridge between blockchains and the real world",
    tagline: "The standard for feeding off-chain data — and AI outputs — into smart contracts.",
    entryRange: "Thematic; tied to tokenisation adoption",
    valuationNotes: [
      "Value accrues with on-chain data and tokenisation demand",
      "More speculative than BTC/ETH",
    ],
    whyItWins: [
      "Dominant oracle network — the data standard for DeFi",
      "CCIP positions it as cross-chain settlement infrastructure",
      "Tokenisation of real-world assets needs trusted data feeds",
      "A natural rail for verifiable AI outputs on-chain",
    ],
    stage: "Infrastructure bet on tokenisation and on-chain data demand.",
    risks: [
      "Token value-accrual is less direct than its usage",
      "Competition in the oracle space",
      "High volatility and adoption-timing risk",
    ],
    scores: { upside: 8, safety: 4.5, aiExposure: 6 },
    basePrice: 18.5,
    vol: 0.85,
    accent: "#f7931a",
    article: `## The thesis in one line
Smart contracts are blind — they can't see the outside world. **Chainlink** is the dominant network that feeds them real-world data, and that role grows directly with tokenisation and AI.

## The oracle problem
A blockchain can't natively access a stock price, an interest rate, a weather reading — or the output of an AI model. **Oracles** solve this, securely delivering off-chain data on-chain, and Chainlink is the **industry standard**, securing a large share of DeFi. As finance moves on-chain, the demand for trustworthy data feeds scales with it.

## Two growth vectors
- **Tokenisation of real-world assets**: bringing treasuries, funds and credit on-chain requires constant, reliable data (prices, NAVs, proof-of-reserves). Chainlink is positioning itself as the data and interoperability layer for that migration, with **CCIP** as cross-chain settlement plumbing that major institutions are testing.
- **The AI angle**: as AI agents begin to transact and as model outputs need to be **verifiably** delivered to contracts, a neutral oracle network is a natural rail — the trust layer between AI and on-chain value.

## The honest caveats
The hardest question in any infrastructure token is **value accrual**: Chainlink's *usage* can grow without the token capturing that value as directly as equity holders would. It faces oracle **competition**, depends on **adoption timing**, and is **highly volatile**. This is a thematic, speculative position — own it as a bet on tokenisation, sized small.

## Stage of the cycle
An **infrastructure bet** on the on-chain data economy.

## Scorecard
Upside **8/10** · Safety **4.5/10** · AI exposure **6/10**. The data layer beneath tokenised finance.`,
  },
  {
    symbol: "RENDER",
    name: "Render",
    coingeckoId: "render-token",
    assetClass: "crypto",
    category: "crypto",
    alsoIn: ["ai-companies"],
    tier: 3,
    tierLabel: "Tier 3 — Decentralised GPU Compute",
    theme: "A peer-to-peer marketplace for GPU rendering and AI compute",
    tagline: "The clearest crypto-meets-AI narrative: tokenised access to idle GPU power.",
    entryRange: "Speculative — small, high-risk allocation",
    valuationNotes: [
      "Narrative-driven; trades on the AI-compute theme",
      "Among the higher-risk tokens in this universe",
    ],
    whyItWins: [
      "Connects idle GPUs to those who need rendering / compute",
      "Rides the same GPU-scarcity thesis as NVIDIA",
      "The cleanest 'crypto + AI' story in the market",
      "Real usage among 3D / media creators",
    ],
    stage: "Early, speculative — a thematic option on decentralised compute.",
    risks: [
      "Must compete with hyperscaler cloud economics",
      "Highly speculative and volatile",
      "Adoption beyond niche rendering is unproven",
    ],
    scores: { upside: 8.5, safety: 3.5, aiExposure: 8 },
    basePrice: 7.4,
    vol: 1.0,
    accent: "#f7931a",
    article: `## The thesis in one line
Render is the **purest crypto expression** of the AI-compute thesis: a marketplace that tokenises access to idle GPUs, riding the exact same scarcity that drives NVIDIA.

## How it works
GPUs are scarce and expensive, yet enormous amounts of GPU capacity sit **idle** around the world. Render coordinates a **peer-to-peer marketplace** that connects those idle GPUs with people who need rendering or compute, settling payments in its token. It began with **3D graphics rendering** — where it has genuine, real-world usage among media and visual-effects creators — and aims to extend toward broader AI compute.

## Why the narrative is powerful
This is the cleanest **"crypto + AI"** story available. If you believe GPU demand outstrips supply for years — the core NVIDIA thesis — then a decentralised network that monetises spare GPU capacity is a natural second-order bet. When the AI-compute theme is hot, tokens like Render tend to move with outsized force.

## Why it's Tier 3
The reality check: decentralised compute must compete with the **brutal economics and reliability** of hyperscaler clouds (AWS, Azure, Google), which are themselves racing to add capacity. Adoption **beyond niche rendering** into mainstream AI workloads is **unproven**, and the token is among the most **speculative and volatile** in this entire research universe. This is a small, high-risk, thematic allocation — an *option* on a future that may or may not arrive.

## Stage of the cycle
**Early and speculative** — a narrative-driven option on decentralised GPU compute.

## Scorecard
Upside **8.5/10** · Safety **3.5/10** · AI exposure **8/10**. The highest-risk, highest-narrative pick on the board.`,
  },
];

export const ASSETS: Asset[] = mergeCatalog(RESEARCH_ASSETS);

// ─────────────────────────────── helpers ───────────────────────────────
export function getAsset(symbol: string): Asset | undefined {
  const s = symbol.toUpperCase();
  return ASSETS.find((a) => a.symbol.toUpperCase() === s);
}

export function getAssetsByCategory(slug: CategorySlug): Asset[] {
  return ASSETS.filter(
    (a) => a.category === slug || (a.alsoIn && a.alsoIn.includes(slug))
  );
}

export function allSymbols(): string[] {
  return ASSETS.map((a) => a.symbol);
}

export function tickerSymbols(): string[] {
  // A curated marquee order
  const order = [
    "BTC", "NVDA", "CEG", "ETH", "MSFT", "VST", "SOL", "AVGO",
    "GOOGL", "AMD", "META", "TSM", "QQQ", "AMZN", "NEE", "PLTR",
    "AAPL", "SMH", "MU", "AES", "TSLA", "LINK", "NI", "RENDER",
  ];
  return order.filter((s) => getAsset(s));
}

export function getRelated(asset: Asset, limit = 3): Asset[] {
  return ASSETS.filter(
    (a) => a.symbol !== asset.symbol && a.category === asset.category
  ).slice(0, limit);
}
