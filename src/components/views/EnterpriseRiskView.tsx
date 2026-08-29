import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { ENTERPRISE_RISKS } from '../../data/risks';
import { WORKSTREAMS } from '../../data/workstreams';
import { summarizeRiskSeverity } from '../../lib/calculations';
import { BAD, HM_RED, INK, STEEL } from '../../lib/format';
import { RiskSeverityBadge } from '../RiskSeverityBadge';
import { StatCard } from '../StatCard';

const workstreamNameById = Object.fromEntries(
  WORKSTREAMS.map((workstream) => [workstream.id, workstream.name]),
);

export function EnterpriseRiskView() {
  const summary = summarizeRiskSeverity();

  return (
    <div className="space-y-6">
      <section
        className="rounded-sm p-6 text-white shadow-md"
        style={{ backgroundColor: HM_RED }}
      >
        <div className="flex items-center gap-2 text-white/70">
          <ShieldAlert size={16} />
          <div className="text-[11px] font-medium uppercase tracking-widest">
            Enterprise asset risk
          </div>
        </div>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal">
          Risk is now a first-class decision view.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
          The roadmap identifies incomplete asset visibility, data regression,
          delivery dependencies and value scale-up as strategic risks. This page
          links those risks to the affected workstreams and leadership asks.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <StatCard label="High risks" value={String(summary.high)} tone={BAD} />
        <StatCard label="Medium risks" value={String(summary.medium)} />
        <StatCard
          label="Roadmap risk anchor"
          value="25.00M SEK"
          sub="enterprise risk basis"
          tone={HM_RED}
        />
        <StatCard
          label="Affected streams"
          value="6"
          sub="risk mapped across scope"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ENTERPRISE_RISKS.map((risk) => (
          <article
            key={risk.id}
            className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" color={BAD} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: INK }}>
                    {risk.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {risk.affectedWorkstreamIds.map((workstreamId) => (
                      <span
                        key={workstreamId}
                        className="bg-stone-100 px-2 py-1 text-[11px]"
                        style={{ color: STEEL }}
                      >
                        {workstreamNameById[workstreamId]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <RiskSeverityBadge severity={risk.severity} />
            </div>

            <div className="mt-4 space-y-2">
              {risk.businessImpact.map((impact) => (
                <div key={impact} className="text-sm leading-5 text-slate-600">
                  {impact}
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-stone-100 pt-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Leadership ask
              </div>
              <div className="mt-1 text-sm leading-5 text-slate-600">
                {risk.leadershipAsk}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
