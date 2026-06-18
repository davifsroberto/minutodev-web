import { RadarApiItem, RadarBriefing } from './radar.model';

const itemWithoutSourceCount: RadarApiItem = {
  id: 'item-1',
  title: 'Angular improves server rendering',
  summary: null,
  url: 'https://example.com/angular',
  sourceName: 'Example Source',
  category: 'frontend',
  contentType: 'ARTICLE',
  publishedAt: '2026-06-17T12:00:00.000Z',
};

function makeBriefing(featuredId: string | null): RadarBriefing {
  return {
    date: '2026-06-17',
    featuredId,
    sections: [{ key: 'trends', items: [itemWithoutSourceCount] }],
    estimatedReadTimeMinutes: 2,
  };
}

describe('radar wire model', () => {
  it('keeps sourceCount optional for legacy item fixtures', () => {
    expect(itemWithoutSourceCount.sourceCount).toBeUndefined();
  });

  it('accepts sourceCount from the API item contract', () => {
    const item: RadarApiItem = {
      ...itemWithoutSourceCount,
      sourceCount: 3,
    };

    expect(item.sourceCount).toBe(3);
  });

  it.each(['item-1', null])(
    'accepts featuredId values from the API envelope: %p',
    (featuredId) => {
      expect(makeBriefing(featuredId).featuredId).toBe(featuredId);
    },
  );
});
