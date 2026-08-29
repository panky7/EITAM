import {
  BrainCircuit,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { WORKSTREAMS, type WorkstreamId } from '../data/workstreams';
import { HM_RED, INK, STEEL } from '../lib/format';

export type AppPage =
  | { type: 'dashboard' }
  | { type: 'budget' }
  | { type: 'workstream' }
  | { type: 'workstream-detail'; workstreamId: WorkstreamId }
  | { type: 'enterprise-risk' }
  | { type: 'ai-risk' };

type PrimaryPage = Exclude<AppPage['type'], 'workstream-detail'>;

interface TabDefinition {
  id: PrimaryPage;
  label: string;
  icon: LucideIcon;
}

const TABS: TabDefinition[] = [
  { id: 'dashboard', label: 'Plan overview', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget / FTE what-if', icon: SlidersHorizontal },
  { id: 'workstream', label: 'Workstream what-if', icon: ListChecks },
  { id: 'enterprise-risk', label: 'Enterprise risk', icon: ShieldAlert },
  { id: 'ai-risk', label: 'AI Act readiness', icon: BrainCircuit },
];

interface TabNavProps {
  active: AppPage;
  onChange: (page: AppPage) => void;
}

export function TabNav({ active, onChange }: TabNavProps) {
  const activeType = active.type;

  return (
    <aside className="border-b border-stone-200 bg-white px-3 py-4 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="px-2 pb-4">
        <div
          className="text-3xl font-semibold leading-none tracking-normal"
          style={{ color: HM_RED }}
          aria-label="H and M"
        >
          H&amp;M
        </div>
        <div className="mt-3 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Enterprise Asset Intelligence
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange({ type: tab.id })}
              className="flex shrink-0 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-stone-50 lg:w-full"
              style={{
                color: isActive ? '#FFFFFF' : INK,
                backgroundColor: isActive ? HM_RED : 'transparent',
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon size={16} />
                <span className="truncate">{tab.label}</span>
              </span>
              {isActive ? <ChevronRight size={15} /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 px-2 text-[11px] font-medium uppercase tracking-widest text-slate-400">
        Workstreams
      </div>
      <div className="mt-2 flex gap-1 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
        {WORKSTREAMS.map((workstream) => {
          const isActive =
            active.type === 'workstream-detail' &&
            active.workstreamId === workstream.id;

          return (
            <button
              key={workstream.id}
              type="button"
              onClick={() =>
                onChange({
                  type: 'workstream-detail',
                  workstreamId: workstream.id,
                })
              }
              className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium transition hover:bg-stone-50 lg:w-full"
              style={{
                color: isActive ? HM_RED : STEEL,
                backgroundColor: isActive ? `${HM_RED}10` : 'transparent',
              }}
            >
              <span className="truncate">
                {workstream.short} {workstream.name}
              </span>
              {isActive ? <ChevronRight size={14} /> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
