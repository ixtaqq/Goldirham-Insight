# Improvement design

## Problem

The review found missing client interaction coverage, hidden provenance on catalog
scores, unbounded per-process market caches and continuous polling in hidden tabs.
The existing adapters already validate provider data and preserve source labels.
This work extends their guarantees without changing the public quote/chart models.

## Usage

Existing routes keep calling fetchCryptoQuotes, fetchCryptoChart and
fetchStockQuote. An admitted request returns validated data; a denied or failed
request returns null and the route supplies labeled simulation.

Card consumers receive a compact review union instead of complete research
citations. A reviewed card can display actual reviewer/date data; an unreviewed
card exposes that state without invented metadata. The user explicitly selected
human review, so this run does not mark any catalog entry reviewed.

Developers run npm run test:browser after building. Fixtures replace market APIs
and block external browser traffic. Operators can pipe existing structured
fallback logs into npm run market:health to see safe grouped event counts.

## Shape

Candidate A retains bounded maps, provider admission state and polling lifecycle
state in their existing owning modules. A rolling timestamp window admits each
actual provider attempt synchronously. Cache hits and shared pending requests
do not spend quota. Expired entries and capacity eviction bound memory.

Every polling request owns its controller and generation. Hide invalidates the
generation and cancels work while preserving displayed quotes. Show requests
fresh data immediately; obsolete completions cannot publish or schedule polling.

Review status is a discriminated union with actual attribution only on the
reviewed variant. Category and ranking state derive from catalog types and a
constant filter table. Navigation visibility has one 1000px stylesheet owner.

The log tool accepts only known provider/operation/reason values and numerical
status/rejected counts. It aggregates bounded groups and never echoes input.
Partial batch rejection is a fallback event, not necessarily a wholly failed
request. The tool does not invent a success denominator or failure percentage.

## Synthesis decision

Two independent candidates and a same-model independent judge compared keeping
state inline against extracted provider-runtime and visible-polling modules.
The primary and judge chose A. Existing test isolation already observes adapter
behavior, and there is one polling consumer. The extra modules would add public
configuration and call layers without a new consumer.

Both candidates contributed generation guards, rolling budgets, compact review
projection and deterministic browser fixtures. Unconsumed health snapshot APIs
were rejected in favor of the log tool that an operator can actually run.

## Tradeoffs accepted

Application caps are conservative per-process policies. They do not establish
account-wide quotas, monthly billing guarantees or distributed abuse prevention.
Denied requests may increase visible simulated fallback during bursts. Successful
quotes cache for 60 seconds; their original provider observation times remain.

Chromium is the initial browser gate. Controlled visibility events verify the
application's event handling, not the browser's own background scheduling policy.
Human editorial review, other browser engines and deployment verification remain
separate work.

## Alternatives considered

Extracted generic runtimes lost because they added one-caller configuration and
ownership indirection. Shared database/Redis admission could enforce deployment
limits but requires hosting and cost decisions beyond this local implementation.
A public diagnostics route would expose operating details without an identified
product need. Local structured-log aggregation supplies the requested evidence.

## Verification

Tests exercise visible behavior through the production UI and actual adapter
entry points with clock/network boundaries controlled. Model the Domain shapes
review variants and provider registries. Boundary Discipline keeps parsing at
inputs. Test Behavior, Not Implementation selects observable regressions. Prove
It Works requires executed results before completion.
