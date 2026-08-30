import { describe, expect, it } from 'vitest';
import { TOTAL_FULL_COST } from '../data/derived';
import {
  capabilityMaturitySummary,
  capabilityRows,
  capabilityRoiSummary,
  modelScopePreset,
  scopeIdsCoveredByBudget,
  scopeWikiRows,
  scopedCapabilityRoiSummary,
  scopeWikiRowById,
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
    expect(summary.pillars).toEqual({
      money: 100,
      security: 9,
      complianceReadiness: 30,
      incidentResponse: 15,
    });
  });

  it('improves security compliance and incident signals as more priority scopes are added', () => {
    const minimumViable = scopedCapabilityRoiSummary(
      new Set(['hardware']),
      8_625_000,
    );
    const riskFirst = scopedCapabilityRoiSummary(
      new Set(['hardware', 'ai']),
      17_250_000,
    );
    const securityFirst = scopedCapabilityRoiSummary(
      new Set(['hardware', 'ai', 'cloud']),
      25_875_000,
    );
    const complianceReady = scopedCapabilityRoiSummary(
      new Set(['hardware', 'ai', 'cloud', 'ot']),
      31_050_000,
    );

    expect(minimumViable.pillars).toMatchObject({
      security: 4,
      complianceReadiness: 8,
      incidentResponse: 12,
    });
    expect(riskFirst.pillars.security).toBeGreaterThan(minimumViable.pillars.security);
    expect(riskFirst.pillars.complianceReadiness).toBeGreaterThan(
      minimumViable.pillars.complianceReadiness,
    );
    expect(riskFirst.pillars.incidentResponse).toBeGreaterThan(
      minimumViable.pillars.incidentResponse,
    );
    expect(securityFirst.pillars).toMatchObject({
      security: 15,
      complianceReadiness: 48,
      incidentResponse: 20,
    });
    expect(complianceReady.pillars).toMatchObject({
      security: 18,
      complianceReadiness: 68,
      incidentResponse: 27,
    });
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

describe('modelScopePreset', () => {
  it('sets both budget and workstream scope for minimum viable modeling', () => {
    const preset = modelScopePreset('minimum_viable');

    expect(preset.budgetSEK).toBe(8_625_000);
    expect(preset.workstreamIds).toEqual(['hardware']);
  });

  it('sets security-first modeling to the hardware, AI and cloud risk scope', () => {
    const preset = modelScopePreset('security_first');

    expect(preset.budgetSEK).toBe(25_875_000);
    expect(preset.workstreamIds).toEqual(['hardware', 'ai', 'cloud']);
  });

  it('sets risk-first modeling to the hardware and AI risk scope', () => {
    const preset = modelScopePreset('risk_first');

    expect(preset.budgetSEK).toBe(17_250_000);
    expect(preset.workstreamIds).toEqual(['hardware', 'ai']);
  });

  it('sets compliance-ready modeling to hardware, AI, cloud and OT scope', () => {
    const preset = modelScopePreset('compliance_ready');

    expect(preset.budgetSEK).toBe(31_050_000);
    expect(preset.workstreamIds).toEqual(['hardware', 'ai', 'cloud', 'ot']);
  });

  it('sets full uplift to all workstreams and full plan cost', () => {
    const preset = modelScopePreset('full_uplift');

    expect(preset.budgetSEK).toBe(41_400_000);
    expect(preset.workstreamIds).toEqual([
      'hardware',
      'ai',
      'cloud',
      'ot',
      'software',
      'newemerging',
    ]);
  });
});

describe('scopeIdsCoveredByBudget', () => {
  it('selects only fully coverable scopes in roadmap priority order', () => {
    expect(scopeIdsCoveredByBudget(0)).toEqual([]);
    expect(scopeIdsCoveredByBudget(8_624_999)).toEqual([]);
    expect(scopeIdsCoveredByBudget(8_625_000)).toEqual(['hardware']);
    expect(scopeIdsCoveredByBudget(17_250_000)).toEqual(['hardware', 'ai']);
    expect(scopeIdsCoveredByBudget(25_875_000)).toEqual([
      'hardware',
      'ai',
      'cloud',
    ]);
    expect(scopeIdsCoveredByBudget(31_050_000)).toEqual([
      'hardware',
      'ai',
      'cloud',
      'ot',
    ]);
    expect(scopeIdsCoveredByBudget(TOTAL_FULL_COST)).toEqual([
      'hardware',
      'ai',
      'cloud',
      'ot',
      'software',
      'newemerging',
    ]);
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

  it('only projects maturity for capabilities covered by the selected modeling scope', () => {
    const rows = capabilityRows(
      17_250_000,
      17_250_000,
      new Set(['hardware', 'ai']),
    );

    expect(rows.find((row) => row.name === 'Physical IT asset management')).toMatchObject({
      projectedMaturity: 3,
      returnSignalPct: 98,
    });
    expect(rows.find((row) => row.name === 'AI asset management')).toMatchObject({
      projectedMaturity: 3,
      returnSignalPct: 82,
    });
    expect(rows.find((row) => row.name === 'Cloud and on-prem asset management')).toMatchObject({
      projectedMaturity: 1,
      returnSignalPct: 0,
    });
    expect(rows.find((row) => row.name === 'Software and license governance')).toMatchObject({
      projectedMaturity: 1,
      returnSignalPct: 0,
    });
  });
});

describe('capabilityMaturitySummary', () => {
  it('summarizes projected maturity from the modeled capability rows', () => {
    const rows = capabilityRows(
      17_250_000,
      17_250_000,
      new Set(['hardware', 'ai']),
    );

    expect(capabilityMaturitySummary(rows)).toEqual({
      current: 1,
      projected: 2.25,
      target: 3,
    });
  });
});

describe('scopeWikiRows', () => {
  it('returns independent scope wiki rows with cost, benefit, highlights and boundary detail', () => {
    const rows = scopeWikiRows();

    expect(rows).toHaveLength(6);
    expect(rows[0]).toMatchObject({
      name: 'Hardware',
      costSEK: 8_625_000,
      benefitSEK: 19_250_000,
      highlights: [
        'Reduced enterprise risk',
        'Incident response uplift',
        'Central asset mapping',
      ],
    });
    expect(rows[0].inScope).toContain(
      'Automate and integrate discovery across remaining asset tools including Zebra, HP, Canon, Kandji and SCCM.',
    );
    expect(rows[0].outOfScope).toBe(
      'Predictive lifecycle management and broader asset intelligence analytics.',
    );
  });

  it('finds one scope wiki row by clicked scope id', () => {
    const rows = scopeWikiRows();

    expect(scopeWikiRowById(rows, 'hardware')?.name).toBe('Hardware');
    expect(scopeWikiRowById(rows, 'ai')?.name).toBe('AI Assets');
  });
});
