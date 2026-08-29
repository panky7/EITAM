export type WorkstreamId =
  | 'hardware'
  | 'ai'
  | 'cloud'
  | 'ot'
  | 'software'
  | 'newemerging';

export type ValueHighlightCategory =
  | 'risk'
  | 'incident'
  | 'transformation'
  | 'asset_mapping';

export interface ValueHighlight {
  category: ValueHighlightCategory;
  label: string;
  description: string;
}

export interface Workstream {
  id: WorkstreamId;
  name: string;
  short: string;
  costSEK: number;
  benefitSEK: number;
  startsInQ1: boolean;
  blurb: string;
  yearOneOutcome: string;
  yearTwoOutcome: string;
  scopeItems: string[];
  riskFocus: string[];
  roadmapEvidence: string[];
  valueHighlights: ValueHighlight[];
}

const VALUE_HIGHLIGHTS: Record<ValueHighlightCategory, ValueHighlight> = {
  risk: {
    category: 'risk',
    label: 'Reduced enterprise risk',
    description:
      'Reduces exposure tied to asset visibility, lifecycle governance, and control gaps.',
  },
  incident: {
    category: 'incident',
    label: 'Incident response uplift',
    description:
      'Improves detection, triage, and operational response through better asset context.',
  },
  transformation: {
    category: 'transformation',
    label: 'Transformation enablement',
    description:
      'Strengthens operating-model maturity and change readiness beyond the technical deliverable.',
  },
  asset_mapping: {
    category: 'asset_mapping',
    label: 'Central asset mapping',
    description:
      'Improves single-source-of-truth accuracy for CMDB and asset relationship data.',
  },
};

export const WORKSTREAMS: Workstream[] = [
  {
    id: 'hardware',
    name: 'Hardware',
    short: 'WS1',
    costSEK: 8_625_000,
    benefitSEK: 19_250_000,
    startsInQ1: true,
    blurb:
      'Discovery/integration uplift, CMDB governance, operational intelligence use cases.',
    yearOneOutcome:
      'Trusted hardware asset foundation operationalised with >90% visibility across priority hardware assets, governed ownership, lifecycle controls and cyber/ITSM asset intelligence use cases enabled.',
    yearTwoOutcome:
      'Predictive lifecycle management and broader asset intelligence analytics.',
    scopeItems: [
      'Automate and integrate discovery across remaining asset tools including Zebra, HP, Canon, Kandji and SCCM.',
      'Strengthen ownership, location enrichment, manual entry standardisation and lifecycle governance.',
      'Enable incident, vulnerability and service desk dependency mapping with trusted asset context.',
    ],
    riskFocus: [
      'Incomplete hardware visibility across remaining asset tools.',
      'Stale or duplicate CMDB records reducing operational trust.',
      'Weak asset context for incident and vulnerability response.',
    ],
    roadmapEvidence: [
      'Roadmap references up to 60% hardware visibility uplift and up to 90% target CMDB uplift.',
      'Current programme highlights include 362k asset baseline and 136k CI retire/archive actions.',
    ],
    valueHighlights: [
      VALUE_HIGHLIGHTS.risk,
      VALUE_HIGHLIGHTS.incident,
      VALUE_HIGHLIGHTS.asset_mapping,
    ],
  },
  {
    id: 'ai',
    name: 'AI Assets',
    short: 'WS2',
    costSEK: 8_625_000,
    benefitSEK: 3_500_000,
    startsInQ1: true,
    blurb:
      'AI registry, metadata model, EU AI Act governance and lifecycle workflows.',
    yearOneOutcome:
      'AI governance capability operationalised through AI registry, ownership, metadata model, governance workflows and EU AI Act readiness controls.',
    yearTwoOutcome:
      'AI asset intelligence layer, automated compliance monitoring, predictive AI risk analytics and integration into enterprise architecture and business capability models.',
    scopeItems: [
      'Confirm AI tooling decision, target architecture and lower-level implementation design.',
      'Implement AI registry, metadata model, lifecycle workflows, CMDB integration and dashboards.',
      'Activate risk, compliance, audit reporting and EU AI Act control assessments.',
    ],
    riskFocus: [
      'Unidentified or unmanaged AI tools and models.',
      'Incomplete ownership, purpose, lifecycle and compliance metadata.',
      'Delayed EU AI Act readiness and weak audit evidence.',
    ],
    roadmapEvidence: [
      'Roadmap calls for AI registry, workflow automation, CMDB integration, reporting and dashboards.',
      'Strategic priorities include alignment with EU AI Act and H&M compliance requirements.',
    ],
    valueHighlights: [VALUE_HIGHLIGHTS.risk, VALUE_HIGHLIGHTS.transformation],
  },
  {
    id: 'cloud',
    name: 'Cloud',
    short: 'WS3',
    costSEK: 8_625_000,
    benefitSEK: 7_000_000,
    startsInQ1: true,
    blurb:
      'Azure baseline, CMDB linkage, multi-cloud roadmap, FinOps requirements.',
    yearOneOutcome:
      'Cloud asset visibility and governance operationalised including inventory, ownership, lifecycle controls and CMDB relationships for one cloud platform.',
    yearTwoOutcome:
      'Establish multi-cloud governance, cloud-to-business service mapping, operational impact analysis, vulnerability correlation and FinOps optimisation.',
    scopeItems: [
      'Reconcile Azure cloud inventory, perimeter, subscriptions, ownership and criticality.',
      'Enhance cloud asset architecture with CMDB linkage and relationships.',
      'Prepare multi-cloud expansion across GCP and AWS plus FinOps and technology optimisation use cases.',
    ],
    riskFocus: [
      'Partial cloud estate visibility and missing subscription ownership.',
      'Limited asset-to-business relationship mapping for cloud services.',
      'Reduced effectiveness of IAM, vulnerability and FinOps decisions.',
    ],
    roadmapEvidence: [
      'Roadmap phases Cloud from Azure onboarding toward GCP, AWS and others.',
      'Cloud priorities include data quality, governance activation and prioritised cyber use cases.',
    ],
    valueHighlights: [VALUE_HIGHLIGHTS.risk, VALUE_HIGHLIGHTS.asset_mapping],
  },
  {
    id: 'ot',
    name: 'Operational Technology',
    short: 'WS4',
    costSEK: 5_175_000,
    benefitSEK: 4_750_000,
    startsInQ1: false,
    blurb: 'Warehouse OT baseline, ownership model, monitoring & discovery design.',
    yearOneOutcome:
      'OT asset baseline and governance model defined with visibility of critical OT assets, ownership model, lifecycle requirements and critical dependency mapping.',
    yearTwoOutcome:
      'OT monitoring implementation, automated discovery expansion, vulnerability integration, operational resilience reporting and broader OT asset coverage.',
    scopeItems: [
      'Extend the OT baseline across warehouses, stores and wider operational assets.',
      'Define OT ownership, accountability, lifecycle status and governance requirements.',
      'Design monitoring and discovery approach, including sensor tooling and reporting.',
    ],
    riskFocus: [
      'Operational technology assets not visible in enterprise asset governance.',
      'Critical dependencies not mapped for warehouse and store resilience.',
      'Limited vulnerability context for operational environments.',
    ],
    roadmapEvidence: [
      'Roadmap identifies 4,128 OT assets in owned warehouses, including assets with 0% prior visibility.',
      'Strategic priorities call for scalable sensor-based OT discovery and operational monitoring.',
    ],
    valueHighlights: [VALUE_HIGHLIGHTS.risk, VALUE_HIGHLIGHTS.incident],
  },
  {
    id: 'software',
    name: 'Software',
    short: 'WS5',
    costSEK: 5_175_000,
    benefitSEK: 6_750_000,
    startsInQ1: false,
    blurb:
      'Software/licence baseline, SAM use cases, target architecture & roadmap.',
    yearOneOutcome:
      'Software visibility baseline established with application inventory, ownership, licence transparency and prioritised optimisation opportunities identified.',
    yearTwoOutcome:
      'Full SAM implementation, licence optimisation automation, contract intelligence, lifecycle governance and ongoing value recovery programme.',
    scopeItems: [
      'Establish software asset baseline across applications, licences and ownership.',
      'Prioritise compliance, security and cost optimisation use cases.',
      'Define SAM target architecture, governance model, data gaps and implementation roadmap.',
    ],
    riskFocus: [
      'Incomplete software ownership and licence inventory.',
      'Limited contract and compliance transparency.',
      'Missed optimisation and value-recovery opportunities.',
    ],
    roadmapEvidence: [
      'Roadmap positions Software as baseline, priority use case, architecture and SAM roadmap work.',
      'Current highlights include $1M+ annual licence savings unlocked from obsolete/duplicate CIs.',
    ],
    valueHighlights: [
      VALUE_HIGHLIGHTS.asset_mapping,
      VALUE_HIGHLIGHTS.transformation,
    ],
  },
  {
    id: 'newemerging',
    name: 'New & Emerging Projects',
    short: 'WS6',
    costSEK: 5_175_000,
    benefitSEK: 1_750_000,
    startsInQ1: false,
    blurb: 'Data products, benefits tracking, 6-month Data-thon, backlog refresh.',
    yearOneOutcome:
      'Reusable asset data products, benefits tracking and strategic outcome tracking established for priority data consumers.',
    yearTwoOutcome:
      'Enterprise Asset Intelligence and change adoption scaled through a prioritised backlog for the next roadmap cycle.',
    scopeItems: [
      'Run the 6-month Data-thon to validate priority business questions and data consumers.',
      'Package curated asset data into business-ready views and dashboards.',
      'Track visible value, uptake, benefit measures and next-cycle scale recommendations.',
    ],
    riskFocus: [
      'Programme value remains difficult to prove without adoption and benefit tracking.',
      'Risk-informed decision-making is delayed if reusable data products are not scaled.',
      'Transformation momentum weakens without a refreshed asset intelligence backlog.',
    ],
    roadmapEvidence: [
      'Roadmap defines Data-thon outputs as benefits dashboard, asset intelligence backlog and adoption actions.',
      'Strategic value framework links asset visibility to optimisation, efficiency, cyber resilience and governance.',
    ],
    valueHighlights: [VALUE_HIGHLIGHTS.transformation],
  },
];
