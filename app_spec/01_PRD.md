# 01 — Product Requirements Document
**Product:** H&M EAM Scenario Modeller | **Status:** Approved for build (v1 scope)

---

## 1. Problem

H&M's Enterprise Asset Management (EAM) programme has a proposed 12-month plan (from EY) covering 6
workstreams and 3 delivery partners/tracks, costing ~41.4M SEK against an estimated ~43.0M SEK of
benefit value. In practice, the approved budget will likely be lower than the proposed cost, and
programme leadership needs to explore, themselves and in real time, what different budget levels or
different workstream selections would actually buy — without waiting on a spreadsheet or document to
be regenerated for every "what if."

## 2. Goals

1. Show the full proposed plan (cost, benefit, benefit multiple) as a single-glance dashboard.
2. Let the user explore **budget-constrained** scenarios: set an available budget below the full plan
   cost, choose an allocation strategy, and see what gets funded and what benefit results.
3. Let the user explore **workstream-constrained** scenarios: pick any subset of the 6 workstreams and
   see the isolated cost/benefit/partner breakdown for just that selection.
4. Every control updates results live — no "run" or "submit" step anywhere.

## 3. Non-goals (v1)

- No editing of the underlying rate card, benefit weights, or partner assumptions in the UI (they are
  fixed constants in v1 — see `05_BACKLOG.md` for the deferred "assumptions panel").
- No persistence/saving of scenarios across sessions (v1 is exploration-only, resets on reload).
- No optimizer that auto-selects a scenario for a stated goal.
- No backend, no auth, no multi-user features.
- No file export (PDF/PNG/xlsx) — v1 is on-screen only.
- No non-linear/diminishing-returns modeling of benefit vs. funding % — v1 assumes benefit scales
  linearly with the % of a workstream's scope that's funded.

## 4. Users

Programme/IT leadership at H&M deciding EAM budget allocation. Single user per session, no
collaboration features required.

## 5. Views (functional requirements)

### 5.1 Plan Overview (default view)
- **FR-1.1** Display total proposed cost, total benefit value, benefit multiple, and delta vs. last
  year's estimated cost as headline stat cards.
- **FR-1.2** Display all 6 workstreams as tiles (icon, name, one-line description, cost, benefit,
  individual benefit multiple, coverage indicator — always "Full" in this view since nothing is
  constrained here).
- **FR-1.3** Display a cost-vs-benefit bar chart across the 6 workstreams.
- **FR-1.4** Display a persistent disclosure that benefit figures are estimates, not audited figures.

### 5.2 Budget / FTE What-If
- **FR-2.1** Provide a budget input (slider + numeric field, kept in sync) ranging from 0 to at least
  110% of the full plan cost.
- **FR-2.2** Provide two mutually-exclusive allocation strategies:
  - **Prioritize highest value first** — rank workstreams by benefit ÷ cost descending, fund each
    fully in that order until the budget runs out, partially fund the workstream where the budget is
    exhausted mid-way, leave the rest unfunded.
  - **Spread evenly** — fund every workstream at the same percentage, equal to
    `min(100%, budget ÷ total full plan cost)`.
- **FR-2.3** Recompute and display, per workstream: funded %, resulting cost, resulting benefit,
  resulting individual multiple, coverage label (Full ≥90%, Partial 10–89%, Deferred <10%).
- **FR-2.4** Recompute and display scenario totals: total cost actually allocated, total benefit,
  overall benefit multiple, and — if the budget exceeds what 100% funding of everything costs — the
  unallocated leftover amount.
- **FR-2.5** All of the above must update on every input change with no separate action required.

### 5.3 Workstream What-If
- **FR-3.1** Present all 6 workstreams as independently toggleable selections (not mutually exclusive
  — any subset, including all 6 or none).
- **FR-3.2** While zero workstreams are selected, show an empty-state prompt instead of zeroed-out
  stats.
- **FR-3.3** For the current selection, display: count selected, total cost, total benefit, overall
  benefit multiple, and each as a % of the full plan's cost/benefit.
- **FR-3.4** Display a cost-by-partner breakdown (EY / Accenture / TCS) for the
  current selection only — not the full plan's partner breakdown.

## 6. Non-functional requirements

- **NFR-1** Client-side only; no network calls required for core functionality.
- **NFR-2** All monetary figures rendered with consistent formatting (millions of SEK, 2 decimal
  places) and a monospace/tabular-numeral treatment so figures align in tables and don't jitter as
  values change.
- **NFR-3** Responsive down to a single-column mobile layout.
- **NFR-4** Color is never the only signal for coverage/multiple status — pair color with a text label
  (e.g. "Full"/"Partial"/"Deferred"), since color-blind users must be able to read scenario health.
- **NFR-5** No client-side data persistence mechanism that isn't explicitly in scope (i.e., don't add
  `localStorage` scenario-saving speculatively — it's explicitly deferred, see backlog).

## 7. Data provenance & the biggest caveat

The benefit figures (§ full data model in doc 03) are derived from an estimated, workstream-weighted
split of a single ~25M SEK "enterprise risk" figure quoted in the source roadmap, plus rough
savings/avoidance estimates per workstream. **They are the least validated numbers in this app.** The
UI must not present them with more confidence than the cost figures (which come from an actual partner
rate card). This is why FR-1.4 (persistent disclosure) is a hard requirement, not a nice-to-have.

## 8. Acceptance criteria (high level — see doc 03 for exact expected values)

- Loading the app with no interaction shows the Plan Overview with total cost ≈ 41.40M SEK, total
  benefit ≈ 43.00M SEK, benefit multiple ≈ 1.04x.
- Setting Budget What-If to the full plan cost with either strategy reproduces the Plan Overview
  totals exactly.
- Setting Budget What-If to 0 shows 0 cost, 0 benefit, all workstreams "Deferred."
- Selecting all 6 workstreams in Workstream What-If reproduces the Plan Overview totals exactly.
- Selecting zero workstreams shows the empty state, not a divide-by-zero or NaN.
