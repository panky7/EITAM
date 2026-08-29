import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Coins,
  HeartHandshake,
  Laptop,
  MonitorCheck,
  Network,
  Rocket,
  Router,
  Shield,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { InteractiveRoadmapTimeline } from '../InteractiveRoadmapTimeline';
import { TOTAL_FULL_COST } from '../../data/derived';
import {
  capabilityRows,
  modelScopePreset,
  type ModelScopePresetId,
  scopedCapabilityRoiSummary,
} from '../../lib/capabilityRoi';
import { WORKSTREAMS, type WorkstreamId } from '../../data/workstreams';
import {
  GOOD,
  HM_RED,
  INK,
  M,
  STEEL,
  WARN,
  fmtM,
  fmtX,
} from '../../lib/format';

const presets = [
  { id: 'minimum_viable', icon: Wrench },
  { id: 'security_first', icon: Shield },
  { id: 'compliance_ready', icon: BadgeCheck },
  { id: 'full_uplift', icon: Rocket },
] satisfies Array<{ id: ModelScopePresetId; icon: typeof Wrench }>;

const presetModels = presets.map((preset) => ({
  ...modelScopePreset(preset.id),
  icon: preset.icon,
}));

const topMetrics = [
  {
    label: 'Financial return',
    key: 'financial',
    color: GOOD,
  },
  {
    label: 'Security',
    key: 'security',
    color: HM_RED,
  },
  {
    label: 'Compliance',
    key: 'compliance',
    color: '#5B3AA4',
  },
  {
    label: 'Incident response',
    key: 'incident',
    color: WARN,
  },
];

const achievements = [
  {
    label: 'Endpoint foundation proven',
    detail: 'Managed laptops and physical devices now reliable enough to build from.',
    value: '90%+',
    icon: MonitorCheck,
  },
  {
    label: 'Network inventory uplifted',
    detail: 'Managed network gear visibility now supports stronger operational control.',
    value: '90%+',
    icon: Router,
  },
  {
    label: 'Value already unlocked',
    detail: 'License and unused-device opportunities identified.',
    value: '10M SEK',
    icon: Coins,
  },
  {
    label: 'Business ownership validated',
    detail: 'Business-owner acknowledgement for improved asset data quality.',
    value: 'Strong',
    icon: HeartHandshake,
  },
];

function maturityPosition(maturity: number): string {
  return `${Math.max(0, Math.min(100, ((maturity - 1) / 4) * 100))}%`;
}

export function CapabilityRoiBoard() {
  const [budgetSEK, setBudgetSEK] = useState(TOTAL_FULL_COST);
  const [selectedWorkstreamIds, setSelectedWorkstreamIds] = useState<Set<WorkstreamId>>(
    () => new Set(WORKSTREAMS.map((workstream) => workstream.id)),
  );
  const summary = useMemo(
    () => scopedCapabilityRoiSummary(selectedWorkstreamIds, budgetSEK),
    [budgetSEK, selectedWorkstreamIds],
  );
  const rows = useMemo(
    () => capabilityRows(budgetSEK, summary.scopeCostSEK),
    [budgetSEK, summary.scopeCostSEK],
  );

  const toggleWorkstream = (workstreamId: WorkstreamId) => {
    setSelectedWorkstreamIds((current) => {
      const next = new Set(current);
      if (next.has(workstreamId)) {
        next.delete(workstreamId);
      } else {
        next.add(workstreamId);
      }
      return next;
    });
  };

  const selectAllWorkstreams = () => {
    setSelectedWorkstreamIds(new Set(WORKSTREAMS.map((workstream) => workstream.id)));
  };

  const applyPreset = (presetId: ModelScopePresetId) => {
    const preset = modelScopePreset(presetId);
    setBudgetSEK(preset.budgetSEK);
    setSelectedWorkstreamIds(new Set(preset.workstreamIds));
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="grid bg-[#071B4D] text-white lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              H&M Enterprise Asset Management
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Asset Management Capability ROI Model
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              From maturity level 1 to level 3, backed by validated inventory uplift
              and modeled return across money, security, compliance readiness and
              incident response.
            </p>
          </div>
          <div className="border-t border-white/15 p-5 lg:border-l lg:border-t-0">
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              Last year achievements
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2 text-sm leading-5">
                <Laptop className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  Managed endpoint inventory above <strong>90%</strong> coverage.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <Network className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  Managed network gear inventory above <strong>90%</strong> coverage.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <Coins className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  <strong>10M SEK</strong> license and unused-device value unlocked.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <ShieldCheck className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>Qualys integration improving asset-risk and vulnerability posture.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
            Model controls
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <label className="text-sm text-slate-500" htmlFor="budget">
              Available investment
            </label>
            <div className="font-mono text-2xl font-semibold tabular-nums" style={{ color: INK }}>
              {(budgetSEK / M).toFixed(1)}M SEK
            </div>
          </div>
          <input
            id="budget"
            className="slider mt-3 w-full"
            type="range"
            min={0}
            max={TOTAL_FULL_COST}
            step={100_000}
            value={budgetSEK}
            onChange={(event) => setBudgetSEK(Number(event.target.value))}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {presetModels.map((preset) => {
              const Icon = preset.icon;
              const active =
                Math.round(budgetSEK) === preset.budgetSEK &&
                preset.workstreamIds.length === selectedWorkstreamIds.size &&
                preset.workstreamIds.every((id) => selectedWorkstreamIds.has(id));

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-[#071B4D] bg-[#071B4D] text-white'
                      : 'border-stone-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={active}
                >
                  <Icon size={14} />
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scope model
              </div>
              <button
                type="button"
                className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
                onClick={selectAllWorkstreams}
              >
                Select all
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {WORKSTREAMS.map((workstream) => {
                const selected = selectedWorkstreamIds.has(workstream.id);

                return (
                  <button
                    key={workstream.id}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                      selected
                        ? 'border-[#071B4D] bg-[#071B4D] text-white'
                        : 'border-stone-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                    aria-pressed={selected}
                    onClick={() => toggleWorkstream(workstream.id)}
                  >
                    {workstream.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="rounded-md bg-stone-50 px-3 py-2">
                Required investment
                <strong className="mt-1 block font-mono text-sm text-slate-950">
                  {fmtM(summary.scopeCostSEK)}
                </strong>
              </div>
              <div className="rounded-md bg-stone-50 px-3 py-2">
                Value unlocked
                <strong className="mt-1 block font-mono text-sm text-slate-950">
                  {fmtM(summary.valueSEK)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((metric) => {
            if (metric.key === 'financial') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={fmtX(summary.multiple)}
                  sub={`${fmtM(summary.valueSEK)} directional value`}
                  color={metric.color}
                />
              );
            }
            if (metric.key === 'security') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={`${summary.pillars.security}%`}
                  sub="Risk reduction"
                  color={metric.color}
                />
              );
            }
            if (metric.key === 'compliance') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={`${summary.pillars.complianceReadiness}%`}
                  sub="Readiness"
                  color={metric.color}
                />
              );
            }
            return (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={`${summary.pillars.incidentResponse}%`}
                sub="MTTR uplift"
                color={metric.color}
              />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
              Capability maturity backed by outcomes
            </div>
            <div className="text-xs text-slate-500">
              Current 1.0 → projected {summary.maturity.projected.toFixed(1)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[11px] text-slate-500">
            {['Ad hoc', 'Visible', 'Managed', 'Integrated', 'Optimized'].map((label, index) => (
              <div key={label}>
                <div className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-[#071B4D] text-xs font-semibold text-white">
                  {index + 1}
                </div>
                {label}
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#071B4D] text-left text-xs uppercase tracking-wide text-white">
                  <th className="px-3 py-2 font-medium">Capability</th>
                  <th className="px-3 py-2 font-medium">Business outcome</th>
                  <th className="px-3 py-2 font-medium">Current → projected</th>
                  <th className="px-3 py-2 font-medium">Return signal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-stone-100 last:border-0">
                    <td className="px-3 py-3 font-semibold" style={{ color: INK }}>
                      {row.name}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.outcome}</td>
                    <td className="px-3 py-3">
                      <div
                        className="relative h-6 min-w-40"
                        aria-label={`Current maturity ${row.currentMaturity.toFixed(1)} projected ${row.projectedMaturity.toFixed(1)}`}
                      >
                        <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-200" />
                        <div className="absolute top-1.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-[#2468C9] shadow" style={{ left: maturityPosition(row.currentMaturity) }} />
                        <div className="absolute top-1.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow transition-all" style={{ left: maturityPosition(row.projectedMaturity), backgroundColor: GOOD }} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${row.returnSignalPct}%`, backgroundColor: GOOD }}
                          />
                        </div>
                        <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-500">
                          {row.returnSignalPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
              Evidence now visible
            </div>
            <div className="mt-3 space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div key={achievement.label} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-green-50 text-green-700">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold" style={{ color: INK }}>
                        {achievement.label}
                      </div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-500">
                        {achievement.detail}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-semibold tabular-nums" style={{ color: INK }}>
                      {achievement.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
              Roadmap reading
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The detailed timeline below keeps every roadmap item visible and
              links the plan back to the same modeled investment, maturity and
              value pillars shown above.
            </p>
          </div>
        </aside>
      </section>

      <InteractiveRoadmapTimeline
        budgetSEK={budgetSEK}
        selectedWorkstreamIds={selectedWorkstreamIds}
        scopeCostSEK={summary.scopeCostSEK}
        scopeBenefitSEK={summary.scopeBenefitSEK}
      />

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
              Capability maturity end state
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Maturity is shown last so the board closes on the business outcome:
              selected scope moves from ad hoc visibility toward managed asset
              management capability.
            </p>
          </div>
          <div className="font-mono text-3xl font-semibold tabular-nums" style={{ color: INK }}>
            {summary.maturity.current.toFixed(1)} -&gt; {summary.maturity.projected.toFixed(1)}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs text-slate-500">
          {['Ad hoc', 'Visible', 'Managed', 'Integrated', 'Optimized'].map((label, index) => (
            <div key={label} className="rounded-md bg-stone-50 px-2 py-3">
              <div
                className={`mx-auto mb-2 h-2 rounded-full ${
                  index + 1 <= Math.floor(summary.maturity.projected)
                    ? 'bg-[#587E1F]'
                    : 'bg-stone-200'
                }`}
              />
              {index + 1}. {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
      <div className="border-l-4 pl-3" style={{ borderColor: color }}>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="mt-1 font-mono text-xl font-semibold tabular-nums" style={{ color: INK }}>
          {value}
        </div>
        <div className="mt-1 text-xs leading-5" style={{ color: STEEL }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
