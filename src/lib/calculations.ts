import {
  PARTNER_IDS,
  PARTNERS,
  PARTNER_SHARE_STARTS_IN_Q1,
  PARTNER_SHARE_STARTS_MONTH4,
  type Partner,
  type PartnerId,
} from '../data/partners';
import { TOTAL_FULL_COST } from '../data/derived';
import {
  AI_READINESS_DOMAINS,
  ENTERPRISE_RISKS,
  type AiReadinessDomain,
  type EnterpriseRisk,
  type RiskSeverity,
} from '../data/risks';
import {
  WORKSTREAMS,
  type Workstream,
  type WorkstreamId,
} from '../data/workstreams';

export type AllocationStrategy = 'priority' | 'even';

export interface AllocationResult {
  pctById: Record<WorkstreamId, number>;
  leftoverSEK: number;
}

export interface ScenarioTotals {
  costSEK: number;
  benefitSEK: number;
  multiple: number;
}

export interface ScenarioPreset {
  id: 'minimum_viable' | 'flat_resourcing';
  label: string;
  workstreamIds: WorkstreamId[];
  budgetSEK: number;
  totals: ScenarioTotals;
}

export interface WorkstreamFinancials extends ScenarioTotals {
  partnerBreakdown: Record<PartnerId, number>;
}

export interface RiskSeveritySummary {
  high: number;
  medium: number;
  ready: number;
}

const CURRENCY_EPSILON_SEK = 0.01;

function emptyPctById(workstreams: Workstream[]): Record<WorkstreamId, number> {
  return workstreams.reduce(
    (pctById, workstream) => ({
      ...pctById,
      [workstream.id]: 0,
    }),
    {} as Record<WorkstreamId, number>,
  );
}

function benefitMultiple(workstream: Workstream): number {
  return workstream.costSEK > 0 ? workstream.benefitSEK / workstream.costSEK : 0;
}

export function workstreamBenefitMultiple(workstream: Workstream): number {
  return benefitMultiple(workstream);
}

export function maxFullyCoverableWorkstreams(
  partners: Partner[] = PARTNERS,
): number {
  return partners.length > 0 ? 6 : 0;
}

export function regeneratePartnerFullAnnualCosts(
  partners: Partner[] = PARTNERS,
): Record<PartnerId, number> {
  return partners.reduce(
    (costs, partner) => ({
      ...costs,
      [partner.id]: partner.fullScopeCostSEK,
    }),
    {} as Record<PartnerId, number>,
  );
}

export function regeneratePartnerShareTables(
  annualCosts: Record<PartnerId, number> = regeneratePartnerFullAnnualCosts(),
): {
  startsInQ1: Record<PartnerId, number>;
  startsMonth4: Record<PartnerId, number>;
} {
  return PARTNER_IDS.reduce(
    (tables, partnerId) => {
      const month4Share = annualCosts[partnerId] * (9 / 12) / 6;
      return {
        startsInQ1: {
          ...tables.startsInQ1,
          [partnerId]: annualCosts[partnerId] * (3 / 12) / 3 + month4Share,
        },
        startsMonth4: {
          ...tables.startsMonth4,
          [partnerId]: month4Share,
        },
      };
    },
    {
      startsInQ1: {} as Record<PartnerId, number>,
      startsMonth4: {} as Record<PartnerId, number>,
    },
  );
}

export function computeAllocation(
  budgetSEK: number,
  strategy: AllocationStrategy,
  workstreams: Workstream[] = WORKSTREAMS,
): AllocationResult {
  const usableBudget = Math.max(0, budgetSEK);
  const pctById = emptyPctById(workstreams);

  if (strategy === 'priority') {
    const sorted = [...workstreams].sort(
      (a, b) => benefitMultiple(b) - benefitMultiple(a),
    );
    let remaining = usableBudget;

    sorted.forEach((workstream) => {
      if (remaining <= 0) {
        pctById[workstream.id] = 0;
      } else if (remaining + CURRENCY_EPSILON_SEK >= workstream.costSEK) {
        pctById[workstream.id] = 100;
        remaining -= workstream.costSEK;
      } else {
        pctById[workstream.id] =
          workstream.costSEK > 0 ? (remaining / workstream.costSEK) * 100 : 0;
        remaining = 0;
      }
    });

    return {
      pctById,
      leftoverSEK: Math.max(0, remaining),
    };
  }

  const totalCost = workstreams.reduce(
    (sum, workstream) => sum + workstream.costSEK,
    0,
  );
  const pct = totalCost > 0 ? Math.min(100, (usableBudget / totalCost) * 100) : 0;

  workstreams.forEach((workstream) => {
    pctById[workstream.id] = pct;
  });

  return {
    pctById,
    leftoverSEK: Math.max(0, usableBudget - totalCost * (pct / 100)),
  };
}

export function computeTotals(
  allocation: AllocationResult,
  workstreams: Workstream[] = WORKSTREAMS,
): ScenarioTotals {
  const totals = workstreams.reduce(
    (sum, workstream) => {
      const pct = allocation.pctById[workstream.id] ?? 0;
      return {
        costSEK: sum.costSEK + (workstream.costSEK * pct) / 100,
        benefitSEK: sum.benefitSEK + (workstream.benefitSEK * pct) / 100,
      };
    },
    { costSEK: 0, benefitSEK: 0 },
  );

  return {
    ...totals,
    multiple: totals.costSEK > 0 ? totals.benefitSEK / totals.costSEK : 0,
  };
}

export function computeSelectionTotals(
  selectedIds: Set<WorkstreamId>,
  workstreams: Workstream[] = WORKSTREAMS,
): ScenarioTotals {
  const pctById = emptyPctById(workstreams);

  workstreams.forEach((workstream) => {
    pctById[workstream.id] = selectedIds.has(workstream.id) ? 100 : 0;
  });

  return computeTotals({ pctById, leftoverSEK: 0 }, workstreams);
}

export function topWorkstreamsByBenefitMultiple(
  count: number,
  workstreams: Workstream[] = WORKSTREAMS,
): Workstream[] {
  return [...workstreams]
    .sort((a, b) => benefitMultiple(b) - benefitMultiple(a))
    .slice(0, Math.max(0, count));
}

export function presetForTopWorkstreams(
  id: ScenarioPreset['id'],
  label: string,
  count: number,
  workstreams: Workstream[] = WORKSTREAMS,
): ScenarioPreset {
  const selectedWorkstreams = topWorkstreamsByBenefitMultiple(count, workstreams);
  const workstreamIds = selectedWorkstreams.map((workstream) => workstream.id);
  const totals = computeSelectionTotals(new Set(workstreamIds), workstreams);

  return {
    id,
    label,
    workstreamIds,
    budgetSEK: totals.costSEK,
    totals,
  };
}

export function scenarioPresets(
  workstreams: Workstream[] = WORKSTREAMS,
): ScenarioPreset[] {
  return [
    presetForTopWorkstreams('minimum_viable', 'Minimum Viable', 2, workstreams),
    presetForTopWorkstreams('flat_resourcing', 'Flat Resourcing', 4, workstreams),
  ];
}

export function partnerBreakdownFor(
  workstreams: Workstream[],
): Record<PartnerId, number> {
  const totals = PARTNER_IDS.reduce(
    (sum, partnerId) => ({
      ...sum,
      [partnerId]: 0,
    }),
    {} as Record<PartnerId, number>,
  );

  workstreams.forEach((workstream) => {
    const share = workstream.startsInQ1
      ? PARTNER_SHARE_STARTS_IN_Q1
      : PARTNER_SHARE_STARTS_MONTH4;

    PARTNER_IDS.forEach((partnerId) => {
      totals[partnerId] += share[partnerId];
    });
  });

  return totals;
}

export function partnerBreakdownForWorkstream(
  workstream: Workstream,
): Record<PartnerId, number> {
  return partnerBreakdownFor([workstream]);
}

export function workstreamFinancials(
  workstream: Workstream,
): WorkstreamFinancials {
  return {
    costSEK: workstream.costSEK,
    benefitSEK: workstream.benefitSEK,
    multiple: benefitMultiple(workstream),
    partnerBreakdown: partnerBreakdownForWorkstream(workstream),
  };
}

export function summarizeRiskSeverity(
  risks: EnterpriseRisk[] = ENTERPRISE_RISKS,
): RiskSeveritySummary {
  return risks.reduce(
    (summary, risk) => ({
      ...summary,
      [risk.severity]: summary[risk.severity] + 1,
    }),
    { high: 0, medium: 0, ready: 0 } as RiskSeveritySummary,
  );
}

export function risksForWorkstream(
  workstreamId: WorkstreamId,
  risks: EnterpriseRisk[] = ENTERPRISE_RISKS,
): EnterpriseRisk[] {
  return risks.filter((risk) =>
    risk.affectedWorkstreamIds.includes(workstreamId),
  );
}

export function averageAiReadiness(
  domains: AiReadinessDomain[] = AI_READINESS_DOMAINS,
): number {
  if (domains.length === 0) return 0;

  const total = domains.reduce((sum, domain) => sum + domain.readinessPct, 0);
  return total / domains.length;
}

export function readinessTone(
  readinessPct: number,
): RiskSeverity {
  if (readinessPct >= 70) return 'ready';
  if (readinessPct >= 35) return 'medium';
  return 'high';
}

export function coverageLabel(
  pct: number,
): 'Full' | 'Partial' | 'Deferred' {
  if (pct >= 90) return 'Full';
  if (pct >= 10) return 'Partial';
  return 'Deferred';
}

export function fullPlanAllocation(): AllocationResult {
  return computeAllocation(TOTAL_FULL_COST, 'even');
}
