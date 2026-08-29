import type { RiskSeverity } from '../data/risks';
import { BAD, GOOD, WARN } from '../lib/format';

const LABEL_BY_SEVERITY: Record<RiskSeverity, string> = {
  high: 'High',
  medium: 'Medium',
  ready: 'Ready',
};

const COLOR_BY_SEVERITY: Record<RiskSeverity, string> = {
  high: BAD,
  medium: WARN,
  ready: GOOD,
};

interface RiskSeverityBadgeProps {
  severity: RiskSeverity;
}

export function RiskSeverityBadge({ severity }: RiskSeverityBadgeProps) {
  const color = COLOR_BY_SEVERITY[severity];

  return (
    <span
      className="inline-flex shrink-0 items-center px-2 py-1 text-[11px] font-medium"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {LABEL_BY_SEVERITY[severity]}
    </span>
  );
}
