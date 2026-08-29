# 05 — Backlog (deliberately out of v1 scope)

Do not build these unless explicitly asked — listed here so Codex doesn't "helpfully" add them
unprompted, and so the next planning pass has a starting list.

| Idea | Why it's deferred | Prerequisite before building |
|---|---|---|
| Editable assumptions panel (rate card, EY scaling factor, benefit weights) | v1 intentionally locks these to reduce surface area after the client found the earlier multi-panel version overwhelming | Client explicitly asks to tune assumptions themselves again |
| Save/load named scenarios (persistence) | Not needed for a single exploratory session; adds storage-design questions (browser-local vs. account-based) | Client confirms whether cross-device persistence matters |
| Side-by-side scenario comparison (2-4 scenarios in one table) | Was in an earlier draft PRD, dropped when the model was simplified to 2 axes | Revisit once v1's two what-if views are validated in real use |
| File export (PDF/PNG/xlsx) | v1 is on-screen only | Client specifies which format they actually need to hand upward |
| Non-linear/diminishing-returns benefit curve | Adds real complexity for unproven payoff; v1's linear assumption is already flagged as a simplification | Only if stakeholders push back that linear benefit scaling misrepresents reality |
| Optimizer ("suggest the best scenario for budget X") | The two what-if views already let the user find this manually; an optimizer changes the tool from exploratory to prescriptive | Explicit client ask, plus agreement on what "best" optimizes for (multiple? absolute benefit? something else?) |
| Multi-user / shared scenarios | Out of scope per PRD non-goals | Not currently planned |
| Real per-workstream benefit data replacing the placeholder weighting | This is the single most important number to fix, but it depends on H&M risk/finance providing real figures, not on app engineering | H&M risk/finance sign-off on real workstream risk weights |
| Quarterly (Q1 vs Month4-12) breakdown view in the UI | The phasing logic already exists in the cost model (`startsInQ1`) but isn't surfaced as its own view | If the client wants to see cash-flow timing, not just annual totals |
