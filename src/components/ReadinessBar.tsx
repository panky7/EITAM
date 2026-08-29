import { readinessTone } from '../lib/calculations';
import { BAD, GOOD, INK, WARN } from '../lib/format';

const COLOR_BY_TONE = {
  high: BAD,
  medium: WARN,
  ready: GOOD,
};

interface ReadinessBarProps {
  label: string;
  pct: number;
}

export function ReadinessBar({ label, pct }: ReadinessBarProps) {
  const tone = readinessTone(pct);
  const color = COLOR_BY_TONE[tone];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium" style={{ color: INK }}>
          {label}
        </span>
        <span className="font-mono tabular-nums" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden bg-stone-100"
        role="progressbar"
        aria-label={`${label} readiness`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
