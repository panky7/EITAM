# AGENTS.md — ITAM Modeling (H&M EAM Scenario Modeller)

## Project overview
Client-side React + TypeScript app. Helps decide 12-month EAM budget allocation across 6 workstreams
and 3 delivery partners (EY, Accenture, combined TCS), with two live "what-if" modes
(budget-constrained, workstream-constrained).
No backend, no auth.

## Before doing anything
Read, in order: `app_spec/00_README.md`, `01_PRD.md`, `02_ARCHITECTURE.md`,
`03_DATA_MODEL_AND_CALCULATIONS.md`, `04_COMPONENT_SPEC.md`, `05_BACKLOG.md`.
`src/_prototype/main.jsx` (once moved there) is the validated reference implementation — match its
behavior if this spec and the prototype ever disagree.

## Rules
- Do not change any figure in `03_DATA_MODEL_AND_CALCULATIONS.md` §2 (cost/benefit constants) — they
  are fixed client-provided inputs, not values to "correct" or estimate differently.
- Do not build anything listed in `05_BACKLOG.md` unless explicitly asked in the task.
- All derived numbers go through `src/lib/calculations.ts` as pure functions — no inline math in
  components, no `useEffect` for recomputation (use `useMemo`).
- Where a benefit figure is flagged as a placeholder in doc 03, the UI must keep that disclosure
  visible — never present it as an audited number.

## Dev environment
- Node + npm. Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`

## Testing instructions
- Unit tests live alongside `src/lib/*.ts` (e.g. `calculations.test.ts`).
- Test command: `npm run test`
- Every function in `calculations.ts` must match the worked examples and reference values in
  `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` §3 and §5 exactly (e.g. full-plan total cost =
  99,510,000 SEK, benefit = 43,000,000 SEK, multiple ≈ 0.4321). A change that breaks these is a bug.

## PR / change instructions
- Keep changes scoped to one layer at a time (data → lib → components → views) — don't rewrite
  multiple layers in a single pass, per `02_ARCHITECTURE.md`.
