# 04 — Component Spec

One entry per file in `src/components/`. Props are TypeScript interfaces; "Behavior" notes anything
not obvious from props alone. Matches the folder structure in doc 02.

---

## `StatCard.tsx`
```ts
interface StatCardProps {
  label: string;
  value: string;       // pre-formatted, e.g. via fmtM()/fmtX() — this component does no formatting itself
  sub?: string;
  tone?: string;        // hex color for the value text; defaults to ink/near-black if omitted
}
```
Purely presentational. Renders label (small caps), value (large, tabular-nums/monospace font), and an
optional sub-line. No calculation logic. Value changes should animate with a lightweight CSS
transition so live scenario changes feel responsive without introducing derived-number state.

## `CoverageBar.tsx`
```ts
interface CoverageBarProps {
  pct: number;   // 0-100, clamped internally
  color: string; // hex
}
```
Thin horizontal progress bar. Animate width changes with a CSS transition (~300ms) so scrubbing the
budget slider feels responsive rather than jumpy.

## `WorkstreamTile.tsx`
```ts
interface WorkstreamTileProps {
  ws: Workstream;
  fundedPct: number; // default 100 if omitted (used as-is in Dashboard; passed explicitly elsewhere)
}
```
**Behavior:** derives `fundedCost`, `fundedBenefit`, and the tile's own multiple internally from
`ws.costSEK/benefitSEK * fundedPct/100` — call `computeTotals`-style math inline here is fine since
it's a single workstream, not a scenario; don't import the scenario-level function for this. Shows
icon (map `ws.id` → a lucide-react icon — see mapping table below), name, blurb, cost/benefit/multiple
in a 3-column tabular row, a coverage label badge (via `coverageLabel()`), and a `CoverageBar` at the
bottom colored via `multipleColor()` — actually per the prototype, the bar is colored by *coverage*
color not *multiple* color; keep that distinction (coverage = is-it-funded, multiple = is-it-good-value
— they're different signals and shouldn't be conflated even though they sometimes correlate).
Also renders `valueHighlights` as small colored chips between the monetary row and coverage bar. Each
chip uses the fixed category icon/color and exposes its description through a tooltip/tap affordance.

**Icon mapping** (`workstream.id` → lucide-react icon):
```
hardware    → HardDrive
ai          → Cpu
cloud       → Cloud (import aliased, e.g. `Cloud as CloudIcon`, to avoid clashing with the app name)
ot          → Factory
software    → Package
newemerging → Sparkles
```

## `TabNav.tsx`
```ts
interface TabNavProps {
  active: 'dashboard' | 'budget' | 'workstream';
  onChange: (tab: 'dashboard' | 'budget' | 'workstream') => void;
}
```
Renders the 3 tabs (icons: `LayoutDashboard`, `SlidersHorizontal`, `ListChecks`) with the active tab
as a filled pill. Stateless — state lives in `App.tsx`.

---

## `views/Dashboard.tsx`
No props (reads directly from `data/workstreams.ts` and `data/derived.ts` — this view has no
interactive state, it's a pure display of the full-plan constants).

**Renders:**
1. Heading + one-line description.
2. `StatCard`s: Total proposed cost, Total benefit value, Benefit multiple (colored via
   `multipleColor`), Δ vs last year (colored red if the delta is positive/over-budget, green if
   negative/under — cost going *up* is the "bad" direction here, don't default to a generic
   positive-is-green convention), and max workstreams fully coverable.
3. Grid of 6 `WorkstreamTile`s, all at `fundedPct={100}`.
4. Recharts grouped `BarChart`: x-axis = workstream `short` codes, two series (Cost, Benefit) in
   millions SEK.
5. A persistent disclosure banner (amber/warning style) stating the benefit figures are estimates —
   this is PRD FR-1.4, do not make it dismissable/closeable, it should always be visible on this view.

## `views/BudgetWhatIf.tsx`
Owns state: `budgetM: number` (millions SEK, for friendlier slider/input UX than raw SEK),
`strategy: 'priority' | 'even'`.

**Renders:**
1. Heading + description including the full plan cost for reference.
2. A control panel: range slider (0 to ~110% of `TOTAL_FULL_COST` in millions) synced with a numeric
   input — both must update the same `budgetM` state, neither should fight the other (typing in the
   number field updates the slider position and vice versa).
3. Budget preset buttons for `Minimum Viable` and `Flat Resourcing`; these set exact preset budgets
   and use priority allocation.
4. Two strategy-select buttons (not a dropdown — both options should be visible and comparable at a
   glance per the prototype's design), each with a one-line explanation of what it does.
5. Recomputed `StatCard`s: cost allocated, benefit, multiple, max workstreams fully coverable, and — conditionally, only when
   `leftoverSEK` is meaningfully nonzero (use a small epsilon like >1000 SEK, not `!== 0`, to avoid
   showing it for floating-point noise) — an "Unallocated" card.
6. Grid of 6 `WorkstreamTile`s with `fundedPct` from the live allocation, in the *original* workstream
   order (not re-sorted by the priority algorithm's internal ranking — the ranking is an
   implementation detail of the allocation, the display order should stay stable so users can track a
   given workstream's tile across strategy changes).

**Behavior note:** every render recomputes `computeAllocation()` and `computeTotals()` via `useMemo`
keyed on `[budgetM, strategy]` — do not compute in a `useEffect` + separate state variable, per the
architecture doc's guidance against unnecessary effects.

## `views/WorkstreamWhatIf.tsx`
Owns state: `selected: Set<WorkstreamId>` (starts empty).

**Renders:**
1. Heading + description.
2. Grid of 6 toggleable workstream cards (similar layout to `WorkstreamTile` but clickable, with a
   checkbox-style indicator, not reusing `WorkstreamTile` directly since the interaction model differs
   enough — a selectable card, not a funded-%-display card). Cards also show value-highlight chips.
3. If `selected.size === 0`: icon-led empty-state message (PRD FR-3.2), nothing else below.
4. Else: `StatCard`s for count selected, total cost (+ % of full plan), total benefit (+ % of full
   plan), multiple — then a horizontal bar chart (Recharts, `layout="vertical"`) of cost by partner
   from `partnerBreakdownFor(selectedWorkstreams)`.

---

## `App.tsx`
```ts
// no props — top-level component
```
Owns `activeTab` state. Renders a polished dark header bar (app title), `TabNav`, and conditionally one of the
3 view components based on `activeTab`. This is the only place that switches between views — views
never navigate to each other directly.

---

## Design tokens (apply consistently, don't redefine per-component)

```
ink (headers/primary text):     #12203A
paper (page background):        #F5F6F8
steel (secondary text/borders): #5B6B82
accent (interactive/brand):     #1B4B66
good (multiple ≥0.9, full coverage):    #1F8A5F
warn (multiple 0.4-0.9, partial):       #C98A1D
bad (multiple <0.4, deferred):          #C4432B
```
Monetary figures use a monospace/tabular-numeral font stack: `ui-monospace, SFMono-Regular, Menlo,
monospace` — applied via a Tailwind utility class or a small shared className constant, not repeated
as inline styles in every component.
