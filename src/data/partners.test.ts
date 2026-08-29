import { describe, expect, it } from 'vitest';
import { TOTAL_FULL_BENEFIT, TOTAL_FULL_COST } from './derived';
import {
  PARTNER_MODEL,
  partnerInvestmentChartData,
  partnerValueChartData,
} from './partners';

describe('PARTNER_MODEL', () => {
  it('uses the confirmed partner investment basis and option-2 value enablement split', () => {
    expect(PARTNER_MODEL.map((partner) => partner.name)).toEqual([
      'EY',
      'TCS',
      'Accenture',
      'Cyber + Business scope',
    ]);

    expect(PARTNER_MODEL.find((partner) => partner.name === 'EY')?.investmentSEK).toBe(
      30_000_000,
    );
    expect(PARTNER_MODEL.find((partner) => partner.name === 'TCS')?.investmentSEK).toBe(
      8_400_000,
    );
    expect(
      PARTNER_MODEL.find((partner) => partner.name === 'Accenture')?.investmentSEK,
    ).toBe(3_000_000);
    expect(
      PARTNER_MODEL.find((partner) => partner.name === 'Cyber + Business scope')
        ?.investmentSEK,
    ).toBe(0);

    expect(
      PARTNER_MODEL.reduce((sum, partner) => sum + partner.investmentSEK, 0),
    ).toBe(TOTAL_FULL_COST);
    expect(PARTNER_MODEL.reduce((sum, partner) => sum + partner.valueSEK, 0)).toBe(
      TOTAL_FULL_BENEFIT,
    );
  });

  it('prepares chart data for investment asked and value enabled pies', () => {
    expect(partnerInvestmentChartData().map((item) => item.name)).toEqual([
      'EY',
      'TCS',
      'Accenture',
    ]);
    expect(partnerValueChartData()).toHaveLength(4);
    expect(
      partnerValueChartData().find((item) => item.name === 'Cyber + Business scope')
        ?.value,
    ).toBe(12_000_000);
  });
});
