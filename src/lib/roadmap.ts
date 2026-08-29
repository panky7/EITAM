import { TOTAL_FULL_COST } from '../data/derived';
import {
  ROADMAP_LANES,
  type RoadmapFilter,
  type RoadmapItem,
} from '../data/roadmap';
import type { WorkstreamId } from '../data/workstreams';

export type { RoadmapFilter };

export type ActiveItemState = 'deferred' | 'partial' | 'full';

export interface RoadmapModelSummary {
  filter: RoadmapFilter;
  fundedScopePct: number;
  activeItemState: ActiveItemState;
  highlightedItemCount: number;
}

export interface RoadmapControlSummary {
  headline: string;
  detail: string;
}

export function roadmapItemsForFilter(filter: RoadmapFilter): RoadmapItem[] {
  return ROADMAP_LANES.flatMap((lane) =>
    lane.cells.flatMap((cell) => cell.items),
  ).filter((item) => filter === 'all' || item.tags.includes(filter));
}

export function roadmapItemsForScope(
  selectedWorkstreamIds: Set<WorkstreamId>,
): RoadmapItem[] {
  return ROADMAP_LANES.filter((lane) =>
    lane.id === 'ambition'
      ? selectedWorkstreamIds.has('cloud') || selectedWorkstreamIds.has('software')
      : selectedWorkstreamIds.has(lane.id as WorkstreamId),
  ).flatMap((lane) => lane.cells.flatMap((cell) => cell.items));
}

function activeItemStateFromCoverage(coveragePct: number): ActiveItemState {
  if (coveragePct >= 90) return 'full';
  if (coveragePct >= 10) return 'partial';
  return 'deferred';
}

export function roadmapModelSummary(
  budgetSEK: number,
  filter: RoadmapFilter,
  fullCostSEK = TOTAL_FULL_COST,
): RoadmapModelSummary {
  const fundedScopePct =
    fullCostSEK > 0
      ? Math.round((Math.max(0, Math.min(budgetSEK, fullCostSEK)) / fullCostSEK) * 100)
      : 0;

  return {
    filter,
    fundedScopePct,
    activeItemState: activeItemStateFromCoverage(fundedScopePct),
    highlightedItemCount: roadmapItemsForFilter(filter).length,
  };
}

export function roadmapControlSummary(
  budgetSEK: number,
  filter: RoadmapFilter,
  fullCostSEK = TOTAL_FULL_COST,
): RoadmapControlSummary {
  const summary = roadmapModelSummary(budgetSEK, filter, fullCostSEK);
  const label = filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1);
  const linked = filter === 'all' ? 'roadmap' : `${filter}-linked roadmap`;

  return {
    headline: `${label} roadmap controls`,
    detail: `${summary.highlightedItemCount} ${linked} items highlighted at ${summary.fundedScopePct}% funded scope.`,
  };
}
