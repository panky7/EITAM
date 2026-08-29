export interface KnowledgeMetric {
  label: string;
  target: string;
}

export interface KnowledgeColumn {
  title: string;
  points: string[];
  metrics?: KnowledgeMetric[];
}

export interface KnowledgeCard {
  id: 'category-outcomes' | 'data-thon' | 'value-framework';
  title: string;
  summary: string;
  eyebrow: string;
  lead: string;
  columns: KnowledgeColumn[];
  outcome: string;
}

export const ROADMAP_KNOWLEDGE_CARDS: KnowledgeCard[] = [
  {
    id: 'category-outcomes',
    title: 'Asset Category Outcomes',
    summary: '5 asset domains | Y1 outcome + future ambition',
    eyebrow: 'Outcomes by domain',
    lead:
      'Expected outcomes across Hardware, Cloud, Software, OT and AI, delivered through an iterative, value-led transformation approach.',
    columns: [
      {
        title: 'Hardware',
        points: [
          'Y1: >90% visibility, governed ownership, lifecycle controls and cyber/ITSM asset intelligence use cases.',
          'Beyond: predictive lifecycle management and broader asset intelligence analytics.',
        ],
      },
      {
        title: 'Cloud',
        points: [
          'Y1: Azure inventory, ownership, lifecycle controls and CMDB relationships.',
          'Beyond: GCP/AWS governance, service mapping, vulnerability correlation and FinOps optimisation.',
        ],
      },
      {
        title: 'Software',
        points: [
          'Y1: application inventory, ownership, licence transparency and prioritised optimisation opportunities.',
          'Beyond: SAM implementation, licence optimisation, contract intelligence and value recovery.',
        ],
      },
      {
        title: 'OT',
        points: [
          'Y1: critical OT visibility, ownership model, lifecycle requirements and dependency mapping.',
          'Beyond: monitoring, automated discovery, vulnerability integration and resilience reporting.',
        ],
      },
      {
        title: 'AI Assets',
        points: [
          'Y1: AI registry, ownership, metadata model, governance workflows and EU AI Act readiness controls.',
          'Beyond: AI intelligence layer, automated compliance monitoring and predictive AI risk analytics.',
        ],
      },
    ],
    outcome:
      'Creates a category-by-category view of where capability lands in year one and what becomes possible next.',
  },
  {
    id: 'data-thon',
    title: '6-Month Data-thon',
    summary: 'Benefits, uptake, data products, scale roadmap',
    eyebrow: 'Value discovery cycle',
    lead:
      'A structured mechanism to demonstrate value, increase uptake and translate asset data improvements into measurable business outcomes.',
    columns: [
      {
        title: 'Flow',
        points: [
          'Prioritise use cases across cyber, ITSM, compliance, cost and operational resilience.',
          'Build reusable data products and business-ready dashboard views.',
          'Measure visibility uplift, adoption, risk reduction, efficiency and cost opportunities.',
          'Drive uptake through BAU forums, governance and decision-making routines.',
        ],
      },
      {
        title: 'Outputs after 6 months',
        points: [
          'Benefits and uptake dashboard.',
          'Asset intelligence backlog.',
          'Reusable data products.',
          'Adoption actions and scale recommendations.',
        ],
      },
      {
        title: 'Programme value',
        points: [
          'Clearer evidence of where trusted asset data is consumed.',
          'Reduced manual effort and fewer data exceptions.',
          'Improved impact analysis and vulnerability context.',
          'Prioritised backlog for the next roadmap cycle.',
        ],
      },
    ],
    outcome:
      'Gives the programme evidence of value, adoption and scale-up priorities across the wider transformation.',
  },
  {
    id: 'value-framework',
    title: 'Strategic Value Framework',
    summary: 'Visibility, compliance, cyber risk, efficiency',
    eyebrow: 'How value is measured',
    lead:
      'How improved asset visibility, ownership and governance translate into measurable business outcomes.',
    columns: [
      {
        title: 'Enterprise Visibility & Control',
        points: [
          'Improve enterprise asset coverage, accountability, data trust and lifecycle governance.',
        ],
        metrics: [
          { label: 'Asset coverage', target: '>95%' },
          { label: 'Ownership completeness', target: '>95%' },
          { label: 'Data quality score', target: '>90%' },
          { label: 'Tech domains coverage', target: '100%' },
        ],
      },
      {
        title: 'Operational Efficiency & Compliance',
        points: [
          'Improve operational processes, service management effectiveness, governance adoption and audit readiness.',
        ],
        metrics: [
          { label: 'Manual effort', target: '50% reduction' },
          { label: 'Data exceptions', target: '75% reduction' },
          { label: 'Governance adoption', target: 'Embedded into BAU roles' },
          { label: 'Compliance readiness', target: '50% reduction' },
        ],
      },
      {
        title: 'Cyber Resilience & Risk Reduction',
        points: [
          'Improve asset-risk visibility, critical asset awareness, vulnerability context and technology risk management.',
        ],
        metrics: [
          { label: 'Critical asset visibility', target: '>95%' },
          { label: 'Risk coverage', target: '100%' },
          { label: 'Vulnerability correlation', target: '>90%' },
          { label: 'Unmanaged technology risk', target: '80% reduction' },
        ],
      },
    ],
    outcome:
      'Maintains a trusted, governed and sustainable asset foundation for decisions, risk, compliance and transformation.',
  },
];
