# 01 — Business Domain: H&M EAM Scenario Modeller

This document describes the business context of the H&M EAM Scenario Modeller: the problem it solves,
who uses it, what it must (and must not) do, the workstreams and partners it models, its two "what-if"
modes, where every number comes from, and the disclosure rules that govern how those numbers may be
presented. It also records how the shipped app has evolved beyond the original v1 spec. It is written
from the spec package in `app_spec/`, the validated prototype `src/_prototype/main.jsx`, and the live
data layer in `src/data/`. Companion document: `docs/02_DATA_MODEL.md`.

---

## 1. The problem

H&M's Enterprise Asset Management (EAM) programme has a proposed 12-month plan — originally costed by
EY — covering 6 IT asset-management workstreams delivered by 3 partner tracks (EY, Accenture, and a
combined TCS team). Programme leadership expects the approved budget to land *below* the proposed cost,
and needs to explore in real time what different budget levels or different workstream selections would
actually buy, without waiting for a spreadsheet or deck to be regenerated for every "what if"
(`app_spec/01_PRD.md` §1).

The app replaces that regeneration loop with a single-page, client-side tool where every control updates
results live — there is no "run" or "submit" step anywhere (PRD goal 4).

## 2. Users

- **Primary:** Programme/IT leadership at H&M deciding EAM budget allocation (PRD §4).
- Single user per session; no collaboration, accounts, or multi-user features.
- The shipped app additionally assumes the audience includes executives reviewing risk and ROI
  narratives, hence the later-added risk views and Capability ROI Board (see §10).

## 3. Goals

From `app_spec/01_PRD.md` §2:

1. **Plan overview at a glance** — full proposed plan (cost, benefit, benefit multiple) as a dashboard.
2. **Budget-constrained what-if** — "I only have X of the Y I planned for — what do I get?" Set an
   available budget below the full plan cost, choose an allocation strategy, see what gets funded and
   what benefit results.
3. **Workstream-constrained what-if** — "If I only fund AI Assets, what does it cost and what's the
   benefit?" Pick any subset of the 6 workstreams; see the isolated cost/benefit/partner breakdown.
4. **Live recomputation** — every control updates results immediately, via pure functions +
   `useMemo`, never via a submit action or a `useEffect` recomputation
   (`app_spec/02_ARCHITECTURE.md` §3).

## 4. Non-goals (v1 scope)

From `app_spec/01_PRD.md` §3 — the app deliberately does **not**:

- Let users edit the rate card, benefit weights, or partner assumptions in the UI (fixed constants in
  v1; the editable "assumptions panel" is deferred, see §9).
- Persist or save scenarios across sessions (exploration-only; resets on reload).
- Auto-optimize a scenario for a stated goal.
- Use a backend, auth, or multi-user features — **note: the shipped app has since added a client-side
  password gate anyway; see §10.1.**
- Export files (PDF/PNG/xlsx) — on-screen only.
- Model non-linear/diminishing-returns benefit — **benefit scales linearly with the funded % of a
  workstream's scope** (see formula in §7.2 and `docs/02_DATA_MODEL.md`).

## 5. The 6 workstreams

Full data: `src/data/workstreams.ts:64` (`WORKSTREAMS`). Each workstream is a year-long scope of EAM
work with a fixed annual cost, an estimated annual benefit, a start phase (Q1 vs Month 4), and — in the
shipped data model — year-one/year-two outcomes, scope items, risk focus areas, roadmap evidence, and
qualitative value highlights.

| # | ID | Name | Starts | Cost (SEK) | Benefit (SEK) | What it covers |
|---|---|---|---|---|---|---|
| WS1 | `hardware` | Hardware | Q1 | 8,625,000 | 19,250,000 | Discovery/integration uplift across remaining asset tools (Zebra, HP, Canon, Kandji, SCCM), CMDB governance (ownership, location, lifecycle), operational-intelligence use cases (incident, vulnerability, service-desk dependency mapping). Year-1 target: >90% visibility across priority hardware (`workstreams.ts:65-97`). |
| WS2 | `ai` | AI Assets | Q1 | 8,625,000 | 3,500,000 | AI asset registry, metadata model, lifecycle workflows, CMDB integration, and EU AI Act governance/readiness controls (`workstreams.ts:98-126`). |
| WS3 | `cloud` | Cloud | Q1 | 8,625,000 | 7,000,000 | Azure inventory/ownership reconciliation, CMDB linkage, multi-cloud (GCP/AWS) expansion roadmap, FinOps and technology-optimisation requirements (`workstreams.ts:127-155`). |
| WS4 | `ot` | Operational Technology | Month 4 | 5,175,000 | 4,750,000 | Warehouse/store OT asset baseline, ownership and accountability model, monitoring & discovery design (sensor tooling, reporting). Roadmap evidence cites 4,128 OT assets in owned warehouses, some at 0% prior visibility (`workstreams.ts:156-183`). |
| WS5 | `software` | Software | Month 4 | 5,175,000 | 6,750,000 | Software/licence baseline, SAM (Software Asset Management) use cases, target architecture and implementation roadmap. Evidence cites $1M+ annual licence savings from obsolete/duplicate CIs (`workstreams.ts:184-215`). |
| WS6 | `newemerging` | New & Emerging Projects | Month 4 | 5,175,000 | 1,750,000 | Reusable asset data products, benefits tracking, the 6-month "Data-thon" value-discovery cycle, and backlog refresh for the next roadmap cycle (`workstreams.ts:216-243`). |

**Why Q1-start workstreams cost more:** Hardware/AI/Cloud run all 12 months; OT/Software/New & Emerging
run months 4–12 (9 months). Partner annual costs are split evenly across active workstreams in each
phase, producing 8.625M SEK for Q1-start and 5.175M SEK for Month-4-start workstreams — see the formula
in §7.3 and `docs/02_DATA_MODEL.md`.

**Value highlights (qualitative value, added post-spec per CR-2 in `app_spec/06_BACKLOG_CORRECTIONS.md`
§2):** each workstream also carries 1–3 chips from four fixed categories — `risk` (reduced enterprise
risk), `incident` (incident-response uplift), `transformation` (operating-model maturity),
`asset_mapping` (CMDB/single-source-of-truth accuracy). Definitions live at `workstreams.ts:37-62`.
These are display metadata, not money; they never replace the monetary benefit figure.

## 6. The delivery partners

Full data: `src/data/partners.ts`.

### 6.1 Cost model partners (rate card)

Three partner tracks carry the plan's cost (`partners.ts:36-48`):

| Partner | Full-scope annual cost | Role in cost model |
|---|---|---|
| EY | 30,000,000 SEK | Strategic partner and assurer (roadmap assurance, architecture/control validation, executive steering) |
| Accenture | 3,000,000 SEK | Platform and tooling enablement (automated ingestion, reconciliation, integrations) |
| TCS (combined onsite + offshore) | 8,400,000 SEK | Data foundation, clean-up and governance support |

Full-scope cost total: **41,400,000 SEK** (see the ⚠️ version note in §8.2 — a 99,510,000 SEK basis
exists in the prototype and root `AGENTS.md` test expectations).

### 6.2 Value-contribution model (ROI narrative)

The shipped app adds `PARTNER_MODEL` (`partners.ts:62-144`), a 4-row contribution model used by the
Capability ROI board. It attributes the 43,000,000 SEK total benefit across contributors — including an
unfunded internal "Cyber + Business scope" row for H&M itself (investmentSEK = 0, valueSEK = 12,000,000).
A module-level invariant at `partners.ts:171-173` throws at import time if the value rows stop summing
to `TOTAL_FULL_BENEFIT`, keeping the attribution honest.

## 7. The two what-if modes (business rules)

### 7.1 Shared model: linear funding

For any workstream funded at percentage `p` (0–100):

- funded cost = `costSEK × p / 100`
- funded benefit = `benefitSEK × p / 100`
- benefit multiple = `funded benefit ÷ funded cost` — which for any single partially funded workstream
  equals its full-scope multiple, since `p` cancels. The guard: when funded cost is 0, the multiple is
  defined as **0** (never `NaN`/`Infinity`) — `src/lib/AGENTS.md` and doc 03 §3.3.

Coverage label (`app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` §3.5):
`p ≥ 90 → "Full"`; `10 ≤ p < 90 → "Partial"`; `p < 10 → "Deferred"`. Colour is never the only
signal — the text label must always accompany it (PRD NFR-4).

### 7.2 Budget / FTE what-if (budget-constrained)

User sets an available budget (0 to ~110% of full-plan cost) and picks one of two mutually exclusive
allocation strategies (PRD FR-2.2; prototype implementation `src/_prototype/main.jsx:214-233`):

- **Prioritize highest value first** — rank workstreams by `benefitSEK ÷ costSEK` descending; fund
  each fully in that order until the budget runs out; partially fund the workstream where the budget is
  exhausted mid-way; the rest get 0%.
- **Spread evenly** — every workstream gets the same funded percentage:
  `p = min(100%, budget ÷ TOTAL_FULL_COST × 100)`.

Outputs: per-workstream funded %/cost/benefit/multiple/coverage; scenario totals; overall multiple; and
an "Unallocated" leftover card shown only when `leftover > 1,000 SEK` (epsilon guards against
floating-point noise, per `app_spec/04_COMPONENT_SPEC.md` BudgetWhatIf §5). Edge cases: budget 0 → all
workstreams Deferred, totals 0; budget ≥ full-plan cost → everything 100%, leftover = budget −
full-plan cost; negative budget treated as 0 (doc 03 §3.2).

### 7.3 Workstream what-if (workstream-constrained)

User toggles any subset of the 6 workstreams (including none). Selected workstreams count as 100%
funded; unselected as 0% (`computeSelectionTotals`, doc 03 §3.3).

Outputs: count selected; total cost and benefit with each as % of the full plan; overall multiple; and a
**cost-by-partner breakdown for the selection only** (PRD FR-3.4), computed by accumulating per-partner
shares:

```
Q1-start workstream share (per partner)  = annual × (3/12) / 3   +   annual × (9/12) / 6
Month-4-start workstream share (per partner) = annual × (9/12) / 6
```

E.g. EY's share of one Q1-start workstream = 30M × ¼ / 3 + 30M × ¾ / 6 = 2.5M + 3.75M = 6.25M SEK.
These share tables (`partners.ts:50-60`) sum to exactly the workstream costs (8.625M / 5.175M).
**Empty-selection edge case:** zero selected shows an icon-led empty state, not zeroed stats or NaN
(PRD FR-3.2; prototype `main.jsx:406-409`).

## 8. Data provenance, placeholders and disclosure rules

### 8.1 Where the numbers come from

From `app_spec/00_README.md` ("Provenance") and `01_PRD.md` §7:

- **Costs are rate-card figures.** Partner full-scope costs (EY 30M, Accenture 3M, TCS 8.4M) come from
  an actual partner rate card the client provided, plus the EY roadmap deck and 2 SOW scope documents.
  Workstream costs are *derived deterministically* from those via the phasing formula in §7.3. Treat
  them as **fixed client inputs** — `AGENTS.md` forbids "correcting" or re-estimating them.
- **Benefits are estimates — the least validated numbers in the app.** The 43M SEK total is a
  workstream-weighted split of a single ~25M SEK "enterprise risk" figure quoted in the source roadmap,
  plus rough per-workstream savings/avoidance estimates. They are directional for comparing options,
  not an audited ROI case.

### 8.2 ⚠️ The two cost bases (read this before quoting any total)

There are **two cost bases in the repo**, and they must not be conflated:

| Basis | Full-plan cost | Full-plan benefit | Multiple | Where it lives |
|---|---|---|---|---|
| PRD / doc 03 basis | 41,400,000 SEK | 43,000,000 SEK | ≈ 1.0386x | `app_spec/01_PRD.md` §1, §8; `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` §2, §5; **and the live data layer** `src/data/workstreams.ts` + `derived.ts` |
| Prototype / "v2 model" basis | 99,510,000 SEK | 43,000,000 SEK | ≈ 0.4321x | `src/_prototype/main.jsx:25-53` (workstream costs 20.075M ×3 + 13.095M ×3, with TCS split into separate Onsite/Offshore share rows); root `AGENTS.md` "Testing instructions" reference values |

The prototype describes its basis as "the EY roadmap plus H&M's revised EY resourcing basis"
(`main.jsx:166`) — i.e. a **later, revised resourcing model** (per-partner FTE scaling with separate
TCS onsite/offshore rates) that roughly 2.4×'d the cost while leaving the 43M benefit estimate unchanged,
halving the multiple from ≈1.04x to ≈0.43x. The correction backlog `app_spec/06_BACKLOG_CORRECTIONS.md`
§1 (CR-1) is the client instruction that drove this: bounded per-partner FTE (min/max), replacing the
old even-split cost model.

**Current state of the checkout (verified):** the live `src/data/` constants still sum to the
**41.4M / 1.0386x** basis, while the prototype and the root `AGENTS.md` test expectations carry the
**99.51M / 0.4321x** basis. Root `AGENTS.md` states a change that breaks the 99,510,000 SEK reference
"is a bug", so the data layer and the prototype are currently out of sync on cost — when implementing
or testing, treat `AGENTS.md` + the prototype's 99.51M basis as the target reference numbers and the
live `src/data` workstream costs as pending regeneration per CR-1.2. The 43,000,000 SEK benefit total
is identical in both bases.

### 8.3 Placeholder & disclosure rules (hard requirements)

- **FR-1.4 (persistent disclosure):** the dashboard must always show a non-dismissible banner stating
  benefit figures are estimates, not audited numbers (PRD §5.1; `04_COMPONENT_SPEC.md` Dashboard §5;
  prototype implementation `main.jsx:194-200`). Never present benefit figures with more confidence
  than the rate-card costs.
- Flags in doc 03 marking a number as placeholder/estimate must survive into the UI
  (`00_README.md` Provenance; root `AGENTS.md` Rules).
- Benefits flagged as placeholder may never be "improved" or recomputed by implementers; replacing them
  with real per-workstream benefit data requires H&M risk/finance sign-off (backlog item, §9).

## 9. Acceptance criteria & deferred backlog

### 9.1 Acceptance criteria

From `01_PRD.md` §8 (figures shown on the PRD basis; see §8.2 for the 99.51M evolution):

- App loads to Plan Overview showing the full-plan totals (PRD basis: cost ≈ 41.40M SEK, benefit ≈
  43.00M SEK, multiple ≈ 1.04x; prototype/AGENTS.md basis: 99.51M SEK / 43.00M SEK / ≈ 0.43x).
- Budget What-If at full-plan cost with either strategy reproduces Plan Overview totals exactly.
- Budget What-If at 0 → 0 cost, 0 benefit, all workstreams "Deferred".
- Selecting all 6 workstreams in Workstream What-If reproduces Plan Overview totals exactly.
- Selecting zero workstreams shows the empty state — never NaN or divide-by-zero.

Post-build correction backlog acceptance (`06_BACKLOG_CORRECTIONS.md` §4): regenerated CR-1 cost
figures with reference values updated, `npm run test` passing on the new figures, the three ⚠️-flagged
max-FTE assumptions (Accenture 2.0, TCS Onsite 2.0, TCS Offshore 4.0) confirmed by the client, value
chips on every workstream, and CR-3 UI polish verified visually.

### 9.2 Deferred backlog (`app_spec/05_BACKLOG.md` — do not build unless explicitly asked)

| Deferred idea | Why deferred |
|---|---|
| Editable assumptions panel (rate card, EY scaling, benefit weights) | v1 locks assumptions; client found the earlier multi-panel version overwhelming |
| Save/load named scenarios | Single-session exploration only; storage design undecided |
| Side-by-side scenario comparison | Dropped when the model simplified to 2 axes |
| File export (PDF/PNG/xlsx) | v1 is on-screen only |
| Non-linear benefit curve | Unproven payoff; linear assumption already disclosed |
| Optimizer ("best scenario for budget X") | Would change the tool from exploratory to prescriptive |
| Multi-user / shared scenarios | Out of scope per PRD non-goals |
| Real per-workstream benefit data | Blocked on H&M risk/finance providing real risk weights |
| Quarterly (Q1 vs M4–12) cash-flow view | Phasing exists in the cost model but isn't surfaced as a view |

## 10. How the shipped app evolved beyond the v1 spec

The spec package describes a 3-view app (dashboard, budget what-if, workstream what-if) with no auth
and no routing. The shipped app (`src/App.tsx`) has grown well past that:

### 10.1 Password gate (contradicts PRD non-goal "no auth")
`src/App.tsx:16-23` wraps the whole app in `PasswordGate` (`src/components/PasswordGate.tsx`). The
entered password is SHA-256-hashed in the browser (`PasswordGate.tsx:9-16`) and compared against
`PASSWORD_HASH` in `src/data/auth.ts:3-4`; success stores `'unlocked'` under
`AUTH_STORAGE_KEY` in `sessionStorage` (`PasswordGate.tsx:33`), so the unlock survives reloads
within a tab session but not across sessions. This is access friction, not real security — the hash and
all data ship to the client — and it directly contradicts both the PRD non-goal and root
`AGENTS.md`'s "No backend, no auth" line, so document it as a deliberate post-spec product decision.

### 10.2 v0 / v1 version switch (routing, contradicts "no routing")
`src/lib/versioning.ts:1-5` derives an app version from the URL path: `/v0` (or `/v0/*`) → the
legacy multi-view app (`LegacyApp`, `App.tsx:34-77`); anything else → `V1App`
(`App.tsx:79-114`), a single-page "Capability ROI Board" with cross-links between versions
(`App.tsx:92-106`). The spec's tab-state navigation (`useState<'dashboard'|'budget'|'workstream'>`)
is replaced in v0 by a sidebar `TabNav` with a page-union type including detail views.

### 10.3 Risk views
Two post-spec views render the risk registers in `src/data/risks.ts`:
- `EnterpriseRiskView` — the 4 enterprise risks (severity, business impact, affected workstreams,
  leadership ask), using `RiskSeverityBadge`.
- `AiRiskView` — the 4 AI-readiness domains with readiness percentages, using `ReadinessBar`.

### 10.4 Roadmap timeline
`src/data/roadmap.ts` (521 lines) models a quarter-by-quarter, lane-based roadmap (7 lanes across
"sustain" and "ambition" sections, percentage-positioned items with tag filters), rendered by
`src/components/InteractiveRoadmapTimeline.tsx` with logic in `src/lib/roadmap.ts`. The knowledge
deck (`src/data/knowledgeDeck.ts`) supplies supporting explainer cards (Asset Category Outcomes,
6-Month Data-thon, Strategic Value Framework with metric targets).

### 10.5 Capability ROI Board (v1 default view)
`src/components/views/CapabilityRoiBoard.tsx` backed by `src/lib/capabilityRoi.ts`: a capability-
maturity model (current 1 → target 3), four value pillars (money, security, compliance readiness,
incident response), scope presets (`minimum_viable`, `security_first`, `compliance_ready`,
`full_uplift`), and per-capability weights mapped to workstreams. This reframes the tool from
"budget allocation explorer" toward "executive ROI narrative", reusing the same cost/benefit constants.

### 10.6 Data-model growth
The `Workstream` type grew from the spec's 8 fields to 14 (`workstreams.ts:21-35`): `yearOneOutcome`,
`yearTwoOutcome`, `scopeItems`, `riskFocus`, `roadmapEvidence`, `valueHighlights` were added
(the last per CR-2). `derived.ts` no longer carries `LAST_YEAR_COST`/`DELTA_FULL_VS_LAST_YEAR`
(spec §2.3) — the "Δ vs last year" stat card from FR-1.1 is currently unbacked by the data layer.

### 10.7 What did NOT change
The calculation rules (linear funding, two strategies, coverage labels, multiple colour thresholds
≥0.9 good / ≥0.4 warn / <0.4 bad), the pure-function discipline in `src/lib/` (`src/lib/AGENTS.md`),
the fixed-constant cost/benefit inputs, and the benefit-estimate disclosure requirement all remain as
specified. The deferred backlog in §9.2 remains deferred — none of those items shipped.
