# 06 — Correction & Enhancement Backlog (post-build feedback)
**Status:** Ready for Codex | Supersedes nothing in `05_BACKLOG.md` (that file is still "don't build unless
asked" — this file IS the ask) | Read `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` first, these items
change it.

---

## 0. Before touching code — report known errors

This doc doesn't yet have your specific error messages/screenshots. **First step for Codex:** run the
app, run the existing test suite (`npm run test`), and list every failing test, console error, and
visibly broken UI element as a checklist at the top of your response — before starting on the items
below. Fix anything that's an outright bug (crash, NaN, wrong number vs. the doc 03 §5 reference
values) as its own small commit, separate from the feature work below.

---

## 1. CR-1 — Partner FTE bounds (currently unbounded — this is the biggest correction)

**Implementation clarification after client correction:** full-scope costs are EY **30,000,000 SEK**,
Accenture **3,000,000 SEK**, and combined TCS **8,400,000 SEK**. Treat TCS as one partner in the app
and partner breakdown chart; do not keep separate TCS Onsite / TCS Offshore rows in active data.

The current model scales EY's FTE-equivalent as `activeWorkstreamCount × 1.75` with **no floor or
ceiling**. That's wrong. Every partner now has an explicit minimum, and the ratio below is *derived*
from your instruction that **the minimum team must be able to run at least 2 workstreams in parallel**
— I calculated it, didn't invent it, but flag where I had to assume:

| Partner | Min FTE (you specified) | Max FTE | FTE-per-workstream ratio (derived: min ÷ 2) | Workstreams supported at min | Workstreams supported at max |
|---|---|---|---|---|---|
| EY | **2.0** | **5.0** (you specified) | 1.00 | 2.0 | 5.0 |
| Accenture | **0.5** | 2.0 ⚠️ *carried over from original proposal — you didn't state a max, confirm or correct* | 0.25 | 2.0 | 8.0 |
| TCS Onsite | **1.0** | 2.0 ⚠️ *same caveat — not stated* | 0.50 | 2.0 | 4.0 |
| TCS Offshore | **2.0** | 4.0 ⚠️ *same caveat — not stated* | 1.00 | 2.0 | 4.0 |

**⚠️ Please confirm or correct the three ⚠️-flagged max values before this ships** — I defaulted them
to the original rate-card proposal (Accenture 2, TCS Onsite 2, TCS Offshore 4) since you only gave an
explicit max for EY. If any of those should be different, this whole table's right two columns change.

### CR-1.1 — Replace the fixed 1.75x scaling factor
In `src/data/derived.ts` / `src/lib/calculations.ts`, replace the single global
`eyFTEPerWorkstreamFactor = 1.75` with a **per-partner ratio derived from `minFTE / 2`** (table above),
and apply it to all 4 partners, not just EY. Update the `Partner` type in
`03_DATA_MODEL_AND_CALCULATIONS.md` §1 to add `minFTE: number` and `maxFTE: number`, replacing the old
single `scalesWithWorkstreamCount: boolean` flag (every partner now scales, bounded by min/max).

```ts
function fteForPartner(partner: Partner, activeWorkstreamCount: number): number {
  const ratio = partner.minFTE / 2; // FTE per workstream, derived from "min FTE covers 2 workstreams"
  const raw = activeWorkstreamCount * ratio;
  return Math.min(partner.maxFTE, Math.max(partner.minFTE, raw));
}
```

### CR-1.2 — Recompute every cost figure in doc 03 with this formula
Every cost constant in `03_DATA_MODEL_AND_CALCULATIONS.md` §2 (per-workstream cost, `TOTAL_FULL_COST`,
the two `PARTNER_SHARE_*` tables) was derived from the old 1.75x/EY-only formula and is now **wrong**.
Codex must regenerate these, show the new full-plan total cost, and update the reference values in §5
(the old ones — 99,510,000 SEK full-plan cost, etc. — no longer apply). Add this recomputation as a
script or test fixture, not a one-off manual edit, so it's reproducible if the min/max table above
changes again.

### CR-1.3 — Binding constraint: which workstream count is actually achievable
Because every partner is now bounded, the number of workstreams a scenario can *fully* resource is
`min(workstreamsSupported(partner) for each partner)` — e.g. even if EY could cover 5 workstreams at
its max FTE, if TCS Onsite tops out at 4, the real ceiling for **full-depth coverage across all 4
partners simultaneously** is 4, not 5. Surface this as a new stat somewhere visible (Dashboard and/or
Budget What-If): "Max workstreams fully coverable at current team size: N" — this is the live version
of the "min team → 2 parallel workstreams" rule you described, generalized to any FTE level.

### CR-1.4 — Update the "Minimum Viable" and "Flat Resourcing" presets
`Minimum Viable` currently funds Hardware only (1 workstream). Per CR-1.3, the minimum team supports
**2 workstreams in parallel**, not 1 — update this preset to fund the top-2-by-benefit-multiple
workstreams (Hardware + Software, per the doc 03 §5 ranking) at the minimum FTE levels from the table
above, not just Hardware alone. Recompute `Flat Resourcing` the same way, and **resolve the
still-open TCS onsite/offshore split** flagged back in doc 03 §4 using these new minimums (1 onsite +
2 offshore) instead of the old ambiguous "3 combined" figure — that ambiguity is now solved by this
correction, make sure it's actually wired through.

---

## 2. CR-2 — Value shown as more than money

Right now "benefit" is a single SEK number. Add qualitative value dimensions, shown as **highlighted
tags/chips alongside the monetary figure, not replacing it**.

### CR-2.1 — Data model change
Add to the `Workstream` type in doc 03 §1:
```ts
export interface ValueHighlight {
  category: 'risk' | 'incident' | 'transformation' | 'asset_mapping';
  label: string;        // short, e.g. "Reduces enterprise risk exposure"
  description: string;  // one sentence, for a tooltip/expanded view
}
// added to Workstream:
valueHighlights: ValueHighlight[];
```
Four fixed categories (don't let this become an open-ended tag system in v1):
- **`risk`** — Reduced Enterprise Risk (ties to the existing 25M SEK risk figure)
- **`incident`** — Incident Management improvement (faster detection/triage, from the roadmap's "30%+
  faster incident ID" figure)
- **`transformation`** — Organisational Transformation / change-enablement advantage (this workstream's
  contribution to operating-model maturity, not just a technical deliverable)
- **`asset_mapping`** — Central Asset Mapping accuracy (single-source-of-truth / CMDB data quality
  contribution)

### CR-2.2 — Assign highlights per workstream
Every workstream should carry **at least one** highlight; most should carry 2-3. Suggested starting
assignment (confirm/adjust — these are my judgment calls, not given data):

| Workstream | Suggested highlights |
|---|---|
| Hardware | risk, incident, asset_mapping |
| AI Assets | risk, transformation |
| Cloud | risk, asset_mapping |
| OT | risk, incident |
| Software | asset_mapping, transformation |
| New & Emerging | transformation |

### CR-2.3 — UI treatment
On `WorkstreamTile` (and the workstream-selection cards in Workstream What-If), render each
`valueHighlight` as a small colored chip with an icon (suggest: `ShieldAlert` for risk, `Siren` for
incident, `Users` for transformation, `Database` for asset_mapping — all in lucide-react, already a
project dependency). Chips sit below the cost/benefit/multiple row, above the coverage bar. Hovering
or tapping a chip shows the `description` (tooltip on desktop, expand-on-tap on mobile).

---

## 3. CR-3 — UI/UX modernization

"Very basic" — concrete directions rather than a vague redo:

- **CR-3.1** Add real elevation/depth: subtle shadows on cards (`WorkstreamTile`, `StatCard`), not flat
  borders only. Cards should feel like surfaces, not table cells.
- **CR-3.2** Animate number changes — when the budget slider moves or a workstream is toggled, the
  headline stat numbers (`StatCard` values) should count/transition rather than snap instantly. Same
  for the `CoverageBar` width transition already spec'd in doc 04 (verify it actually shipped).
- **CR-3.3** Replace the plain range `<input type="range">` with a styled slider component (custom
  track/thumb matching the design tokens in doc 04, not the unstyled browser default) — this is
  probably the single biggest "looks basic" culprit.
- **CR-3.4** Add a proper empty/loading feel to the Workstream What-If empty state (doc 04 already
  specifies the empty-state message — check it's not just plain gray text with no visual weight; give
  it an icon and center it properly).
- **CR-3.5** Tighten spacing rhythm — audit for consistent padding/margin scale (e.g. 4/8/12/16/24px
  steps) rather than ad-hoc Tailwind values; this is what makes a UI feel "designed" vs. "assembled."
- **CR-3.6** Chart polish: Recharts default tooltips/legends are plain — restyle tooltip background,
  border-radius, and font to match the design tokens (doc 04's ink/paper/steel palette), and add
  subtle bar-hover states.
- **CR-3.7** Header/nav: the current dark header + underline tabs is functional but flat — consider a
  subtle gradient or texture on the header band, and give the active tab a filled pill/background
  instead of just an underline, for clearer state.
- **CR-3.8** Responsive check: explicitly verify the 3-column workstream tile grid collapses cleanly to
  1 column on mobile widths (doc 02 NFR-3) — test at actual narrow viewport, not just visually inferred.

None of CR-3 changes any calculation logic — keep these changes isolated to `components/` and styling,
don't let a UI pass touch `lib/calculations.ts`.

---

## 4. Acceptance criteria for this backlog

- [ ] All CR-1 cost figures regenerated and doc 03 §5 reference values updated to match
- [ ] `npm run test` passes with the new figures
- [ ] The 3 ⚠️-flagged max-FTE assumptions in §1's table are either confirmed by the client or replaced
      with real values before this is treated as final
- [ ] Every workstream shows at least one value-highlight chip, monetary benefit still shown alongside
      (not replaced)
- [ ] CR-3 items reviewed visually against actual rendered app, not just code review
