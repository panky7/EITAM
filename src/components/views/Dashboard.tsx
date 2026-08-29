import { ArrowUpRight, Info, ShieldAlert } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WORKSTREAMS } from '../../data/workstreams';
import { dashboardDecisionSummary, workstreamDecisionRows } from '../../lib/decision';
import { StatCard } from '../StatCard';
import { WorkstreamTile } from '../WorkstreamTile';
import {
  ACCENT,
  GOOD,
  HM_RED,
  INK,
  M,
  STEEL,
  fmtM,
  fmtX,
  multipleColor,
} from '../../lib/format';

export function Dashboard() {
  const summary = dashboardDecisionSummary();
  const rows = workstreamDecisionRows();
  const chartData = WORKSTREAMS.map((workstream) => ({
    name: workstream.short,
    Cost: +(workstream.costSEK / M).toFixed(1),
    Benefit: +(workstream.benefitSEK / M).toFixed(1),
  }));
  const formatMetric = (metric: (typeof summary.metrics)[number]) => {
    if (metric.unit === 'sek') return fmtM(metric.value);
    if (metric.unit === 'x') return fmtX(metric.value);
    return String(metric.value);
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-sm p-6 text-white shadow-md"
          style={{ backgroundColor: HM_RED }}
        >
          <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
            Proposed 12-month plan
          </div>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-normal">
            {summary.heroTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
            {summary.heroSubtitle} Last-year cost is removed from the model so
            decisions focus on current scope, directional value and risk.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 bg-white px-3 py-2 text-sm font-medium" style={{ color: HM_RED }}>
            <ShieldAlert size={16} />
            Risk-led funding view
          </div>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/70">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            Decision frame
          </div>
          <div className="mt-4 grid gap-3">
            <div className="border-l-4 pl-3" style={{ borderColor: HM_RED }}>
              <div className="text-sm font-medium" style={{ color: INK }}>
                Fund the roadmap by risk reduction, not only by cost.
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Hardware delivers the strongest multiple; AI has a lower direct
                multiple but carries regulatory readiness and unmanaged-AI risk.
              </p>
            </div>
            <div className="border-l-4 border-stone-300 pl-3">
              <div className="text-sm font-medium" style={{ color: INK }}>
                Keep benefit values directional.
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                The app keeps the disclosure visible wherever monetary value is
                used for trade-off decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {summary.metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={formatMetric(metric)}
            sub={metric.context}
            tone={metric.unit === 'x' ? multipleColor(metric.value) : undefined}
          />
        ))}
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold" style={{ color: INK }}>
              Workstream decision ranking
            </div>
            <div className="text-xs text-slate-400">ranked by value multiple</div>
          </div>
          <div className="overflow-hidden border border-stone-100">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[36px_minmax(0,1fr)_90px_84px_64px] items-center gap-3 border-t border-stone-100 px-3 py-3 text-sm first:border-t-0 max-md:grid-cols-[32px_minmax(0,1fr)_70px]"
              >
                <div className="font-mono text-xs text-slate-400">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: INK }}>
                      {row.short} {row.name}
                    </span>
                    <ArrowUpRight size={13} color={ACCENT} />
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {row.primaryOutcome}
                  </div>
                </div>
                <div className="font-mono text-xs tabular-nums" style={{ color: INK }}>
                  {fmtM(row.costSEK)}
                </div>
                <div className="font-mono text-xs tabular-nums max-md:hidden" style={{ color: GOOD }}>
                  {fmtM(row.benefitSEK)}
                </div>
                <div className="font-mono text-xs tabular-nums max-md:hidden" style={{ color: multipleColor(row.multiple) }}>
                  {fmtX(row.multiple)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-surface p-4">
          <div className="mb-3 text-sm font-semibold" style={{ color: INK }}>
            Cost vs. benefit (M SEK)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E7DED8"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: STEEL }}
                axisLine={{ stroke: '#E7DED8' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: STEEL }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => `${value}M SEK`}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 2,
                  borderColor: '#DDD5CF',
                  boxShadow: '0 16px 36px rgb(23 23 23 / 0.14)',
                  color: INK,
                }}
              />
              <Bar dataKey="Cost" fill={ACCENT} radius={[1, 1, 0, 0]} />
              <Bar dataKey="Benefit" fill={GOOD} radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {WORKSTREAMS.slice(0, 3).map((workstream) => (
          <WorkstreamTile key={workstream.id} ws={workstream} fundedPct={100} />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 shadow-sm">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Benefit values are estimated from the roadmap's ~25M SEK enterprise
          risk figure, weighted by workstream, plus rough savings/avoidance
          estimates. Treat them as directional for comparing options, not as an
          audited ROI case.
        </span>
      </div>
    </div>
  );
}
