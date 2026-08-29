import { describe, expect, it } from 'vitest';
import { ROADMAP_KNOWLEDGE_CARDS } from './knowledgeDeck';

describe('ROADMAP_KNOWLEDGE_CARDS', () => {
  it('summarizes slides 5 to 7 as three collapsible board cards', () => {
    expect(ROADMAP_KNOWLEDGE_CARDS).toHaveLength(3);
    expect(ROADMAP_KNOWLEDGE_CARDS.map((card) => card.title)).toEqual([
      'Asset Category Outcomes',
      '6-Month Data-thon',
      'Strategic Value Framework',
    ]);
    expect(ROADMAP_KNOWLEDGE_CARDS[0].summary).toBe(
      '5 asset domains | Y1 outcome + future ambition',
    );
    expect(
      ROADMAP_KNOWLEDGE_CARDS.some((card) =>
        `${card.title} ${card.summary}`.includes(
          'Compact board appendix from roadmap slides 5-7',
        ),
      ),
    ).toBe(false);
  });
});
