import {
  Cloud as CloudIcon,
  Cpu,
  Factory,
  HardDrive,
  Package,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { Workstream, WorkstreamId } from '../data/workstreams';
import { coverageLabel } from '../lib/calculations';
import {
  ACCENT,
  INK,
  MONO_NUMERIC_CLASS,
  coverageColor,
  fmtM,
  fmtX,
  multipleColor,
} from '../lib/format';
import { CoverageBar } from './CoverageBar';
import { ValueHighlightChips } from './ValueHighlightChips';

const WORKSTREAM_ICONS: Record<WorkstreamId, LucideIcon> = {
  hardware: HardDrive,
  ai: Cpu,
  cloud: CloudIcon,
  ot: Factory,
  software: Package,
  newemerging: Sparkles,
};

interface WorkstreamTileProps {
  ws: Workstream;
  fundedPct?: number;
}

export function WorkstreamTile({ ws, fundedPct = 100 }: WorkstreamTileProps) {
  const Icon = WORKSTREAM_ICONS[ws.id];
  const fundedCost = (ws.costSEK * fundedPct) / 100;
  const fundedBenefit = (ws.benefitSEK * fundedPct) / 100;
  const multiple = fundedCost > 0 ? fundedBenefit / fundedCost : 0;
  const coverage = coverageColor(fundedPct);

  return (
    <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5" style={{ backgroundColor: `${ACCENT}14` }}>
            <Icon size={16} color={ACCENT} />
          </div>
          <div>
            <div className="text-[10px] font-medium tracking-wide text-slate-400">
              {ws.short}
            </div>
            <div className="text-sm font-semibold" style={{ color: INK }}>
              {ws.name}
            </div>
          </div>
        </div>
        <span
          className="px-1.5 py-0.5 text-[10px] font-medium"
          style={{ color: coverage, backgroundColor: `${coverage}18` }}
        >
          {coverageLabel(fundedPct)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-snug text-slate-500">{ws.blurb}</p>
      <div className={`mt-3 grid grid-cols-3 gap-2 text-xs ${MONO_NUMERIC_CLASS}`}>
        <div>
          <div className="text-slate-400">Cost</div>
          <div className="font-medium" style={{ color: INK }}>
            {fmtM(fundedCost)}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Benefit</div>
          <div className="font-medium" style={{ color: INK }}>
            {fmtM(fundedBenefit)}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Multiple</div>
          <div className="font-medium" style={{ color: multipleColor(multiple) }}>
            {fmtX(multiple)}
          </div>
        </div>
      </div>
      <ValueHighlightChips highlights={ws.valueHighlights} />
      <CoverageBar pct={fundedPct} color={coverage} />
    </div>
  );
}
