# Prompt for Claude (design) — paste this with LEADERSHIP_DECK.md attached

Copy everything below the line into Claude along with the attached `LEADERSHIP_DECK.md`.

---

You are designing an executive decision asset for H&M's CISO and senior leadership. Attached is
`LEADERSHIP_DECK.md` — the approved slide text. It is the **single source of truth for all
content and numbers**. Do not invent, recompute, round differently, or "improve" any figure.

## Deliverable

A polished, executive-level slide deck (10 slides as structured in the attachment) **plus one
interactive component** embedded in / accompanying the scenarios slide: a **workstream scope
selector** that lets a leader click workstreams on and off and instantly see what that scope costs
and what it unlocks. The interactivity is the persuasion device — it must feel immediate and
authoritative.

## Hard content rules (non-negotiable)

1. **No vendor names anywhere.** Never show "EY", "TCS" or "Accenture". Delivery is described by
   function only: Strategic assurance & value governance · Data foundation & governance ·
   Platform & tooling enablement · Internal ownership & adoption.
2. Value figures are **directional estimates** — always carry that label. Costs are firm
   rate-card inputs.
3. FTE ceilings marked ⚠️ in the attachment must keep a visible "subject to confirmation" flag.
4. Tone: calm, factual, decision-oriented. No sales language, no fear-mongering. Every scenario
   states what is **not** covered — honesty is the design principle.
5. Currency formatting: "8.6M SEK" style; ratios as "2.23x".

## The interactive scope selector — exact behavior

**Controls:**
- Six toggle chips: Hardware · AI Assets · Cloud · OT · Software · New & Emerging.
- Four preset buttons that set the chips: **A. Minimum viable** (Hardware) · **B. Security first**
  (Hardware + AI + Cloud) · **C. Compliance ready** (+ OT) · **D. Full uplift** (all six).
- Optional: a budget slider (0–41.4M SEK) that auto-selects workstreams greedily in roadmap order
  (Hardware → AI → Cloud → OT → Software → New & Emerging), including a workstream only when the
  budget fully covers the running total.

**Outputs that update live on every click:**
- Required investment (sum of selected workstream costs)
- Directional value unlocked (sum of selected benefits) and value ratio (value ÷ investment;
  show 0 when nothing selected, never NaN)
- Three outcome bars: Unmanaged tech risk reduction %, Compliance readiness %, Incident-response
  uplift %
- Financial benefit share of full plan (%)
- A plain-language "Not covered in this scope" line listing the deferred workstreams
- An empty state ("Select at least one workstream") instead of zeroed numbers when nothing is on

**Exact model (implement literally — these constants ARE the product):**

| Workstream | Cost (SEK) | Benefit (SEK) | Risk −% | Compliance % | Incident % |
|---|---|---|---|---|---|
| Hardware | 8,625,000 | 19,250,000 | 18 | 9 | 12 |
| AI Assets | 8,625,000 | 3,500,000 | 22 | 26 | 3 |
| Cloud | 8,625,000 | 7,000,000 | 27 | 21 | 5 |
| OT | 5,175,000 | 4,750,000 | 13 | 24 | 7 |
| Software | 5,175,000 | 6,750,000 | 0 | 0 | 2 |
| New & Emerging | 5,175,000 | 1,750,000 | 0 | 0 | 1 |

- outcome % = sum of the selected workstreams' contributions (caps: risk 80, compliance 80,
  incident 30 — sums of the full scope; no extra clamping needed if you use the table).
- financial benefit share = round(selected benefit ÷ 43,000,000 × 100).
- Sanity checks the component must pass: Full uplift → 41.4M / 43.0M / 1.04x / 80 / 80 / 30 / 100%.
  Minimum viable → 8.63M / 19.25M / 2.23x / 18 / 9 / 12 / 45%. Compliance ready → 31.05M / 34.5M /
  1.11x / 80 / 80 / 27 / 80%.

## Design direction

- Restrained corporate palette: deep navy (#071B4D), warm paper (#FAF7F4), one accent red
  (#CC071E) used sparingly for risk; green for validated gains. White space over decoration.
- Big tabular-numeral figures for money; outcome bars animate smoothly when scope changes.
- Slide 9's scenario table and the interactive selector must tell the same story — same letters
  A–D, same numbers.
- The deck must also work as a static PDF if the interactivity is stripped: every number visible
  without interaction.

## Process

1. First produce the static deck faithful to the attachment's slide structure.
2. Then build the interactive scope selector as the centerpiece of the scenarios slide.
3. Finally self-check every number against the attachment and the sanity checks above, and list
   any discrepancy you find instead of silently fixing it.
