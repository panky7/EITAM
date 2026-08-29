import { AlertTriangle, CheckCircle2, Info, Target } from 'lucide-react';
import { useMemo } from 'react';
import type { Workstream } from '../../data/workstreams';
import {
  risksForWorkstream,
  workstreamFinancials,
} from '../../lib/calculations';
import {
  ACCENT,
  BAD,
  GOOD,
  HM_RED,
  INK,
  STEEL,
  fmtM,
  fmtX,
  multipleColor,
} from '../../lib/format';
import { PartnerCostSplit } from '../PartnerCostSplit';
import { RiskSeverityBadge } from '../RiskSeverityBadge';
import { StatCard } from '../StatCard';
import { ValueHighlightChips } from '../ValueHighlightChips';

interface WorkstreamDetailProps {
  workstream: Workstream;
}

export function WorkstreamDetail({ workstream }: WorkstreamDetailProps) {
  const financials = useMemo(
    () => workstreamFinancials(workstream),
    [workstream],
  );
  const relatedRisks = useMemo(
    () => risksForWorkstream(workstream.id),
    [workstream.id],
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div
          className="rounded-sm p-6 text-white shadow-md"
          style={{ backgroundColor: HM_RED }}
        >
          <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
            {workstream.short} detail page
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">{workstream.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
            {workstream.blurb}
          </p>
          <div className="mt-4">
            <ValueHighlightChips highlights={workstream.valueHighlights} />
          </div>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/70">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            Roadmap outcome
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {workstream.yearOneOutcome}
          </p>
          <div className="mt-3 border-t border-stone-200 pt-3 text-xs leading-5 text-slate-500">
            Year 2+: {workstream.yearTwoOutcome}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <StatCard label="Calculated cost" value={fmtM(financials.costSEK)} />
        <StatCard
          label="Directional value"
          value={fmtM(financials.benefitSEK)}
          sub="not audited ROI"
          tone={GOOD}
        />
        <StatCard
          label="Benefit multiple"
          value={fmtX(financials.multiple)}
          tone={multipleColor(financials.multiple)}
        />
        <StatCard
          label="Phase"
          value={workstream.startsInQ1 ? 'Q1' : 'M4'}
          sub={workstream.startsInQ1 ? 'starts in Q1' : 'starts in month 4'}
          tone={ACCENT}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="flex items-center gap-2">
            <Target size={16} color={ACCENT} />
            <h3 className="text-sm font-semibold" style={{ color: INK }}>
              Scope and delivery content
            </h3>
          </div>
          <div className="mt-3 grid gap-3">
            {workstream.scopeItems.map((item) => (
              <div key={item} className="flex gap-2 text-sm leading-5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" color={GOOD} />
                <span className="text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <PartnerCostSplit
          breakdown={financials.partnerBreakdown}
          totalSEK={financials.costSEK}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} color={BAD} />
            <h3 className="text-sm font-semibold" style={{ color: INK }}>
              Workstream risk focus
            </h3>
          </div>
          <div className="mt-3 grid gap-3">
            {workstream.riskFocus.map((risk) => (
              <div key={risk} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
                <div className="text-sm leading-5 text-slate-600">{risk}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <h3 className="text-sm font-semibold" style={{ color: INK }}>
            Related enterprise risks
          </h3>
          <div className="mt-3 grid gap-3">
            {relatedRisks.map((risk) => (
              <div key={risk.id} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: INK }}>
                      {risk.title}
                    </div>
                    <div className="mt-1 text-xs leading-5" style={{ color: STEEL }}>
                      {risk.businessImpact[0]}
                    </div>
                  </div>
                  <RiskSeverityBadge severity={risk.severity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800 shadow-sm">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Benefit values remain directional and are shown to compare scenarios,
          not as audited ROI. Risk content is mapped from the roadmap narrative.
        </span>
      </div>
    </div>
  );
}
