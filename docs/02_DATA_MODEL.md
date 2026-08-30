# 02 — Data Model: `src/data/*`

This document describes every exported type, constant and function in the data layer of the H&M EAM
Scenario Modeller — its shape, its values, and the business meaning of every number. It also records
where the data layer diverges from the spec in `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` ("doc 03")
and from the validated prototype `src/_prototype/main.jsx`. Business context and formulas are covered
in `docs/01_BUSINESS_DOMAIN.md`; calculation *functions* live in `src/lib/` and are out of scope here
except where data files define them.

**Files covered:** `src/data/workstreams.ts`, `partners.ts`, `risks.ts`, `roadmap.ts`,
`knowledgeDeck.ts`, `derived.ts`, `auth.ts`.

**Fixed vs placeholder:** all cost figures are fixed client-provided rate-card inputs (do not
"correct" them — root `AGENTS.md` rule). All benefit figures are directional estimates derived from a
~25M SEK enterprise-risk figure plus rough savings estimates, and must keep their placeholder
disclosure in the UI. Qualitative content (blurbs, outcomes, scope items, risks, roadmap items,
knowledge cards) is curated copy from the source roadmap deck, not computed data.

---

## 1. `src/data/workstreams.ts` — the 6 workstreams

### 1.1 Types

| Export | Lines | Shape | Purpose |
|---|---|---|---|
| `WorkstreamId` | 1–7 | `'hardware' \| 'ai' \| 'cloud' \| 'ot' \| 'software' \| 'newemerging'` | Stable string key for each workstream; used as map keys throughout (`pctById`, selections, risk references). Matches doc 03 §1 exactly. |
| `ValueHighlightCategory` | 9–13 | `'risk' \| 'incident' \| 'transformation' \| 'asset_mapping'` | The four fixed qualitative-value categories added by CR-2 (`app_spec/06_BACKLOG_CORRECTIONS.md` §2.1). Deliberately closed — "don't let this become an open-ended tag system". |
| `ValueHighlight` | 15–19 | `{ category, label, description }` | One chip: short `label` for the badge, one-sentence `description` for tooltip/tap expansion. |
| `Workstream` | 21–35 | see below | The core entity. **14 fields — a superset of doc 03 §1's 8 fields** (divergence, see §8). |

```ts
interface Workstream {
  id: WorkstreamId;            // stable key
  name: string;                // display name, e.g. 'New & Emerging Projects'
  short: string;               // chart/axis code, 'WS1'..'WS6'
  costSEK: number;             // fixed client input: full-scope annual cost
  benefitSEK: number;          // PLACEHOLDER estimate: full-scope annual benefit
  startsInQ1: boolean;         // phasing: true = months 1-12, false = months 4-12
  blurb: string;               // one-line scope summary (tiles)
  yearOneOutcome: string;      // post-spec: Y1 capability outcome statement
  yearTwoOutcome: string;      // post-spec: Y2 ambition statement
  scopeItems: string[];        // post-spec: 3 scope bullets (detail view)
  riskFocus: string[];         // post-spec: 3 risk bullets (detail view)
  roadmapEvidence: string[];   // post-spec: citations tying scope to the source roadmap
  valueHighlights: ValueHighlight[];  // CR-2 qualitative chips
}
```

### 1.2 `VALUE_HIGHLIGHTS` (lines 37–62)

A `Record<ValueHighlightCategory, ValueHighlight>` singleton map so every workstream references the
*same* chip objects (consistent labels/colours downstream):

| Category | Label | Business meaning (description) |
|---|---|---|
| `risk` | Reduced enterprise risk | Reduces exposure tied to asset visibility, lifecycle governance, and control gaps — ties to the ~25M SEK enterprise-risk figure. |
| `incident` | Incident response uplift | Improves detection, triage, and operational response through better asset context (from the roadmap's "30%+ faster incident ID" claim). |
| `transformation` | Transformation enablement | Strengthens operating-model maturity and change readiness beyond the technical deliverable. |
| `asset_mapping` | Central asset mapping | Improves single-source-of-truth accuracy for CMDB and asset relationship data. |

### 1.3 `WORKSTREAMS` (lines 64–244)

The six constant records. **Costs are fixed client inputs; benefits are placeholder estimates.** The
display order (WS1→WS6) is meaningful: views must keep this original order even when the priority
allocation ranks differently (`04_COMPONENT_SPEC.md` BudgetWhatIf §6).

| Line | id | short | name | costSEK | benefitSEK | startsInQ1 | Individual multiple (benefit ÷ cost) | Highlights |
|---|---|---|---|---|---|---|---|---|
| 65–97 | `hardware` | WS1 | Hardware | 8,625,000 | 19,250,000 | true | ≈ 2.232x — best value in the plan | risk, incident, asset_mapping |
| 98–126 | `ai` | WS2 | AI Assets | 8,625,000 | 3,500,000 | true | ≈ 0.406x | risk, transformation |
| 127–155 | `cloud` | WS3 | Cloud | 8,625,000 | 7,000,000 | true | ≈ 0.812x | risk, asset_mapping |
| 156–183 | `ot` | WS4 | Operational Technology | 5,175,000 | 4,750,000 | false | ≈ 0.918x | risk, incident |
| 184–215 | `software` | WS5 | Software | 5,175,000 | 6,750,000 | false | ≈ 1.304x | asset_mapping, transformation |
| 216–243 | `newemerging` | WS6 | New & Emerging Projects | 5,175,000 | 1,750,000 | false | ≈ 0.338x — worst value | transformation |

**Cost derivation (why 8.625M vs 5.175M):** partner annual costs are split evenly across the
workstreams active in each phase — Q1 has 3 active (Hardware, AI, Cloud), months 4–12 have all 6:

```
startsInQ1 = true :  Σpartners [ annual × (3/12)/3 + annual × (9/12)/6 ] = 6.25M + 0.625M + 1.75M = 8,625,000
startsInQ1 = false:  Σpartners [ annual × (9/12)/6 ]                     = 3.75M + 0.375M + 1.05M = 5,175,000
```

**Content fields** (business meaning, all curated copy from the EY roadmap deck / SOWs):
- `blurb` — one-line scope summary shown on tiles (spec field).
- `yearOneOutcome` / `yearTwoOutcome` — outcome statements, e.g. Hardware Y1: ">90% visibility across
  priority hardware assets, governed ownership, lifecycle controls…" (lines 74–77).
- `scopeItems` — three concrete scope bullets per workstream (e.g. AI: "Implement AI registry, metadata
  model, lifecycle workflows, CMDB integration and dashboards.", line 113).
- `riskFocus` — three risk statements the workstream mitigates (e.g. OT: "Operational technology assets
  not visible in enterprise asset governance.", line 174).
- `roadmapEvidence` — two citations anchoring the workstream in the source roadmap, including the
  client's real numbers: 362k asset baseline + 136k CI retire/archive actions (Hardware, line 90);
  4,128 OT assets in owned warehouses (line 179); $1M+ annual licence savings from obsolete/duplicate
  CIs (Software, line 209).

**Totals of this table:** cost 41,400,000 SEK, benefit 43,000,000 SEK, multiple ≈ 1.0386x. See §8 for
the divergence with the prototype's 99,510,000 SEK basis.

---

## 2. `src/data/partners.ts` — partner costs and value contributions

### 2.1 Types

| Export | Lines | Shape | Purpose |
|---|---|---|---|
| `PartnerId` | 3 | `'EY' \| 'Accenture' \| 'TCS'` | The 3 delivery tracks. TCS is deliberately **one** combined partner (CR-1, `06_BACKLOG_CORRECTIONS.md` §1: "do not keep separate TCS Onsite / TCS Offshore rows in active data") — unlike the prototype's 4-row split. |
| `PartnerContributionId` | 4 | `'ey' \| 'tcs' \| 'accenture' \| 'hm'` | Lowercase ids for the ROI contribution model; adds `'hm'` for H&M's internal contribution. |
| `PartnerContributionCategory` | 5–10 | `'financial' \| 'security' \| 'compliance' \| 'incident' \| 'adoption'` | Value-dimension tags for ROI board filtering/display. |
| `Partner` | 12–15 | `{ id: PartnerId, fullScopeCostSEK: number }` | Cost-model record. Matches doc 03 §1. |
| `PartnerContribution` | 17–27 | `{ id, name, role, investmentSEK, valueSEK, color, categories, scope[], successSignals[] }` | Rich ROI-narrative record (post-spec). |
| `PartnerChartDatum` | 29–34 | `{ id, name, value, color }` | Flattened chart-ready shape. |

### 2.2 Cost constants (fixed client inputs)

| Export | Lines | Value | Business meaning |
|---|---|---|---|
| `PARTNERS` | 36–40 | EY 30,000,000 · Accenture 3,000,000 · TCS 8,400,000 | Full-scope annual cost per delivery track from the client rate card. Sum = 41,400,000 SEK full-plan cost. |
| `PARTNER_IDS` | 42 | `['EY','Accenture','TCS']` | Derived key list (iteration order for charts/tables). |
| `PARTNER_FULL_ANNUAL_COST` | 44–48 | same figures as `PARTNERS`, as a `Record<PartnerId, number>` | Lookup-by-id form of the rate card; the input to the share-table derivation. |
| `PARTNER_SHARE_STARTS_IN_Q1` | 50–54 | EY 6,250,000 · Accenture 625,000 · TCS 1,750,000 | One Q1-start workstream's cost, attributed by partner: `annual×(3/12)/3 + annual×(9/12)/6`. **Sums to 8,625,000** = `costSEK` of a Q1-start workstream. |
| `PARTNER_SHARE_STARTS_MONTH4` | 56–60 | EY 3,750,000 · Accenture 375,000 · TCS 1,050,000 | One Month-4-start workstream's cost by partner: `annual×(9/12)/6`. **Sums to 5,175,000**. |

These share tables are what `partnerBreakdownFor()` accumulates for the workstream-selection partner
chart (doc 03 §3.4). Worked example from the spec: selecting Hardware+AI+Cloud → EY 18,750,000,
Accenture 1,875,000, TCS 5,250,000 (= 3 × the Q1 row).

### 2.3 `PARTNER_MODEL` (lines 62–144) — post-spec ROI attribution

Four `PartnerContribution` rows attributing the 43M SEK benefit. `investmentSEK` mirrors the rate
card (fixed); `valueSEK` is a **placeholder attribution of the estimated benefit pool** — the same
confidence class as `benefitSEK`, not audited.

| id | name | role | investmentSEK | valueSEK | color | categories |
|---|---|---|---|---|---|---|
| `ey` | EY | Strategic partner and assurer | 30,000,000 | 8,000,000 | `#071B4D` | compliance, adoption, security |
| `tcs` | TCS | Data foundation, clean-up and governance support | 8,400,000 | 11,000,000 | `#4F7D2A` | financial, compliance, adoption |
| `accenture` | Accenture | Platform and tooling enablement | 3,000,000 | 12,000,000 | `#C9002B` | security, incident, compliance |
| `hm` | Cyber + Business scope | Internal vision, ownership and adoption engine | **0** | 12,000,000 | `#B27900` | adoption, security, financial |

Each row also carries `scope[]` (3–5 bullets of what the contributor delivers, e.g. TCS: "Hardware data
clean-up and enrichment across ownership, location, lifecycle and CI quality.") and
`successSignals[]` (measurable targets, e.g. TCS ">90% data completeness", ">75% reduction in
duplicate/orphaned records"; Accenture ">50% reduction in manual reconciliation effort"). Note the
`hm` row is **unfunded** (investmentSEK 0) yet attributed 12M SEK of value — it represents H&M's
internal cyber/business/EA effort that the partner budget doesn't pay for.

### 2.4 Functions and the integrity invariant

| Export | Lines | Behaviour |
|---|---|---|
| `partnerInvestmentChartData()` | 146–155 | Returns `PartnerChartDatum[]` of investment, **filtering out zero-investment rows** (drops `hm`) — an investment pie/bar should not show a 0 slice. |
| `partnerValueChartData()` | 157–164 | Returns `PartnerChartDatum[]` of value for **all four** rows — H&M's value contribution is displayed even though it costs nothing. |
| `PARTNER_VALUE_TOTAL` | 166–169 | `Σ valueSEK = 43,000,000`. |
| invariant | 171–173 | `if (PARTNER_VALUE_TOTAL !== TOTAL_FULL_BENEFIT) throw` — a module-load-time guarantee that the value attribution never drifts from the workstream benefit total. Because it throws at import, a bad edit breaks the build/tests immediately rather than rendering a wrong chart. |

---

## 3. `src/data/risks.ts` — risk registers (post-spec)

### 3.1 Types

- `RiskSeverity` (line 3): `'high' | 'medium' | 'ready'` — note `'ready'` exists in the type though no
  current record uses it.
- `EnterpriseRisk` (lines 5–12): `{ id, title, severity, businessImpact: string[],
  affectedWorkstreamIds: WorkstreamId[], leadershipAsk: string }` — an enterprise risk, its impacts,
  which workstreams mitigate it, and the explicit ask of leadership.
- `AiReadinessDomain` (lines 14–20): `{ id, title, readinessPct: number, description,
  evidenceNeeded: string[] }` — an AI-governance readiness dimension scored 0–100.

### 3.2 `ENTERPRISE_RISKS` (lines 22–76)

Four curated risks (content from the roadmap's risk narrative; not computed):

| id | title | severity | affects workstreams | leadership ask (summary) |
|---|---|---|---|---|
| `incomplete-visibility` | Incomplete enterprise asset visibility | high | cloud, software, ai, ot | Expand coverage across Cloud/Software/AI/OT to reduce unmanaged technology risk. |
| `data-regression` | Data quality regression and sustainability risk | medium | hardware, cloud, software, ai, ot | Sustain operational ownership and governance adoption to protect CMDB quality. |
| `delivery-dependencies` | Vendor, tool-owner and regional dependency risk | medium | hardware, cloud, software, ai, ot | Maintain cross-functional collaboration (Cyber Security, EA, Operations, GRC). |
| `value-scale` | Asset Intelligence value scale-up risk | high | ai, newemerging, cloud, software | Continue executive sponsorship for Asset Management as a service capability. |

`affectedWorkstreamIds` is the join back into `WORKSTREAMS` — the UI can show which funded
workstreams mitigate which risk. `newemerging` appears only in `value-scale`.

### 3.3 `AI_READINESS_DOMAINS` (lines 78–127)

Four readiness scores (client-assessed percentages — curated inputs, not computed):

| id | title | readinessPct | what it measures |
|---|---|---|---|
| `registry` | AI registry completeness | 42 | Central AI asset registry with owner/purpose/lifecycle/usage context. |
| `metadata` | Metadata and architecture | 35 | Target metadata model, CMDB integration, relationship mapping. |
| `classification` | EU AI Act risk classification | 24 | Classification workflow for prohibited / high-risk / limited-risk / transparency-obligation systems. |
| `compliance` | Continuous compliance and evidence | 18 | Monitoring, audit evidence, issue handling, compliance reporting. |

Each carries `evidenceNeeded[]` — the artefacts required to lift the score (e.g. classification needs a
"Risk classification decision record", an "Assessment workflow and approval trail"). The descending
percentages (42 → 18) tell the story: the further toward operational compliance, the less ready H&M is —
the justification for the AI Assets workstream (WS2).

---

## 4. `src/data/roadmap.ts` — interactive roadmap timeline (post-spec)

### 4.1 Types (lines 1–27)

- `RoadmapFilter`: `'all' | 'foundation' | 'risk' | 'compliance' | 'value'` — tag filter for the timeline.
- `RoadmapTone`: `'green' | 'blue' | 'purple' | 'amber' | 'red'` — bar colour per lane theme.
- `RoadmapItem`: `{ id, title, tags: Exclude<RoadmapFilter,'all'>[], tone, quarterIndex: number,
  startPct: number, widthPct: number, row: 1 | 2 }` — one roadmap bar. Position is **percentage-based
  within its quarter cell** (`startPct`/`widthPct`), `quarterIndex` is 0–3 (Q1–Q4), and `row`
  stacks up to 2 bars vertically within a cell. Ids are human numbering from the source deck
  (`'1.1'`, `'2.6'`, `'6.1.1'`…), which is why some sequences skip numbers.
- `RoadmapCell`: `{ stage?: string, items: RoadmapItem[] }` — one quarter of a lane; `stage` labels
  the phase (e.g. "Design Finalisation"). Empty `items` = nothing scheduled that quarter.
- `RoadmapLane`: `{ id, label, description, section: 'sustain' | 'ambition', cells: RoadmapCell[4] }` —
  one horizontal swimlane; `section` splits the roadmap into "sustain the foundation" vs "raise the
  ambition".

### 4.2 `ROADMAP_LANES` (lines 29–521)

Seven lanes (all curated schedule content from the EY roadmap deck):

| Lane | Section | Tone | Quarters with work | Summary of scheduled items |
|---|---|---|---|---|
| `hardware` | sustain | green | Q1–Q3 | Discovery automation (Zebra/HP/Canon/Kandji/SCCM), data-quality & governance foundation, BAU KPI monitoring, service mapping, then operational intelligence (incident/vulnerability/service-desk integration). |
| `ai` | sustain | blue | Q1–Q4 | Tooling decision & readiness → registry/workflow/CMDB implementation → EU AI Act controls + governance adoption → continuous compliance. |
| `ot` | sustain | amber | Q3–Q4 | Extend OT baseline + lifecycle/ownership model, then monitoring & discovery design (sensors, data capture, reporting). Nothing in Q1–Q2 — matches `startsInQ1: false`. |
| `ambition` | ambition | — | none | **Placeholder lane** "Raise the ambition" with stage names only (Set-up Foundation → Design Finalisation → Implementation → Operational Intelligence) and no items — reserved for expanded scope. |
| `cloud` | ambition | green | Q1–Q4 | Azure reconciliation & prioritised use cases → architecture/CMDB + data governance → automated onboarding + KPI monitoring → multi-cloud (GCP/AWS), asset intelligence mapping, FinOps. |
| `software` | ambition | amber | Q2–Q4 | Baseline + compliance/security/cost use cases → data model & governance + gap analysis → SAM implementation roadmap. Starts Q2. |
| `newemerging` | sustain | purple | Q2–Q3 | Asset data products, benefits/value tracking, Enterprise Asset Intelligence & change adoption; Q1 and Q4 cells carry stage names only. |

Tags drive the timeline's filter: `foundation` (base build), `risk` (risk reduction),
`compliance` (regulatory), `value` (benefit/value realisation). An item can carry several (e.g.
Software 5.5 carries `risk`, `compliance`, `value`).

---

## 5. `src/data/knowledgeDeck.ts` — explainer cards (post-spec)

### 5.1 Types (lines 1–20)

- `KnowledgeMetric`: `{ label, target }` — a target KPI, both strings (targets are display text like
  `'>95%'`, not numbers).
- `KnowledgeColumn`: `{ title, points: string[], metrics?: KnowledgeMetric[] }`.
- `KnowledgeCard`: `{ id: 'category-outcomes' | 'data-thon' | 'value-framework', title, summary,
  eyebrow, lead, columns: KnowledgeColumn[], outcome }` — the `id` union is closed to the three cards
  that exist.

### 5.2 `ROADMAP_KNOWLEDGE_CARDS` (lines 22–157)

Three curated explainer cards supporting the roadmap/ROI narrative:

| id | title | columns | key content |
|---|---|---|---|
| `category-outcomes` | Asset Category Outcomes | 5 (Hardware, Cloud, Software, OT, AI Assets) | Y1 outcome + "beyond" ambition per domain — mirrors `yearOneOutcome`/`yearTwoOutcome` in `workstreams.ts`. |
| `data-thon` | 6-Month Data-thon | 3 (Flow, Outputs after 6 months, Programme value) | The WS6 value-discovery cycle: prioritise use cases → build data products → measure uplift → drive uptake; outputs = benefits dashboard, asset intelligence backlog, reusable data products, adoption actions. |
| `value-framework` | Strategic Value Framework | 3 pillars with metrics | Enterprise Visibility & Control (asset coverage >95%, ownership >95%, data quality >90%, tech domains 100%); Operational Efficiency & Compliance (manual effort −50%, data exceptions −75%, governance embedded in BAU, compliance readiness −50%); Cyber Resilience & Risk (critical asset visibility >95%, risk coverage 100%, vulnerability correlation >90%, unmanaged technology risk −80%). |

These metric targets are the roadmap's strategic KPIs — aspirational client targets, displayed as text;
nothing in the app computes against them.

---

## 6. `src/data/derived.ts` — plan totals (computed at module load)

All four exports are **computed** from `WORKSTREAMS` at import time, so they can never disagree with
the workstream table (divergence from doc 03 §2.3, which hard-codes them):

| Export | Lines | Definition | Current value |
|---|---|---|---|
| `TOTAL_FULL_COST` | 3–6 | `Σ costSEK` over `WORKSTREAMS` | **41,400,000 SEK** |
| `TOTAL_FULL_BENEFIT` | 8–11 | `Σ benefitSEK` over `WORKSTREAMS` | **43,000,000 SEK** |
| `FULL_MULTIPLE` | 13 | `TOTAL_FULL_BENEFIT / TOTAL_FULL_COST` | **≈ 1.0386** |
| `MAX_FULLY_COVERABLE_WORKSTREAMS` | 15 | constant `6` | 6 |

Business meaning: the full-plan headline numbers for the dashboard stat cards and the denominators for
every "% of full plan" sub-line. `FULL_MULTIPLE` = benefit ÷ cost in plain terms: "for every SEK
spent on the full plan, ~1.04 SEK of estimated benefit comes back" (on this cost basis — see §8).

**Edge case:** if `WORKSTREAMS` were ever emptied, `TOTAL_FULL_COST` would be 0 and
`FULL_MULTIPLE` would be `NaN` — there is **no divide-by-zero guard here** (guards live in
`src/lib/calculations.ts` per `src/lib/AGENTS.md`). With the fixed 6-workstream constant this cannot
occur in practice.

**Missing vs spec:** doc 03 §2.3 also defines `LAST_YEAR_COST` (67,140,000 SEK) and
`DELTA_FULL_VS_LAST_YEAR` (−25,740,000 SEK) backing the PRD FR-1.1 "Δ vs last year" stat card. Neither
exists in the current data layer.

---

## 7. `src/data/auth.ts` — password gate constants (post-spec)

| Export | Lines | Value / shape | Purpose |
|---|---|---|---|
| `PASSWORD_HASH` | 3–4 | SHA-256 hex string (`'1466ef5c…607be7'`) | Hash of the static access password. The plaintext is never committed; `PasswordGate.tsx:9-16` hashes user input with `crypto.subtle.digest('SHA-256', …)` and compares. |
| `AUTH_STORAGE_KEY` | 6 | `'eam-auth-unlocked'` | `sessionStorage` key recording an unlocked session (`App.tsx:17-19`, `PasswordGate.tsx:33`). Session-scoped, so it clears when the tab closes. |

Both contradict the PRD's "no auth" non-goal — a deliberate post-spec addition; treat it as access
friction for a shared link, not security (the hash and all app data ship to every client regardless).

---

## 8. Divergences from the spec docs (summary)

1. **Two cost bases (most important).** The live workstream table sums to **41,400,000 SEK / 43,000,000
   SEK benefit / ≈1.0386x**, matching doc 03 §2/§5 and the PRD. The validated prototype
   (`src/_prototype/main.jsx:25-53`) and the root `AGENTS.md` test expectations carry the later
   **99,510,000 SEK / 43,000,000 / ≈0.4321x** basis ("EY roadmap plus H&M's revised EY resourcing
   basis", `main.jsx:166`), with workstream costs 20,075,000 (Q1-start) / 13,095,000 (Month-4-start)
   and a 4-row partner share split including separate TCS Onsite/Offshore rows
   (`main.jsx:48-49`). CR-1 in `06_BACKLOG_CORRECTIONS.md` explains the cause (bounded per-partner
   FTE model replacing the even-split model) and instructs regenerating the cost constants; the benefit
   total is identical (43M) in both. Until the regeneration lands, quote cost figures with their basis.
2. **`Workstream` grew from 8 to 14 fields** (`workstreams.ts:21-35`): `yearOneOutcome`,
   `yearTwoOutcome`, `scopeItems`, `riskFocus`, `roadmapEvidence` added post-spec;
   `valueHighlights` added per CR-2.
3. **`derived.ts` computes totals** instead of hard-coding them, and **omits `LAST_YEAR_COST` /
   `DELTA_FULL_VS_LAST_YEAR`** (doc 03 §2.3).
4. **New data files with no spec counterpart:** `risks.ts`, `roadmap.ts`, `knowledgeDeck.ts`,
   `auth.ts`, plus the `PARTNER_MODEL` ROI attribution in `partners.ts`.
5. **`Partner` type unchanged** despite CR-1.1's instruction to add `minFTE`/`maxFTE` — the FTE
   bounds exist only in the correction doc, not in code.
6. **TCS modelled as one partner** in the live data (`partners.ts:3,39`) per CR-1, whereas the
   prototype splits TCS Onsite/Offshore in its share tables.
7. **Calculation/formula behaviour** (allocation strategies, coverage labels, multiple thresholds,
   divide-by-zero guards returning 0, empty-selection handling) is implemented in `src/lib/` exactly
   per doc 03 §3 — see `src/lib/AGENTS.md` for the purity/no-NaN rules; those are unchanged.
