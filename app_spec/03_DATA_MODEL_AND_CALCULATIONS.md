# 03 — Data Model & Calculations
This is the spec to implement `src/data/*.ts` and `src/lib/calculations.ts` from. Every number here
is a fixed constant for v1 unless changed by an active correction doc. Benefit values remain
directional estimates and must stay disclosed in the UI.

---

## 1. Types

```ts
export type WorkstreamId = 'hardware' | 'ai' | 'cloud' | 'ot' | 'software' | 'newemerging';
export type ValueHighlightCategory = 'risk' | 'incident' | 'transformation' | 'asset_mapping';

export interface ValueHighlight {
  category: ValueHighlightCategory;
  label: string;
  description: string;
}

export interface Workstream {
  id: WorkstreamId;
  name: string;
  short: string;
  costSEK: number;
  benefitSEK: number;
  startsInQ1: boolean;
  blurb: string;
  valueHighlights: ValueHighlight[];
}

export type PartnerId = 'EY' | 'Accenture' | 'TCS';

export interface Partner {
  id: PartnerId;
  fullScopeCostSEK: number;
}

export type PartnerShare = Record<PartnerId, number>;
```

## 2. Constant data

### 2.1 Workstreams

```ts
export const WORKSTREAMS: Workstream[] = [
  { id: 'hardware',    name: 'Hardware',               short: 'WS1', costSEK: 8_625_000, benefitSEK: 19_250_000, startsInQ1: true,  blurb: 'Discovery/integration uplift, CMDB governance, operational intelligence use cases.', valueHighlights: [risk, incident, asset_mapping] },
  { id: 'ai',          name: 'AI Assets',               short: 'WS2', costSEK: 8_625_000, benefitSEK:  3_500_000, startsInQ1: true,  blurb: 'AI registry, metadata model, EU AI Act governance and lifecycle workflows.', valueHighlights: [risk, transformation] },
  { id: 'cloud',       name: 'Cloud',                   short: 'WS3', costSEK: 8_625_000, benefitSEK:  7_000_000, startsInQ1: true,  blurb: 'Azure baseline, CMDB linkage, multi-cloud roadmap, FinOps requirements.', valueHighlights: [risk, asset_mapping] },
  { id: 'ot',          name: 'Operational Technology',  short: 'WS4', costSEK: 5_175_000, benefitSEK:  4_750_000, startsInQ1: false, blurb: 'Warehouse OT baseline, ownership model, monitoring & discovery design.', valueHighlights: [risk, incident] },
  { id: 'software',    name: 'Software',                short: 'WS5', costSEK: 5_175_000, benefitSEK:  6_750_000, startsInQ1: false, blurb: 'Software/licence baseline, SAM use cases, target architecture & roadmap.', valueHighlights: [asset_mapping, transformation] },
  { id: 'newemerging', name: 'New & Emerging Projects', short: 'WS6', costSEK: 5_175_000, benefitSEK:  1_750_000, startsInQ1: false, blurb: 'Data products, benefits tracking, 6-month Data-thon, backlog refresh.', valueHighlights: [transformation] },
];
```

**Where these numbers come from:**
- Full-scope partner costs are fixed at EY `30,000,000 SEK`, Accenture `3,000,000 SEK`, and combined
  TCS `8,400,000 SEK`, for a full-scope total of `41,400,000 SEK`.
- Q1 has Hardware/AI/Cloud active; Month 4-12 has all six active. Partner costs are split evenly
  across active workstreams in each phase:
  - Q1-start share = `(annual * 3/12 / 3) + (annual * 9/12 / 6)`.
  - Month4-start share = `annual * 9/12 / 6`.
- `benefitSEK` remains a weighted split of a ~25,000,000 SEK enterprise-risk figure plus rough
  savings/avoidance estimates. **This is the least validated number in the app — keep the UI
  disclosure visible.**

### 2.2 Partner full-scope cost and share tables

```ts
export const PARTNERS: Partner[] = [
  { id: 'EY',        fullScopeCostSEK: 30_000_000 },
  { id: 'Accenture', fullScopeCostSEK:  3_000_000 },
  { id: 'TCS',       fullScopeCostSEK:  8_400_000 },
];

export const PARTNER_FULL_ANNUAL_COST: Record<PartnerId, number> = {
  'EY': 30_000_000,
  'Accenture': 3_000_000,
  'TCS': 8_400_000,
};

export const PARTNER_SHARE_STARTS_IN_Q1: PartnerShare = {
  'EY': 6_250_000,
  'Accenture': 625_000,
  'TCS': 1_750_000,
}; // sums to 8,625,000

export const PARTNER_SHARE_STARTS_MONTH4: PartnerShare = {
  'EY': 3_750_000,
  'Accenture': 375_000,
  'TCS': 1_050_000,
}; // sums to 5,175,000
```

### 2.3 Derived constants

```ts
export const TOTAL_FULL_COST = 41_400_000;
export const TOTAL_FULL_BENEFIT = 43_000_000;
export const FULL_MULTIPLE = TOTAL_FULL_BENEFIT / TOTAL_FULL_COST; // approximately 1.0386

export const LAST_YEAR_COST =
  3 * 4_000_000 +
  1 * 1_500_000 +
  3 * 6_120_000 +
  2 * 17_640_000;
// = 67,140,000

export const DELTA_FULL_VS_LAST_YEAR = TOTAL_FULL_COST - LAST_YEAR_COST; // = -25,740,000
export const MAX_FULLY_COVERABLE_WORKSTREAMS = 6;
```

---

## 3. Calculation functions

All functions here are pure — same input always produces same output, no React, no I/O.

### 3.1 Partner cost regeneration helpers

`regeneratePartnerFullAnnualCosts()` returns `fullScopeCostSEK` per partner.
`regeneratePartnerShareTables()` derives the Q1 and Month4 share tables from annual costs:

```
Q1-start share = (annual * 3/12 / 3) + (annual * 9/12 / 6)
Month4-start share = annual * 9/12 / 6
```

`maxFullyCoverableWorkstreams()` returns 6 for the full-scope team.

### 3.2 Budget allocation

```ts
export type AllocationStrategy = 'priority' | 'even';

export interface AllocationResult {
  pctById: Record<WorkstreamId, number>;
  leftoverSEK: number;
}
```

Priority strategy sorts by `benefitSEK / costSEK` descending, funds each workstream fully until the
budget runs out, then partially funds the next one. Even strategy funds every workstream at the same
percentage, capped at 100%. Negative budget is treated as 0.

Worked examples:

| Input | Expected |
|---|---|
| `computeAllocation(41_400_000, 'priority')` | every workstream 100%, leftover 0 |
| `computeAllocation(41_400_000, 'even')` | every workstream 100%, leftover 0 |
| `computeAllocation(0, 'priority')` | every workstream 0%, leftover 0 |
| `computeAllocation(8_625_000, 'priority')` | Hardware 100%, all others 0%, leftover 0 |
| `computeAllocation(20_000_000, 'even')` | every workstream `(20/41.4)*100`, approximately 48.31% |
| `computeAllocation(120_000_000, 'priority')` | every workstream 100%, leftover `78,600,000` |

### 3.3 Scenario totals

`computeTotals()` sums funded cost/benefit from an `AllocationResult`. `multiple` is
`benefitSEK / costSEK`, or 0 when `costSEK` is 0. Never return `NaN` or `Infinity`.

`computeSelectionTotals()` treats selected workstreams as 100% funded and unselected workstreams as
0% funded.

### 3.4 Partner breakdown

`partnerBreakdownFor(workstreams)` accumulates `PARTNER_SHARE_STARTS_IN_Q1` for Q1-starting
workstreams and `PARTNER_SHARE_STARTS_MONTH4` for Month4-starting workstreams.

Worked example: `partnerBreakdownFor([hardware, ai, cloud])` -> `{ EY: 18_750_000, Accenture:
1_875_000, TCS: 5_250_000 }`.

### 3.5 Coverage and presets

```ts
export function coverageLabel(pct: number): 'Full' | 'Partial' | 'Deferred' {
  if (pct >= 90) return 'Full';
  if (pct >= 10) return 'Partial';
  return 'Deferred';
}
```

Scenario presets are generated from the top workstreams by benefit multiple:
- Minimum Viable: Hardware + Software, cost `13,800,000`, benefit `26,000,000`, multiple
  approximately `1.8841`.
- Flat Resourcing: Hardware + Software + OT + Cloud, cost `27,600,000`, benefit `37,750,000`,
  multiple approximately `1.3678`.

## 4. Formatting

```ts
export const fmtM = (sek: number): string => `${(sek / 1_000_000).toFixed(2)}M SEK`;
export const fmtX = (multiple: number): string => `${multiple.toFixed(2)}x`;
```

Color thresholds for benefit multiple: at least 0.9 good, at least 0.4 warning, below 0.4 bad.

## 5. Reference values for regression testing

```
TOTAL_FULL_COST                  = 41,400,000 SEK
TOTAL_FULL_BENEFIT               = 43,000,000 SEK
FULL_MULTIPLE                    approximately 1.0386
LAST_YEAR_COST                   = 67,140,000 SEK
DELTA_FULL_VS_LAST_YEAR          = -25,740,000 SEK
MAX_FULLY_COVERABLE_WORKSTREAMS  = 6
```

Individual workstream benefit multiples:

```
Hardware:     19.25M / 8.625M approximately 2.232
Software:      6.75M / 5.175M approximately 1.304
OT:            4.75M / 5.175M approximately 0.918
Cloud:         7.00M / 8.625M approximately 0.812
AI Assets:     3.50M / 8.625M approximately 0.406
New/Emerging:  1.75M / 5.175M approximately 0.338
```
