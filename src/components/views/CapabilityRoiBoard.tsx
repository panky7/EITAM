import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Coins,
  Database,
  Handshake,
  Laptop,
  Layers3,
  Network,
  Rocket,
  Shield,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { InteractiveRoadmapTimeline } from '../InteractiveRoadmapTimeline';
import { TOTAL_FULL_COST } from '../../data/derived';
import {
  ROADMAP_KNOWLEDGE_CARDS,
  type KnowledgeCard,
} from '../../data/knowledgeDeck';
import {
  PARTNER_MODEL,
  type PartnerContribution,
  type PartnerContributionCategory,
} from '../../data/partners';
import {
  capabilityMaturitySummary,
  capabilityRows,
  modelScopePreset,
  scopeWikiRowById,
  scopeWikiRows,
  type ModelScopePresetId,
  type ScopeWikiRow,
  scopedCapabilityRoiSummary,
  scopeIdsCoveredByBudget,
} from '../../lib/capabilityRoi';
import { WORKSTREAMS, type WorkstreamId } from '../../data/workstreams';
import {
  GOOD,
  HM_RED,
  INK,
  M,
  STEEL,
  WARN,
  fmtM,
  fmtX,
} from '../../lib/format';

const presets = [
  { id: 'minimum_viable', icon: Wrench },
  { id: 'security_first', icon: Shield },
  { id: 'compliance_ready', icon: BadgeCheck },
  { id: 'full_uplift', icon: Rocket },
] satisfies Array<{ id: ModelScopePresetId; icon: typeof Wrench }>;

const presetModels = presets.map((preset) => ({
  ...modelScopePreset(preset.id),
  icon: preset.icon,
}));

const topMetrics = [
  {
    label: 'Financial return',
    key: 'financial',
    color: GOOD,
  },
  {
    label: 'Security',
    key: 'security',
    color: HM_RED,
  },
  {
    label: 'Compliance',
    key: 'compliance',
    color: '#5B3AA4',
  },
  {
    label: 'Incident response',
    key: 'incident',
    color: WARN,
  },
];

const knowledgeIcons: Record<KnowledgeCard['id'], typeof Layers3> = {
  'category-outcomes': Layers3,
  'data-thon': Database,
  'value-framework': BarChart3,
};

const partnerIcons: Record<PartnerContribution['id'], typeof ShieldCheck> = {
  ey: ShieldCheck,
  tcs: Database,
  accenture: Wrench,
  hm: Handshake,
};

const contributionCategoryLabels: Record<PartnerContributionCategory, string> = {
  financial: 'Financial return',
  security: 'Security posture',
  compliance: 'Compliance readiness',
  incident: 'Incident response',
  adoption: 'Business adoption',
};

function maturityPosition(maturity: number): string {
  return `${Math.max(0, Math.min(100, ((maturity - 1) / 4) * 100))}%`;
}

export function CapabilityRoiBoard() {
  const [budgetSEK, setBudgetSEK] = useState(TOTAL_FULL_COST);
  const [selectedWorkstreamIds, setSelectedWorkstreamIds] = useState<Set<WorkstreamId>>(
    () => new Set(WORKSTREAMS.map((workstream) => workstream.id)),
  );
  const summary = useMemo(
    () => scopedCapabilityRoiSummary(selectedWorkstreamIds, budgetSEK),
    [budgetSEK, selectedWorkstreamIds],
  );
  const rows = useMemo(
    () => capabilityRows(budgetSEK, summary.scopeCostSEK, selectedWorkstreamIds),
    [budgetSEK, summary.scopeCostSEK, selectedWorkstreamIds],
  );
  const maturity = useMemo(
    () => capabilityMaturitySummary(rows),
    [rows],
  );
  const wikiRows = useMemo(() => scopeWikiRows(), []);

  const toggleWorkstream = (workstreamId: WorkstreamId) => {
    setSelectedWorkstreamIds((current) => {
      const next = new Set(current);
      if (next.has(workstreamId)) {
        next.delete(workstreamId);
      } else {
        next.add(workstreamId);
      }
      return next;
    });
  };

  const selectAllWorkstreams = () => {
    setSelectedWorkstreamIds(new Set(WORKSTREAMS.map((workstream) => workstream.id)));
  };

  const applyPreset = (presetId: ModelScopePresetId) => {
    const preset = modelScopePreset(presetId);
    setBudgetSEK(preset.budgetSEK);
    setSelectedWorkstreamIds(new Set(preset.workstreamIds));
  };

  const changeBudget = (nextBudgetSEK: number) => {
    setBudgetSEK(nextBudgetSEK);
    setSelectedWorkstreamIds(new Set(scopeIdsCoveredByBudget(nextBudgetSEK)));
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="grid bg-[#071B4D] text-white lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              H&M Enterprise Asset Management
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Asset Management Capability ROI Model
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              From maturity level 1 to level 3, backed by validated inventory uplift
              and modeled return across money, security, compliance readiness and
              incident response.
            </p>
          </div>
          <div className="border-t border-white/15 p-5 lg:border-l lg:border-t-0">
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              Last year achievements
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2 text-sm leading-5">
                <Laptop className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  Managed endpoint inventory above <strong>90%</strong> coverage.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <Network className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  Managed network gear inventory above <strong>90%</strong> coverage.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <Coins className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>
                  <strong>10M SEK</strong> license and unused-device value unlocked.
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-5">
                <ShieldCheck className="mt-0.5 shrink-0 text-green-300" size={16} />
                <span>Qualys integration improving asset-risk and vulnerability posture.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
          <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
            Model controls
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <label className="text-sm text-slate-500" htmlFor="budget">
              Available investment
            </label>
            <div className="font-mono text-2xl font-semibold tabular-nums" style={{ color: INK }}>
              {(budgetSEK / M).toFixed(1)}M SEK
            </div>
          </div>
          <input
            id="budget"
            className="slider mt-3 w-full"
            type="range"
            min={0}
            max={TOTAL_FULL_COST}
            step={100_000}
            value={budgetSEK}
            onChange={(event) => changeBudget(Number(event.target.value))}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {presetModels.map((preset) => {
              const Icon = preset.icon;
              const active =
                Math.round(budgetSEK) === preset.budgetSEK &&
                preset.workstreamIds.length === selectedWorkstreamIds.size &&
                preset.workstreamIds.every((id) => selectedWorkstreamIds.has(id));

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-[#071B4D] bg-[#071B4D] text-white'
                      : 'border-stone-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={active}
                >
                  <Icon size={14} />
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Scope model
              </div>
              <button
                type="button"
                className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
                onClick={selectAllWorkstreams}
              >
                Select all
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {WORKSTREAMS.map((workstream) => {
                const selected = selectedWorkstreamIds.has(workstream.id);

                return (
                  <button
                    key={workstream.id}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                      selected
                        ? 'border-[#071B4D] bg-[#071B4D] text-white'
                        : 'border-stone-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                    aria-pressed={selected}
                    onClick={() => toggleWorkstream(workstream.id)}
                  >
                    {workstream.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="rounded-md bg-stone-50 px-3 py-2">
                Required investment
                <strong className="mt-1 block font-mono text-sm text-slate-950">
                  {fmtM(summary.scopeCostSEK)}
                </strong>
              </div>
              <div className="rounded-md bg-stone-50 px-3 py-2">
                Value unlocked
                <strong className="mt-1 block font-mono text-sm text-slate-950">
                  {fmtM(summary.valueSEK)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((metric) => {
            if (metric.key === 'financial') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={fmtX(summary.multiple)}
                  sub={`${fmtM(summary.valueSEK)} directional value`}
                  color={metric.color}
                />
              );
            }
            if (metric.key === 'security') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={`${summary.pillars.security}%`}
                  sub="Risk reduction"
                  color={metric.color}
                />
              );
            }
            if (metric.key === 'compliance') {
              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={`${summary.pillars.complianceReadiness}%`}
                  sub="Readiness"
                  color={metric.color}
                />
              );
            }
            return (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={`${summary.pillars.incidentResponse}%`}
                sub="MTTR uplift"
                color={metric.color}
              />
            );
          })}
        </div>
      </section>

      <PartnerContributionModel partners={PARTNER_MODEL} />

      <ScopeWiki rows={wikiRows} />

      <InteractiveRoadmapTimeline
        budgetSEK={budgetSEK}
        selectedWorkstreamIds={selectedWorkstreamIds}
        scopeCostSEK={summary.scopeCostSEK}
        scopeBenefitSEK={summary.scopeBenefitSEK}
      />

      <MaturityDeck rows={rows} maturity={maturity} />

      <KnowledgeDeck cards={ROADMAP_KNOWLEDGE_CARDS} />
    </div>
  );
}

function PartnerContributionModel({
  partners,
}: {
  partners: PartnerContribution[];
}) {
  const [activePartnerId, setActivePartnerId] =
    useState<PartnerContribution['id'] | null>(null);
  const activePartner = partners.find((partner) => partner.id === activePartnerId);

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm shadow-stone-200/70">
      <div className="bg-[#071B4D] p-4 text-white">
        <div className="text-sm font-semibold uppercase tracking-wide">
          Partners and H&M engagement model
        </div>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-white/75">
          Capability-enabled contribution across strategic assurance, data foundation,
          platform enablement and cyber/business adoption.
        </p>
      </div>

      <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
        {partners.map((partner) => {
          const Icon = partnerIcons[partner.id];
          const active = partner.id === activePartnerId;

          return (
            <button
              key={partner.id}
              type="button"
              className={`flex min-h-24 items-start justify-between gap-3 rounded-lg border p-3 text-left transition ${
                active
                  ? 'border-[#071B4D] bg-[#071B4D] text-white shadow-md'
                  : 'border-stone-200 bg-[#FAFAF8] text-slate-700 hover:border-slate-300'
              }`}
              aria-expanded={active}
              onClick={() =>
                setActivePartnerId((current) =>
                  current === partner.id ? null : partner.id,
                )
              }
            >
              <span className="flex min-w-0 gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                    active ? 'bg-white/10 text-green-200' : 'bg-green-50 text-green-700'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{partner.name}</span>
                  <span className={`mt-1 block text-xs leading-5 ${active ? 'text-white/75' : 'text-slate-500'}`}>
                    {partner.role}
                  </span>
                  <span className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <span>{fmtM(partner.investmentSEK)}</span>
                    <span>{fmtM(partner.valueSEK)}</span>
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`shrink-0 transition ${active ? 'rotate-180' : ''}`}
                size={16}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {activePartner ? <PartnerDetail partner={activePartner} /> : null}
    </section>
  );
}

function PartnerDetail({ partner }: { partner: PartnerContribution }) {
  return (
    <article className="border-t border-stone-200 bg-[#FAFAF8] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Contribution scope
          </div>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: INK }}>
            {partner.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{partner.role}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right text-[11px] text-slate-500">
          <div className="rounded-md bg-white px-3 py-2">
            Investment
            <strong className="block font-mono text-xs text-slate-950">
              {fmtM(partner.investmentSEK)}
            </strong>
          </div>
          <div className="rounded-md bg-white px-3 py-2">
            Enabled value
            <strong className="block font-mono text-xs text-slate-950">
              {fmtM(partner.valueSEK)}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {partner.categories.map((category) => (
          <span
            key={category}
            className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-800"
          >
            {contributionCategoryLabels[category]}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            Scope contribution
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
            {partner.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            Success signals
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
            {partner.successSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function KnowledgeDeck({ cards }: { cards: KnowledgeCard[] }) {
  const [activeCardId, setActiveCardId] = useState<KnowledgeCard['id'] | null>(null);
  const activeCard = cards.find((card) => card.id === activeCardId);

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm shadow-stone-200/70">
      <div className="bg-[#071B4D] px-4 py-3 text-white">
        <div className="text-sm font-semibold uppercase tracking-wide">
          Enterprise Asset Management Knowledge Deck
        </div>
      </div>

      <div className="grid gap-2 p-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = knowledgeIcons[card.id];
          const active = card.id === activeCardId;

          return (
            <button
              key={card.id}
              type="button"
              className={`flex min-h-20 items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                active
                  ? 'border-[#071B4D] bg-[#071B4D] text-white shadow-md'
                  : 'border-stone-200 bg-[#FAFAF8] text-slate-700 hover:border-slate-300'
              }`}
              aria-expanded={active}
              onClick={() =>
                setActiveCardId((current) => (current === card.id ? null : card.id))
              }
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                    active ? 'bg-white/10 text-green-200' : 'bg-green-50 text-green-700'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{card.title}</span>
                  <span className={`mt-1 block text-xs ${active ? 'text-white/75' : 'text-slate-500'}`}>
                    {card.summary}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`shrink-0 transition ${active ? 'rotate-180' : ''}`}
                size={16}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {activeCard ? <KnowledgeDeckDetail card={activeCard} /> : null}
    </section>
  );
}

function KnowledgeDeckDetail({ card }: { card: KnowledgeCard }) {
  return (
    <article className="border-t border-stone-200 bg-[#FAFAF8] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {card.eyebrow}
          </div>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: INK }}>
            {card.title}
          </h3>
        </div>
        <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
          Board-ready
        </div>
      </div>

      <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600">{card.lead}</p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {card.columns.map((column) => (
          <div key={column.title} className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="text-sm font-semibold" style={{ color: INK }}>
              {column.title}
            </div>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
              {column.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {column.metrics ? (
              <div className="mt-3 grid gap-2">
                {column.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-2.5 py-2 text-xs"
                  >
                    <span className="text-slate-500">{metric.label}</span>
                    <strong className="text-right font-mono text-slate-950">
                      {metric.target}
                    </strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 border-l-4 border-green-700 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
        {card.outcome}
      </div>
    </article>
  );
}

function ScopeWiki({
  rows,
}: {
  rows: ReturnType<typeof scopeWikiRows>;
}) {
  const [activeScopeId, setActiveScopeId] = useState<WorkstreamId | null>(null);
  const activeRow = scopeWikiRowById(rows, activeScopeId);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
      <div className="flex min-w-0 flex-wrap gap-2">
        {rows.map((row) => {
          const active = row.id === activeScopeId;

          return (
            <button
              key={row.id}
              type="button"
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                active
                  ? 'border-[#071B4D] bg-[#071B4D] text-white'
                  : 'border-stone-200 bg-stone-50 hover:border-slate-300'
              }`}
              style={active ? undefined : { color: INK }}
              aria-expanded={active}
              onClick={() =>
                setActiveScopeId((current) => (current === row.id ? null : row.id))
              }
            >
              {row.name}
              <ChevronDown
                className={`transition ${active ? 'rotate-180' : ''}`}
                size={14}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {activeRow ? <ScopeWikiDetail row={activeRow} /> : null}
    </section>
  );
}

function ScopeWikiDetail({ row }: { row: ScopeWikiRow }) {
  return (
    <article className="mt-4 rounded-lg border border-stone-200 bg-[#FAFAF8] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {row.short}
          </div>
          <h3 className="mt-1 text-base font-semibold" style={{ color: INK }}>
            {row.name}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right text-[11px] text-slate-500">
          <div>
            Cost
            <strong className="block font-mono text-xs text-slate-950">
              {fmtM(row.costSEK)}
            </strong>
          </div>
          <div>
            Value
            <strong className="block font-mono text-xs text-slate-950">
              {fmtM(row.benefitSEK)}
            </strong>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{row.summary}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {row.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-800"
          >
            {highlight}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            In scope
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
            {row.inScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Beyond year one
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{row.outOfScope}</p>
        </div>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
      <div className="border-l-4 pl-3" style={{ borderColor: color }}>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="mt-1 font-mono text-xl font-semibold tabular-nums" style={{ color: INK }}>
          {value}
        </div>
        <div className="mt-1 text-xs leading-5" style={{ color: STEEL }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function MaturityDeck({
  rows,
  maturity,
}: {
  rows: ReturnType<typeof capabilityRows>;
  maturity: ReturnType<typeof capabilityMaturitySummary>;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK }}>
            Capability maturity backed by outcomes
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            The page closes on maturity so the board can read the modeled roadmap
            first, then see the final capability movement.
          </p>
        </div>
        <div className="font-mono text-xl font-semibold tabular-nums" style={{ color: INK }}>
          Current {maturity.current.toFixed(1)} -&gt; projected{' '}
          {maturity.projected.toFixed(1)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[11px] text-slate-500">
        {['Ad hoc', 'Visible', 'Managed', 'Integrated', 'Optimized'].map((label, index) => (
          <div key={label}>
            <div className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-[#071B4D] text-xs font-semibold text-white">
              {index + 1}
            </div>
            {label}
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#071B4D] text-left text-xs uppercase tracking-wide text-white">
              <th className="px-3 py-2 font-medium">Capability</th>
              <th className="px-3 py-2 font-medium">Business outcome</th>
              <th className="px-3 py-2 font-medium">Current → projected</th>
              <th className="px-3 py-2 font-medium">Return signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-stone-100 last:border-0">
                <td className="px-3 py-3 font-semibold" style={{ color: INK }}>
                  {row.name}
                </td>
                <td className="px-3 py-3 text-slate-600">{row.outcome}</td>
                <td className="px-3 py-3">
                  <div
                    className="relative h-6 min-w-40"
                    aria-label={`Current maturity ${row.currentMaturity.toFixed(1)} projected ${row.projectedMaturity.toFixed(1)}`}
                  >
                    <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-200" />
                    <div
                      className="absolute top-1.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-[#2468C9] shadow"
                      style={{ left: maturityPosition(row.currentMaturity) }}
                    />
                    <div
                      className="absolute top-1.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow transition-all"
                      style={{
                        left: maturityPosition(row.projectedMaturity),
                        backgroundColor: GOOD,
                      }}
                    />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${row.returnSignalPct}%`,
                          backgroundColor: GOOD,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-500">
                      {row.returnSignalPct}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
