import { TOTAL_FULL_BENEFIT } from './derived';

export type PartnerId = 'EY' | 'Accenture' | 'TCS';
export type PartnerContributionId = 'ey' | 'tcs' | 'accenture' | 'hm';
export type PartnerContributionCategory =
  | 'financial'
  | 'security'
  | 'compliance'
  | 'incident'
  | 'adoption';

export interface Partner {
  id: PartnerId;
  fullScopeCostSEK: number;
}

export interface PartnerContribution {
  id: PartnerContributionId;
  name: string;
  role: string;
  investmentSEK: number;
  valueSEK: number;
  color: string;
  categories: PartnerContributionCategory[];
  scope: string[];
  successSignals: string[];
}

export interface PartnerChartDatum {
  id: PartnerContributionId;
  name: string;
  value: number;
  color: string;
}

export const PARTNERS: Partner[] = [
  { id: 'EY', fullScopeCostSEK: 30_000_000 },
  { id: 'Accenture', fullScopeCostSEK: 3_000_000 },
  { id: 'TCS', fullScopeCostSEK: 8_400_000 },
];

export const PARTNER_IDS = PARTNERS.map((partner) => partner.id);

export const PARTNER_FULL_ANNUAL_COST: Record<PartnerId, number> = {
  EY: 30_000_000,
  Accenture: 3_000_000,
  TCS: 8_400_000,
};

export const PARTNER_SHARE_STARTS_IN_Q1: Record<PartnerId, number> = {
  EY: 6_250_000,
  Accenture: 625_000,
  TCS: 1_750_000,
};

export const PARTNER_SHARE_STARTS_MONTH4: Record<PartnerId, number> = {
  EY: 3_750_000,
  Accenture: 375_000,
  TCS: 1_050_000,
};

export const PARTNER_MODEL: PartnerContribution[] = [
  {
    id: 'ey',
    name: 'EY',
    role: 'Strategic partner and assurer',
    investmentSEK: 30_000_000,
    valueSEK: 8_000_000,
    color: '#071B4D',
    categories: ['compliance', 'adoption', 'security'],
    scope: [
      'Roadmap assurance, value governance and executive steering support.',
      'Architecture and control validation across delivery partners.',
      'Quality challenge for scope, sequencing, benefits and risk decisions.',
    ],
    successSignals: [
      'Governed roadmap with clear assurance points.',
      'Board-ready business case and value narrative.',
      'Delivery quality challenged across partners and workstreams.',
    ],
  },
  {
    id: 'tcs',
    name: 'TCS',
    role: 'Data foundation, clean-up and governance support',
    investmentSEK: 8_400_000,
    valueSEK: 11_000_000,
    color: '#4F7D2A',
    categories: ['financial', 'compliance', 'adoption'],
    scope: [
      'Hardware data clean-up and enrichment across ownership, location, lifecycle and CI quality.',
      'Cloud asset data quality and governance support across Azure, GCP and AWS.',
      'SAM readiness data support for applications, licences, subscriptions and implementation inputs.',
      'AI registry data quality and compliance evidence readiness.',
    ],
    successSignals: [
      '>90% data completeness.',
      '>95% ownership coverage.',
      '>75% reduction in duplicate/orphaned records.',
      'BAU governance and monitoring operationalised.',
    ],
  },
  {
    id: 'accenture',
    name: 'Accenture',
    role: 'Platform and tooling enablement',
    investmentSEK: 3_000_000,
    valueSEK: 12_000_000,
    color: '#C9002B',
    categories: ['security', 'incident', 'compliance'],
    scope: [
      'Automated ingestion, reconciliation and relationship mapping across priority asset domains.',
      'Hardware source integrations including discovery automation and CMDB reconciliation.',
      'Cloud inventory, CMDB relationships, governance workflows, dashboards and reporting.',
      'AI registry, metadata model, lifecycle workflows, CMDB integration and reporting enablement.',
      'Incident, vulnerability and service management asset context.',
    ],
    successSignals: [
      '>90% automated asset visibility coverage.',
      '100% onboarding of priority asset sources.',
      '3+ operational intelligence use cases enabled.',
      '>50% reduction in manual reconciliation effort.',
    ],
  },
  {
    id: 'hm',
    name: 'H&M + Business Units',
    role: 'Internal vision, ownership and adoption engine',
    investmentSEK: 0,
    valueSEK: 12_000_000,
    color: '#B27900',
    categories: ['adoption', 'security', 'financial'],
    scope: [
      'Cyber security architect leadership for vision, enterprise-risk framing and security alignment.',
      'Business-unit ownership for data validation, stewardship and value-led adoption.',
      'Enterprise architecture contribution for service mapping, capability alignment and target architecture coherence.',
    ],
    successSignals: [
      'Business ownership activated across priority asset domains.',
      'Asset data consumed by cyber, operations, finance and transformation teams.',
      'Enterprise architecture alignment embedded in roadmap decisions.',
    ],
  },
];

export function partnerInvestmentChartData(): PartnerChartDatum[] {
  return PARTNER_MODEL.filter((partner) => partner.investmentSEK > 0).map(
    (partner) => ({
      id: partner.id,
      name: partner.name,
      value: partner.investmentSEK,
      color: partner.color,
    }),
  );
}

export function partnerValueChartData(): PartnerChartDatum[] {
  return PARTNER_MODEL.map((partner) => ({
    id: partner.id,
    name: partner.name,
    value: partner.valueSEK,
    color: partner.color,
  }));
}

export const PARTNER_VALUE_TOTAL = PARTNER_MODEL.reduce(
  (sum, partner) => sum + partner.valueSEK,
  0,
);

if (PARTNER_VALUE_TOTAL !== TOTAL_FULL_BENEFIT) {
  throw new Error('Partner value allocation must equal total full benefit.');
}
