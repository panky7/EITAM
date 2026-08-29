import { Cpu, FileCheck2, Scale } from 'lucide-react';
import { AI_READINESS_DOMAINS } from '../../data/risks';
import { WORKSTREAMS } from '../../data/workstreams';
import {
  averageAiReadiness,
  risksForWorkstream,
  workstreamFinancials,
} from '../../lib/calculations';
import { BAD, HM_RED, INK, STEEL, fmtM, fmtX, multipleColor } from '../../lib/format';
import { ReadinessBar } from '../ReadinessBar';
import { RiskSeverityBadge } from '../RiskSeverityBadge';
import { StatCard } from '../StatCard';

const aiWorkstream = WORKSTREAMS.find((workstream) => workstream.id === 'ai');

export function AiRiskView() {
  if (!aiWorkstream) return null;

  const financials = workstreamFinancials(aiWorkstream);
  const avgReadiness = averageAiReadiness();
  const aiRisks = risksForWorkstream('ai');

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-sm p-6 text-white shadow-md"
          style={{ backgroundColor: HM_RED }}
        >
          <div className="flex items-center gap-2 text-white/70">
            <Cpu size={16} />
            <div className="text-[11px] font-medium uppercase tracking-widest">
              AI asset risk
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">
            EU AI Act readiness needs its own operating page.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
            This view focuses on AI asset inventory, ownership, metadata,
            risk classification, compliance workflow and continuous evidence.
          </p>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            Readiness snapshot
          </div>
          <div className="mt-4 space-y-3">
            {AI_READINESS_DOMAINS.map((domain) => (
              <ReadinessBar
                key={domain.id}
                label={domain.title}
                pct={domain.readinessPct}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <StatCard
          label="AI workstream cost"
          value={fmtM(financials.costSEK)}
        />
        <StatCard
          label="Directional value"
          value={fmtM(financials.benefitSEK)}
          sub="not audited ROI"
        />
        <StatCard
          label="Benefit multiple"
          value={fmtX(financials.multiple)}
          tone={multipleColor(financials.multiple)}
        />
        <StatCard
          label="Avg readiness"
          value={`${avgReadiness.toFixed(0)}%`}
          sub="illustrative readiness baseline"
          tone={BAD}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="flex items-center gap-2">
            <Scale size={16} color={HM_RED} />
            <h3 className="text-sm font-semibold" style={{ color: INK }}>
              EU AI Act readiness domains
            </h3>
          </div>
          <div className="mt-3 grid gap-4">
            {AI_READINESS_DOMAINS.map((domain) => (
              <article key={domain.id} className="border-t border-stone-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: INK }}>
                      {domain.title}
                    </h4>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {domain.description}
                    </p>
                  </div>
                  <RiskSeverityBadge
                    severity={
                      domain.readinessPct >= 70
                        ? 'ready'
                        : domain.readinessPct >= 35
                          ? 'medium'
                          : 'high'
                    }
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {domain.evidenceNeeded.map((evidence) => (
                    <span
                      key={evidence}
                      className="bg-stone-100 px-2 py-1 text-[11px]"
                      style={{ color: STEEL }}
                    >
                      {evidence}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="flex items-center gap-2">
            <FileCheck2 size={16} color={HM_RED} />
            <h3 className="text-sm font-semibold" style={{ color: INK }}>
              AI-related enterprise risks
            </h3>
          </div>
          <div className="mt-3 grid gap-3">
            {aiRisks.map((risk) => (
              <div key={risk.id} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: INK }}>
                      {risk.title}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {risk.leadershipAsk}
                    </div>
                  </div>
                  <RiskSeverityBadge severity={risk.severity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
