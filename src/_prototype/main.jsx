import React, { useState, useMemo } from "react";
import {
  HardDrive, Cpu, Cloud as CloudIcon, Factory, Package, Sparkles,
  LayoutDashboard, SlidersHorizontal, ListChecks, Info, TrendingUp, TrendingDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// DATA — derived from the H&M EAM v2 scenario model (rate card + benefit
// weighting). See per-workstream figures verified against that model.
// ---------------------------------------------------------------------------

const INK = "#12203A";
const PAPER = "#F5F6F8";
const STEEL = "#5B6B82";
const ACCENT = "#1B4B66";
const GOOD = "#1F8A5F";
const WARN = "#C98A1D";
const BAD = "#C4432B";

const M = 1_000_000;

const WORKSTREAMS = [
  { id: "hardware", name: "Hardware", short: "WS1", icon: HardDrive,
    cost: 20.075 * M, benefit: 19.25 * M, q1: true,
    blurb: "Discovery/integration uplift, CMDB governance, operational intelligence use cases." },
  { id: "ai", name: "AI Assets", short: "WS2", icon: Cpu,
    cost: 20.075 * M, benefit: 3.50 * M, q1: true,
    blurb: "AI registry, metadata model, EU AI Act governance and lifecycle workflows." },
  { id: "cloud", name: "Cloud", short: "WS3", icon: CloudIcon,
    cost: 20.075 * M, benefit: 7.00 * M, q1: true,
    blurb: "Azure baseline, CMDB linkage, multi-cloud roadmap, FinOps requirements." },
  { id: "ot", name: "Operational Technology", short: "WS4", icon: Factory,
    cost: 13.095 * M, benefit: 4.75 * M, q1: false,
    blurb: "Warehouse OT baseline, ownership model, monitoring & discovery design." },
  { id: "software", name: "Software", short: "WS5", icon: Package,
    cost: 13.095 * M, benefit: 6.75 * M, q1: false,
    blurb: "Software/licence baseline, SAM use cases, target architecture & roadmap." },
  { id: "newemerging", name: "New & Emerging Projects", short: "WS6", icon: Sparkles,
    cost: 13.095 * M, benefit: 1.75 * M, q1: false,
    blurb: "Data products, benefits tracking, 6-month Data-thon, backlog refresh." },
];

// Partner cost contribution to a single workstream's annual cost, split by
// whether that workstream starts in Q1 (Hardware/AI/Cloud) or Month 4 (OT/Software/New).
const PARTNER_SHARE_EARLY = { EY: 7.00 * M, Accenture: 0.625 * M, "TCS Offshore": 5.10 * M, "TCS Onsite": 7.35 * M };
const PARTNER_SHARE_LATE  = { EY: 5.25 * M, Accenture: 0.375 * M, "TCS Offshore": 3.06 * M, "TCS Onsite": 4.41 * M };

const TOTAL_FULL_COST = WORKSTREAMS.reduce((s, w) => s + w.cost, 0);
const TOTAL_FULL_BENEFIT = WORKSTREAMS.reduce((s, w) => s + w.benefit, 0);
const FULL_MULTIPLE = TOTAL_FULL_BENEFIT / TOTAL_FULL_COST;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const fmtM = (n) => `${(n / M).toFixed(2)}M SEK`;
const fmtX = (n) => `${n.toFixed(2)}x`;

const multipleColor = (x) => (x >= 0.9 ? GOOD : x >= 0.4 ? WARN : BAD);
const coverageLabel = (pct) => (pct >= 90 ? "Full" : pct >= 10 ? "Partial" : "Deferred");
const coverageColor = (pct) => (pct >= 90 ? GOOD : pct >= 10 ? WARN : BAD);

function partnerBreakdownFor(workstreams) {
  const totals = { EY: 0, Accenture: 0, "TCS Offshore": 0, "TCS Onsite": 0 };
  workstreams.forEach((w) => {
    const share = w.q1 ? PARTNER_SHARE_EARLY : PARTNER_SHARE_LATE;
    Object.keys(totals).forEach((k) => (totals[k] += share[k]));
  });
  return totals;
}

// ---------------------------------------------------------------------------
// SHARED UI BITS
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, tone }) {
  return (
    <div className="flex-1 min-w-[160px] rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: tone || INK }}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function CoverageBar({ pct, color }) {
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function WorkstreamTile({ ws, fundedPct = 100 }) {
  const Icon = ws.icon;
  const fundedCost = (ws.cost * fundedPct) / 100;
  const fundedBenefit = (ws.benefit * fundedPct) / 100;
  const mult = fundedCost > 0 ? fundedBenefit / fundedCost : 0;
  const cov = coverageColor(fundedPct);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3.5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md p-1.5" style={{ backgroundColor: `${ACCENT}14` }}>
            <Icon size={16} color={ACCENT} />
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-400 tracking-wide">{ws.short}</div>
            <div className="text-sm font-semibold" style={{ color: INK }}>{ws.name}</div>
          </div>
        </div>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{ color: cov, backgroundColor: `${cov}18` }}
        >
          {coverageLabel(fundedPct)}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{ws.blurb}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs tabular-nums" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
        <div>
          <div className="text-slate-400" style={{ fontFamily: "inherit" }}>Cost</div>
          <div className="font-medium" style={{ color: INK }}>{fmtM(fundedCost)}</div>
        </div>
        <div>
          <div className="text-slate-400">Benefit</div>
          <div className="font-medium" style={{ color: INK }}>{fmtM(fundedBenefit)}</div>
        </div>
        <div>
          <div className="text-slate-400">Multiple</div>
          <div className="font-medium" style={{ color: multipleColor(mult) }}>{fmtX(mult)}</div>
        </div>
      </div>
      <CoverageBar pct={fundedPct} color={cov} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DASHBOARD MODE
// ---------------------------------------------------------------------------

function Dashboard() {
  const chartData = WORKSTREAMS.map((w) => ({
    name: w.short,
    Cost: +(w.cost / M).toFixed(1),
    Benefit: +(w.benefit / M).toFixed(1),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold" style={{ color: INK }}>Proposed 12-month plan</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Full scope across all 6 workstreams, as costed in the EY roadmap plus H&M's revised EY resourcing basis.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard label="Total proposed cost" value={fmtM(TOTAL_FULL_COST)} sub="EY + Accenture + TCS, full year" />
        <StatCard label="Total benefit value" value={fmtM(TOTAL_FULL_BENEFIT)} sub="vs. ~25M SEK enterprise risk + savings" />
        <StatCard label="Benefit multiple" value={fmtX(FULL_MULTIPLE)} tone={multipleColor(FULL_MULTIPLE)} sub="benefit ÷ cost, full plan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {WORKSTREAMS.map((w) => <WorkstreamTile key={w.id} ws={w} fundedPct={100} />)}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Cost vs. benefit by workstream (M SEK)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EC" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: STEEL }} axisLine={{ stroke: "#E5E8EC" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `${v}M SEK`} contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E5E8EC" }} />
            <Bar dataKey="Cost" fill={ACCENT} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Benefit" fill={GOOD} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Benefit values are estimated from the roadmap's ~25M SEK enterprise risk figure, weighted by workstream, plus
          rough savings/avoidance estimates — treat as directional for comparing options, not as an audited ROI case.
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BUDGET / FTE WHAT-IF MODE
// ---------------------------------------------------------------------------

function BudgetWhatIf() {
  const [budgetM, setBudgetM] = useState(+(TOTAL_FULL_COST / M / 2).toFixed(1)); // default: half of full plan
  const [strategy, setStrategy] = useState("priority"); // "priority" | "even"
  const budget = budgetM * M;

  const allocation = useMemo(() => {
    if (strategy === "priority") {
      const sorted = [...WORKSTREAMS].sort((a, b) => b.benefit / b.cost - a.benefit / a.cost);
      let remaining = budget;
      const byId = {};
      sorted.forEach((w) => {
        let pct;
        if (remaining <= 0) pct = 0;
        else if (remaining >= w.cost) { pct = 100; remaining -= w.cost; }
        else { pct = (remaining / w.cost) * 100; remaining = 0; }
        byId[w.id] = pct;
      });
      return { pctById: byId, leftover: Math.max(0, remaining) };
    }
    const pct = Math.min(100, (budget / TOTAL_FULL_COST) * 100);
    const byId = {};
    WORKSTREAMS.forEach((w) => (byId[w.id] = pct));
    const leftover = Math.max(0, budget - TOTAL_FULL_COST * (pct / 100));
    return { pctById: byId, leftover };
  }, [budget, strategy]);

  const totals = useMemo(() => {
    let cost = 0, benefit = 0;
    WORKSTREAMS.forEach((w) => {
      const pct = allocation.pctById[w.id] || 0;
      cost += (w.cost * pct) / 100;
      benefit += (w.benefit * pct) / 100;
    });
    return { cost, benefit, multiple: cost > 0 ? benefit / cost : 0 };
  }, [allocation]);

  const maxSliderM = Math.ceil((TOTAL_FULL_COST / M) * 1.1);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold" style={{ color: INK }}>Budget / FTE what-if</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Set the budget you actually expect to get. See what's achievable and what value comes back — full plan costs {fmtM(TOTAL_FULL_COST)}.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Available budget</label>
            <span
              className="text-lg font-semibold tabular-nums"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: INK }}
            >
              {fmtM(budget)}
            </span>
          </div>
          <input
            type="range" min={0} max={maxSliderM} step={0.5} value={budgetM}
            onChange={(e) => setBudgetM(+e.target.value)}
            className="w-full accent-[#1B4B66]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span>
            <span>Full plan: {fmtM(TOTAL_FULL_COST)}</span>
            <span>{maxSliderM}M</span>
          </div>
          <input
            type="number" value={budgetM} step={0.1} min={0}
            onChange={(e) => setBudgetM(+e.target.value || 0)}
            className="mt-2 w-32 rounded border border-slate-300 px-2 py-1 text-sm tabular-nums"
          />
          <span className="ml-1 text-xs text-slate-400">M SEK</span>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Allocation strategy</label>
          <div className="mt-1.5 flex gap-2">
            <button
              onClick={() => setStrategy("priority")}
              className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium text-left transition-colors ${
                strategy === "priority" ? "border-transparent text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              style={strategy === "priority" ? { backgroundColor: ACCENT } : {}}
            >
              Prioritize highest value first
              <div className={`font-normal mt-0.5 ${strategy === "priority" ? "text-white/80" : "text-slate-400"}`}>
                Fund the best benefit-per-SEK workstreams fully before moving to the next
              </div>
            </button>
            <button
              onClick={() => setStrategy("even")}
              className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium text-left transition-colors ${
                strategy === "even" ? "border-transparent text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              style={strategy === "even" ? { backgroundColor: ACCENT } : {}}
            >
              Spread evenly
              <div className={`font-normal mt-0.5 ${strategy === "even" ? "text-white/80" : "text-slate-400"}`}>
                Cut every workstream's scope by the same %
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard label="You get" value={fmtM(totals.cost)} sub={`of ${fmtM(budget)} budget`} />
        <StatCard label="Benefit value" value={fmtM(totals.benefit)} sub={`vs ${fmtM(TOTAL_FULL_BENEFIT)} at full plan`} />
        <StatCard label="Benefit multiple" value={fmtX(totals.multiple)} tone={multipleColor(totals.multiple)}
          sub={totals.multiple > FULL_MULTIPLE ? "better than full plan" : totals.multiple < FULL_MULTIPLE ? "below full plan" : "same as full plan"} />
        {allocation.leftover > 1000 && (
          <StatCard label="Unallocated" value={fmtM(allocation.leftover)} sub="budget exceeds full plan cost" tone={WARN} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {WORKSTREAMS.map((w) => (
          <WorkstreamTile key={w.id} ws={w} fundedPct={allocation.pctById[w.id] || 0} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WORKSTREAM WHAT-IF MODE
// ---------------------------------------------------------------------------

function WorkstreamWhatIf() {
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const chosen = WORKSTREAMS.filter((w) => selected.has(w.id));
  const cost = chosen.reduce((s, w) => s + w.cost, 0);
  const benefit = chosen.reduce((s, w) => s + w.benefit, 0);
  const multiple = cost > 0 ? benefit / cost : 0;
  const partnerTotals = partnerBreakdownFor(chosen);

  const partnerChartData = Object.entries(partnerTotals).map(([name, v]) => ({ name, cost: +(v / M).toFixed(2) }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold" style={{ color: INK }}>Workstream what-if</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Pick only the workstream(s) you want to fund — e.g. "just AI Assets" — and see the isolated cost and benefit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {WORKSTREAMS.map((w) => {
          const Icon = w.icon;
          const on = selected.has(w.id);
          return (
            <button
              key={w.id}
              onClick={() => toggle(w.id)}
              className={`text-left rounded-lg border p-3.5 transition-colors ${
                on ? "border-transparent" : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
              style={on ? { backgroundColor: `${ACCENT}0D`, borderColor: ACCENT } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5" style={{ backgroundColor: on ? `${ACCENT}22` : "#F1F3F5" }}>
                    <Icon size={16} color={on ? ACCENT : STEEL} />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-400 tracking-wide">{w.short}</div>
                    <div className="text-sm font-semibold" style={{ color: INK }}>{w.name}</div>
                  </div>
                </div>
                <div
                  className="h-4 w-4 rounded border flex items-center justify-center shrink-0"
                  style={{ borderColor: on ? ACCENT : "#CBD5E1", backgroundColor: on ? ACCENT : "transparent" }}
                >
                  {on && <div className="h-1.5 w-1.5 rounded-sm bg-white" />}
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs tabular-nums" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                <span className="text-slate-500">{fmtM(w.cost)}</span>
                <span style={{ color: multipleColor(w.benefit / w.cost) }}>{fmtX(w.benefit / w.cost)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {chosen.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          Select one or more workstreams above to see cost and benefit.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <StatCard label="Selected workstreams" value={String(chosen.length)} sub={chosen.map((w) => w.short).join(", ")} />
            <StatCard label="Total cost" value={fmtM(cost)} sub={`${((cost / TOTAL_FULL_COST) * 100).toFixed(0)}% of full plan cost`} />
            <StatCard label="Benefit value" value={fmtM(benefit)} sub={`${((benefit / TOTAL_FULL_BENEFIT) * 100).toFixed(0)}% of full plan benefit`} />
            <StatCard label="Benefit multiple" value={fmtX(multiple)} tone={multipleColor(multiple)} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Cost by partner, for this selection</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={partnerChartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E8EC" />
                <XAxis type="number" tick={{ fontSize: 11, fill: STEEL }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => `${v}M SEK`} contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#E5E8EC" }} />
                <Bar dataKey="cost" radius={[0, 3, 3, 0]}>
                  {partnerChartData.map((_, i) => <Cell key={i} fill={ACCENT} fillOpacity={1 - i * 0.15} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// APP SHELL
// ---------------------------------------------------------------------------

const TABS = [
  { id: "dashboard", label: "Plan overview", icon: LayoutDashboard },
  { id: "budget", label: "Budget / FTE what-if", icon: SlidersHorizontal },
  { id: "workstream", label: "Workstream what-if", icon: ListChecks },
];

export default function EAMScenarioModeller() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: PAPER }}>
      <div className="text-white px-5 py-4" style={{ backgroundColor: INK }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-[11px] uppercase tracking-widest text-white/50 font-medium">H&M Enterprise Asset Management</div>
          <div className="text-lg font-semibold mt-0.5">12-Month Budget & Benefit Scenario Modeller</div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex gap-1 px-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
                style={{
                  borderColor: active ? ACCENT : "transparent",
                  color: active ? ACCENT : STEEL,
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {tab === "dashboard" && <Dashboard />}
        {tab === "budget" && <BudgetWhatIf />}
        {tab === "workstream" && <WorkstreamWhatIf />}
      </div>
    </div>
  );
}
