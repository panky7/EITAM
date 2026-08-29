export type RoadmapFilter = 'all' | 'foundation' | 'risk' | 'compliance' | 'value';

export type RoadmapTone = 'green' | 'blue' | 'purple' | 'amber' | 'red';

export interface RoadmapItem {
  id: string;
  title: string;
  tags: Exclude<RoadmapFilter, 'all'>[];
  tone: RoadmapTone;
  quarterIndex: number;
  startPct: number;
  widthPct: number;
  row: 1 | 2;
}

export interface RoadmapCell {
  stage?: string;
  items: RoadmapItem[];
}

export interface RoadmapLane {
  id: string;
  label: string;
  description: string;
  section: 'sustain' | 'ambition';
  cells: RoadmapCell[];
}

export const ROADMAP_LANES: RoadmapLane[] = [
  {
    id: 'hardware',
    label: 'Hardware',
    description:
      'Foundation established: hardware visibility, data quality and governance.',
    section: 'sustain',
    cells: [
      {
        stage: 'Continue CMDB data uplift',
        items: [
          {
            id: '1.1',
            title:
              'Continue to automate and integrate discovery across remaining asset tools: Zebra, HP, Canon, Kandji, SCCM.',
            tags: ['foundation', 'risk'],
            tone: 'green',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '1.2',
            title:
              'Establish foundation across data quality and governance, including ownership, location enrichment and lifecycle governance.',
            tags: ['foundation'],
            tone: 'green',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 75,
            row: 2,
          },
        ],
      },
      {
        stage: 'Continue CMDB data uplift',
        items: [
          {
            id: '1.3',
            title: 'BAU data quality KPI monitoring and governance.',
            tags: ['foundation', 'value'],
            tone: 'green',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '1.4',
            title:
              'Enable service mapping and establish asset linkage across capability model.',
            tags: ['risk', 'value'],
            tone: 'green',
            quarterIndex: 1,
            startPct: 50,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Operational Intelligence',
        items: [
          {
            id: '1.5',
            title:
              'Enable asset intelligence through automation: incident management integration, vulnerability visibility and service desk dependency mapping.',
            tags: ['risk', 'value'],
            tone: 'purple',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 100,
            row: 1,
          },
        ],
      },
      { stage: 'Operational Intelligence', items: [] },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    description:
      'AI asset architecture and metadata design established, unlocking further capabilities.',
    section: 'sustain',
    cells: [
      {
        stage: 'Foundation',
        items: [
          {
            id: '2.1',
            title:
              'AI tooling decision and design implementation approach, including platform selection.',
            tags: ['foundation', 'compliance'],
            tone: 'blue',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 75,
            row: 1,
          },
          {
            id: '2.2',
            title: 'Implementation readiness: operating model and integrations.',
            tags: ['foundation'],
            tone: 'blue',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 75,
            row: 2,
          },
        ],
      },
      {
        stage: 'Implementation',
        items: [
          {
            id: '2.3',
            title:
              'AI Asset Management target architecture implementation: registry, workflow automation, CMDB integration, reporting and dashboards.',
            tags: ['compliance', 'risk'],
            tone: 'blue',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 100,
            row: 1,
          },
        ],
      },
      {
        stage: 'Monitoring and reporting',
        items: [
          {
            id: '2.4',
            title:
              'Risk and compliance activation: EU AI Act controls and assessments.',
            tags: ['compliance', 'risk'],
            tone: 'blue',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '2.6',
            title: 'Enterprise governance adoption: onboarding and governance.',
            tags: ['compliance', 'value'],
            tone: 'blue',
            quarterIndex: 2,
            startPct: 50,
            widthPct: 50,
            row: 1,
          },
        ],
      },
      {
        stage: 'Monitoring and reporting',
        items: [
          {
            id: '2.5',
            title: 'Continuous compliance.',
            tags: ['compliance'],
            tone: 'blue',
            quarterIndex: 3,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'ot',
    label: 'OT',
    description:
      'OT baseline established, revealing critical dependencies and transformation opportunities.',
    section: 'sustain',
    cells: [
      { items: [] },
      { items: [] },
      {
        stage: 'Target Architecture Design',
        items: [
          {
            id: '3.1',
            title: 'Extend OT baseline.',
            tags: ['foundation', 'risk'],
            tone: 'amber',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 25,
            row: 1,
          },
          {
            id: '3.2',
            title:
              'Lifecycle model, accountability, lifecycle status and governance requirements.',
            tags: ['risk'],
            tone: 'amber',
            quarterIndex: 2,
            startPct: 25,
            widthPct: 50,
            row: 1,
          },
        ],
      },
      {
        stage: 'Lower-level design for implementation',
        items: [
          {
            id: '3.3',
            title:
              'Monitoring and discovery design: sensor/tooling approach, data capture and reporting design.',
            tags: ['risk'],
            tone: 'amber',
            quarterIndex: 3,
            startPct: 0,
            widthPct: 75,
            row: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'ambition',
    label: 'Raise the ambition',
    description: 'Expanded capability scope beyond the established foundation.',
    section: 'ambition',
    cells: [
      { stage: 'Set-up Foundation', items: [] },
      { stage: 'Design Finalisation', items: [] },
      { stage: 'Implementation', items: [] },
      { stage: 'Operational Intelligence', items: [] },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud (Azure > GCP > AWS > Others)',
    description:
      'Cloud roadmap moves from reconciliation to multi-cloud asset intelligence.',
    section: 'ambition',
    cells: [
      {
        stage: 'Set-up Foundation',
        items: [
          {
            id: '4.1',
            title:
              'Cloud asset reconciliation: inventory, perimeter alignment, subscriptions, ownership and priorities.',
            tags: ['foundation', 'risk'],
            tone: 'green',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 75,
            row: 1,
          },
          {
            id: '4.3',
            title:
              'Prioritised cloud use cases: IAM, cyber security and vulnerability management.',
            tags: ['risk'],
            tone: 'green',
            quarterIndex: 0,
            startPct: 0,
            widthPct: 75,
            row: 2,
          },
        ],
      },
      {
        stage: 'Design Finalisation',
        items: [
          {
            id: '4.4',
            title:
              'Cloud asset architecture enhancement, including CMDB linkage and relationships.',
            tags: ['foundation', 'value'],
            tone: 'green',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '4.5',
            title:
              'Cloud data model and governance: ownership, lifecycle and controls.',
            tags: ['foundation'],
            tone: 'green',
            quarterIndex: 1,
            startPct: 50,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Implementation',
        items: [
          {
            id: '4.6',
            title:
              'Cloud integration and onboarding: Azure automated ingestion and visibility.',
            tags: ['foundation', 'risk'],
            tone: 'green',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '4.7',
            title: 'Data quality and governance activation and KPI monitoring.',
            tags: ['value'],
            tone: 'green',
            quarterIndex: 2,
            startPct: 50,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Operational Intelligence',
        items: [
          {
            id: '4.8',
            title: 'Multi-cloud expansion: GCP and AWS onboarding.',
            tags: ['foundation'],
            tone: 'green',
            quarterIndex: 3,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '4.9',
            title: 'Cloud Asset Intelligence mapping.',
            tags: ['value'],
            tone: 'green',
            quarterIndex: 3,
            startPct: 50,
            widthPct: 25,
            row: 2,
          },
          {
            id: '4.10',
            title: 'FinOps and technology optimisation.',
            tags: ['value'],
            tone: 'green',
            quarterIndex: 3,
            startPct: 75,
            widthPct: 25,
            row: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'software',
    label: 'Software',
    description:
      'Software baseline, data governance, risk alignment and SAM roadmap.',
    section: 'ambition',
    cells: [
      { items: [] },
      {
        stage: 'Set-up Foundation',
        items: [
          {
            id: '5.1',
            title:
              'Software asset baseline: application/license inventory and ownership.',
            tags: ['foundation', 'value'],
            tone: 'amber',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '5.2',
            title:
              'Priority use case: compliance, security and cost optimisation.',
            tags: ['compliance', 'value'],
            tone: 'amber',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Design and Architecture',
        items: [
          {
            id: '5.4',
            title: 'Software data model and governance.',
            tags: ['foundation'],
            tone: 'amber',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '5.5',
            title:
              'Data gap analysis and risk alignment for visibility, contract value optimisation and compliance.',
            tags: ['risk', 'compliance', 'value'],
            tone: 'amber',
            quarterIndex: 2,
            startPct: 50,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Design and Architecture',
        items: [
          {
            id: '5.6',
            title:
              'SAM implementation roadmap: priorities, phasing and dependencies.',
            tags: ['value', 'compliance'],
            tone: 'amber',
            quarterIndex: 3,
            startPct: 0,
            widthPct: 75,
            row: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'newemerging',
    label: 'New and Emerging Projects',
    description:
      'Data products, benefits visibility, strategic outcome tracking and adoption.',
    section: 'sustain',
    cells: [
      { stage: 'Establish data foundation structures and data model', items: [] },
      {
        stage: 'Benefits visibility',
        items: [
          {
            id: '6.1.1',
            title: 'Asset data products and consumption.',
            tags: ['value'],
            tone: 'purple',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
          {
            id: '6.1.2',
            title:
              'Benefits, control, value and strategic outcome tracking.',
            tags: ['value'],
            tone: 'purple',
            quarterIndex: 1,
            startPct: 0,
            widthPct: 50,
            row: 2,
          },
        ],
      },
      {
        stage: 'Change adoption',
        items: [
          {
            id: '6.1.3',
            title: 'Enterprise Asset Intelligence and Change adoption.',
            tags: ['value'],
            tone: 'purple',
            quarterIndex: 2,
            startPct: 0,
            widthPct: 50,
            row: 1,
          },
        ],
      },
      { stage: 'Scale uptake', items: [] },
    ],
  },
];
