import {
  Database,
  ShieldAlert,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import type {
  ValueHighlight,
  ValueHighlightCategory,
} from '../data/workstreams';
import { ACCENT, BAD, GOOD, HM_RED, SOFT, WARN } from '../lib/format';

const HIGHLIGHT_STYLES: Record<
  ValueHighlightCategory,
  { icon: LucideIcon; color: string; background: string }
> = {
  risk: { icon: ShieldAlert, color: BAD, background: `${HM_RED}14` },
  incident: { icon: Siren, color: WARN, background: '#9B661514' },
  transformation: { icon: Users, color: ACCENT, background: `${HM_RED}10` },
  asset_mapping: { icon: Database, color: GOOD, background: `${SOFT}` },
};

interface ValueHighlightChipsProps {
  highlights: ValueHighlight[];
  interactive?: boolean;
}

export function ValueHighlightChips({
  highlights,
  interactive = true,
}: ValueHighlightChipsProps) {
  const [expandedCategory, setExpandedCategory] =
    useState<ValueHighlightCategory | null>(null);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {highlights.map((highlight) => {
        const style = HIGHLIGHT_STYLES[highlight.category];
        const Icon = style.icon;
        const expanded = expandedCategory === highlight.category;

        return (
          <span key={highlight.category} className="relative inline-flex">
            <button
              type="button"
              tabIndex={interactive ? 0 : -1}
              title={highlight.description}
              aria-label={`Value highlight: ${highlight.label}. ${highlight.description}`}
              onClick={(event) => {
                event.stopPropagation();
                if (interactive) {
                  setExpandedCategory(expanded ? null : highlight.category);
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[10px] font-medium leading-none transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              style={{ color: style.color, backgroundColor: style.background }}
            >
              <Icon size={12} aria-hidden="true" />
              <span>{highlight.label}</span>
            </button>
            {interactive && expanded ? (
              <span className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-slate-200 bg-white p-2 text-xs leading-snug text-slate-600 shadow-lg">
                {highlight.description}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
