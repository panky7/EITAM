import { INK, MONO_NUMERIC_CLASS } from '../lib/format';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}

export function StatCard({ label, value, sub, tone = INK }: StatCardProps) {
  return (
    <div className="min-w-[170px] flex-1 rounded-sm border border-stone-200 bg-white px-4 py-3 shadow-sm shadow-stone-200/60 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        key={value}
        className={`mt-1 text-2xl font-semibold tracking-normal ${MONO_NUMERIC_CLASS}`}
        style={{ color: tone }}
      >
        <span className="inline-block animate-value-change">{value}</span>
      </div>
      {sub ? <div className="mt-0.5 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}
