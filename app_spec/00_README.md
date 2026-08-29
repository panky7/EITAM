# H&M EAM Scenario Modeller — App Spec Package

This package is written so OpenAI Codex (or a human developer) can scaffold and build this app without
needing the prior conversation history. The root-level `AGENTS.md` is the short entry point Codex loads
automatically at session start — it points here. Read this package in order:

| # | File | What it covers |
|---|---|---|
| 1 | `01_PRD.md` | What the app is, who it's for, what it must do, what it explicitly does not do |
| 2 | `02_ARCHITECTURE.md` | Tech stack, folder structure, state management, build/run commands |
| 3 | `03_DATA_MODEL_AND_CALCULATIONS.md` | TypeScript types for every data entity + every formula, in enough detail to implement without guessing |
| 4 | `04_COMPONENT_SPEC.md` | One entry per component/file: purpose, props, behavior |
| 5 | `05_BACKLOG.md` | Known-good ideas deliberately deferred past v1 — don't build these unless asked |

## One-paragraph summary

A single-user, client-side-only web app that helps H&M EAM programme leadership decide how to spend
the next 12 months' budget across 6 IT asset-management workstreams (Hardware, AI Assets, Cloud, OT,
Software, New & Emerging Projects), split across 3 delivery partners/tracks (EY, Accenture, combined
TCS). It has 3 views: a plan-overview dashboard, a budget-constrained what-if
("I only have 5M of the 10M I planned for — what do I get?"), and a workstream-constrained what-if
("if I only fund AI Assets, what does that cost and what's the benefit?"). No backend, no auth, no
external data source — all figures are constants derived from the source planning documents, editable
only where the spec says so.

## Provenance / origin of the numbers

Every cost and benefit figure in `03_DATA_MODEL_AND_CALCULATIONS.md` traces back to a prior planning
exercise (EY roadmap deck + 2 SOW scope documents + a rate card the client provided). **Do not
recompute or "improve" these numbers when implementing** — they're intentionally treated as fixed
inputs at this stage; changing them is a product decision for the client, not an implementation
detail. Where a number is explicitly flagged as a placeholder/estimate in the data model doc, preserve
that flag in the UI (don't quietly present it as authoritative).

## What already exists

A working single-file React prototype (`eam_scenario_modeller.jsx`) implements this app's logic and
was validated with the client. **This spec package formalizes that prototype into a proper,
maintainable app structure** (separated components, typed data model, documented formulas) — it is
not a redesign. If anything in this package appears to contradict the prototype's behavior, the
prototype is the source of truth for *what it should do*; this package is the source of truth for
*how it should be structured*.
