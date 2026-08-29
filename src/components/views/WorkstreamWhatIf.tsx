import { useMemo, useState } from 'react';
import {
  Cloud as CloudIcon,
  Cpu,
  Factory,
  HardDrive,
  Package,
  Sparkles,
  MousePointer2,
  type LucideIcon,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TOTAL_FULL_BENEFIT, TOTAL_FULL_COST } from '../../data/derived';
import {
  WORKSTREAMS,
  type WorkstreamId,
} from '../../data/workstreams';
import {
  computeSelectionTotals,
  partnerBreakdownFor,
} from '../../lib/calculations';
import {
  ACCENT,
  INK,
  M,
  MONO_NUMERIC_CLASS,
  STEEL,
  fmtM,
  fmtX,
  multipleColor,
} from '../../lib/format';
import { StatCard } from '../StatCard';
import { ValueHighlightChips } from '../ValueHighlightChips';

const WORKSTREAM_ICONS: Record<WorkstreamId, LucideIcon> = {
  hardware: HardDrive,
  ai: Cpu,
  cloud: CloudIcon,
  ot: Factory,
  software: Package,
  newemerging: Sparkles,
};

export function WorkstreamWhatIf() {
  const [selected, setSelected] = useState<Set<WorkstreamId>>(new Set());

  const selectedWorkstreams = useMemo(
    () => WORKSTREAMS.filter((workstream) => selected.has(workstream.id)),
    [selected],
  );

  const totals = useMemo(
    () => computeSelectionTotals(selected),
    [selected],
  );

  const partnerChartData = useMemo(
    () =>
      Object.entries(partnerBreakdownFor(selectedWorkstreams)).map(
        ([name, costSEK]) => ({
          name,
          cost: +(costSEK / M).toFixed(2),
        }),
      ),
    [selectedWorkstreams],
  );

  function toggle(id: WorkstreamId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 pl-4" style={{ borderColor: ACCENT }}>
        <h2 className="text-2xl font-semibold tracking-normal" style={{ color: INK }}>
          Workstream what-if
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick only the workstream(s) you want to fund, such as just AI Assets,
          and see the isolated cost and benefit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {WORKSTREAMS.map((workstream) => {
          const Icon = WORKSTREAM_ICONS[workstream.id];
          const isSelected = selected.has(workstream.id);
          const workstreamMultiple =
            workstream.costSEK > 0
              ? workstream.benefitSEK / workstream.costSEK
              : 0;

          return (
            <div
              key={workstream.id}
              className={`rounded-sm border p-4 text-left shadow-sm shadow-stone-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? 'border-transparent'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
              style={
                isSelected
                  ? { backgroundColor: `${ACCENT}0D`, borderColor: ACCENT }
                  : undefined
              }
            >
              <button
                type="button"
                aria-label={`Toggle ${workstream.short} ${workstream.name} in workstream what-if`}
                onClick={() => toggle(workstream.id)}
                className="w-full text-left"
              >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5"
                    style={{
                      backgroundColor: isSelected ? `${ACCENT}22` : '#F1F3F5',
                    }}
                  >
                    <Icon size={16} color={isSelected ? ACCENT : STEEL} />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium tracking-wide text-slate-400">
                      {workstream.short}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: INK }}>
                      {workstream.name}
                    </div>
                  </div>
                </div>
                <div
                className="flex h-4 w-4 shrink-0 items-center justify-center border"
                  style={{
                    borderColor: isSelected ? ACCENT : '#CBD5E1',
                    backgroundColor: isSelected ? ACCENT : 'transparent',
                  }}
                >
                  {isSelected ? (
                    <div className="h-1.5 w-1.5 bg-white" />
                  ) : null}
                </div>
              </div>
              <div className={`mt-2 flex gap-4 text-xs ${MONO_NUMERIC_CLASS}`}>
                <span className="text-slate-500">{fmtM(workstream.costSEK)}</span>
                <span style={{ color: multipleColor(workstreamMultiple) }}>
                  {fmtX(workstreamMultiple)}
                </span>
              </div>
              </button>
              <ValueHighlightChips highlights={workstream.valueHighlights} />
            </div>
          );
        })}
      </div>

      {selected.size === 0 ? (
        <div className="rounded-sm border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center bg-stone-100">
            <MousePointer2 size={18} color={ACCENT} />
          </div>
          <div className="font-medium" style={{ color: INK }}>
            Select workstreams to model
          </div>
          <div className="mt-1">
            Select one or more workstreams above to see cost and benefit.
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <StatCard
              label="Selected workstreams"
              value={String(selectedWorkstreams.length)}
              sub={selectedWorkstreams.map((workstream) => workstream.short).join(', ')}
            />
            <StatCard
              label="Total cost"
              value={fmtM(totals.costSEK)}
              sub={`${((totals.costSEK / TOTAL_FULL_COST) * 100).toFixed(
                0,
              )}% of full plan cost`}
            />
            <StatCard
              label="Benefit value"
              value={fmtM(totals.benefitSEK)}
              sub={`${((totals.benefitSEK / TOTAL_FULL_BENEFIT) * 100).toFixed(
                0,
              )}% of full plan benefit`}
            />
            <StatCard
              label="Benefit multiple"
              value={fmtX(totals.multiple)}
              tone={multipleColor(totals.multiple)}
            />
          </div>

          <div className="chart-surface p-4">
            <div className="mb-3 text-sm font-semibold" style={{ color: INK }}>
              Cost by partner, for this selection
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={partnerChartData}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E7DED8"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: STEEL }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: STEEL }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => `${value}M SEK`}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 2,
                    borderColor: '#DDD5CF',
                    boxShadow: '0 12px 30px rgb(23 23 23 / 0.12)',
                    color: INK,
                  }}
                />
                <Bar dataKey="cost" radius={[0, 3, 3, 0]} activeBar={{ fillOpacity: 0.82 }}>
                  {partnerChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={ACCENT}
                      fillOpacity={1 - index * 0.15}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
