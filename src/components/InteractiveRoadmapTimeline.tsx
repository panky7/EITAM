import { useMemo, useState } from 'react';
import { ROADMAP_LANES, type RoadmapItem } from '../data/roadmap';
import type { WorkstreamId } from '../data/workstreams';
import {
  capabilityRoiSummary,
  type CapabilityRow,
} from '../lib/capabilityRoi';
import { roadmapItemsForScope, roadmapModelSummary } from '../lib/roadmap';
import { INK, fmtM } from '../lib/format';

const periods = [
  { label: '3 months', sub: 'Mid-Aug 2026' },
  { label: '3 months', sub: 'Foundation to design' },
  { label: '3 months', sub: 'Implementation' },
  { label: '3 months and further', sub: 'Operational intelligence' },
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

interface HoveredRoadmapItem {
  item: RoadmapItem;
  laneLabel: string;
  timing: string;
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
  capabilityRows,
}: {
  budgetSEK: number;
  selectedWorkstreamIds: Set<WorkstreamId>;
  scopeCostSEK: number;
  scopeBenefitSEK: number;
  capabilityRows: CapabilityRow[];
}) {
  const [hoveredItem, setHoveredItem] = useState<HoveredRoadmapItem | null>(null);
  const summary = useMemo(
    () => roadmapModelSummary(budgetSEK, 'all', scopeCostSEK),
    [budgetSEK, scopeCostSEK],
  );
  const highlightedItemCount = useMemo(
    () => roadmapItemsForScope(selectedWorkstreamIds).length,
    [selectedWorkstreamIds],
  );
  const roi = useMemo(
    () => capabilityRoiSummary(budgetSEK, scopeCostSEK, scopeBenefitSEK),
    [budgetSEK, scopeBenefitSEK, scopeCostSEK],
  );

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm shadow-stone-200/70">
      {hoveredItem ? <RoadmapHoverCard hover={hoveredItem} /> : null}
      <div className="grid bg-[#071B4D] text-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <div className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
            Interactive timeline
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Enterprise Asset Management Roadmap
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
            Dense swimlane roadmap aligned to the ROI model. Scenario and scope
            controls update the workstreams visible in the execution plan.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/15 p-4 sm:grid-cols-4 lg:border-l lg:border-t-0">
          <HeaderMetric label="Scope" value={`${summary.fundedScopePct}%`} />
          <HeaderMetric label="Maturity" value={`1.0 -> ${roi.maturity.projected.toFixed(1)}`} />
          <HeaderMetric label="Items" value={String(highlightedItemCount)} />
          <HeaderMetric label="Investment" value={fmtM(roi.budgetSEK)} />
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
              return (
                <div
                  key={lane.id}
                  className={`grid min-h-[88px] grid-cols-[190px_repeat(4,minmax(0,1fr))] transition-opacity ${
                    laneInScope ? 'opacity-100' : 'opacity-25'
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
                        const dimClass = laneInScope ? '' : 'opacity-25';
                        const fundingClass =
                          summary.activeItemState === 'partial' ? 'opacity-60' : '';

                        return (
                          <div
                            key={item.id}
                            className={`absolute overflow-hidden rounded border py-1 pl-2 pr-1 text-left text-[10px] leading-3 text-slate-800 shadow-sm shadow-stone-200/70 transition hover:z-30 hover:shadow-lg ${toneStyles[item.tone]} ${dimClass} ${fundingClass}`}
                            style={itemStyle(item)}
                            aria-label={`${item.id} ${item.title}. ${itemPillar(item)} roadmap item.`}
                            tabIndex={0}
                            onMouseEnter={() =>
                              setHoveredItem({
                                item,
                                laneLabel: lane.label,
                                timing: `${periods[cellIndex]?.label} / ${periods[cellIndex]?.sub}`,
                              })
                            }
                            onMouseLeave={() => setHoveredItem(null)}
                            onFocus={() =>
                              setHoveredItem({
                                item,
                                laneLabel: lane.label,
                                timing: `${periods[cellIndex]?.label} / ${periods[cellIndex]?.sub}`,
                              })
                            }
                            onBlur={() => setHoveredItem(null)}
                          >
                            <div className="line-clamp-2 overflow-hidden">
                              <strong>{item.id}</strong> {item.title}
                            </div>
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
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: INK }}>
              Capability maturity in modeled scope
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums" style={{ color: INK }}>
              1.0 -&gt; {roi.maturity.projected.toFixed(1)}
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {capabilityRows.map((row) => (
              <div
                key={row.name}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                  row.projectedMaturity > row.currentMaturity
                    ? 'border-green-100 bg-green-50/70'
                    : 'border-stone-200 bg-stone-50 text-slate-400'
                }`}
              >
                <span className="text-xs font-medium leading-4">{row.name}</span>
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums" style={{ color: INK }}>
                  {row.projectedMaturity.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapHoverCard({ hover }: { hover: HoveredRoadmapItem }) {
  return (
    <div className="pointer-events-none fixed right-6 top-24 z-50 hidden w-[360px] rounded-lg border border-stone-200 bg-white p-4 text-left text-sm leading-6 text-slate-600 shadow-2xl shadow-slate-900/25 lg:block">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {itemPillar(hover.item)} roadmap item
      </div>
      <div className="mt-1 text-lg font-semibold leading-6" style={{ color: INK }}>
        {hover.item.id} {hover.item.title}
      </div>
      <div className="mt-3 grid gap-2 text-xs leading-5">
        <div>
          <span className="font-semibold text-slate-900">Timing:</span>{' '}
          {hover.timing}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Scope:</span>{' '}
          {hover.laneLabel}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Value signal:</span>{' '}
          {itemPillar(hover.item)}
        </div>
      </div>
    </div>
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
