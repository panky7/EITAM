import { PARTNER_IDS, type PartnerId } from '../data/partners';
import { ACCENT, GOOD, INK, MONO_NUMERIC_CLASS, STEEL, fmtM } from '../lib/format';

const PARTNER_COLOR: Record<PartnerId, string> = {
  EY: ACCENT,
  Accenture: GOOD,
  TCS: STEEL,
};

interface PartnerCostSplitProps {
  breakdown: Record<PartnerId, number>;
  totalSEK: number;
}

export function PartnerCostSplit({ breakdown, totalSEK }: PartnerCostSplitProps) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/70">
      <div className="text-sm font-semibold" style={{ color: INK }}>
        Partner cost split
      </div>
      <div className="mt-3 space-y-3">
        {PARTNER_IDS.map((partnerId) => {
          const value = breakdown[partnerId];
          const pct = totalSEK > 0 ? (value / totalSEK) * 100 : 0;
          const color = PARTNER_COLOR[partnerId];

          return (
            <div key={partnerId}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium" style={{ color: INK }}>
                  {partnerId}
                </span>
                <span className={MONO_NUMERIC_CLASS} style={{ color: STEEL }}>
                  {fmtM(value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden bg-stone-100">
                <div
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
