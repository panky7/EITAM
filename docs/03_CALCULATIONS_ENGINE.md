# Calculations Engine — src/lib/calculations.ts + src/lib/format.ts

The calculation engine is a set of **pure functions** (no React, no I/O, no randomness, no module-level
state) that turn the fixed client-provided constants in `src/data/` into every derived number the UI
shows. Components are forbidden from doing inline math — they call these functions inside `useMemo`
and render the results. The rules in `src/lib/AGENTS.md` govern this layer: every division is guarded
against a zero denominator (return `0`, never `NaN`/`Infinity`), and every formula must keep the
reference values in `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` §5 passing. This document walks
through every exported type, constant and function in `src/lib/calculations.ts` and
`src/lib/format.ts`, with the worked examples pinned by `src/lib/calculations.test.ts`.

> **Reference values — important correction.** The workspace `AGENTS.md` and
> `docs/00_OVERVIEW.md` still quote the legacy pre-correction figures (full-plan cost
> **99,510,000 SEK**, multiple ≈ **0.4321**). Those were superseded by the backlog-correction
> programme (`app_spec/06_BACKLOG_CORRECTIONS.md` §CR-1.2: *"the old ones — 99,510,000 SEK
> full-plan cost, etc. — no longer apply"*). The values the **tests actually pin today**
> (`src/lib/calculations.test.ts:33-38`, matching `app_spec/03` §2.3/§5) are:
>
> | Constant | Value | Meaning |
> |---|---|---|
> | `TOTAL_FULL_COST` | **41,400,000 SEK** | Sum of all 6 workstream costs = EY 30M + Accenture 3M + TCS 8.4M |
> | `TOTAL_FULL_BENEFIT` | **43,000,000 SEK** | Sum of all 6 directional benefit estimates |
> | `FULL_MULTIPLE` | **≈ 1.0386** | benefit ÷ cost = 43,000,000 ÷ 41,400,000 |
> | `MAX_FULLY_COVERABLE_WORKSTREAMS` | **6** | The full partner team can resource all 6 workstreams |
>
> These are computed in `src/data/derived.ts:3-15` from `WORKSTREAMS`, not hard-coded, so a data
> change propagates everywhere — and would break the tests, which is intentional.

## 1. The data the engine consumes

| Entity | Source | Role |
|---|---|---|
| `WORKSTREAMS` | `src/data/workstreams.ts:64-244` | The 6 workstreams. Each has `costSEK` (12-month delivery cost), `benefitSEK` (directional value estimate), and `startsInQ1` (phase timing, which picks the partner share table). |
| `PARTNERS`, `PARTNER_IDS`, share tables | `src/data/partners.ts:36-60` | EY 30M, Accenture 3M, TCS 8.4M full-scope annual costs; per-workstream partner splits for Q1-start vs Month4-start workstreams. |
| `TOTAL_FULL_COST` / `TOTAL_FULL_BENEFIT` / `FULL_MULTIPLE` | `src/data/derived.ts:3-13` | Full-plan aggregates, derived by summing `WORKSTREAMS`. |
| `ENTERPRISE_RISKS`, `AI_READINESS_DOMAINS` | `src/data/risks.ts:22-127` | 4 enterprise risks and 4 AI readiness domains feeding the risk helpers. |

Per-workstream economics (cost → benefit → multiple = benefit ÷ cost), matching
`app_spec/03` §5:

| Workstream | Cost (SEK) | Benefit (SEK) | Multiple | Starts in Q1 |
|---|---|---|---|---|
| Hardware (`hardware`) | 8,625,000 | 19,250,000 | ≈ 2.232 | yes |
| AI Assets (`ai`) | 8,625,000 | 3,500,000 | ≈ 0.406 | yes |
| Cloud (`cloud`) | 8,625,000 | 7,000,000 | ≈ 0.812 | yes |
| Operational Technology (`ot`) | 5,175,000 | 4,750,000 | ≈ 0.918 | no |
| Software (`software`) | 5,175,000 | 6,750,000 | ≈ 1.304 | no |
| New & Emerging (`newemerging`) | 5,175,000 | 1,750,000 | ≈ 0.338 | no |

**Business meaning of a cost figure:** a workstream's `costSEK` is its share of the 12-month
partner bill. Partner costs are split evenly across the active workstreams in each phase — Q1 (3
months, 3 active workstreams) and Months 4–12 (9 months, 6 active) — so a Q1-starting workstream
carries `annual × 3/12 ÷ 3 + annual × 9/12 ÷ 6` and a Month-4-starting one carries
`annual × 9/12 ÷ 6` (`app_spec/03` §2.1). Benefit figures are **directional estimates** (a
weighted split of a ~25M SEK enterprise-risk figure plus rough savings/avoidance), and the UI
must keep that disclosure visible — it is a hard requirement, not decoration.

## 2. Exported types (`src/lib/calculations.ts`)

| Type | Lines | Purpose |
|---|---|---|
| `AllocationStrategy` | `:23` | `'priority' \| 'even'` — the two what-if allocation strategies (§4). |
| `AllocationResult` | `:25-28` | Output of an allocation: `pctById` maps each `WorkstreamId` to a funded percentage 0–100; `leftoverSEK` is budget not consumed by the plan. |
| `ScenarioTotals` | `:30-34` | Aggregated `costSEK`, `benefitSEK`, and `multiple` (= benefit ÷ cost) for any scenario. |
| `ScenarioPreset` | `:36-42` | A named one-click scenario (`'minimum_viable' \| 'flat_resourcing'`): label, selected workstream ids, implied budget, and pre-computed totals. |
| `WorkstreamFinancials` | `:44-46` | `ScenarioTotals` plus `partnerBreakdown`: the per-partner cost split for one workstream. |
| `RiskSeveritySummary` | `:48-52` | Counts of enterprise risks by severity: `high`, `medium`, `ready`. |

Internal helpers (not exported): `emptyPctById` (`:56-64`) builds a zero-filled
`pctById` map; `benefitMultiple` (`:66-68`) is the guarded benefit÷cost ratio;
`CURRENCY_EPSILON_SEK = 0.01` (`:54`) is a one-öre tolerance used so that floating-point dust
never blocks a full funding decision (see `computeAllocation`).

## 3. Benefit multiple helpers

### `workstreamBenefitMultiple(workstream)` — `calculations.ts:70-72`

- **Math:** multiple = benefitSEK ÷ costSEK, with a zero-cost guard.
- **Plain English:** how many kronor of estimated value each invested krona buys in this
  workstream. It is the ranking key for the priority strategy, the preset builder, and the
  decision table.
- **Edge case:** `costSEK ≤ 0` returns `0` (never `NaN`/`Infinity`), per `src/lib/AGENTS.md`.

### `topWorkstreamsByBenefitMultiple(count, workstreams = WORKSTREAMS)` — `:202-209`

Sorts a copy of the workstream list by multiple descending and takes the first
`Math.max(0, count)` entries. Negative or zero `count` yields `[]`.

### `presetForTopWorkstreams(id, label, count, workstreams)` — `:211-228` and `scenarioPresets(workstreams)` — `:230-237`

Build the two one-click scenarios from the top-N multiples:

| Preset | N | Workstreams | Cost | Benefit | Multiple |
|---|---|---|---|---|---|
| **Minimum Viable** | 2 | Hardware, Software | 13,800,000 | 26,000,000 | ≈ 1.8841 |
| **Flat Resourcing** | 4 | Hardware, Software, OT, Cloud | 27,600,000 | 37,750,000 | ≈ 1.3678 |

`budgetSEK` is set to the preset's total cost, so applying a preset funds exactly those
workstreams at 100%. Pinned by `calculations.test.ts:232-251`.

## 4. `computeAllocation(budgetSEK, strategy, workstreams)` — `calculations.ts:119-166`

The heart of the Budget What-If view: *"I only have X SEK — what do I get?"* Negative budgets are
clamped to 0 first (`usableBudget = Math.max(0, budgetSEK)`, `:124`).

### Strategy `'priority'` — "prioritize highest value first" (`:127-150`)

1. Sort workstreams by benefit multiple **descending** (best value per krona first).
2. Walk the sorted list with a `remaining` purse:
   - `remaining ≤ 0` → the workstream gets **0%** (deferred).
   - `remaining + 0.01 ≥ costSEK` → fund **100%**, subtract the full cost. The one-öre epsilon
     (`CURRENCY_EPSILON_SEK`, `:54`) means float rounding can never strand a workstream at
     99.9999…% when the budget mathematically covers it.
   - Otherwise → **partial funding**: `pct = (remaining ÷ costSEK) × 100` (guarded: 0 if the
     cost is 0), then the purse is empty and every later workstream gets 0%.
3. `leftoverSEK = max(0, remaining)` — non-zero only when the budget exceeds the full plan cost.

### Strategy `'even'` — "spread evenly" (`:152-165`)

Every workstream gets the **same percentage**:

```
pct = min(100, (usableBudget ÷ totalCost) × 100)     // 0 if totalCost = 0
leftoverSEK = max(0, usableBudget − totalCost × pct/100)
```

No ranking, no partial-boundary special case: all six move together.

### Worked examples pinned by the tests (`calculations.test.ts:67-124`)

| Call | Result |
|---|---|
| `computeAllocation(41_400_000, 'priority')` | all 6 at 100%, leftover 0 |
| `computeAllocation(41_400_000, 'even')` | all 6 at 100%, leftover 0 |
| `computeAllocation(0, 'priority')` | all 6 at 0%, leftover 0 (zero budget defers everything) |
| `computeAllocation(8_625_000, 'priority')` | Hardware 100% (highest multiple ≈ 2.232), everything else 0%, leftover 0 |
| `computeAllocation(20_000_000, 'even')` | every workstream at 20/41.4 × 100 ≈ 48.31% |
| `computeAllocation(120_000_000, 'priority')` | all 6 at 100%, leftover **78,600,000** (budget beyond the plan is reported, not spent) |

**Edge cases:** zero budget → all zeros, leftover 0; negative budget → treated as 0; budget above
the plan → capped at 100% per workstream with the excess returned as `leftoverSEK`; empty
workstream list → `totalCost = 0` → even-strategy pct = 0.

### `fullPlanAllocation()` — `:326-328`

Convenience wrapper: `computeAllocation(TOTAL_FULL_COST, 'even')` — the "fund the whole plan as
proposed" scenario used as a baseline in views.

## 5. Scenario totals

### `computeTotals(allocation, workstreams = WORKSTREAMS)` — `calculations.ts:168-187`

- **Math:**
  ```
  costSEK    = Σ workstream.costSEK    × pct(id) / 100
  benefitSEK = Σ workstream.benefitSEK × pct(id) / 100
  multiple   = benefitSEK ÷ costSEK    (0 when costSEK = 0)
  ```
- **Plain English:** scales each workstream's cost and benefit linearly by its funded percentage
  and sums them. The model assumes value scales proportionally with funding — a documented
  simplification, not a diminishing-returns curve.
- **Pinned:** full plan → cost 41,400,000, benefit 43,000,000, multiple ≈ 1.0386
  (`calculations.test.ts:126-133`); zero allocation → all zeros, multiple exactly `0`
  (`:135-141`). Missing ids in `pctById` are treated as 0% (`?? 0`, `:174`).

### `computeSelectionTotals(selectedIds, workstreams = WORKSTREAMS)` — `:189-200`

The Workstream What-If engine: selected ids are treated as 100% funded, unselected as 0%, then
delegated to `computeTotals`.

- **Pinned:** `{hardware, software}` → cost 13,800,000, benefit 26,000,000, multiple =
  26,000,000 ÷ 13,800,000 ≈ 1.8841 (`calculations.test.ts:144-152`); empty selection →
  all zeros (`:154-160`).

## 6. Partner cost model

### `maxFullyCoverableWorkstreams(partners = PARTNERS)` — `:74-78`

Returns `6` when at least one partner is engaged, else `0`. Business meaning: with the full
partner team contracted, all 6 workstreams can be resourced at full depth.
**Divergence note:** `app_spec/06_BACKLOG_CORRECTIONS.md` §CR-1.1–1.3 proposes a per-partner
min/max FTE model where this ceiling becomes data-driven (`min` across partners of how many
workstreams each can support). That correction is **not implemented** — the function is still the
spec-03 §3.1 constant. The test pins `6` (`calculations.test.ts:48`).

### `regeneratePartnerFullAnnualCosts(partners = PARTNERS)` — `:80-90`

Rebuilds the `{ EY: 30M, Accenture: 3M, TCS: 8.4M }` map from the partner list. Exists so the
share tables can be regenerated from source data rather than hand-maintained (the reproducibility
requirement in `app_spec/06` §CR-1.2). Pinned to equal `PARTNER_FULL_ANNUAL_COST`
(`calculations.test.ts:51-53`).

### `regeneratePartnerShareTables(annualCosts)` — `:92-117`

Derives both partner share tables from annual costs:

```
month4Share   = annual × (9/12) ÷ 6                      // Months 4–12, 6 active workstreams
startsInQ1    = annual × (3/12) ÷ 3 + month4Share        // Q1 (3 active) + Months 4–12
startsMonth4  = month4Share
```

E.g. EY: 30M × 3/12 ÷ 3 = 2.5M, 30M × 9/12 ÷ 6 = 3.75M → Q1-start share 6.25M, Month4-start share
3.75M. Verified to 2 decimal places against the constants in `src/data/partners.ts:50-60`
(`calculations.test.ts:55-64`).

### `partnerBreakdownFor(workstreams)` — `:239-261` and `partnerBreakdownForWorkstream(workstream)` — `:263-267`

Accumulates per-partner spend across a set of workstreams: each Q1-starting workstream adds the
`PARTNER_SHARE_STARTS_IN_Q1` row, each Month4-starting one adds the
`PARTNER_SHARE_STARTS_MONTH4` row.

- **Pinned:** `[hardware, ai, cloud]` (all Q1 starters) →
  `{ EY: 18,750,000, Accenture: 1,875,000, TCS: 5,250,000 }` (`calculations.test.ts:163-174`);
  a single Hardware workstream → `{ EY: 6,250,000, Accenture: 625,000, TCS: 1,750,000 }`
  (`:176-185`).

### `workstreamFinancials(workstream)` — `:269-278`

One workstream's full financial card: cost, benefit, guarded multiple, and partner split. Pinned
for AI Assets: cost 8,625,000, benefit 3,500,000, multiple = 3.5M ÷ 8.625M ≈ 0.4058, partner split
as above (`calculations.test.ts:188-204`).

## 7. Risk & readiness helpers

These feed the Enterprise Risk / AI Risk views (an evolution beyond the v1 spec).

| Function | Lines | What it answers |
|---|---|---|
| `summarizeRiskSeverity(risks = ENTERPRISE_RISKS)` | `:280-290` | How many enterprise risks sit at each severity. Pinned: `{ high: 2, medium: 2, ready: 0 }` (`calculations.test.ts:207-213`). |
| `risksForWorkstream(workstreamId, risks)` | `:292-299` | Which enterprise risks touch a given workstream. Pinned: `'ai'` → `incomplete-visibility`, `data-regression`, `delivery-dependencies`, `value-scale` (`:215-222`). |
| `averageAiReadiness(domains = AI_READINESS_DOMAINS)` | `:301-308` | Mean readiness across the 4 AI-governance domains. Pinned: (42+35+24+18) ÷ 4 = **29.75%** (`:225`). Empty list → `0` (guard at `:304`). |
| `readinessTone(readinessPct)` | `:310-316` | Severity-style color tone for a readiness score: `≥ 70` → `'ready'`, `≥ 35` → `'medium'`, else `'high'` (i.e. high risk). Pinned: 80/42/18 (`:226-228`). Note the tone names reuse the `RiskSeverity` type, so a *low* readiness gets the *`high`*-risk tone. |

## 8. Coverage labels

### `coverageLabel(pct)` — `:318-324`

```
pct ≥ 90 → 'Full'
pct ≥ 10 → 'Partial'
else     → 'Deferred'
```

Business language for a funded percentage: at least 90% funded is "Full" (the workstream can
deliver its year-one outcome), 10–89% is "Partial" (scoped-down delivery), under 10% is
"Deferred" (effectively not happening this year). Boundaries are inclusive at the top of each
band — pinned exactly: `coverageLabel(90) = 'Full'`, `coverageLabel(10) = 'Partial'`,
`coverageLabel(9.99) = 'Deferred'` (`calculations.test.ts:253-259`). The same 90/10 thresholds
recur in the roadmap's `ActiveItemState` (see doc 04) and `coverageColor` below.

## 9. Formatting & design tokens — `src/lib/format.ts`

Presentation constants shared by every view (kept in `src/lib` so styling rules live beside the
calculation rules they visualize).

### Color constants (`format.ts:1-12`)

| Constant | Value | Use |
|---|---|---|
| `HM_RED` | `#CC071E` | H&M brand red; also `ACCENT` and `BAD`. |
| `HM_RED_DARK` | `#9F0618` | Darker brand red (hover/emphasis). |
| `INK` | `#171717` | Primary text. |
| `PAPER` | `#FAF7F4` | App background. |
| `STEEL` | `#5B6B82` | Secondary text. |
| `GOOD` | `#587E1F` | Positive indicator green. |
| `WARN` | `#9B6615` | Caution amber-brown. |
| `SURFACE` / `LINE` / `SOFT` | `#FFFFFF` / `#DDD5CF` / `#F0EBE7` | Card surface, hairline, muted fill. |

### Number formatting

| Export | Lines | Behavior |
|---|---|---|
| `M = 1_000_000` | `:14` | Million divisor. |
| `MONO_NUMERIC_CLASS` | `:15` | Tailwind class `font-mono tabular-nums` so figures align in tables. |
| `fmtM(sek)` | `:17-18` | `(sek ÷ 1,000,000).toFixed(2) + "M SEK"` → e.g. `41,400,000` → `"41.40M SEK"`. |
| `fmtX(multiple)` | `:20` | `multiple.toFixed(2) + "x"` → e.g. `1.0386` → `"1.04x"`. |

### Color-by-value rules

- **`multipleColor(x)`** (`:22-26`): `x ≥ 0.9` → `GOOD`, `x ≥ 0.4` → `WARN`, else `BAD`.
  Business reading: a multiple below 0.4× means the directional value estimate returns less than
  40 öre per invested krona; ≥ 0.9× approaches break-even. These thresholds are from
  `app_spec/03` §4 verbatim.
- **`coverageColor(pct)`** (`:28-32`): the same 90/10 bands as `coverageLabel` —
  `≥ 90` → `GOOD`, `≥ 10` → `WARN`, else `BAD` — so a workstream tile's color always
  agrees with its Full/Partial/Deferred label.

**Divergence from spec:** `app_spec/03` §4 specifies only `fmtM`, `fmtX` and the multiple
color thresholds. The palette constants, `M`, `MONO_NUMERIC_CLASS`, and `coverageColor` are
post-spec additions supporting the shipped design system and the risk/roadmap views.

## 10. Divergences and caveats

1. **Legacy reference values are stale.** Workspace `AGENTS.md:34` and `docs/00_OVERVIEW.md:44-45`
   cite 99,510,000 SEK / ≈ 0.4321 from before the partner cost-model correction; the live pinned
   values are 41,400,000 SEK / 43,000,000 SEK / ≈ 1.0386 (`calculations.test.ts:33-38`,
   `app_spec/03` §5). Treat any doc quoting the old figures as outdated.
2. **`LAST_YEAR_COST` / `DELTA_FULL_VS_LAST_YEAR`** are specified in `app_spec/03` §2.3 but are
   **absent** from `src/data/derived.ts`; the current dashboard deliberately dropped last-year
   comparisons (the decision test asserts no metric label matches /last year/i —
   `decision.test.ts:18-20`).
3. **Linear value scaling.** `computeTotals` scales benefit linearly with funding percentage;
   there is no partial-funding discount. This is a modeling choice baked into every view.
4. **FTE-based resourcing corrections** (`app_spec/06` §CR-1.x) are unimplemented;
   `maxFullyCoverableWorkstreams` remains a constant 6.
5. **Everything is synchronous and pure** so views can call these from `useMemo` without
   `useEffect` recomputation — a hard rule in `src/lib/AGENTS.md`.
