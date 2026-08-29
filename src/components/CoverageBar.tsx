interface CoverageBarProps {
  pct: number;
  color: string;
}

export function CoverageBar({ pct, color }: CoverageBarProps) {
  const clampedPct = Math.min(100, Math.max(0, pct));

  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${clampedPct}%`, backgroundColor: color }}
      />
    </div>
  );
}
