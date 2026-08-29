import type { WorkstreamId } from './workstreams';

export type RiskSeverity = 'high' | 'medium' | 'ready';

export interface EnterpriseRisk {
  id: string;
  title: string;
  severity: RiskSeverity;
  businessImpact: string[];
  affectedWorkstreamIds: WorkstreamId[];
  leadershipAsk: string;
}

export interface AiReadinessDomain {
  id: string;
  title: string;
  readinessPct: number;
  description: string;
  evidenceNeeded: string[];
}

export const ENTERPRISE_RISKS: EnterpriseRisk[] = [
  {
    id: 'incomplete-visibility',
    title: 'Incomplete enterprise asset visibility',
    severity: 'high',
    affectedWorkstreamIds: ['cloud', 'software', 'ai', 'ot'],
    businessImpact: [
      'Partial cyber and operational visibility across the enterprise estate.',
      'Increased risk of unmanaged or unidentified assets.',
      'Reduced effectiveness of incident, vulnerability and compliance management.',
      'Limited ability to establish an enterprise-wide single source of truth.',
    ],
    leadershipAsk:
      'Expand coverage across Cloud, Software, AI and OT asset classes to reduce unmanaged technology risk.',
  },
  {
    id: 'data-regression',
    title: 'Data quality regression and sustainability risk',
    severity: 'medium',
    affectedWorkstreamIds: ['hardware', 'cloud', 'software', 'ai', 'ot'],
    businessImpact: [
      'Reintroduction of stale or manually maintained records.',
      'Reduced audit readiness and control effectiveness.',
      'Inconsistent operational execution across regions and support teams.',
    ],
    leadershipAsk:
      'Sustain operational ownership and governance adoption to protect CMDB quality and lifecycle controls.',
  },
  {
    id: 'delivery-dependencies',
    title: 'Vendor, tool-owner and regional dependency risk',
    severity: 'medium',
    affectedWorkstreamIds: ['hardware', 'cloud', 'software', 'ai', 'ot'],
    businessImpact: [
      'Delayed onboarding of remaining asset classes and tools.',
      'Inconsistent operational standards and ownership accountability.',
      'Fragmented processes across vendors, platforms and regions.',
    ],
    leadershipAsk:
      'Maintain cross-functional collaboration across Cyber Security, Enterprise Architecture, Operations and GRC.',
  },
  {
    id: 'value-scale',
    title: 'Asset Intelligence value scale-up risk',
    severity: 'high',
    affectedWorkstreamIds: ['ai', 'newemerging', 'cloud', 'software'],
    businessImpact: [
      'Reduced return on transformation value already activated.',
      'Delayed AI governance and regulatory readiness capability.',
      'Reduced opportunity for AI-driven operational resilience and predictive insight.',
    ],
    leadershipAsk:
      'Continue executive sponsorship for Asset Management as a service capability.',
  },
];

export const AI_READINESS_DOMAINS: AiReadinessDomain[] = [
  {
    id: 'registry',
    title: 'AI registry completeness',
    readinessPct: 42,
    description:
      'A central AI asset registry with system, owner, purpose, lifecycle, usage and business-capability context.',
    evidenceNeeded: [
      'Inventory of AI tools, models and use cases.',
      'Named business and technical owners.',
      'Lifecycle state and approved usage scope.',
    ],
  },
  {
    id: 'metadata',
    title: 'Metadata and architecture',
    readinessPct: 35,
    description:
      'Target metadata model, CMDB integration and relationship mapping for AI assets.',
    evidenceNeeded: [
      'Metadata schema for AI assets.',
      'Relationship mapping into CMDB and enterprise architecture.',
      'Integration pattern for reporting and dashboards.',
    ],
  },
  {
    id: 'classification',
    title: 'EU AI Act risk classification',
    readinessPct: 24,
    description:
      'Classification workflow for prohibited, high-risk, limited-risk and transparency-obligation AI systems.',
    evidenceNeeded: [
      'Risk classification decision record.',
      'Assessment workflow and approval trail.',
      'Controls mapped to applicable EU AI Act obligations.',
    ],
  },
  {
    id: 'compliance',
    title: 'Continuous compliance and evidence',
    readinessPct: 18,
    description:
      'Operational monitoring, audit evidence, issue handling and compliance reporting.',
    evidenceNeeded: [
      'Compliance dashboard and evidence repository.',
      'Incident and change-management linkage.',
      'Periodic reassessment and control monitoring cadence.',
    ],
  },
];
