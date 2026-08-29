import {
  FULL_MULTIPLE,
  TOTAL_FULL_BENEFIT,
  TOTAL_FULL_COST,
} from '../data/derived';
import { ENTERPRISE_RISKS } from '../data/risks';
import { WORKSTREAMS, type WorkstreamId } from '../data/workstreams';
import {
  risksForWorkstream,
  summarizeRiskSeverity,
  workstreamBenefitMultiple,
} from './calculations';

export interface DecisionMetric {
  label: string;
  value: number;
  unit: 'sek' | 'x' | 'count';
  context: string;
}

export interface DashboardDecisionSummary {
  heroTitle: string;
  heroSubtitle: string;
  metrics: DecisionMetric[];
}

export interface WorkstreamDecisionRow {
  id: WorkstreamId;
  name: string;
  short: string;
  costSEK: number;
  benefitSEK: number;
  multiple: number;
  riskCount: number;
  primaryOutcome: string;
}

export function dashboardDecisionSummary(): DashboardDecisionSummary {
  const riskSummary = summarizeRiskSeverity();

  return {
    heroTitle: 'Enterprise Asset Intelligence cockpit',
    heroSubtitle:
      'Compare investment, directional value and risk reduction across the 12-month roadmap.',
    metrics: [
      {
        label: 'Full-scope cost',
        value: TOTAL_FULL_COST,
        unit: 'sek',
        context: 'EY + Accenture + TCS delivery basis',
      },
      {
        label: 'Directional value',
        value: TOTAL_FULL_BENEFIT,
        unit: 'sek',
        context: 'benefit estimate with disclosure retained',
      },
      {
        label: 'Benefit multiple',
        value: FULL_MULTIPLE,
        unit: 'x',
        context: 'value divided by cost',
      },
      {
        label: 'High enterprise risks',
        value: riskSummary.high,
        unit: 'count',
        context: `${ENTERPRISE_RISKS.length} total mapped risks`,
      },
    ],
  };
}

export function workstreamDecisionRows(): WorkstreamDecisionRow[] {
  return WORKSTREAMS.map((workstream) => ({
    id: workstream.id,
    name: workstream.name,
    short: workstream.short,
    costSEK: workstream.costSEK,
    benefitSEK: workstream.benefitSEK,
    multiple: workstreamBenefitMultiple(workstream),
    riskCount: risksForWorkstream(workstream.id).length,
    primaryOutcome: workstream.yearOneOutcome,
  })).sort((a, b) => b.multiple - a.multiple);
}
