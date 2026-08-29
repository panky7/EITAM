import { describe, expect, it } from 'vitest';
import {
  FULL_MULTIPLE,
  TOTAL_FULL_BENEFIT,
  TOTAL_FULL_COST,
} from '../data/derived';
import { AI_READINESS_DOMAINS } from '../data/risks';
import { WORKSTREAMS, type WorkstreamId } from '../data/workstreams';
import {
  averageAiReadiness,
  computeAllocation,
  computeSelectionTotals,
  computeTotals,
  coverageLabel,
  maxFullyCoverableWorkstreams,
  partnerBreakdownFor,
  partnerBreakdownForWorkstream,
  regeneratePartnerFullAnnualCosts,
  regeneratePartnerShareTables,
  readinessTone,
  risksForWorkstream,
  scenarioPresets,
  summarizeRiskSeverity,
  workstreamFinancials,
} from './calculations';
import {
  PARTNERS,
  PARTNER_FULL_ANNUAL_COST,
  PARTNER_SHARE_STARTS_IN_Q1,
  PARTNER_SHARE_STARTS_MONTH4,
} from '../data/partners';

describe('derived constants', () => {
  it('matches the full-plan regression values', () => {
    expect(TOTAL_FULL_COST).toBe(41_400_000);
    expect(TOTAL_FULL_BENEFIT).toBe(43_000_000);
    expect(FULL_MULTIPLE).toBeCloseTo(1.0386, 4);
  });
});

describe('partner cost model', () => {
  it('uses the provided full-scope partner costs', () => {
    expect(PARTNERS).toEqual([
      { id: 'EY', fullScopeCostSEK: 30_000_000 },
      { id: 'Accenture', fullScopeCostSEK: 3_000_000 },
      { id: 'TCS', fullScopeCostSEK: 8_400_000 },
    ]);
    expect(maxFullyCoverableWorkstreams()).toBe(6);
  });

  it('regenerates full annual partner costs from max FTE and rates', () => {
    expect(regeneratePartnerFullAnnualCosts()).toEqual(PARTNER_FULL_ANNUAL_COST);
  });

  it('regenerates partner share tables from full annual costs', () => {
    const tables = regeneratePartnerShareTables();

    Object.entries(PARTNER_SHARE_STARTS_IN_Q1).forEach(([partnerId, value]) => {
      expect(tables.startsInQ1[partnerId as keyof typeof tables.startsInQ1]).toBeCloseTo(value, 2);
    });
    Object.entries(PARTNER_SHARE_STARTS_MONTH4).forEach(([partnerId, value]) => {
      expect(tables.startsMonth4[partnerId as keyof typeof tables.startsMonth4]).toBeCloseTo(value, 2);
    });
  });
});

describe('computeAllocation', () => {
  it('funds every workstream at full plan cost with priority strategy', () => {
    const allocation = computeAllocation(41_400_000, 'priority');

    WORKSTREAMS.forEach((workstream) => {
      expect(allocation.pctById[workstream.id]).toBe(100);
    });
    expect(allocation.leftoverSEK).toBe(0);
  });

  it('funds every workstream at full plan cost with even strategy', () => {
    const allocation = computeAllocation(41_400_000, 'even');

    WORKSTREAMS.forEach((workstream) => {
      expect(allocation.pctById[workstream.id]).toBe(100);
    });
    expect(allocation.leftoverSEK).toBe(0);
  });

  it('defers every workstream at zero budget', () => {
    const allocation = computeAllocation(0, 'priority');

    WORKSTREAMS.forEach((workstream) => {
      expect(allocation.pctById[workstream.id]).toBe(0);
    });
    expect(allocation.leftoverSEK).toBe(0);
  });

  it('funds Hardware first under the priority strategy', () => {
    const allocation = computeAllocation(8_625_000, 'priority');

    expect(allocation.pctById.hardware).toBe(100);
    WORKSTREAMS.filter((workstream) => workstream.id !== 'hardware').forEach(
      (workstream) => {
        expect(allocation.pctById[workstream.id]).toBe(0);
      },
    );
    expect(allocation.leftoverSEK).toBe(0);
  });

  it('spreads 20M evenly across all workstreams', () => {
    const allocation = computeAllocation(20_000_000, 'even');
    const expectedPct = (20_000_000 / 41_400_000) * 100;

    WORKSTREAMS.forEach((workstream) => {
      expect(allocation.pctById[workstream.id]).toBeCloseTo(expectedPct, 8);
    });
  });

  it('reports leftover when budget exceeds the full plan', () => {
    const allocation = computeAllocation(120_000_000, 'priority');

    WORKSTREAMS.forEach((workstream) => {
      expect(allocation.pctById[workstream.id]).toBe(100);
    });
    expect(allocation.leftoverSEK).toBe(78_600_000);
  });
});

describe('computeTotals', () => {
  it('matches full-plan totals', () => {
    const totals = computeTotals(computeAllocation(41_400_000, 'even'));

    expect(totals.costSEK).toBe(41_400_000);
    expect(totals.benefitSEK).toBe(43_000_000);
    expect(totals.multiple).toBeCloseTo(1.0386, 4);
  });

  it('returns zero multiple for zero cost', () => {
    const totals = computeTotals(computeAllocation(0, 'even'));

    expect(totals.costSEK).toBe(0);
    expect(totals.benefitSEK).toBe(0);
    expect(totals.multiple).toBe(0);
  });
});

describe('computeSelectionTotals', () => {
  it('treats selected workstreams as fully funded', () => {
    const selected = new Set<WorkstreamId>(['hardware', 'software']);
    const totals = computeSelectionTotals(selected);

    expect(totals.costSEK).toBe(13_800_000);
    expect(totals.benefitSEK).toBe(26_000_000);
    expect(totals.multiple).toBeCloseTo(26_000_000 / 13_800_000, 8);
  });

  it('returns zero totals for an empty selection', () => {
    const totals = computeSelectionTotals(new Set<WorkstreamId>());

    expect(totals.costSEK).toBe(0);
    expect(totals.benefitSEK).toBe(0);
    expect(totals.multiple).toBe(0);
  });
});

describe('partnerBreakdownFor', () => {
  it('accumulates Q1-starting partner shares', () => {
    const q1Workstreams = WORKSTREAMS.filter((workstream) =>
      ['hardware', 'ai', 'cloud'].includes(workstream.id),
    );

    expect(partnerBreakdownFor(q1Workstreams)).toEqual({
      EY: 18_750_000,
      Accenture: 1_875_000,
      TCS: 5_250_000,
    });
  });

  it('returns a single workstream partner breakdown', () => {
    const hardware = WORKSTREAMS.find((workstream) => workstream.id === 'hardware');

    expect(hardware).toBeDefined();
    expect(partnerBreakdownForWorkstream(hardware!)).toEqual({
      EY: 6_250_000,
      Accenture: 625_000,
      TCS: 1_750_000,
    });
  });
});

describe('workstreamFinancials', () => {
  it('summarizes cost, benefit, multiple and partner split', () => {
    const ai = WORKSTREAMS.find((workstream) => workstream.id === 'ai');

    expect(ai).toBeDefined();
    expect(workstreamFinancials(ai!)).toEqual({
      costSEK: 8_625_000,
      benefitSEK: 3_500_000,
      multiple: 3_500_000 / 8_625_000,
      partnerBreakdown: {
        EY: 6_250_000,
        Accenture: 625_000,
        TCS: 1_750_000,
      },
    });
  });
});

describe('risk helpers', () => {
  it('summarizes enterprise risk severity counts', () => {
    expect(summarizeRiskSeverity()).toEqual({
      high: 2,
      medium: 2,
      ready: 0,
    });
  });

  it('maps enterprise risks to affected workstreams', () => {
    expect(risksForWorkstream('ai').map((risk) => risk.id)).toEqual([
      'incomplete-visibility',
      'data-regression',
      'delivery-dependencies',
      'value-scale',
    ]);
  });

  it('calculates average AI readiness and readiness tones', () => {
    expect(averageAiReadiness(AI_READINESS_DOMAINS)).toBeCloseTo(29.75, 2);
    expect(readinessTone(80)).toBe('ready');
    expect(readinessTone(42)).toBe('medium');
    expect(readinessTone(18)).toBe('high');
  });
});

describe('scenarioPresets', () => {
  it('builds the Minimum Viable and Flat Resourcing presets from top multiples', () => {
    const [minimumViable, flatResourcing] = scenarioPresets();

    expect(minimumViable.workstreamIds).toEqual(['hardware', 'software']);
    expect(minimumViable.totals.costSEK).toBe(13_800_000);
    expect(minimumViable.totals.benefitSEK).toBe(26_000_000);
    expect(minimumViable.totals.multiple).toBeCloseTo(1.8841, 4);

    expect(flatResourcing.workstreamIds).toEqual([
      'hardware',
      'software',
      'ot',
      'cloud',
    ]);
    expect(flatResourcing.totals.costSEK).toBe(27_600_000);
    expect(flatResourcing.totals.benefitSEK).toBe(37_750_000);
    expect(flatResourcing.totals.multiple).toBeCloseTo(1.3678, 4);
  });
});

describe('coverageLabel', () => {
  it('classifies coverage consistently', () => {
    expect(coverageLabel(90)).toBe('Full');
    expect(coverageLabel(10)).toBe('Partial');
    expect(coverageLabel(9.99)).toBe('Deferred');
  });
});
