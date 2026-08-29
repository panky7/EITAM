import { TOTAL_FULL_BENEFIT, TOTAL_FULL_COST } from '../data/derived';
import { WORKSTREAMS, type WorkstreamId } from '../data/workstreams';

export interface CapabilityMaturity {
  current: number;
  projected: number;
  target: number;
}

export interface CapabilityRoiPillars {
  money: number;
  security: number;
  complianceReadiness: number;
  incidentResponse: number;
}

export interface CapabilityRoiSummary {
  budgetSEK: number;
  valueSEK: number;
  multiple: number;
  fundedScopePct: number;
  maturity: CapabilityMaturity;
  pillars: CapabilityRoiPillars;
}

export interface ScopedCapabilityRoiSummary extends CapabilityRoiSummary {
  scopeCostSEK: number;
  scopeBenefitSEK: number;
}

export type ModelScopePresetId =
  | 'minimum_viable'
  | 'security_first'
  | 'compliance_ready'
  | 'full_uplift';

export interface ModelScopePreset {
  id: ModelScopePresetId;
  label: string;
  budgetSEK: number;
  workstreamIds: WorkstreamId[];
}

export interface CapabilityRow {
  name: string;
  outcome: string;
  currentMaturity: number;
  projectedMaturity: number;
  returnSignalPct: number;
}

const CURRENT_MATURITY = 1;
const TARGET_MATURITY = 3;
const MAX_SECURITY_REDUCTION_PCT = 20;
const MAX_COMPLIANCE_READINESS_PCT = 80;
const MAX_INCIDENT_RESPONSE_UPLIFT_PCT = 30;

const CAPABILITY_INPUTS = [
  {
    name: 'Physical IT asset management',
    outcome: 'Trusted endpoint and network inventory',
    weight: 0.98,
  },
  {
    name: 'Asset discovery and reconciliation',
    outcome: 'Fewer unknown assets and stronger CMDB quality',
    weight: 0.94,
  },
  {
    name: 'Security posture integration',
    outcome: 'Qualys-driven vulnerability and asset-risk context',
    weight: 0.88,
  },
  {
    name: 'AI asset management',
    outcome: 'EU AI Act readiness and controlled AI inventory',
    weight: 0.82,
  },
  {
    name: 'Cloud and on-prem asset management',
    outcome: 'Risk, ownership and lifecycle visibility',
    weight: 0.76,
  },
  {
    name: 'Software and license governance',
    outcome: 'Optimization of licenses and unused-device value',
    weight: 0.72,
  },
  {
    name: 'OT / industrial asset visibility',
    outcome: 'Baseline risk classification and resilience',
    weight: 0.58,
  },
  {
    name: 'Business ownership and data quality',
    outcome: 'Validated stewardship with business appreciation',
    weight: 0.9,
  },
];

const MODEL_SCOPE_PRESETS: Record<ModelScopePresetId, Omit<ModelScopePreset, 'id'>> = {
  minimum_viable: {
    label: 'Minimum viable',
    budgetSEK: 17_250_000,
    workstreamIds: ['hardware', 'ai'],
  },
  security_first: {
    label: 'Security first',
    budgetSEK: 31_050_000,
    workstreamIds: ['hardware', 'ai', 'cloud', 'ot'],
  },
  compliance_ready: {
    label: 'Compliance ready',
    budgetSEK: 22_425_000,
    workstreamIds: ['ai', 'cloud', 'software'],
  },
  full_uplift: {
    label: 'Full uplift',
    budgetSEK: TOTAL_FULL_COST,
    workstreamIds: WORKSTREAMS.map((workstream) => workstream.id),
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function fundingCoverage(budgetSEK: number, fullCostSEK = TOTAL_FULL_COST): number {
  return fullCostSEK > 0 ? clamp(Math.max(0, budgetSEK) / fullCostSEK, 0, 1) : 0;
}

function maturityFromCoverage(coverage: number): number {
  return CURRENT_MATURITY + (TARGET_MATURITY - CURRENT_MATURITY) * coverage;
}

export function capabilityRoiSummary(
  budgetSEK: number,
  fullCostSEK = TOTAL_FULL_COST,
  fullBenefitSEK = TOTAL_FULL_BENEFIT,
): CapabilityRoiSummary {
  const coverage = fundingCoverage(budgetSEK, fullCostSEK);
  const valueSEK = fullBenefitSEK * coverage;
  const usedBudgetSEK = Math.max(0, Math.min(budgetSEK, fullCostSEK));

  return {
    budgetSEK: usedBudgetSEK,
    valueSEK,
    multiple: usedBudgetSEK > 0 ? valueSEK / usedBudgetSEK : 0,
    fundedScopePct: Math.round(coverage * 100),
    maturity: {
      current: CURRENT_MATURITY,
      projected: maturityFromCoverage(coverage),
      target: TARGET_MATURITY,
    },
    pillars: {
      money: Math.round(coverage * 100),
      security: Math.round(MAX_SECURITY_REDUCTION_PCT * coverage),
      complianceReadiness: Math.round(MAX_COMPLIANCE_READINESS_PCT * coverage),
      incidentResponse: Math.round(MAX_INCIDENT_RESPONSE_UPLIFT_PCT * coverage),
    },
  };
}

export function scopedCapabilityRoiSummary(
  selectedWorkstreamIds: Set<WorkstreamId>,
  budgetSEK: number,
): ScopedCapabilityRoiSummary {
  const selected = WORKSTREAMS.filter((workstream) =>
    selectedWorkstreamIds.has(workstream.id),
  );
  const scopeCostSEK = selected.reduce(
    (sum, workstream) => sum + workstream.costSEK,
    0,
  );
  const scopeBenefitSEK = selected.reduce(
    (sum, workstream) => sum + workstream.benefitSEK,
    0,
  );
  const summary = capabilityRoiSummary(budgetSEK, scopeCostSEK, scopeBenefitSEK);

  return {
    ...summary,
    scopeCostSEK,
    scopeBenefitSEK,
  };
}

export function modelScopePreset(id: ModelScopePresetId): ModelScopePreset {
  return {
    id,
    ...MODEL_SCOPE_PRESETS[id],
  };
}

export function capabilityRows(
  budgetSEK: number,
  fullCostSEK = TOTAL_FULL_COST,
): CapabilityRow[] {
  const coverage = fundingCoverage(budgetSEK, fullCostSEK);

  return CAPABILITY_INPUTS.map((capability) => {
    const capabilityCoverage = clamp(coverage * capability.weight, 0, 1);

    return {
      name: capability.name,
      outcome: capability.outcome,
      currentMaturity: CURRENT_MATURITY,
      projectedMaturity: maturityFromCoverage(coverage),
      returnSignalPct: Math.round(capabilityCoverage * 100),
    };
  });
}
