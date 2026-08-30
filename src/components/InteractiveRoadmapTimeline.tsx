import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Coins,
  Layers,
  LayoutGrid,
  ShieldAlert,
} from 'lucide-react';
import { ROADMAP_LANES, type RoadmapFilter, type RoadmapItem } from '../data/roadmap';
import type { WorkstreamId } from '../data/workstreams';
import { capabilityRoiSummary } from '../lib/capabilityRoi';
import { roadmapControlSummary, roadmapModelSummary } from '../lib/roadmap';
import { INK, fmtM } from '../lib/format';

const periods = [
  { label: '3 months', sub: 'Mid-Aug 2026' },
  { label: '3 months', sub: 'Foundation to design' },
  { label: '3 months', sub: 'Implementation' },
  { label: '3 months and further', sub: 'Operational intelligence' },
];

const filters: Array<{
  id: RoadmapFilter;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'foundation', label: 'Foundation', icon: Layers },
  { id: 'risk', label: 'Risk', icon: ShieldAlert },
  { id: 'compliance', label: 'Compliance', icon: BadgeCheck },
  { id: 'value', label: 'Value', icon: Coins },
];

const toneStyles: Record<RoadmapItem['tone'], string> = {
  amber: 'border-l-[#9B6615] bg-amber-50',
  blue: 'border-l-[#2468C9] bg-blue-50',
  green: 'border-l-[#587E1F] bg-green-50',
  purple: 'border-l-[#5B3AA4] bg-purple-50',
  red: 'border-l-[#CC071E] bg-red-50',
};

const stageColors = {
  sustain: 'bg-[#071B4D]',
  ambition: 'bg-[#5B3AA4]',
};

function itemPillar(item: RoadmapItem): string {
  if (item.tags.includes('risk')) return 'Security';
  if (item.tags.includes('compliance')) return 'Compliance';
  if (item.tags.includes('value')) return 'Value';
  return 'Foundation';
}
function itemStyle(item: RoadmapItem): React.CSSProperties {
  return {
    left: `${item.startPct}%`,
    width: `calc(${item.widthPct}% - 6px)`,
    top: item.row === 1 ? '24px' : '55px',
  };
}

export function InteractiveRoadmapTimeline({
  budgetSEK,
  selectedWorkstreamIds,
  scopeCostSEK,
  scopeBenefitSEK,
}: {
  budgetSEK: number;
  selectedWorkstreamIds: Set<WorkstreamId>;
  scopeCostSEK: number;
  scopeBenefitSEK: number;
}) {
  const [filter, setFilter] = useState<RoadmapFilter>('all');
  const summary = useMemo(
    () => roadmapModelSummary(budgetSEK, filter, scopeCostSEK),
    [budgetSEK, filter, scopeCostSEK],
  );
  const controlSummary = useMemo(
    () => roadmapControlSummary(budgetSEK, filter, scopeCostSEK),
    [budgetSEK, filter, scopeCostSEK],
  );
  const roi = useMemo(
    () => capabilityRoiSummary(budgetSEK, scopeCostSEK, scopeBenefitSEK),
    [budgetSEK, scopeBenefitSEK, scopeCostSEK],
  );

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm shadow-stone-200/70">
      <div className="grid bg-[#071B4D] text-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <div className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
            Interactive timeline
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Enterprise Asset Management Roadmap
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
            Dense swimlane roadmap aligned to the ROI model. Filter by executive
            value pillar or click a work item to see its business contribution.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/15 p-4 sm:grid-cols-4 lg:border-l lg:border-t-0">
          <HeaderMetric label="Scope" value={`${summary.fundedScopePct}%`} />
          <HeaderMetric label="Maturity" value={`1.0 -> ${roi.maturity.projected.toFixed(1)}`} />
          <HeaderMetric label="Items" value={String(summary.highlightedItemCount)} />
          <HeaderMetric label="Investment" value={fmtM(roi.budgetSEK)} />
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: INK }}>
            Timeline controls
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((option) => {
              const Icon = option.icon;
              const active = option.id === filter;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-[#071B4D] bg-[#071B4D] text-white'
                      : 'border-stone-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  aria-pressed={active}
                  onClick={() => setFilter(option.id)}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-md border border-stone-200 bg-white p-3 text-xs leading-5 text-slate-600">
            Current filter shows <strong>{summary.highlightedItemCount}</strong>{' '}
            roadmap items. Funding status is{' '}
            <strong>{summary.activeItemState}</strong> at{' '}
            <strong>{summary.fundedScopePct}%</strong> of the full uplift plan.
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-stone-200 bg-white p-4">
        <div className="min-w-[1120px]">
          <div className="relative">
            <div className="absolute left-[482px] right-4 top-[44px] z-10 text-center text-[11px] italic text-[#2468C9]">
              Data-thon: 6 months for benefits visibility and uptake
            </div>
            <div className="grid grid-cols-[190px_repeat(4,minmax(0,1fr))]">
              <div className="bg-[#071B4D] px-3 py-3 text-sm font-semibold text-white">
                Sustain and expand scope
              </div>
              {periods.map((period) => (
                <div
                  key={period.label + period.sub}
                  className="border-r border-stone-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-[#071B4D]"
                >
                  {period.label}
                  <div className="mt-1 text-[10px] font-normal text-slate-500">
                    {period.sub}
                  </div>
                </div>
              ))}
            </div>

            {ROADMAP_LANES.map((lane) => {
              const laneInScope =
                lane.id === 'ambition'
                  ? selectedWorkstreamIds.has('cloud') ||
                    selectedWorkstreamIds.has('software')
                  : selectedWorkstreamIds.has(lane.id as WorkstreamId);
              const laneMatches =
                filter === 'all' ||
                lane.cells.some((cell) =>
                  cell.items.some((item) => item.tags.includes(filter)),
                );

              return (
                <div
                  key={lane.id}
                  className={`grid min-h-[88px] grid-cols-[190px_repeat(4,minmax(0,1fr))] transition-opacity ${
                    laneInScope && laneMatches ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  <div className="grid content-center gap-1 border-b border-r border-stone-200 bg-[#F0EBE7] px-3 py-2">
                    <div className="text-sm font-semibold" style={{ color: INK }}>
                      {lane.label}
                    </div>
                    <div className="text-[11px] leading-4 text-slate-500">
                      {lane.description}
                    </div>
                  </div>
                  {lane.cells.map((cell, cellIndex) => (
                    <div
                      key={`${lane.id}-${cellIndex}`}
                      className="relative min-h-[88px] border-b border-r border-stone-200 bg-stone-50"
                    >
                      {cell.stage ? (
                        <div
                          className={`absolute left-1 right-1 top-1 h-4 truncate px-2 text-center text-[9px] font-medium leading-4 text-white ${stageColors[lane.section]}`}
                          style={{
                            clipPath:
                              'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)',
                          }}
                        >
                          {cell.stage}
                        </div>
                      ) : null}
                      {cell.items.map((item) => {
                        const matches = filter === 'all' || item.tags.includes(filter);
                        const dimClass = matches && laneInScope ? '' : 'opacity-25';
                        const fundingClass =
                          summary.activeItemState === 'partial' ? 'opacity-60' : '';

                        return (
                          <div
                            key={item.id}
                            className={`absolute overflow-hidden rounded border py-1 pl-2 pr-1 text-left text-[10px] leading-3 text-slate-800 shadow-sm shadow-stone-200/70 transition ${toneStyles[item.tone]} ${dimClass} ${fundingClass}`}
                            style={itemStyle(item)}
                            aria-label={`${item.id} ${item.title}. ${itemPillar(item)} roadmap item.`}
                          >
                            <strong>{item.id}</strong> {item.title}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 bg-stone-50 p-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: INK }}>
            {controlSummary.headline}
          </div>
          <div className="mt-2 text-sm leading-5 text-slate-600">
            {controlSummary.detail}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((option) => {
              const Icon = option.icon;
              const active = option.id === filter;

              return (
                <button
                  key={`dock-${option.id}`}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-[#071B4D] bg-[#071B4D] text-white'
                      : 'border-stone-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  aria-pressed={active}
                  onClick={() => setFilter(option.id)}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/60">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}
