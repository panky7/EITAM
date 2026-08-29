import { describe, expect, it } from 'vitest';
import { TOTAL_FULL_COST } from '../data/derived';
import {
  capabilityRows,
  capabilityRoiSummary,
  scopedCapabilityRoiSummary,
} from './capabilityRoi';

describe('capabilityRoiSummary', () => {
  it('projects full funding to managed maturity and all ROI pillars', () => {
    const summary = capabilityRoiSummary(TOTAL_FULL_COST);

    expect(summary.budgetSEK).toBe(41_400_000);
    expect(summary.valueSEK).toBe(43_000_000);
    expect(summary.multiple).toBeCloseTo(1.0386, 4);
    expect(summary.fundedScopePct).toBe(100);
    expect(summary.maturity.current).toBe(1);
    expect(summary.maturity.projected).toBe(3);
    expect(summary.pillars).toEqual({
      money: 100,
      security: 20,
      complianceReadiness: 80,
      incidentResponse: 30,
    });
  });

  it('keeps zero funding safe with current maturity and zero return', () => {
    const summary = capabilityRoiSummary(0);

    expect(summary.valueSEK).toBe(0);
    expect(summary.multiple).toBe(0);
    expect(summary.fundedScopePct).toBe(0);
    expect(summary.maturity.projected).toBe(1);
    expect(summary.pillars.security).toBe(0);
    expect(summary.pillars.complianceReadiness).toBe(0);
    expect(summary.pillars.incidentResponse).toBe(0);
  });
});

describe('scopedCapabilityRoiSummary', () => {
  it('calculates investment requirement and value unlocked for selected scope', () => {
    const summary = scopedCapabilityRoiSummary(
      new Set(['hardware', 'ai']),
      17_250_000,
    );

    expect(summary.scopeCostSEK).toBe(17_250_000);
    expect(summary.scopeBenefitSEK).toBe(22_750_000);
    expect(summary.budgetSEK).toBe(17_250_000);
    expect(summary.valueSEK).toBe(22_750_000);
    expect(summary.multiple).toBeCloseTo(1.3188, 4);
    expect(summary.fundedScopePct).toBe(100);
    expect(summary.maturity.projected).toBe(3);
  });

  it('treats empty selected scope as zero requirement and zero return', () => {
    const summary = scopedCapabilityRoiSummary(new Set(), TOTAL_FULL_COST);

    expect(summary.scopeCostSEK).toBe(0);
    expect(summary.scopeBenefitSEK).toBe(0);
    expect(summary.valueSEK).toBe(0);
    expect(summary.multiple).toBe(0);
    expect(summary.fundedScopePct).toBe(0);
    expect(summary.maturity.projected).toBe(1);
  });
});

describe('capabilityRows', () => {
  it('shows achievement-backed capability rows for executive board', () => {
    const rows = capabilityRows(TOTAL_FULL_COST);

    expect(rows).toHaveLength(8);
    expect(rows[0]).toMatchObject({
      name: 'Physical IT asset management',
      outcome: 'Trusted endpoint and network inventory',
      currentMaturity: 1,
      projectedMaturity: 3,
      returnSignalPct: 98,
    });
    expect(rows.some((row) => row.name === 'Business ownership and data quality')).toBe(true);
  });
});
