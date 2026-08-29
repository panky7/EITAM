# AGENTS.md — src/lib

This folder is the calculation engine. Every function here must be pure (no React, no I/O, no
randomness) and must match `app_spec/03_DATA_MODEL_AND_CALCULATIONS.md` exactly — that doc is the
spec, this comment is just a pointer, not a substitute for reading it.

Before editing `calculations.ts` or `format.ts`:
- Re-read doc 03 §3 (function-by-function spec) and §5 (reference values) in full.
- Any change to a formula must keep all reference values in §5 passing.
- Guard every division (e.g. `benefit / cost`) against a zero denominator — return 0, never NaN or
  Infinity, per doc 03 §3.2.
- Do not add caching, memoization-via-module-state, or async — this layer is called from React
  `useMemo` in the view components; keep it synchronous and side-effect-free so that works.
