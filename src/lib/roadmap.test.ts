import { describe, expect, it } from 'vitest';
import { TOTAL_FULL_COST } from '../data/derived';
import { ROADMAP_LANES } from '../data/roadmap';
import {
  roadmapControlSummary,
  roadmapItemsForScope,
  roadmapItemsForFilter,
  roadmapModelSummary,
  type RoadmapFilter,
} from './roadmap';

describe('roadmap data', () => {
  it('includes the attachment roadmap lanes and core work items', () => {
    expect(ROADMAP_LANES.map((lane) => lane.id)).toEqual([
      'hardware',
      'ai',
      'ot',
      'ambition',
      'cloud',
      'software',
      'newemerging',
    ]);

    expect(roadmapItemsForFilter('all').map((item) => item.id)).toContain('1.5');
    expect(roadmapItemsForFilter('all').map((item) => item.id)).toContain('2.4');
    expect(roadmapItemsForFilter('all').map((item) => item.id)).toContain('6.1.3');
  });

  it('filters roadmap items by executive value pillar', () => {
    const riskItems = roadmapItemsForFilter('risk');
    const complianceItems = roadmapItemsForFilter('compliance');

    expect(riskItems.map((item) => item.id)).toEqual([
      '1.1',
      '1.4',
      '1.5',
      '2.3',
      '2.4',
      '3.1',
      '3.2',
      '3.3',
      '4.1',
      '4.3',
      '4.6',
      '5.5',
    ]);
    expect(complianceItems.map((item) => item.id)).toEqual([
      '2.1',
      '2.3',
      '2.4',
      '2.6',
      '2.5',
      '5.2',
      '5.5',
      '5.6',
    ]);
  });

  it('filters roadmap items by selected scope lanes', () => {
    const scopedItems = roadmapItemsForScope(new Set(['hardware', 'ai']));

    expect(scopedItems.map((item) => item.id)).toEqual([
      '1.1',
      '1.2',
      '1.3',
      '1.4',
      '1.5',
      '2.1',
      '2.2',
      '2.3',
      '2.4',
      '2.6',
      '2.5',
    ]);
  });

  it('summarizes funding coverage and highlighted work for each filter', () => {
    const full = roadmapModelSummary(TOTAL_FULL_COST, 'all');
    const halfRisk = roadmapModelSummary(TOTAL_FULL_COST / 2, 'risk');

    expect(full).toEqual({
      filter: 'all' satisfies RoadmapFilter,
      fundedScopePct: 100,
      activeItemState: 'full',
      highlightedItemCount: 31,
    });
    expect(halfRisk).toEqual({
      filter: 'risk' satisfies RoadmapFilter,
      fundedScopePct: 50,
      activeItemState: 'partial',
      highlightedItemCount: 12,
    });
  });

  it('builds compact copy for the timeline control dock', () => {
    expect(roadmapControlSummary(TOTAL_FULL_COST / 2, 'risk')).toEqual({
      headline: 'Risk roadmap controls',
      detail: '12 risk-linked roadmap items highlighted at 50% funded scope.',
    });
  });
});
