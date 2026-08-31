# Decision, Roadmap, ROI & Versioning Logic

This document covers the four `src/lib/` modules that sit **on top of** the calculations engine
(documented in `docs/03_CALCULATIONS_ENGINE.md`) and answer the executive-layer questions:

| Module | Business question it answers |
|---|---|
| `src/lib/capabilityRoi.ts` | "If I invest X SEK (in this scope), what capability maturity, value and risk reduction do I get?" — the **Capability ROI Board** |
| `src/lib/decision.ts` | "What are the headline numbers, and which workstream gives the best value?" — the dashboard hero metrics and decision table |
| `src/lib/roadmap.ts` | "Given a budget and a lens (foundation/risk/compliance/value), which roadmap items light up, and how funded is the plan?" — the **roadmap timeline** |
| `src/lib/versioning.ts` | "Which app version does this URL serve?" — the path-based **v0/v1 switch** |

All four are pure and synchronous, per the rules in `src/lib/AGENTS.md` (guard every division,
never return `NaN`/`Infinity`, no side effects). Each has a co-located Vitest file that pins the
behavior described below. These modules are all **post-spec additions** — none of them appear in
`app_spec/01_PRD.md`–`04_COMPONENT_SPEC.md`; they implement the views the shipped app grew
beyond v1 scope (see §6).

## 1. Capability ROI board — `src/lib/capabilityRoi.ts`

The ROI board translates a budget (optionally restricted to a subset of workstreams) into a
capability story: maturity progression, directional value, and four "ROI pillars" an executive
audience cares about.

### 1.1 Exported types

| Type | Lines | Purpose |
|---|---|---|
| `CapabilityMaturity` | `:4-8` | `current`, `projected`, `target` maturity levels on a 1–3 scale. |
| `CapabilityRoiPillars` | `:10-15` | Four percentage signals: `money` (benefit-weighted % of the 43M value potential in the scoped path; funded coverage % in the budget-only path), `security` (% unmanaged technology risk reduction), `complianceReadiness` (% readiness), `incidentResponse` (% uplift). |
| `CapabilityRoiSummary` | `:17-24` | Board headline: effective budget, value unlocked, multiple, funded scope %, maturity triple, pillars. |
| `ScopedCapabilityRoiSummary` | `:26-29` | Adds `scopeCostSEK` / `scopeBenefitSEK` — the full cost and benefit of just the selected workstreams ("investment requirement" / "value potential of this scope"). |
| `ModelScopePresetId` | `:31-35` | `'minimum_viable' \| 'security_first' \| 'compliance_ready' \| 'full_uplift'`. |
| `ModelScopePreset` | `:37-42` | A one-click modeling preset: label, budget, workstream scope. |
| `CapabilityRow` | `:44-50` | One board row: capability name, outcome, current/projected maturity, `returnSignalPct`. |
| `ScopeWikiRow` | `:52-62` | A workstream "wiki" card: cost, benefit, year-one summary, in-scope items, out-of-scope (year-two) boundary, value-highlight labels. |

### 1.2 Modeling constants (`:65-70`)

| Constant | Value | Business meaning |
|---|---|---|
| `CURRENT_MATURITY` | `1` | Today's asset-management maturity (initial/ad-hoc) on the 1–3 scale. |
| `TARGET_MATURITY` | `3` | "Managed" maturity the 12-month programme targets at full funding. |
| `MAX_SECURITY_REDUCTION_PCT` | `80` | At full funding of the risk-relevant scope (hardware + AI + cloud + OT), up to **80% reduction in unmanaged technology risk** — aligned to the Strategic Value Framework target (`src/data/knowledgeDeck.ts:150`). Was `20` before the framework alignment. |
| `MAX_COMPLIANCE_READINESS_PCT` | `80` | At full funding of the same four workstreams, up to **80% compliance readiness** (e.g. EU AI Act). |
| `MAX_INCIDENT_RESPONSE_UPLIFT_PCT` | `30` | At full funding, up to **30% faster/better incident response** (no framework counterpart; kept as-is). |

The three "MAX" caps are directional claims — like the benefit figures, they are estimates, not
audited numbers. The security cap is now anchored to the Strategic Value Framework's
"Unmanaged technology risk: 80% reduction" target.

### 1.3 Capability model (`CAPABILITY_INPUTS`, `:110-161`)

Eight enterprise capabilities, each with a subjective **weight** (how strongly full funding
expresses as progress in that capability) and the set of workstreams that deliver it:

| Capability | Weight | Delivered by |
|---|---|---|
| Physical IT asset management | 0.98 | hardware |
| Asset discovery and reconciliation | 0.94 | hardware, ai, cloud, ot, software |
| Business ownership and data quality | 0.90 | all six |
| Security posture integration | 0.88 | hardware, ai, cloud, ot |
| AI asset management | 0.82 | ai |
| Cloud and on-prem asset management | 0.76 | cloud |
| Software and license governance | 0.72 | software |
| OT / industrial asset visibility | 0.58 | ot |

A capability counts as **in scope** when *any* of its delivering workstreams is selected
(`:368-370`). Weights are display heuristics — they shape the `returnSignalPct` bar, nothing
else — and they are ordered in the array so the highest-signal capability renders first (pinned:
row 0 is "Physical IT asset management" with `returnSignalPct: 98` at full funding,
`capabilityRoi.test.ts:138-151`).

### 1.4 Internal math (`:209-219`)

```
clamp(n, min, max)               = max(min, min(max, n))
fundingCoverage(budget, fullCost) = clamp(max(0, budget) ÷ fullCost, 0, 1)   // 0 if fullCost = 0
maturityFromCoverage(c)           = 1 + (3 − 1) × c = 1 + 2c
```

**Plain English:** coverage is the fraction of the plan (or selected scope) the budget can pay
for, clamped to 0–100%. Maturity moves **linearly** from 1 (today) to 3 (target) with coverage —
half-funded plan ⇒ projected maturity 2.0. Like `computeTotals`, this is a deliberate linear
model, not a diminishing-returns curve.

### 1.5 `scopeIdsCoveredByBudget(budgetSEK)` — `:275-295`

Greedy **full-coverage-only** selection in a fixed roadmap priority order
(`BUDGET_COVERAGE_PRIORITY`, `:266-273`):

```
hardware → ai → cloud → ot → software → newemerging
```

Walk the list accumulating cost; include a workstream only if the running total **plus its full
cost** still fits the budget; stop at the first that does not. There is no partial funding here —
unlike `computeAllocation(..., 'priority')`, which ranks by benefit multiple and partial-funds
the boundary workstream. Note the two orderings **deliberately differ**: this list is the
client's roadmap sequencing (hardware first, then AI, cloud…), not the value-per-krona ranking
(hardware, software, ot, cloud, ai, newemerging).

**Pinned boundaries** (`capabilityRoi.test.ts:110-136`):

| Budget (SEK) | Covered scope |
|---|---|
| 0 or 8,624,999 (one krona short) | `[]` |
| 8,625,000 | `[hardware]` |
| 17,250,000 | `[hardware, ai]` |
| 25,875,000 | `[hardware, ai, cloud]` |
| 31,050,000 | `[hardware, ai, cloud, ot]` |
| 41,400,000 (`TOTAL_FULL_COST`) | all six |

### 1.6 `capabilityRoiSummary(budgetSEK, fullCostSEK = TOTAL_FULL_COST, fullBenefitSEK = TOTAL_FULL_BENEFIT)` — `:297-323`

The board's headline math:

```
coverage        = fundingCoverage(budget, fullCost)
valueSEK        = fullBenefit × coverage                     // value unlocked scales with coverage
usedBudgetSEK   = clamp(budget, 0, fullCost)                 // budget beyond the plan is not "used"
multiple        = valueSEK ÷ usedBudgetSEK  (0 if usedBudget = 0)
fundedScopePct  = round(coverage × 100)
maturity        = { current: 1, projected: 1 + 2×coverage, target: 3 }
pillars.money             = round(coverage × 100)   // budget-only path: linear value assumption
pillars.security          = round(80 × coverage)
pillars.complianceReadiness = round(80 × coverage)
pillars.incidentResponse  = round(30 × coverage)
```

**Edge cases:** budget 0 → value 0, multiple 0, funded scope 0%, projected maturity 1, all pillars
0 (pinned at `capabilityRoi.test.ts:32-42`); budget above `fullCostSEK` → coverage clamps at 1,
so the summary never claims more than the full plan delivers, and the excess budget is excluded
from `budgetSEK`. Full funding pins: budget 41,400,000 → value 43,000,000, multiple ≈ 1.0386,
maturity 1 → 3, pillars `{ money: 100, security: 80, complianceReadiness: 80, incidentResponse: 30 }`
(`:15-30`).

### 1.7 `scopedCapabilityRoiSummary(selectedIds, budgetSEK)` — `:325-349`

Same math, but scoped: `fullCostSEK`/`fullBenefitSEK` are recomputed as the sums over the
**selected** workstreams only, so the board answers "what does this subset cost, and what is it
worth, at this budget?" Adds `scopeCostSEK` (investment requirement of the selection) and
`scopeBenefitSEK` (value potential).

Scoped pillars come from `scopedPillars(selectedIds, coverage)` (`:206-263`) using the
per-workstream contribution table `WORKSTREAM_PILLAR_CONTRIBUTIONS` (`:72-108`):

| Workstream | Security | Compliance | Incident |
|---|---|---|---|
| Hardware | 18 | 9 | 12 |
| AI Assets | 22 | 26 | 3 |
| Cloud | 27 | 21 | 5 |
| OT | 13 | 24 | 7 |
| Software | 0 | 0 | 2 |
| New & Emerging | 0 | 0 | 1 |
| **Full-scope total (= cap)** | **80** | **80** | **30** |

**Business rule (framework-aligned):** risk reduction and compliance readiness are delivered by
**hardware + AI + cloud + OT only** — fully funding exactly that scope reaches both caps (80/80).
Software (SAM) and New & Emerging contribute **0** to both; their value is financial instead,
which surfaces through the **benefit-weighted money pillar** (`:231-241`):

```
pillars.money (scoped) = round( (selectedBenefitSEK ÷ TOTAL_FULL_BENEFIT) × coverage × 100 )
```

where `selectedBenefitSEK` = Σ `benefitSEK` of the selected workstreams (0 if
`TOTAL_FULL_BENEFIT <= 0`, per the zero-denominator rule). SAM+Cloud funded → 32%; hardware only
→ 45%; full scope → 100. The other pillars are `round(clamp(Σ contributions, 0, cap) × coverage)`.

**Pinned** (`capabilityRoi.test.ts:45-71`):
- `{hardware, ai}` at 17,250,000 SEK → scope cost 17,250,000, scope benefit 22,750,000, budget
  fully used, value 22,750,000, multiple ≈ **1.3188**, funded scope 100%, projected maturity 3,
  pillars `{ money: 53, security: 40, complianceReadiness: 35, incidentResponse: 15 }`.
- **Preset ladder** (`:85-114`): hardware only → `{ security: 18, compliance: 9, incident: 12 }`;
  +ai+cloud → `{ 67, 56, 20 }`; +ot → `{ 80, 80, 27 }` (both caps reached by the four risk
  workstreams alone).
- **Software-only** (`:121-131`): pillars `{ money: 16, security: 0, complianceReadiness: 0,
  incidentResponse: 2 }` — encodes "SAM drives finance, not risk/compliance".
- **Empty selection** → `scopeCostSEK = 0`, so `fundingCoverage`'s zero-denominator guard
  returns coverage 0: value 0, multiple 0, funded scope 0%, maturity stays at 1 — the empty-scope
  case is safe by construction.

### 1.8 `modelScopePreset(id)` — `:351-356` and `MODEL_SCOPE_PRESETS` (`:166-204`)

One-click modeling presets for the board. Note these are **independent** of the
`scenarioPresets()` in calculations.ts — different names, different scopes, roadmap ordering:

| Preset | Budget (SEK) | Scope | Business story |
|---|---|---|---|
| `minimum_viable` | 8,625,000 | hardware | Prove the model on the hardware foundation only. |
| `security_first` | 25,875,000 | hardware, ai, cloud | Fund the security-relevant asset domains first. |
| `compliance_ready` | 31,050,000 | hardware, ai, cloud, ot | Add OT to reach compliance readiness. |
| `full_uplift` | 41,400,000 (`TOTAL_FULL_COST`) | all six | The complete 12-month programme. |

Each budget equals the exact sum of its workstreams' costs, so every preset lands at 100% funded
scope for its scope. All four pinned at `capabilityRoi.test.ts:73-108`.

### 1.9 `capabilityRows(budgetSEK, fullCostSEK, selectedWorkstreamIds = all)` — `:358-385`

Builds the 8 board rows from `CAPABILITY_INPUTS`:

```
inScope           = any of the capability's workstreams is selected
capabilityCoverage = inScope ? clamp(coverage × weight, 0, 1) : 0
projectedMaturity  = inScope ? 1 + 2×coverage : 1
returnSignalPct    = round(capabilityCoverage × 100)
```

**Pinned** (`capabilityRoi.test.ts:153-177`): with scope `{hardware, ai}` fully funded
(17,250,000 / 17,250,000 → coverage 1), "Physical IT asset management" projects to maturity 3
with return signal 98 (weight 0.98), "AI asset management" → 3 / 82, while out-of-scope
capabilities ("Cloud and on-prem", "Software and license governance") stay at maturity 1 with
return signal 0. Full-plan call returns exactly 8 rows.

### 1.10 `capabilityMaturitySummary(rows)` — `:387-406`

Averages `currentMaturity` and `projectedMaturity` across the rows, rounded to 2 decimals;
`target` is always 3. Empty row list → the safe default `{ current: 1, projected: 1, target: 3 }`.
**Pinned** (`capabilityRoi.test.ts:179-193`): for the `{hardware, ai}` scope at full
coverage, exactly **5 of the 8 capabilities are in scope** — "Physical IT asset management"
(hardware), "Asset discovery and reconciliation" (touches hardware/ai), "Security posture
integration" (touches hardware/ai), "AI asset management" (ai), and "Business ownership and data
quality" (touches all six) — so 5 rows project to maturity 3 and the other 3 (cloud-, software-,
OT-only capabilities) stay at 1. The summary averages all 8 rows: (5×3 + 3×1) ÷ 8 = 18 ÷ 8 =
**2.25**, giving `{ current: 1, projected: 2.25, target: 3 }`. Note the average counts
out-of-scope rows at their current maturity, which is what pulls the board-level projection below
the in-scope rows' 3.0.

### 1.11 Scope wiki — `scopeWikiRows()` (`:408-420`) and `scopeWikiRowById(rows, id)` (`:422-427`)

Map `WORKSTREAMS` into wiki cards: year-one outcome as `summary`, `scopeItems` as `inScope`,
**year-two outcome as `outOfScope`** (the year-one boundary: anything year-two is explicitly out
of this programme's scope), and value-highlight labels as `highlight`. `scopeWikiRowById` is a
null-safe lookup (`null` id → `undefined`) used when a board row is clicked. Pinned: 6 rows,
Hardware row carries cost 8,625,000, benefit 19,250,000, the three highlight labels, the Zebra/
HP/Canon/Kandji/SCCM scope item, and the predictive-lifecycle out-of-scope sentence
(`capabilityRoi.test.ts:195-224`).

## 2. Decision helpers — `src/lib/decision.ts`

Thin, pure selectors that compose the calculations engine into dashboard-ready view models.

### 2.1 Types

| Type | Lines | Purpose |
|---|---|---|
| `DecisionMetric` | `:14-19` | A hero metric: `label`, numeric `value`, `unit` (`'sek' \| 'x' \| 'count'`), and a `context` caption. |
| `DashboardDecisionSummary` | `:21-25` | Hero title, subtitle, and the metric list for the cockpit header. |
| `WorkstreamDecisionRow` | `:27-36` | One row of the decision table: identity, cost, benefit, multiple, risk count, primary (year-one) outcome. |

### 2.2 `dashboardDecisionSummary()` — `:38-72`

Returns the four executive hero metrics, in fixed order:

| Label | Value | Unit | Context caption |
|---|---|---|---|
| Full-scope cost | `TOTAL_FULL_COST` = 41,400,000 | sek | "EY + Accenture + TCS delivery basis" |
| Directional value | `TOTAL_FULL_BENEFIT` = 43,000,000 | sek | "benefit estimate with disclosure retained" |
| Benefit multiple | `FULL_MULTIPLE` ≈ 1.0386 | x | "value divided by cost" |
| High enterprise risks | `summarizeRiskSeverity().high` = 2 | count | "4 total mapped risks" |

Two business rules are encoded here and pinned by test (`decision.test.ts:7-22`):

1. **The disclosure rule.** The value metric is labeled *"Directional value"* and its context
   says the disclosure is retained — satisfying the hard requirement that benefit estimates are
   never presented as audited numbers (`AGENTS.md`, `docs/00_OVERVIEW.md`).
2. **No last-year comparisons.** The test asserts no metric label matches `/last year/i`. The
   spec's `LAST_YEAR_COST` / `DELTA_FULL_VS_LAST_YEAR` (`app_spec/03` §2.3) were dropped from
   the data layer and the dashboard; the hero title is pinned as *"Enterprise Asset Intelligence
   cockpit"*.

### 2.3 `workstreamDecisionRows()` — `:74-85`

One row per workstream — cost, benefit, guarded multiple (`workstreamBenefitMultiple`), number
of enterprise risks touching it (`risksForWorkstream(...).length`), and the year-one outcome —
**sorted by multiple descending** so the table reads as a value ranking. Pinned order
(`decision.test.ts:24-42`):

```
hardware (≈2.232) → software (≈1.304) → ot (≈0.918) → cloud (≈0.812) → ai (≈0.406) → newemerging (≈0.338)
```

Row 0 is pinned as hardware with `multiple = 19,250,000 ÷ 8,625,000` and `riskCount = 2`
(hardware is touched by `data-regression` and `delivery-dependencies`).

## 3. Roadmap timeline logic — `src/lib/roadmap.ts`

The interactive 12-month roadmap: 7 lanes (`hardware`, `ai`, `ot`, `ambition`, `cloud`,
`software`, `newemerging` — order pinned at `roadmap.test.ts:13-22`) of tagged work items
(`src/data/roadmap.ts`). Items carry `tags` drawn from the executive value pillars
`'foundation' | 'risk' | 'compliance' | 'value'` (`RoadmapFilter`, `src/data/roadmap.ts:1`,
re-exported at `roadmap.ts:9`).

### 3.1 Types

| Type | Lines | Purpose |
|---|---|---|
| `ActiveItemState` | `:11` | `'deferred' \| 'partial' \| 'full'` — lowercase mirror of the calculations engine's `coverageLabel`. |
| `RoadmapModelSummary` | `:13-18` | `{ filter, fundedScopePct, activeItemState, highlightedItemCount }` — the timeline's state for a budget + filter. |
| `RoadmapControlSummary` | `:20-23` | `{ headline, detail }` — copy for the control dock. |

### 3.2 `roadmapItemsForFilter(filter)` — `:25-29`

Flattens all lanes → cells → items, then keeps every item when `filter === 'all'`, else only
items whose `tags` include the filter. **Pinned** (`roadmap.test.ts:29-57`): `'risk'` yields
exactly the 12 ids `1.1, 1.4, 1.5, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.3, 4.6, 5.5`; `'compliance'`
yields 8 ids `2.1, 2.3, 2.4, 2.6, 2.5, 5.2, 5.5, 5.6`; `'all'` contains items `1.5`, `2.4`,
`6.1.3` (31 items total, see §3.4).

### 3.3 `roadmapItemsForScope(selectedWorkstreamIds)` — `:31-39`

Lane-level filtering by workstream selection: a lane's items are included iff the lane's id is in
the selection — with **one special case**: the `'ambition'` lane (cross-cutting ambition work) is
included when **either** `cloud` **or** `software` is selected (`:35-37`), because its items
deliver cloud/software outcomes. **Pinned**: `{hardware, ai}` → the 11 ids
`1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.6, 2.5` (`roadmap.test.ts:59-75`) — ambition
items excluded because neither cloud nor software is selected.

### 3.4 `roadmapModelSummary(budgetSEK, filter, fullCostSEK = TOTAL_FULL_COST)` — `:47-63`

```
fundedScopePct  = round( clamp(budget, 0, fullCost) ÷ fullCost × 100 )   // 0 if fullCost = 0
activeItemState = fundedScopePct ≥ 90 → 'full'
                  fundedScopePct ≥ 10 → 'partial'
                  else               → 'deferred'
highlightedItemCount = roadmapItemsForFilter(filter).length
```

The 90/10 thresholds are the same business bands as `coverageLabel` in the calculations engine
(Full ≥ 90%, Partial 10–89%, Deferred < 10%), kept as a lowercase state machine for styling.
**Pinned** (`roadmap.test.ts:77-93`): full budget + `'all'` → `{ fundedScopePct: 100,
activeItemState: 'full', highlightedItemCount: 31 }`; half budget + `'risk'` → `{ 50, 'partial', 12 }`.

### 3.5 `roadmapControlSummary(budgetSEK, filter, fullCostSEK)` — `:65-78`

Composes `roadmapModelSummary` into display copy: headline `"{Filter} roadmap controls"`
(`"All"` for `'all'`, otherwise the capitalized filter), detail
`"{n} {filter}-linked roadmap items highlighted at {pct}% funded scope."` (`"roadmap"` without
a prefix for `'all'`). **Pinned verbatim** (`roadmap.test.ts:95-100`):
`roadmapControlSummary(TOTAL_FULL_COST / 2, 'risk')` →
`{ headline: 'Risk roadmap controls', detail: '12 risk-linked roadmap items highlighted at 50% funded scope.' }`.

## 4. Version switch — `src/lib/versioning.ts`

The whole module is one type and one function (`:1-5`):

```ts
export type AppVersion = 'v0' | 'v1';

export function appVersionFromPath(pathname: string): AppVersion {
  return pathname === '/v0' || pathname.startsWith('/v0/') ? 'v0' : 'v1';
}
```

**Business context:** the app shipped a redesigned `v1` experience (the Capability ROI board and
its supporting views) while keeping the legacy multi-tab app reachable. Rather than a router or a
feature-flag service, the version is read **from the URL path** at bootstrap:
`src/App.tsx:25` calls `appVersionFromPath(window.location.pathname)`.

**Rules, pinned by `versioning.test.ts:4-15`:**

| Path | Version |
|---|---|
| `/v0`, `/v0/workstreams`, any `/v0/*` | `v0` (legacy app) |
| `/v1`, `/v1/board` | `v1` (new board) |
| `/` and **anything else** | `v1` — v1 is the default; only the explicit `/v0` prefix opts into legacy |

The check is a prefix test on the exact segment (`/v0` or `/v0/…`), so a hypothetical path like
`/v0legacy` would **not** match and would fall through to `v1`.

## 5. How the tests pin behavior — summary

| Test file | What it freezes |
|---|---|
| `capabilityRoi.test.ts` | Full/zero-funding summaries; scoped summary incl. empty-scope safety; all 4 preset budgets+scopes; budget-coverage boundaries to the exact krona; 8 capability rows with weights; maturity averaging; wiki row contents and lookup. |
| `decision.test.ts` | Hero title, exact metric order, the *absence* of last-year comparisons; workstream ranking order and hardware's multiple/risk count. |
| `roadmap.test.ts` | Lane order; exact item-id lists for `risk`/`compliance` filters and the `{hardware, ai}` scope; funded-scope %, active-item state and 31/12 highlight counts; control-dock copy verbatim. |
| `versioning.test.ts` | `/v0` prefix → legacy; `/v1`, `/` and everything else → new board. |

## 6. Divergences from the spec docs

1. **All four modules are beyond v1 spec scope.** `app_spec/01_PRD.md`–`04_COMPONENT_SPEC.md`
   define three v1 views (Plan Overview, Budget What-If, Workstream What-If). The Capability ROI
   board, decision cockpit, roadmap timeline, risk views, password gate and the v0/v1 switch are
   later additions; `app_spec/05_BACKLOG.md` and `app_spec/06_BACKLOG_CORRECTIONS.md` track the
   still-open items.
2. **Two competing priority orders coexist intentionally.** The budget what-if ranks by benefit
   multiple (value per krona); the ROI board's `scopeIdsCoveredByBudget` and scope presets use
   the client's roadmap sequence (hardware → ai → cloud → ot → software → newemerging). Don't
   "reconcile" them — they answer different questions (value optimization vs. delivery sequencing).
3. **Duplicate threshold logic.** The 90/10 coverage bands live in both
   `calculations.ts` (`coverageLabel`, `:318-324`) and `roadmap.ts`
   (`activeItemStateFromCoverage`, `:41-45`); the clamp-and-round funded-scope % appears in
   both `capabilityRoi.ts` (`fundingCoverage`, `:153-155`) and `roadmap.ts`
   (`roadmapModelSummary`, `:52-55`). They must stay numerically identical — the tests pin
   both sides.
4. **No router.** Version selection is raw `window.location.pathname` prefix matching at app
   bootstrap, so deep-linking a `v1` sub-view requires no routing library but also means the
   switch is read once per page load.
5. **Legacy reference figures.** As noted in doc 03, workspace-level docs still quote the
   pre-correction full-plan cost of 99,510,000 SEK (multiple ≈ 0.4321); the live pinned values
   everywhere in these modules are 41,400,000 SEK cost / 43,000,000 SEK benefit / ≈ 1.0386
   multiple (`src/data/derived.ts:3-13`, `app_spec/06` §CR-1.2).
