import { describe, expect, it } from 'vitest';
import {
  dashboardDecisionSummary,
  workstreamDecisionRows,
} from './decision';

describe('dashboardDecisionSummary', () => {
  it('prioritizes the executive decision metrics without last-year comparisons', () => {
    const summary = dashboardDecisionSummary();

    expect(summary.heroTitle).toBe('Enterprise Asset Intelligence cockpit');
    expect(summary.metrics.map((metric) => metric.label)).toEqual([
      'Full-scope cost',
      'Directional value',
      'Benefit multiple',
      'High enterprise risks',
    ]);
    expect(summary.metrics.some((metric) => /last year/i.test(metric.label))).toBe(
      false,
    );
  });
});

describe('workstreamDecisionRows', () => {
  it('ranks workstreams by benefit multiple for decision scanning', () => {
    const rows = workstreamDecisionRows();

    expect(rows.map((row) => row.id)).toEqual([
      'hardware',
      'software',
      'ot',
      'cloud',
      'ai',
      'newemerging',
    ]);
    expect(rows[0]).toMatchObject({
      id: 'hardware',
      multiple: 19_250_000 / 8_625_000,
      riskCount: 2,
    });
  });
});
