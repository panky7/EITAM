export const HM_RED = '#CC071E';
export const HM_RED_DARK = '#9F0618';
export const INK = '#171717';
export const PAPER = '#FAF7F4';
export const STEEL = '#5B6B82';
export const ACCENT = HM_RED;
export const GOOD = '#587E1F';
export const WARN = '#9B6615';
export const BAD = HM_RED;
export const SURFACE = '#FFFFFF';
export const LINE = '#DDD5CF';
export const SOFT = '#F0EBE7';

export const M = 1_000_000;
export const MONO_NUMERIC_CLASS = 'font-mono tabular-nums';

export const fmtM = (sek: number): string =>
  `${(sek / M).toFixed(2)}M SEK`;

export const fmtX = (multiple: number): string => `${multiple.toFixed(2)}x`;

export function multipleColor(x: number): string {
  if (x >= 0.9) return GOOD;
  if (x >= 0.4) return WARN;
  return BAD;
}

export function coverageColor(pct: number): string {
  if (pct >= 90) return GOOD;
  if (pct >= 10) return WARN;
  return BAD;
}
