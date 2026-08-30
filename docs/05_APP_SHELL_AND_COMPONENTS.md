# 05 — App Shell & Shared Components

This document covers the bootstrap path of the **H&M EAM Scenario Modeller** (entry point, root
component, password gate, version switch), the global styling/design system, and every shared
component under `src/components/`. It is written against the shipped code, not the original spec —
where the app has evolved beyond `app_spec/04_COMPONENT_SPEC.md`, the divergence is called out
explicitly in a "Spec divergence" note. For the per-view breakdowns, see `docs/06_VIEWS.md`.

The app is a client-only React 18 + TypeScript + Vite + Tailwind SPA. There is **no router
library**: routing is a single `window.location.pathname` check, and the legacy ("v0") UI switches
tabs with local React state.

---

## 1. Bootstrap

### `index.html` (repo root, 12 lines)

- Plain Vite HTML shell. Sets `<title>H&M EAM Scenario Modeller</title>` and mounts
  `<div id="root"></div>` with module script `/src/main.tsx` (`index.html:9-10`).
- No favicon, no meta description, no fonts preloaded — typography is whatever Tailwind's default
  stack resolves to.

### `src/main.tsx` (10 lines)

- Calls `ReactDOM.createRoot(document.getElementById('root')!)` and renders `<App />` inside
  `<React.StrictMode>` (`src/main.tsx:6-9`). StrictMode means every render and effect runs twice
  in development — all derived numbers are computed in `useMemo` from pure functions, so this is
  safe by design.
- Imports `./index.css` once (`src/main.tsx:4`), which pulls in Tailwind's base/components/utilities
  layers plus the custom component classes described in §4.

### `tailwind.config.cjs` (8 lines)

- Minimal config: `content: ['./index.html', './src/**/*.{ts,tsx}']`, no theme extension, no
  plugins (`tailwind.config.cjs:3-6`). **All brand colors are plain hex constants imported from
  `src/lib/format.ts` and applied via inline `style={{ ... }}`**, not Tailwind theme tokens —
  Tailwind only supplies layout/spacing/slate/stone utilities. This is why you see strings like
  `#071B4D` (dark navy used by the v1 board) hard-coded in class lists.

---

## 2. Root component and version switch — `src/App.tsx` (114 lines)

`App` is the composition root. It owns exactly one piece of state, `unlocked`
(`src/App.tsx:17-19`), initialised lazily from `sessionStorage`:

```ts
useState(() => sessionStorage.getItem(AUTH_STORAGE_KEY) === 'unlocked')
```

Render flow, in order:

1. **Locked** → render `<PasswordGate onUnlock={() => setUnlocked(true)} />` and nothing else
   (`src/App.tsx:21-23`). Neither app version is reachable until unlocked.
2. **Unlocked** → `const version = appVersionFromPath(window.location.pathname)`
   (`src/App.tsx:25`). This is read **once per render** with no listener on navigation — a
   full page load (or the plain `<a href>` links in the v1 header) is the switching mechanism.
3. `version === 'v0'` → `<LegacyApp />`; anything else → `<V1App />` (`src/App.tsx:27-31`).

### Versioning rule — `src/lib/versioning.ts` (5 lines)

| Export | Signature | Behaviour |
|---|---|---|
| `AppVersion` | `'v0' \| 'v1'` | The two shipped variants. |
| `appVersionFromPath` | `(pathname: string) => AppVersion` | Returns `'v0'` only for `/v0` or paths starting `/v0/`; **every other path (including `/`) is v1** (`src/lib/versioning.ts:3-4`). v1 is the default. |

### `LegacyApp` (v0) — `src/App.tsx:34-77`

- Owns `activePage: AppPage` state, default `{ type: 'dashboard' }` (`src/App.tsx:35`). The
  `AppPage` union is defined in `TabNav.tsx` (see §5.2).
- Layout: full-height page in PAPER/INK, a two-column CSS grid
  `lg:grid-cols-[260px_minmax(0,1fr)]` with `<TabNav>` as the sticky left sidebar
  (`src/App.tsx:42-44`).
- Header bar ("H&M Enterprise Asset Management" eyebrow, "Strategic Roadmap Modeller" title,
  `src/App.tsx:47-61`).
- `<main>` switches on `activePage.type` and mounts exactly one of: `Dashboard`,
  `BudgetWhatIf`, `WorkstreamWhatIf`, `EnterpriseRiskView`, `AiRiskView`
  (`src/App.tsx:64-68`).
- For `workstream-detail` pages it resolves the workstream by id
  (`WORKSTREAMS.find(...)`, `src/App.tsx:36-39`) and only renders `<WorkstreamDetail>` when a
  match exists (`src/App.tsx:69-71`) — an unknown id silently renders an empty `<main>`.

### `V1App` (v1, default) — `src/App.tsx:79-114`

- No state. Renders a slimmer header ("Capability ROI Board") plus a version nav with two plain
  anchor links: "Open v0" (`/v0`) and the current-page "v1 board" (`/v1`, styled as the active
  navy pill, `src/App.tsx:92-106`). Because these are real navigations, the version switch is a
  full reload, not an in-place swap.
- `<main class="max-w-7xl ...">` hosts `<CapabilityRoiBoard />` (`src/App.tsx:109-111`) — the
  v1 surface is a single scrolling board, no tabs.

> **Spec divergence:** `app_spec/04_COMPONENT_SPEC.md` §"App.tsx" describes a single app with
> `activeTab` state, a dark header bar, and 3 tabs. The shipped app adds: (a) a password gate,
> (b) the v0/v1 path switch, (c) two extra v0 tabs (Enterprise risk, AI Act readiness), (d)
> per-workstream detail pages, and (e) the entire v1 Capability ROI Board. Tab state also moved from
> `App` into the `LegacyApp` subcomponent.

---

## 3. Password gate — `src/components/PasswordGate.tsx` (98 lines)

A lightweight client-side lock screen. It is an **access courtesy, not security** — the hash and all
data ship in the bundle, so anyone can read the source; it exists to keep casual viewers out of a
shared preview link.

### Auth constants — `src/data/auth.ts` (6 lines)

| Constant | Value | Meaning |
|---|---|---|
| `PASSWORD_HASH` | `'1466ef5c…607be7'` (`src/data/auth.ts:3-4`) | SHA-256 (hex) of the static access password. Plaintext is never committed. |
| `AUTH_STORAGE_KEY` | `'eam-auth-unlocked'` (`src/data/auth.ts:6`) | `sessionStorage` key; value `'unlocked'` marks the tab as authenticated. |

### Flow

1. `sha256Hex(value)` (`src/components/PasswordGate.tsx:9-16`) hashes the trimmed password with
   `crypto.subtle.digest('SHA-256', …)` and hex-encodes the digest. (Note: this requires a secure
   context — `crypto.subtle` is unavailable on plain-HTTP origins, in which case the `catch`
   branch shows the generic error.)
2. `handleSubmit` (`:23-43`): ignores empty input, sets `busy`, compares the hash to
   `PASSWORD_HASH`. On match it writes `sessionStorage.setItem(AUTH_STORAGE_KEY, 'unlocked')`
   and calls `onUnlock()`; on mismatch (or any exception) it sets `error`.
3. Because the key lives in `sessionStorage`, **unlock persists only for the browser tab's
   lifetime** — new tabs and restarts re-prompt. That is deliberate: no long-lived credential.

### UI

Centered white card on the PAPER background with "Restricted Access" heading, a password input
(`autoComplete="current-password"`), inline red error text ("Incorrect password. Please try
again.", `:79-83`), and an "Unlock" button disabled while `busy` or while the input is blank
(`:86-93`). The button and focus ring use `#1B4B66` — the *old* spec accent color (see §4.2),
one of the few places it survives.

---

## 4. Design system

### 4.1 Color and formatting constants — `src/lib/format.ts` (32 lines)

| Export | Value / behaviour | Used for |
|---|---|---|
| `HM_RED` | `'#CC071E'` | H&M brand red; hero panels, active tab fill. |
| `HM_RED_DARK` | `'#9F0618'` | Darker red (exported but currently unused by components). |
| `INK` | `'#171717'` | Primary text / headings. |
| `PAPER` | `'#FAF7F4'` | Page background (warm off-white). |
| `STEEL` | `'#5B6B82'` | Secondary text and muted figures. |
| `ACCENT` | `= HM_RED` | Interactive accent — **aliased to brand red**, so "accent" elements are red. |
| `GOOD` | `'#587E1F'` (green) | Good multiples, high coverage, "ready" severity, benefit bars. |
| `WARN` | `'#9B6615'` (amber-brown) | Middling multiples/coverage/readiness. |
| `BAD` | `= HM_RED` | Poor multiples, low coverage, high-severity risk. |
| `SURFACE` / `LINE` / `SOFT` | `#FFFFFF` / `#DDD5CF` / `#F0EBE7` | Card surface, chart border, soft fill. |
| `M` | `1_000_000` | SEK→millions divisor. |
| `MONO_NUMERIC_CLASS` | `'font-mono tabular-nums'` | Shared class string for every monetary/multiple figure so digits don't jiggle. |

**Formatting functions:**

- `fmtM(sek)` → `"41.40M SEK"` — `(sek / 1e6).toFixed(2)` (`src/lib/format.ts:17-18`). All
  money in the UI is displayed in millions of SEK with 2 decimals.
- `fmtX(multiple)` → `"1.04x"` — `multiple.toFixed(2) + 'x'` (`:20`). The benefit multiple is
  **benefit ÷ cost** (how many SEK of directional value per SEK invested); e.g. the full plan is
  43,000,000 ÷ 41,400,000 ≈ **1.04x**.
- `multipleColor(x)` (`:22-26`): `x ≥ 0.9 → GOOD`, `0.4 ≤ x < 0.9 → WARN`, else `BAD`. So a
  multiple below 0.4x is red (very poor value), 0.4–0.9x amber, ≥0.9x green.
- `coverageColor(pct)` (`:28-32`): `pct ≥ 90 → GOOD`, `10 ≤ pct < 90 → WARN`, else `BAD`.
  Coverage answers "is it funded?", multiple answers "is it good value?" — the spec explicitly warns
  not to conflate them, and the code keeps them separate (see `WorkstreamTile`).

### 4.2 Global CSS — `src/index.css` (69 lines)

- `@layer base`: `body { font-feature-settings: "tnum" }` (`:6-8`) — tabular numerals globally,
  reinforcing `MONO_NUMERIC_CLASS`.
- `.slider` (`:12-46`): custom-styled `<input type="range">`. WebKit and Firefox pseudo-element
  rules paint a red→green gradient track (`#cc071e → #587e1f`, i.e. BAD→GOOD — sliding right moves
  toward "good") and a red thumb with a 3px white ring and drop shadow. Used by the Budget what-if
  slider and the v1 investment slider.
- `.chart-surface` (`:48-53`): white rounded card with LINE border and soft shadow, used to wrap
  Recharts charts.
- `@keyframes value-change` + `.animate-value-change` (`:56-69`): a 180ms fade-and-rise used by
  `StatCard` so numbers visibly "tick" when a live scenario changes.

> **Spec divergence (design tokens):** `app_spec/04_COMPONENT_SPEC.md` §"Design tokens" specifies
> ink `#12203A`, paper `#F5F6F8`, accent `#1B4B66`, good `#1F8A5F`, warn `#C98A1D`, bad
> `#C4432B`. The shipped palette rebranded around H&M red: INK is now neutral `#171717`, PAPER is
> warm `#FAF7F4`, and ACCENT/BAD are the brand red `#CC071E`. The spec's `#1B4B66` accent
> survives only inside `PasswordGate`, and `#C4432B` only as its error text. The v1 board
> additionally introduces an off-palette dark navy `#071B4D` and purple `#5B3AA4` that are not in
> `format.ts` at all — they're hard-coded per-component.

---

## 5. Shared components

One section per file in `src/components/` (excluding `views/`, covered in `docs/06_VIEWS.md`).

### 5.1 `StatCard.tsx` (26 lines)

**Purpose:** the standard KPI tile used across every view.

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Small-caps grey caption. |
| `value` | `string` | **Pre-formatted** — callers pass `fmtM(...)`/`fmtX(...)` output; the card does no math. |
| `sub?` | `string` | Optional grey sub-line (context like "vs 43.00M SEK at full plan"). |
| `tone?` | `string` (hex) | Color of the value text; defaults to `INK`. Callers pass `multipleColor(...)`, `WARN`, `GOOD`, etc. |

**Behaviour:** white card with hover lift (`hover:-translate-y-0.5`). The value span is keyed by
`value` (`key={value}`, `src/components/StatCard.tsx:17`) so React remounts it on change,
replaying the `animate-value-change` CSS animation — a cheap "number ticked" effect with no state.

**Used by:** Dashboard, BudgetWhatIf, WorkstreamWhatIf, WorkstreamDetail, EnterpriseRiskView,
AiRiskView (all v0 views).

### 5.2 `TabNav.tsx` (121 lines)

**Purpose:** the v0 left sidebar — brand block, primary tab list, and per-workstream drill-down
links.

**Exported types:**

```ts
type AppPage =
  | { type: 'dashboard' } | { type: 'budget' } | { type: 'workstream' }
  | { type: 'workstream-detail'; workstreamId: WorkstreamId }
  | { type: 'enterprise-risk' } | { type: 'ai-risk' };
```
(`src/components/TabNav.tsx:13-19`) — the full v0 page union; `LegacyApp` switches on it.

**Props:** `{ active: AppPage; onChange: (page: AppPage) => void }`. Stateless per spec.

**Behaviour:**

- Brand header: red "H&M" wordmark + "Enterprise Asset Intelligence" eyebrow (`:47-58`).
- Five primary tabs from the `TABS` constant (`:29-35`): Plan overview, Budget / FTE what-if,
  Workstream what-if, Enterprise risk, AI Act readiness — each with a lucide icon
  (`LayoutDashboard`, `SlidersHorizontal`, `ListChecks`, `ShieldAlert`, `BrainCircuit`).
  Active tab is filled `HM_RED` with a `ChevronRight` (`:71-81`).
- A "Workstreams" section (`:86-118`) lists all 6 `WORKSTREAMS` as smaller links that navigate to
  `{ type: 'workstream-detail', workstreamId }`; the active one gets a subtle red-tinted
  background (`HM_RED` at 6% opacity, `:108`).
- Responsive: horizontal scroll row on mobile (`flex overflow-x-auto`), sticky full-height sidebar
  at `lg` (`:46`).

> **Spec divergence:** the spec's `TabNavProps` has only 3 tabs
> (`'dashboard' | 'budget' | 'workstream'`). Shipped adds the two risk tabs and the workstream
> detail section, and the active tab is a filled red bar rather than a "pill".

**Used by:** `LegacyApp` only.

### 5.3 `WorkstreamTile.tsx` (93 lines)

**Purpose:** compact card showing one workstream's economics at a given funding level.

| Prop | Type | Notes |
|---|---|---|
| `ws` | `Workstream` | From `src/data/workstreams.ts`. |
| `fundedPct?` | `number` | 0–100; **default 100**. 100 = fully funded scope. |

**Derived numbers (computed inline, per the spec's allowance for single-workstream math,
`src/components/WorkstreamTile.tsx:40-43`):**

- `fundedCost = ws.costSEK × fundedPct / 100` — SEK of this workstream's plan that the scenario buys.
- `fundedBenefit = ws.benefitSEK × fundedPct / 100` — pro-rata directional value.
- `multiple = fundedCost > 0 ? fundedBenefit / fundedCost : 0` — benefit ÷ cost, with a
  divide-by-zero guard returning 0. Because both terms scale by the same `fundedPct`, the multiple
  is **funding-independent**; it equals `ws.benefitSEK / ws.costSEK` at any non-zero funding.
- `coverage = coverageColor(fundedPct)` — colors the badge and bar by *funding*, not by value.

**Renders:** per-workstream lucide icon from `WORKSTREAM_ICONS` (`:24-31`: hardware→HardDrive,
ai→Cpu, cloud→Cloud-as-CloudIcon, ot→Factory, software→Package, newemerging→Sparkles), short code +
name, blurb, a coverage-label badge (`coverageLabel(fundedPct)` → "Full"/"Partial"/"Deferred",
thresholds 90/10), a 3-column Cost/Benefit/Multiple row (multiple tinted with `multipleColor`),
`ValueHighlightChips`, and a `CoverageBar`.

**Used by:** Dashboard (first 3 workstreams at `fundedPct={100}`) and BudgetWhatIf (all 6 with
live allocation percentages). Display order is always the original `WORKSTREAMS` order, never the
allocation algorithm's internal ranking — per spec, so a tile doesn't move as you scrub the slider.

### 5.4 `CoverageBar.tsx` (17 lines)

**Purpose:** thin progress bar for funding coverage. **Props:** `{ pct: number; color: string }`.
**Behaviour:** clamps `pct` into `[0, 100]` (`Math.min(100, Math.max(0, pct))`,
`src/components/CoverageBar.tsx:7`), then a full-width slate track with a colored fill whose width
transitions over 300ms — scrubbing the budget slider animates rather than jumps. **Used by:**
`WorkstreamTile` (only consumer).

### 5.5 `ReadinessBar.tsx` (44 lines)

**Purpose:** labelled readiness progress bar for the AI Act view. **Props:**
`{ label: string; pct: number }`. **Behaviour:** resolves a tone via `readinessTone(pct)` from
`src/lib/calculations.ts:310-316` — `pct ≥ 70 → 'ready'` (GOOD green), `35–69 → 'medium'`
(WARN), `< 35 → 'high'` (BAD red; "high" here means *high risk*). Renders label + whole-percent
readout and a bar with proper `role="progressbar"` / `aria-valuenow` attributes
(`src/components/ReadinessBar.tsx:29-41`). Width animates 300ms. **Used by:** AiRiskView's
"Readiness snapshot" panel.

### 5.6 `RiskSeverityBadge.tsx` (31 lines)

**Purpose:** small pill showing an enterprise risk's severity. **Props:**
`{ severity: RiskSeverity }` where `RiskSeverity = 'high' | 'medium' | 'ready'`
(`src/data/risks.ts:3`). Maps to labels High/Medium/Ready and colors BAD/WARN/GOOD
(`src/components/RiskSeverityBadge.tsx:4-14`); the pill background is the color at 9% opacity
(hex alpha suffix `18`, `:26`). **Used by:** EnterpriseRiskView, AiRiskView, WorkstreamDetail
("Related enterprise risks" panel).

### 5.7 `PartnerCostSplit.tsx` (49 lines)

**Purpose:** card breaking one workstream's (or a selection's) cost down across the three delivery
partners. **Props:** `{ breakdown: Record<PartnerId, number>; totalSEK: number }`.

**Behaviour:** for each id in `PARTNER_IDS` (EY, Accenture, TCS) shows the partner name, the
`fmtM` amount, and a bar whose width is `pct = totalSEK > 0 ? value / totalSEK × 100 : 0`
(`src/components/PartnerCostSplit.tsx:24`) — the divide-by-zero guard collapses all bars to 0%
rather than NaN when nothing is funded. Partner colors: EY→ACCENT(red), Accenture→GOOD(green),
TCS→STEEL. The underlying share tables (`PARTNER_SHARE_STARTS_IN_Q1` = EY 6.25M / Accenture 0.625M
/ TCS 1.75M for Q1-starting workstreams; `PARTNER_SHARE_STARTS_MONTH4` = 3.75M / 0.375M / 1.05M for
month-4 starts, `src/data/partners.ts:50-60`) encode the client's phasing: a workstream starting in
Q1 costs 8.625M SEK in year one, one starting in month 4 costs 5.175M SEK (9 of 12 months).

**Used by:** WorkstreamDetail only. (WorkstreamWhatIf renders the same data as a Recharts bar chart
instead of reusing this card.)

### 5.8 `ValueHighlightChips.tsx` (73 lines)

**Purpose:** row of small colored chips surfacing each workstream's qualitative value highlights.

| Prop | Type | Notes |
|---|---|---|
| `highlights` | `ValueHighlight[]` | `{ category, label, description }` per workstream. |
| `interactive?` | `boolean` | Default `true`; when false, chips are non-focusable (`tabIndex={-1}`) and can't expand. |

**Behaviour:** each of the four categories has a fixed icon/color pair in `HIGHLIGHT_STYLES`
(`src/components/ValueHighlightChips.tsx:15-23`): `risk`→ShieldAlert/red, `incident`→Siren/amber,
`transformation`→Users/red-tinted, `asset_mapping`→Database/green. Clicking a chip toggles a
one-chip-at-a-time popover with the full description (`:51-67`); `event.stopPropagation()`
prevents the click from also toggling the surrounding selectable card in WorkstreamWhatIf. The
description is also on `title`/`aria-label` for hover and screen readers. **Used by:**
WorkstreamTile, WorkstreamWhatIf cards, WorkstreamDetail hero.

### 5.9 `InteractiveRoadmapTimeline.tsx` (282 lines)

**Purpose:** the v1 board's swimlane roadmap — a dense 4-period grid of roadmap work items that
dims/highlights in response to the budget, scope selection, and a pillar filter.

**Props (`:61-71`):**

| Prop | Type | Meaning |
|---|---|---|
| `budgetSEK` | `number` | Current investment slider value. |
| `selectedWorkstreamIds` | `Set<WorkstreamId>` | Currently selected scope chips. |
| `scopeCostSEK` / `scopeBenefitSEK` | `number` | Cost/benefit of the selected scope (denominators for coverage). |

**State:** `filter: RoadmapFilter` (`'all' | 'foundation' | 'risk' | 'compliance' | 'value'`),
default `'all'` (`:72`).

**Derived data (all `useMemo`, `:73-84`):**

- `roadmapModelSummary(budgetSEK, filter, scopeCostSEK)` (`src/lib/roadmap.ts:47-63`) →
  `{ fundedScopePct, activeItemState, highlightedItemCount }`. Funded scope
  `= round(clamp(budget, 0, scopeCost) / scopeCost × 100)` (0 when scope cost is 0 — the guard at
  `roadmap.ts:52-55`). `activeItemState` thresholds mirror `coverageLabel`: ≥90 → `'full'`,
  ≥10 → `'partial'`, else `'deferred'` (`roadmap.ts:41-45`).
- `roadmapControlSummary(...)` → `{ headline, detail }` strings for the bottom dock
  (`roadmap.ts:65-78`).
- `capabilityRoiSummary(budgetSEK, scopeCostSEK, scopeBenefitSEK)` for the header "Maturity" and
  "Investment" metrics.

**Rendered sections:**

1. **Navy header** (`:88-107`): title + four `HeaderMetric`s — Scope %, Maturity
   `1.0 -> projected`, item count, investment.
2. **Timeline controls** (`:109-144`): five filter buttons (All/Foundation/Risk/Compliance/Value,
   `:22-32`) and a one-line status sentence naming the item count, funding state, and funded-scope %.
3. **The grid** (`:146-236`): a `min-w-[1120px]` horizontally scrollable table — one label column
   plus 4 period columns ("3 months" × 3, then "3 months and further", `:15-20`), one row per
   `ROADMAP_LANES` lane (Hardware, AI, OT, "Raise the ambition", Cloud, Software, New & Emerging
   from `src/data/roadmap.ts`). Items are absolutely positioned inside their cell via
   `itemStyle()` (`:53-59`: `left` = `startPct%`, `width` = `widthPct%` minus 6px, two
   stacked rows at 24px/55px) and colored by tone (`toneStyles`, `:34-40`). Chevron-shaped stage
   ribbons sit atop cells that declare a `stage`, tinted navy for "sustain" lanes and purple for
   "ambition" lanes (`:42-45`, `:201-211`).
4. **Bottom control dock** (`:238-270`): repeats the filter buttons plus the
   `controlSummary` headline/detail — a redundant second control row so users at the bottom of the
   timeline don't scroll back up.

**Interaction semantics (`:169-186`, `:212-217`):**

- A **lane is dimmed to 25% opacity** when its workstream is out of scope *or* no item in the lane
  matches the filter. Scope test: the special `'ambition'` lane counts as in-scope when **either
  `cloud` or `software`** is selected; other lanes map 1:1 to a workstream id
  (`:170-174`, mirrored by `roadmapItemsForScope` in `src/lib/roadmap.ts:31-39`).
- Individual **items** dim when they don't match the filter or their lane is out of scope, and drop
  to 60% opacity when funding is `'partial'` — visually communicating "funded but throttled".
- An italic overlay labels the mid-grid "Data-thon: 6 months for benefits visibility and uptake"
  (`:149-151`), tying the timeline to the WS6 Data-thon.

**Used by:** `CapabilityRoiBoard` only — this component exists purely for the v1 surface and is
not part of the original spec at all.
