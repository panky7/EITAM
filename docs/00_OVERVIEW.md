# H&M EAM Scenario Modeller — Documentation Overview

This folder is a complete, code-grounded documentation set for the **H&M EAM Scenario Modeller**,
a client-side-only React + TypeScript web app that helps H&M programme leadership decide how to
allocate a 12-month Enterprise Asset Management (EAM) budget across **6 IT asset-management
workstreams** and **3 delivery partners** (EY, Accenture, combined TCS).

## What the app does

1. **Plan Overview dashboard** — shows the full proposed plan (cost, benefit, benefit multiple,
   delta vs. last year) at a glance, with all 6 workstreams as tiles and a cost-vs-benefit chart.
2. **Budget What-If** — "I only have X SEK of the planned budget — what do I get?" The user sets an
   available budget and picks an allocation strategy (prioritize highest value first, or spread
   evenly); results update live.
3. **Workstream What-If** — "If I only fund these workstreams, what does it cost and what's the
   benefit?" Any subset of the 6 workstreams can be toggled; totals and a per-partner cost
   breakdown update live.

The shipped app has also grown beyond the original v1 spec: a **password gate**, **Enterprise Risk**
and **AI Risk** views, an **interactive roadmap timeline**, a **Capability ROI Board**, and a
path-based **v0/v1 version switch** (`/v0` = legacy multi-tab app, `/v1` = ROI board). These are
documented in the files below.

## Document map

| File | Contents |
|---|---|
| `01_BUSINESS_DOMAIN.md` | Business context: problem, users, goals, non-goals, workstreams, partners, what-if modes, data provenance, disclosures, acceptance criteria, deferred backlog, and how the app evolved past the spec |
| `02_DATA_MODEL.md` | Every data entity and constant in `src/data/` — workstream costs/benefits, partner rate card, risk registers, roadmap data, knowledge deck, auth — with types, values, and business meaning |
| `03_CALCULATIONS_ENGINE.md` | The pure-function calculation engine in `src/lib/calculations.ts` + `format.ts`: allocation strategies, scenario totals, partner breakdown, coverage labels, formatting, and the pinned reference values |
| `04_DECISION_ROADMAP_ROI_LOGIC.md` | Business logic for the Capability ROI board, decision helpers, roadmap timeline logic, and the v0/v1 versioning switch |
| `05_APP_SHELL_AND_COMPONENTS.md` | Bootstrap, `App.tsx` shell, password gate, design system, and every shared component (props, behavior, usage) |
| `06_VIEWS.md` | One detailed section per view: controls, state, derived-number flow, rendering, empty states |

## Architecture at a glance

- **Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Recharts, lucide-react. No backend, no
  router, no state library — `useState` + `useMemo` only.
- **Layers:** `src/data/` (fixed client-provided constants) → `src/lib/` (pure calculation
  functions) → `src/components/` (shared UI) → `src/components/views/` (screens) → `src/App.tsx`
  (shell). All derived numbers go through `src/lib/` as pure functions; components never do inline
  math and never use `useEffect` for recomputation.
- **Testing:** Vitest unit tests live alongside each `src/lib/*.ts` (and some `src/data/*.ts`) file
  and pin the reference values exactly: full-plan total cost = 41,400,000 SEK, total benefit =
  43,000,000 SEK, benefit multiple ≈ 1.0386x (see the dual-basis note below).
- **Source of truth:** `app_spec/` is the formal spec package; `src/_prototype/main.jsx` is the
  client-validated reference implementation. Where they disagree, the prototype governs behavior and
  the spec governs structure.

## ⚠️ Dual cost basis — quote every figure with its basis

Two cost bases currently coexist in the repo:

- **Live data layer (current app):** `src/data/workstreams.ts` + `src/data/derived.ts` sum to
  **41,400,000 SEK cost / 43,000,000 SEK benefit / ≈1.0386x**, matching `app_spec/03` and the
  live tests (`src/lib/calculations.test.ts`).
- **Prototype / root AGENTS.md basis:** `src/_prototype/main.jsx` uses **99,510,000 SEK cost /**
  **43,000,000 SEK benefit / ≈0.4321x** (EY roadmap + revised resourcing basis, tracked as CR-1 in
  `app_spec/06_BACKLOG_CORRECTIONS.md`, which retires the 99.51M figures).

The benefit total (43M SEK) is identical in both. Until the CR-1.2 regeneration lands, treat any
cost figure as ambiguous unless its basis is stated — `01_BUSINESS_DOMAIN.md` §8.2 and
`02_DATA_MODEL.md` §8 document this in detail.

## Data provenance caveat (read this first)

Cost figures come from an actual partner rate card and SOW scope documents. **Benefit figures are
directional estimates** — a workstream-weighted split of a ~25M SEK "enterprise risk" figure plus
rough savings/avoidance estimates — and are the least validated numbers in the app. The UI carries a
persistent disclosure for this; it is a hard requirement, not decoration. Figures flagged as
placeholders must never be presented as audited numbers.

## Build, run, test

```bash
npm install
npm run dev    # Vite dev server
npm run test   # Vitest unit tests
npm run build  # tsc + vite build → dist/ (static, deployable anywhere)
```
