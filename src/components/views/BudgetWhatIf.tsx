import { useMemo, useState } from 'react';
import {
  FULL_MULTIPLE,
  MAX_FULLY_COVERABLE_WORKSTREAMS,
  TOTAL_FULL_BENEFIT,
  TOTAL_FULL_COST,
} from '../../data/derived';
import { WORKSTREAMS } from '../../data/workstreams';
import {
  type AllocationStrategy,
  computeAllocation,
  computeTotals,
  scenarioPresets,
} from '../../lib/calculations';
import {
  ACCENT,
  INK,
  M,
  MONO_NUMERIC_CLASS,
  WARN,
  fmtM,
  fmtX,
  multipleColor,
} from '../../lib/format';
import { StatCard } from '../StatCard';
import { WorkstreamTile } from '../WorkstreamTile';

export function BudgetWhatIf() {
  const [budgetM, setBudgetM] = useState<number>(
    +(TOTAL_FULL_COST / M / 2).toFixed(1),
  );
  const [strategy, setStrategy] = useState<AllocationStrategy>('priority');

  const budgetSEK = budgetM * M;
  const maxSliderM = Math.ceil((TOTAL_FULL_COST / M) * 1.1);
  const presets = useMemo(() => scenarioPresets(), []);

  const allocation = useMemo(
    () => computeAllocation(budgetSEK, strategy),
    [budgetSEK, strategy],
  );

  const totals = useMemo(() => computeTotals(allocation), [allocation]);

  return (
    <div className="space-y-6">
      <div className="border-l-4 pl-4" style={{ borderColor: ACCENT }}>
        <h2 className="text-2xl font-semibold tracking-normal" style={{ color: INK }}>
          Budget / FTE what-if
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Set the budget you actually expect to get. See what's achievable and
          what value comes back. Full plan costs {fmtM(TOTAL_FULL_COST)}.
        </p>
      </div>

      <div className="space-y-4 rounded-sm border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/70">
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <label
              htmlFor="budget-slider"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Available budget
            </label>
            <span
              className={`text-lg font-semibold ${MONO_NUMERIC_CLASS}`}
              style={{ color: INK }}
            >
              {fmtM(budgetSEK)}
            </span>
          </div>
          <input
            id="budget-slider"
            type="range"
            min={0}
            max={maxSliderM}
            step={0.5}
            value={budgetM}
            onChange={(event) => setBudgetM(Number(event.target.value))}
            className="slider w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0</span>
            <span>Full plan: {fmtM(TOTAL_FULL_COST)}</span>
            <span>{maxSliderM}M</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={Number(budgetM.toFixed(2))}
              step={0.01}
              min={0}
              onChange={(event) => setBudgetM(Number(event.target.value) || 0)}
              className={`w-32 rounded-sm border border-stone-300 px-2 py-1 text-sm shadow-inner ${MONO_NUMERIC_CLASS}`}
            />
            <span className="text-xs text-slate-400">M SEK</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Presets
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setBudgetM(preset.budgetSEK / M);
                  setStrategy('priority');
                }}
                className="rounded-sm border border-stone-200 bg-stone-50 px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white hover:shadow"
              >
                {preset.label}
                <div className="mt-0.5 font-normal text-slate-400">
                  {fmtM(preset.budgetSEK)} / {fmtX(preset.totals.multiple)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Allocation strategy
          </div>
          <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <StrategyButton
              active={strategy === 'priority'}
              onClick={() => setStrategy('priority')}
              title="Prioritize highest value first"
              description="Fund the best benefit-per-SEK workstreams fully before moving to the next"
            />
            <StrategyButton
              active={strategy === 'even'}
              onClick={() => setStrategy('even')}
              title="Spread evenly"
              description="Cut every workstream's scope by the same percent"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard
          label="You get"
          value={fmtM(totals.costSEK)}
          sub={`of ${fmtM(budgetSEK)} budget`}
        />
        <StatCard
          label="Benefit value"
          value={fmtM(totals.benefitSEK)}
          sub={`vs ${fmtM(TOTAL_FULL_BENEFIT)} at full plan`}
        />
        <StatCard
          label="Benefit multiple"
          value={fmtX(totals.multiple)}
          tone={multipleColor(totals.multiple)}
          sub={
            totals.multiple > FULL_MULTIPLE
              ? 'better than full plan'
              : totals.multiple < FULL_MULTIPLE
                ? 'below full plan'
                : 'same as full plan'
          }
        />
        <StatCard
          label="Max fully coverable"
          value={String(MAX_FULLY_COVERABLE_WORKSTREAMS)}
          sub="workstreams at current max team size"
          tone={ACCENT}
        />
        {allocation.leftoverSEK > 1000 ? (
          <StatCard
            label="Unallocated"
            value={fmtM(allocation.leftoverSEK)}
            sub="budget exceeds full plan cost"
            tone={WARN}
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {WORKSTREAMS.map((workstream) => (
          <WorkstreamTile
            key={workstream.id}
            ws={workstream}
            fundedPct={allocation.pctById[workstream.id] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

interface StrategyButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

function StrategyButton({
  active,
  onClick,
  title,
  description,
}: StrategyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-3 py-2 text-left text-xs font-medium transition-colors ${
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-stone-200 text-slate-600 shadow-sm hover:border-stone-300 hover:bg-stone-50'
      }`}
      style={active ? { backgroundColor: ACCENT } : undefined}
    >
      {title}
      <div
        className={`mt-0.5 font-normal ${
          active ? 'text-white/80' : 'text-slate-400'
        }`}
      >
        {description}
      </div>
    </button>
  );
}
