# 06 — Views

This document describes every view component in `src/components/views/`: what business question it
answers, the controls and state it owns, which `src/lib/*` functions produce its numbers, and how
it re-renders live. Six views belong to the **v0 legacy app** (reachable at `/v0` through the
`TabNav` sidebar); the seventh, `CapabilityRoiBoard`, is the whole of the **v1 default app** and
gets an extended breakdown.

Shared conventions, unless noted otherwise:

- All derived numbers come from pure functions in `src/lib/calculations.ts`,
  `src/lib/decision.ts`, `src/lib/capabilityRoi.ts` or `src/lib/roadmap.ts`, consumed via
  `useMemo` — no `useEffect` recomputation, per the architecture rules.
- Money is displayed via `fmtM()` (millions of SEK, 2 decimals), multiples via `fmtX()`
  (**benefit ÷ cost**, e.g. 43,000,000 ÷ 41,400,000 ≈ 1.04x for the full plan), and both use
  `MONO_NUMERIC_CLASS` so digits don't shift as values change.
- Every division is guarded: a zero denominator yields 0, never NaN/Infinity
  (e.g. `src/lib/calculations.ts:67`, `:185`).

### Reference data (what the numbers mean)

The client plan has 6 workstreams (`src/data/workstreams.ts:64-244`). Cost = year-one delivery
cost across the three partners; benefit = directional (unaudited) value estimate.

| ID | Name | Cost (SEK) | Benefit (SEK) | Multiple | Starts |
|---|---|---|---|---|---|
| hardware | Hardware (WS1) | 8,625,000 | 19,250,000 | ≈2.23x | Q1 |
| ai | AI Assets (WS2) | 8,625,000 | 3,500,000 | ≈0.41x | Q1 |
| cloud | Cloud (WS3) | 8,625,000 | 7,000,000 | ≈0.81x | Q1 |
| ot | Operational Technology (WS4) | 5,175,000 | 4,750,000 | ≈0.92x | Month 4 |
| software | Software (WS5) | 5,175,000 | 6,750,000 | ≈1.30x | Month 4 |
| newemerging | New & Emerging Projects (WS6) | 5,175,000 | 1,750,000 | ≈0.34x | Month 4 |

Totals derived in `src/data/derived.ts`: `TOTAL_FULL_COST` = **41,400,000 SEK**,
`TOTAL_FULL_BENEFIT` = **43,000,000 SEK**, `FULL_MULTIPLE` ≈ **1.0386x**,
`MAX_FULLY_COVERABLE_WORKSTREAMS` = 6. Q1-starting workstreams cost more because they run all 12
months (the partner share tables in `src/data/partners.ts:50-60` encode the phasing: 8.625M vs
5.175M).

---

## 1. `Dashboard.tsx` (201 lines) — "Plan overview"

**Business purpose:** the landing cockpit. Answers "what does the full 12-month plan cost, what is
it worth, which workstreams give the best value, and where is the risk?" It is deliberately
*risk-led*: the copy steers leadership to fund by risk reduction, not only by cost.

**State:** none — everything derives from constants.

**Lib calls:**

- `dashboardDecisionSummary()` (`src/lib/decision.ts:38-72`) → hero title/subtitle plus 4
  `DecisionMetric`s: full-scope cost 41.40M SEK, directional value 43.00M SEK, benefit multiple
  ≈1.04x (each with a `unit` of `'sek' | 'x' | 'count'` driving `formatMetric` at
  `src/components/views/Dashboard.tsx:35-39`), and the count of *high*-severity enterprise risks
  (2 of the 4 risks in `src/data/risks.ts`).
- `workstreamDecisionRows()` (`src/lib/decision.ts:74-84`) → all 6 workstreams with cost,
  benefit, multiple (`workstreamBenefitMultiple` = benefit ÷ cost, 0-guarded), risk count, and
  year-one outcome, **sorted by multiple descending** (Hardware first, New & Emerging last).

**Renders:**

1. Hero pair (`:43-89`): red "Proposed 12-month plan" panel with a "Risk-led funding view" badge,
   beside a "Decision frame" card with two framing notes (fund by risk reduction; benefits stay
   directional). The hero explicitly notes last-year cost is removed from the model.
2. Four `StatCard`s from `summary.metrics` (`:91-101`); the multiple card is tinted with
   `multipleColor`.
3. "Workstream decision ranking" table (`:103-143`): numbered rows with cost, benefit, multiple;
   benefit/multiple columns hide below `md` breakpoint.
4. Recharts grouped `BarChart` "Cost vs. benefit (M SEK)" (`:145-181`): one bar pair per
   workstream short code, Cost in ACCENT red, Benefit in GOOD green, values pre-converted to
   millions with 1 decimal.
5. Three `WorkstreamTile`s — **only `WORKSTREAMS.slice(0, 3)`** (Hardware, AI, Cloud, the
   Q1 starters) at `fundedPct={100}` (`:184-188`).
6. **Persistent amber disclosure banner** (`:190-198`): benefit values are estimates weighted from
   the roadmap's ~25M SEK enterprise risk figure plus rough savings/avoidance estimates —
   directional, not audited ROI. Per PRD FR-1.4 this banner is never dismissable.

**Live recompute:** none needed; the view is static. The `StatCard` value animation still applies
on mount.

> **Spec divergence:** `app_spec/04_COMPONENT_SPEC.md` §Dashboard asks for 5 stat cards including
> "Δ vs last year" and "max workstreams fully coverable", and 6 tiles. Shipped shows 4 metrics
> (risk count replaces the delta/max cards — last-year cost was deliberately dropped from the model,
> so the Δ card no longer made sense) and 3 tiles.

---

## 2. `BudgetWhatIf.tsx` (232 lines) — "Budget / FTE what-if"

**Business purpose:** "I won't get the full 41.4M — what can I achieve with what I *will* get?"
Models budget-constrained allocation across all 6 workstreams.

**State (`src/components/views/BudgetWhatIf.tsx:29-32`):**

- `budgetM: number` — budget in **millions** of SEK for friendlier slider UX. Initialised to half
  the full plan rounded to 1 decimal: `+(41.4 / 2).toFixed(1) = 20.7` (i.e. 20.7M SEK).
- `strategy: 'priority' | 'even'` — default `'priority'`.

**Controls:**

- Range slider 0 → `maxSliderM = ceil(41.4 × 1.1) = 46` M SEK, step 0.5 (`:35`, `:73-82`),
  using the custom `.slider` gradient styling.
- A synced numeric input (`:88-98`) writing the same `budgetM`; `Number(value) || 0` means
  clearing the field falls back to 0 rather than NaN.
- Two **preset buttons** from `scenarioPresets()` (`src/lib/calculations.ts:230-237`), each
  showing its budget and multiple (`:106-121`). Clicking sets the exact budget and forces
  `strategy='priority'`:
  - *Minimum Viable* — top 2 workstreams by multiple (Hardware + Software): 13,800,000 SEK, benefit
    26,000,000, ≈1.88x.
  - *Flat Resourcing* — top 4 (adds OT + Cloud): 27,600,000 SEK, benefit 37,750,000, ≈1.37x.
- Two visible **strategy buttons** (`StrategyButton`, `:205-231`) rather than a dropdown:
  - **priority** — fund workstreams fully in descending benefit-per-SEK order until the budget runs
    out; the last affordable one may be partially funded
    (`computeAllocation`, `src/lib/calculations.ts:127-150`). Partial funding of the boundary
    workstream is `pct = remaining / costSEK × 100`; a 0.01-SEK epsilon
    (`CURRENCY_EPSILON_SEK`, `:54`, `:136`) treats floating-point dust as "fully funded".
  - **even** — every workstream gets the same percentage cut:
    `pct = min(100, budget / 41.4M × 100)` (`:152-165`).

**Lib calls:** `computeAllocation(budgetSEK, strategy)` → `{ pctById, leftoverSEK }`, then
`computeTotals(allocation)` → `{ costSEK, benefitSEK, multiple }` where
`costSEK = Σ ws.costSEK × pct/100`, `benefitSEK = Σ ws.benefitSEK × pct/100`,
`multiple = costSEK > 0 ? benefitSEK / costSEK : 0` (`:168-187`). Both are memoized on
`[budgetSEK, strategy]` (`BudgetWhatIf.tsx:38-43`).

**Renders:**

- 4 always-on `StatCard`s (`:146-174`): "You get" (allocated cost vs budget), "Benefit value"
  (vs 43.00M at full plan), "Benefit multiple" (tinted, sub-line compares against
  `FULL_MULTIPLE` ≈1.04x: better/below/same), "Max fully coverable" (constant 6).
- Conditional **"Unallocated"** card when `allocation.leftoverSEK > 1000` (`:175-182`) — the
  >1,000 SEK epsilon (not `!== 0`) suppresses float noise; this appears when the budget exceeds
  the full plan cost, which is possible because the slider goes to 110%.
- Grid of all 6 `WorkstreamTile`s with live `fundedPct={allocation.pctById[id] ?? 0}`
  (`:185-193`), in stable original order.

**Edge cases:** budget 0 → all tiles 0% ("Deferred", red), totals all 0, multiple 0. Budget ≥ full
cost under `priority` → everything 100% plus the unallocated card; under `even` pct caps at 100
so leftover accrues identically.

---

## 3. `WorkstreamWhatIf.tsx` (270 lines) — "Workstream what-if"

**Business purpose:** the opposite cut — "if we fund *only these* workstreams (e.g. just AI
Assets), what does that isolated scope cost and return, and which partners deliver it?"

**State:** `selected: Set<WorkstreamId>`, initially **empty**
(`src/components/views/WorkstreamWhatIf.tsx:54`). `toggle()` (`:77-87`) adds/removes ids in a
copied Set.

**Lib calls (memoized):**

- `computeSelectionTotals(selected)` (`src/lib/calculations.ts:189-200`): builds a 100/0
  `pctById` and reuses `computeTotals` — so selection math and allocation math can never drift
  apart.
- `partnerBreakdownFor(selectedWorkstreams)` (`:239-261`): sums the partner share table
  (Q1 vs month-4) across the chosen workstreams → `{ EY, Accenture, TCS }` in SEK.

**Renders:**

1. Six toggleable cards (`:101-172`) — deliberately **not** `WorkstreamTile` (different
   interaction model): icon, name, cost, per-workstream multiple (inline benefit ÷ cost with the
   `costSEK > 0` guard, `:105-108`), a custom checkbox square, and `ValueHighlightChips`
   (whose clicks are stop-propagation'd so they don't toggle the card).
2. **Empty state** when `selected.size === 0` (`:174-185`): dashed-border card with a
   MousePointer2 icon, "Select workstreams to model" — and *nothing else* below it.
3. With a selection: 4 `StatCard`s (`:188-213`) — count + short codes, total cost (with
   `costSEK / TOTAL_FULL_COST × 100`% of full plan), benefit (same % treatment), and multiple
   tinted by `multipleColor`.
4. Horizontal Recharts bar chart "Cost by partner, for this selection" (`:215-265`), one bar per
   partner in millions with fading opacity per bar (`fillOpacity = 1 - index × 0.15`).

**Live recompute:** every toggle re-runs both memos; stat values tick via the `StatCard`
animation.

---

## 4. `WorkstreamDetail.tsx` (165 lines) — per-workstream drill-down

**Business purpose:** the single-workstream reference page reached from the sidebar — full scope,
economics, partner split, and the risks it addresses.

**Props:** `{ workstream: Workstream }` (resolved by `LegacyApp` from the page state).

**Lib calls (memoized):**

- `workstreamFinancials(workstream)` (`src/lib/calculations.ts:269-278`) → cost, benefit,
  multiple (benefit ÷ cost, 0-guarded), and `partnerBreakdown` for this one workstream.
- `risksForWorkstream(workstream.id)` (`:292-299`) → the subset of `ENTERPRISE_RISKS` whose
  `affectedWorkstreamIds` include this workstream.

**Renders:**

1. Hero pair (`:40-68`): red panel with name, blurb, `ValueHighlightChips`; beside it a "Roadmap
   outcome" card with the year-one outcome and a "Year 2+" line (`yearTwoOutcome`).
2. Four `StatCard`s (`:70-89`): calculated cost; directional value (green, sub-line "not audited
   ROI" — the disclosure follows the number here too); benefit multiple (tinted); and phase —
   **"Q1" or "M4"** from `startsInQ1`, i.e. whether delivery starts in quarter 1 or month 4.
3. "Scope and delivery content" checklist (`scopeItems` with CheckCircle2 icons) beside a
   `PartnerCostSplit` card (`:91-113`).
4. "Workstream risk focus" (`riskFocus` strings) beside "Related enterprise risks" — each with a
   `RiskSeverityBadge` and its first business-impact line (`:115-154`).
5. Closing amber disclosure (`:156-162`): benefits are directional; risk content is mapped from
   the roadmap narrative.

**State / live recompute:** none — the page is static per workstream; switching workstreams remounts
it via `LegacyApp`.

---

## 5. `EnterpriseRiskView.tsx` (104 lines) — "Enterprise risk"

**Business purpose:** elevates the roadmap's strategic risks to a first-class decision view, linking
each risk to affected workstreams and the leadership ask that would mitigate it.

**State:** none. **Lib calls:** `summarizeRiskSeverity()` (`src/lib/calculations.ts:280-290`)
counts the 4 `ENTERPRISE_RISKS` by severity → `{ high: 2, medium: 2, ready: 0 }`.

**Renders:**

1. Red hero: "Risk is now a first-class decision view." (`:18-36`).
2. Four `StatCard`s (`:38-52`): High risks (2, red), Medium risks (2), **"Roadmap risk anchor —
   25.00M SEK"** (the ~25M enterprise risk figure that anchors the benefit estimates; hard-coded
   string, not a computed value), and "Affected streams — 6".
3. A 2-column card grid over all 4 risks (`:54-101`): title, `RiskSeverityBadge`, grey chips
   naming each affected workstream (via a module-level `workstreamNameById` lookup, `:9-11`), the
   full `businessImpact` bullet lines, and a "Leadership ask" footer.

**Live recompute:** none.

---

## 6. `AiRiskView.tsx` (158 lines) — "AI Act readiness"

**Business purpose:** a dedicated operating page for the EU AI Act exposure inside the AI Assets
workstream — inventory, ownership, metadata, risk classification, compliance workflow, evidence.

**State:** none. **Lib calls:**

- `workstreamFinancials(aiWorkstream)` — AI workstream economics: cost 8,625,000 SEK, benefit
  3,500,000 SEK, multiple ≈0.41x.
- `averageAiReadiness()` (`src/lib/calculations.ts:301-308`) → mean of the 4 domains'
  `readinessPct`: (42 + 35 + 24 + 18) / 4 = **29.75%**, displayed as "30%". Returns 0 for an
  empty domain list.
- `risksForWorkstream('ai')` → the enterprise risks touching AI (incomplete visibility +
  value scale-up — 2 of the 4).

**Renders:**

1. Red hero ("EU AI Act readiness needs its own operating page.") beside a **Readiness snapshot**
   card with a `ReadinessBar` per domain (`:45-58`).
2. Four `StatCard`s (`:61-82`): AI cost, directional value ("not audited ROI"), multiple
   (tinted), and average readiness (red — 30% is a low baseline).
3. "EU AI Act readiness domains" panel (`:84-128`): each domain's title, description, a
   `RiskSeverityBadge` whose severity is derived inline from readiness
   (`≥70 → 'ready'`, `≥35 → 'medium'`, else `'high'`, `:104-112` — the same thresholds as
   `readinessTone()` in `src/lib/calculations.ts:310-316`, duplicated locally), and grey
   `evidenceNeeded` chips. All four domains currently score below 70, so every badge is Medium or
   High.
4. "AI-related enterprise risks" panel with `RiskSeverityBadge`s and each risk's leadership ask
   (`:130-155`).

**Edge case:** if the `ai` workstream ever disappeared from the data, the view renders `null`
(`:14`, `:17`) — a silent blank tab rather than an error.

---

## 7. `CapabilityRoiBoard.tsx` (866 lines) — the v1 "Capability ROI Board"

The entire default (`/v1`) experience: a board-style, single-page ROI narrative that takes the
reader from last year's proof points, through a live investment model, partner engagement model,
scope reference cards, the interactive roadmap timeline, and lands on capability maturity. Unlike
the v0 views, it uses its own navy (`#071B4D`)/purple (`#5B3AA4`) chrome and local subcomponents
instead of `StatCard`/`WorkstreamTile`.

### 7.1 State and derived data (`src/components/views/CapabilityRoiBoard.tsx:111-155`)

**State:**

| State | Initial | Meaning |
|---|---|---|
| `budgetSEK` | `TOTAL_FULL_COST` (41.4M) | The investment slider value, in raw SEK. |
| `selectedWorkstreamIds` | all 6 ids | Scope chips currently switched on. |

**Memoized derivations:**

- `scopedCapabilityRoiSummary(selectedWorkstreamIds, budgetSEK)`
  (`src/lib/capabilityRoi.ts:220-242`): sums the *selected* workstreams' cost
  (`scopeCostSEK`) and benefit (`scopeBenefitSEK`), then runs `capabilityRoiSummary` against
  those scoped totals (`:192-218`):
  - `coverage = clamp(budget / scopeCost, 0, 1)` — fraction of the selected scope the budget buys
    (0-guarded denominator at `:153-155`).
  - `valueSEK = scopeBenefit × coverage`; `budgetSEK` reported is clamped to
    `min(budget, scopeCost)` so over-funding can't inflate the model.
  - `multiple = valueSEK / usedBudgetSEK` (0-guarded) — for a fully funded scope this equals the
    scope's own benefit ÷ cost.
  - `fundedScopePct = round(coverage × 100)`.
  - **Maturity model**: `current = 1`, `target = 3`,
    `projected = 1 + (3 − 1) × coverage` (`:64-65`, `:157-159`) — full funding moves the
    programme from maturity level 1 ("Ad hoc") to 3 ("Managed").
  - **Value pillars** (`:66-68`, `:211-216`): money `= round(coverage × 100)`, security risk
    reduction `= round(20 × coverage)`% (cap 20%), compliance readiness `= round(80 × coverage)`%
    (cap 80%), incident-response/MTTR uplift `= round(30 × coverage)`% (cap 30%).
- `capabilityRows(budgetSEK, summary.scopeCostSEK, selectedWorkstreamIds)` (`:251-278`): 8
  capability rows from `CAPABILITY_INPUTS` (`:70-124`). Each capability lists the workstreams
  that feed it and a `weight` (0.58–0.98). If **any** feeding workstream is selected, the row's
  `projectedMaturity` follows the global maturity curve and its
  `returnSignalPct = round(clamp(coverage × weight, 0, 1) × 100)`; if none are selected the row
  stays at maturity 1.0 with 0% return signal.
- `capabilityMaturitySummary(rows)` (`:280-299`): plain averages of current/projected across
  rows (so deselecting workstreams drags the projected average down), rounded to 2 decimals; an
  empty row list returns the 1→1 baseline.
- `scopeWikiRows()` (`:301-313`): per-workstream reference cards reshaped from `WORKSTREAMS`
  (name, short code, cost, benefit, year-one outcome as summary, scope items, year-two outcome,
  highlight labels).

**Control handlers — note the deliberate coupling:**

- `toggleWorkstream(id)` (`:130-140`): adds/removes a scope chip. **Does not touch the budget** —
  deselecting a workstream shrinks `scopeCostSEK`, so the same budget now covers a larger
  percentage of the remaining scope (coverage denominator shrinks).
- `selectAllWorkstreams()` (`:142-144`): re-selects all 6.
- `applyPreset(id)` (`:146-150`): sets budget **and** selection together from
  `modelScopePreset()` (`src/lib/capabilityRoi.ts:126-147`, `:244-249`):

  | Preset | Budget (SEK) | Workstreams | Rationale |
  |---|---|---|---|
  | Minimum viable | 8,625,000 | hardware | Cheapest credible start; strongest multiple. |
  | Security first | 25,875,000 | hardware, ai, cloud | The three 8.625M Q1 starters. |
  | Compliance ready | 31,050,000 | + ot | Adds OT (25.875M + 5.175M). |
  | Full uplift | 41,400,000 | all 6 | The complete plan. |

- `changeBudget(sek)` (`:152-155`): sets the slider **and auto-derives the selection** via
  `scopeIdsCoveredByBudget()` (`:170-190`) — a greedy walk down the fixed priority order
  hardware → ai → cloud → ot → software → newemerging, adding each workstream only while the
  running cost stays within budget. So dragging the slider to 20M selects hardware + ai + cloud
  would exceed… precisely: hardware (8.625M) + ai (8.625M) = 17.25M; adding cloud → 25.875M > 20M,
  so the selection is {hardware, ai}. A workstream is only "in scope" if the budget can *fully* pay
  for it under this order.

### 7.2 Section-by-section render

1. **Hero** (`:159-204`): navy panel — "Asset Management Capability ROI Model", the maturity
   1→3 framing — beside a "Last year achievements" grid (managed endpoint & network inventory
   >90% coverage, **10M SEK** license/unused-device value unlocked, Qualys integration). These
   establish credibility for why the model starts at level 1 rather than 0.
2. **Model controls + top metrics** (`:206-352`):
   - *Controls card*: investment slider 0 → `TOTAL_FULL_COST`, step 100,000 SEK, with a live
     1-decimal M-SEK readout (`:219-228`); four preset buttons whose active state is detected by
     exact budget **and** exact selection match (`:232-235`); the scope chip row with "Select
     all"; and two summary boxes — "Required investment" (`scopeCostSEK`) and "Value unlocked"
     (`valueSEK`).
   - *Four `MetricCard`s* (`:306-351`, component at `:745-769`): Financial return
     (`fmtX(multiple)` + directional value sub-line, green), Security (risk-reduction %, red),
     Compliance (readiness %, purple), Incident response (MTTR uplift %, amber). Each card gets a
     colored left border from the `topMetrics` table (`:63-84`).
3. **`PartnerContributionModel`** (`:372-442`): navy-headed accordion of the 4
   `PARTNER_MODEL` entries (`src/data/partners.ts:62-144`) — EY (strategic assurer, 30M
   investment / 8M enabled value), TCS (data foundation, 8.4M / 11M), Accenture (platform
   enablement, 3M / 12M), and internal "Cyber + Business scope" (0 / 12M). Only one partner expands
   at a time (`activePartnerId` state); `PartnerDetail` (`:444-508`) shows investment/enabled
   value, green category pills (financial/security/compliance/incident/adoption per
   `contributionCategoryLabels`, `:99-105`), scope bullets, and success signals (e.g. TCS's
   ">90% data completeness, >75% reduction in duplicate/orphaned records"). A data-level invariant
   (`src/data/partners.ts:171-173`) throws at module load if partner value totals ≠ 43M — the
   partner story can never disagree with the benefit model.
4. **`ScopeWiki`** (`:627-743`): "Capability Scope Cards" — one toggle button per workstream;
   expanding one shows cost, value, the year-one summary, highlight pills, an "In scope" bullet
   list, and a "Beyond year one" boundary paragraph. Accordion state is local
   (`activeScopeId`); `scopeWikiRowById` returns `undefined` for `null`, collapsing the
   detail cleanly.
5. **`InteractiveRoadmapTimeline`** (`:358-363`): the swimlane roadmap documented in
   `docs/05_APP_SHELL_AND_COMPONENTS.md` §5.9, fed with `budgetSEK`, the selection set, and the
   scoped cost/benefit. Its lanes/items dim as the selection and budget change.
6. **`MaturityDeck`** (`:771-865`): the closing argument. Header shows "Current 1.0 → projected
   X.X" from `capabilityMaturitySummary`; a 5-step maturity scale legend (Ad hoc, Visible,
   Managed, Integrated, Optimized); then a table over `capabilityRows` with, per capability:
   business outcome, a **dot slider** showing current (blue dot) vs projected (green dot) position —
   `maturityPosition(m)` maps maturity 1–5 to 0–100% of the track (`:107-109`, clamped) — and a
   green "Return signal" bar at `returnSignalPct`%. Rows whose feeding workstreams are deselected
   visibly collapse to the 1.0/0% baseline.
7. **`KnowledgeDeck`** (`:510-625`): an accordion of the 3 `ROADMAP_KNOWLEDGE_CARDS`
   (`src/data/knowledgeDeck.ts:22-157`) — *Asset Category Outcomes* (Y1 outcome + ambition per
   domain), *6-Month Data-thon* (flow, outputs, programme value), and *Strategic Value Framework*
   (three measurement pillars with hard targets like asset coverage >95%, manual effort −50%,
   unmanaged technology risk −80%). The expanded card shows eyebrow, lead paragraph, 3 columns of
   points with optional metric/target chips, and a green-bordered outcome strip.

### 7.3 Interaction summary and live-recompute behaviour

Every control (slider, preset, scope chip, "Select all") funnels into the two pieces of state; all
five derived memos recompute synchronously, and every downstream section — metric cards, timeline
dimming, maturity table — re-renders in the same frame. Notable behavioural edge cases:

- **Budget 0**: `scopeIdsCoveredByBudget` returns `[]`, so the selection empties;
  `scopedCapabilityRoiSummary` then has `scopeCostSEK = 0` → coverage 0 → value 0, multiple 0,
  maturity 1.0, pillars all 0%. No NaN anywhere.
- **Manual deselection without budget change**: coverage uses the *selected* scope cost, so
  removing an expensive workstream can push `fundedScopePct` to 100% without touching the slider —
  the model rewards descoping.
- **No empty-state panel**: unlike `WorkstreamWhatIf`, an empty selection renders the full board
  with zeroed metrics rather than a prompt to select — a deliberate board-presentation choice.
- Accordion state (partner, scope card, knowledge card) is independent of the model state, so
  exploring the narrative never perturbs the numbers.

> **Spec divergence:** the entire v1 board — this view, `InteractiveRoadmapTimeline`,
> `src/lib/capabilityRoi.ts`, `src/lib/roadmap.ts`, `src/data/roadmap.ts`,
> `src/data/knowledgeDeck.ts`, and the `PARTNER_MODEL` half of `src/data/partners.ts` — is
> beyond the scope of `app_spec/04_COMPONENT_SPEC.md`, which specifies only the three v0
> what-if views plus Dashboard. The v0 risk views (§5, §6) and `WorkstreamDetail` are likewise
> post-spec additions.
