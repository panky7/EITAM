import { useState } from 'react';
import { TabNav, type AppPage } from './components/TabNav';
import { AiRiskView } from './components/views/AiRiskView';
import { BudgetWhatIf } from './components/views/BudgetWhatIf';
import { Dashboard } from './components/views/Dashboard';
import { EnterpriseRiskView } from './components/views/EnterpriseRiskView';
import { WorkstreamDetail } from './components/views/WorkstreamDetail';
import { WorkstreamWhatIf } from './components/views/WorkstreamWhatIf';
import { CapabilityRoiBoard } from './components/views/CapabilityRoiBoard';
import { WORKSTREAMS } from './data/workstreams';
import { INK, PAPER } from './lib/format';
import { appVersionFromPath } from './lib/versioning';

export default function App() {
  const version = appVersionFromPath(window.location.pathname);

  if (version === 'v0') {
    return <LegacyApp />;
  }

  return <V1App />;
}

function LegacyApp() {
  const [activePage, setActivePage] = useState<AppPage>({ type: 'dashboard' });
  const activeWorkstream =
    activePage.type === 'workstream-detail'
      ? WORKSTREAMS.find((workstream) => workstream.id === activePage.workstreamId)
      : undefined;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: PAPER, color: INK }}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <TabNav active={activePage} onChange={setActivePage} />

        <div className="min-w-0">
          <header className="border-b border-stone-200/80 bg-white/80 px-5 py-5 backdrop-blur">
            <div className="mx-auto max-w-6xl">
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                H&M Enterprise Asset Management
              </div>
              <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                <div className="text-2xl font-semibold tracking-normal">
                  Strategic Roadmap Modeller
                </div>
                <div className="text-sm text-slate-500">
                  Cost, value and risk across the 12-month roadmap
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-5 py-6">
            {activePage.type === 'dashboard' ? <Dashboard /> : null}
            {activePage.type === 'budget' ? <BudgetWhatIf /> : null}
            {activePage.type === 'workstream' ? <WorkstreamWhatIf /> : null}
            {activePage.type === 'enterprise-risk' ? <EnterpriseRiskView /> : null}
            {activePage.type === 'ai-risk' ? <AiRiskView /> : null}
            {activeWorkstream ? (
              <WorkstreamDetail workstream={activeWorkstream} />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function V1App() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: PAPER, color: INK }}>
      <header className="border-b border-stone-200/80 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              H&M Enterprise Asset Management
            </div>
            <div className="mt-1 text-xl font-semibold tracking-normal">
              Capability ROI Board
            </div>
          </div>
          <nav className="flex gap-2 text-sm" aria-label="Version navigation">
            <a
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-slate-600 transition hover:border-slate-300"
              href="/v0"
            >
              Open v0
            </a>
            <a
              className="rounded-md border border-[#071B4D] bg-[#071B4D] px-3 py-2 text-white"
              href="/v1"
              aria-current="page"
            >
              v1 board
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6">
        <CapabilityRoiBoard />
      </main>
    </div>
  );
}
