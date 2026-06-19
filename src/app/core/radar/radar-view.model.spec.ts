import {
  RadarApiItem,
  RadarBriefing,
  RadarSection,
  RadarSectionKey,
} from '@app/core/radar/radar.model';
import {
  RADAR_APP_DISPLAY_ORDER,
  RADAR_APP_SECTION_LABELS,
  RADAR_ITEMS_PER_SECTION,
  radarBadgeFor,
  RadarTodaySection,
  resolveHighlight,
  toRadarTodaySections,
} from './radar-view.model';

function makeItem(overrides: Partial<RadarApiItem> = {}): RadarApiItem {
  return {
    id: 'id-1',
    title: 'Item title',
    summary: 'Item summary',
    url: 'https://example.com/item',
    sourceName: 'Example Source',
    imageUrl: null,
    category: null,
    contentType: 'ARTICLE',
    publishedAt: '2026-06-13T08:00:00.000Z',
    ...overrides,
  };
}

function makeSection(
  key: RadarSectionKey,
  items: RadarApiItem[],
): RadarSection {
  return { key, items };
}

function makeBriefing(sections: RadarSection[]): RadarBriefing {
  return {
    date: '2026-06-13',
    featuredId: null,
    sections,
    estimatedReadTimeMinutes: 6,
  };
}

describe('toRadarTodaySections', () => {
  describe('constants', () => {
    it('defines the app display order, PT-BR labels, and shared cap', () => {
      expect(RADAR_APP_DISPLAY_ORDER).toEqual([
        'trends',
        'recommended',
        'tools',
        'releases',
      ]);
      expect(RADAR_APP_SECTION_LABELS).toEqual({
        trends: 'Tendências',
        tools: 'Ferramentas',
        releases: 'Releases',
        recommended: 'Recomendados',
      });
      expect(RADAR_ITEMS_PER_SECTION).toBe(5);
    });
  });

  describe('section ordering and labels', () => {
    it('returns sections in the fixed display order regardless of backend section order', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [makeItem({ id: 'recommended' })]),
        makeSection('releases', [makeItem({ id: 'releases' })]),
        makeSection('tools', [makeItem({ id: 'tools' })]),
        makeSection('trends', [makeItem({ id: 'trends' })]),
      ]);

      const sectionKeys = toRadarTodaySections(briefing).map(
        (section) => section.key,
      );

      expect(sectionKeys).toEqual([
        'trends',
        'recommended',
        'tools',
        'releases',
      ]);
    });

    it('applies the frontend-owned PT-BR label per section key', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [makeItem()]),
        makeSection('releases', [makeItem()]),
        makeSection('tools', [makeItem()]),
        makeSection('trends', [makeItem()]),
      ]);

      const labels = toRadarTodaySections(briefing).map(
        (section) => section.label,
      );

      expect(labels).toEqual([
        'Tendências',
        'Recomendados',
        'Ferramentas',
        'Releases',
      ]);
    });
  });

  describe('item ordering', () => {
    it('preserves the relevance order received from the API regardless of publishedAt', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({
            id: 'most-relevant',
            publishedAt: '2026-06-11T08:00:00.000Z',
          }),
          makeItem({
            id: 'second-most-relevant',
            publishedAt: '2026-06-13T08:00:00.000Z',
          }),
          makeItem({
            id: 'third-most-relevant',
            publishedAt: '2026-06-12T08:00:00.000Z',
          }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.items.map((item) => item.id)).toEqual([
        'most-relevant',
        'second-most-relevant',
        'third-most-relevant',
      ]);
    });
  });

  describe('relevance ordering guard (6A.2 — no local re-sort)', () => {
    it('keeps the exact API order within a section, even when it matches no sort key', () => {
      const apiOrder = ['mid', 'oldest', 'newest'];
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({
            id: 'mid',
            title: 'Mango',
            publishedAt: '2026-06-12T08:00:00.000Z',
          }),
          makeItem({
            id: 'oldest',
            title: 'Apple',
            publishedAt: '2026-06-10T08:00:00.000Z',
          }),
          makeItem({
            id: 'newest',
            title: 'Zebra',
            publishedAt: '2026-06-14T08:00:00.000Z',
          }),
        ]),
      ]);

      const produced = toRadarTodaySections(briefing)[0].items.map(
        (item) => item.id,
      );

      expect(produced).toEqual(apiOrder);
      expect(produced).not.toEqual(['newest', 'mid', 'oldest']);
      expect(produced).not.toEqual([...apiOrder].sort());
    });

    it('keeps each section item order independent, with no global re-sort by date', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({ id: 't1', publishedAt: '2026-06-09T08:00:00.000Z' }),
          makeItem({ id: 't2', publishedAt: '2026-06-15T08:00:00.000Z' }),
        ]),
        makeSection('recommended', [
          makeItem({ id: 'r1', publishedAt: '2026-06-08T08:00:00.000Z' }),
          makeItem({ id: 'r2', publishedAt: '2026-06-20T08:00:00.000Z' }),
        ]),
      ]);

      const orderByKey = Object.fromEntries(
        toRadarTodaySections(briefing).map((section) => [
          section.key,
          section.items.map((item) => item.id),
        ]),
      );

      expect(orderByKey['trends']).toEqual(['t1', 't2']);
      expect(orderByKey['recommended']).toEqual(['r1', 'r2']);
    });
  });

  describe('cap and empty handling', () => {
    it('caps a section with more than five items to exactly five', () => {
      const briefing = makeBriefing([
        makeSection(
          'releases',
          Array.from({ length: 6 }, (_, index) =>
            makeItem({
              id: `release-${index + 1}`,
              publishedAt: `2026-06-${13 - index}T08:00:00.000Z`,
            }),
          ),
        ),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.items).toHaveLength(5);
      expect(section.items.map((item) => item.id)).toEqual([
        'release-1',
        'release-2',
        'release-3',
        'release-4',
        'release-5',
      ]);
    });

    it('passes all items through when a section has fewer than five items', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [
          makeItem({ id: 'rec-1' }),
          makeItem({ id: 'rec-2' }),
          makeItem({ id: 'rec-3' }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.items.map((item) => item.id)).toEqual([
        'rec-1',
        'rec-2',
        'rec-3',
      ]);
    });

    it('omits a section whose items array is empty', () => {
      const briefing = makeBriefing([
        makeSection('trends', [makeItem({ id: 'trend' })]),
        makeSection('tools', []),
        makeSection('releases', [makeItem({ id: 'release' })]),
      ]);

      const sections = toRadarTodaySections(briefing);

      expect(sections.map((section) => section.key)).toEqual([
        'trends',
        'releases',
      ]);
    });

    it('returns [] when every section is empty', () => {
      const briefing = makeBriefing([
        makeSection('trends', []),
        makeSection('tools', []),
        makeSection('releases', []),
        makeSection('recommended', []),
      ]);

      expect(toRadarTodaySections(briefing)).toEqual([]);
    });

    it('returns [] when the briefing has no sections', () => {
      expect(toRadarTodaySections(makeBriefing([]))).toEqual([]);
    });

    it('uses a custom cap argument instead of RADAR_ITEMS_PER_SECTION', () => {
      const briefing = makeBriefing([
        makeSection(
          'trends',
          Array.from({ length: 4 }, (_, index) =>
            makeItem({
              id: `trend-${index + 1}`,
              publishedAt: `2026-06-${13 - index}T08:00:00.000Z`,
            }),
          ),
        ),
      ]);

      const [section] = toRadarTodaySections(briefing, 2);

      expect(section.items.map((item) => item.id)).toEqual([
        'trend-1',
        'trend-2',
      ]);
    });
  });

  describe('field carry-through', () => {
    it('maps item fields, carries summary null unchanged, and ignores category for grouping', () => {
      const briefing = makeBriefing([
        makeSection('tools', [
          makeItem({
            id: 'tool-1',
            title: 'CLI com IA',
            summary: null,
            url: 'https://example.com/cli',
            sourceName: 'Dev Tools',
            imageUrl: 'https://cdn.test/cli.png',
            sourceCount: 3,
            category: 'recommended',
          }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.key).toBe('tools');
      expect(section.items).toEqual([
        {
          id: 'tool-1',
          title: 'CLI com IA',
          summary: null,
          url: 'https://example.com/cli',
          sourceName: 'Dev Tools',
          imageUrl: 'https://cdn.test/cli.png',
          sourceCount: 3,
          badge: radarBadgeFor('recommended', 'tools'),
        },
      ]);
    });

    it('propagates sourceCount when present and defaults a missing value to one', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({ id: 'covered', sourceCount: 4 }),
          makeItem({ id: 'legacy', sourceCount: undefined }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);
      const sourceCountById = Object.fromEntries(
        section.items.map((item) => [item.id, item.sourceCount]),
      );

      expect(sourceCountById).toEqual({
        covered: 4,
        legacy: 1,
      });
    });

    it('carries imageUrl when present and defaults a missing imageUrl to null', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({
            id: 'with-image',
            imageUrl: 'https://cdn.test/cover.png',
            publishedAt: '2026-06-13T08:00:00.000Z',
          }),
          makeItem({
            id: 'without-image',
            imageUrl: undefined,
            publishedAt: '2026-06-12T08:00:00.000Z',
          }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);
      const imageById = Object.fromEntries(
        section.items.map((item) => [item.id, item.imageUrl]),
      );

      expect(imageById['with-image']).toBe('https://cdn.test/cover.png');
      expect(imageById['without-image']).toBeNull();
    });

    it('assigns a badge per item: topical category wins, else the section badge', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [
          makeItem({ id: 'ai', category: 'ai' }),
          makeItem({ id: 'plain', category: 'backend' }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);
      const badgeById = Object.fromEntries(
        section.items.map((item) => [item.id, item.badge.label]),
      );

      // categoria temática sobrepõe a seção...
      expect(badgeById['ai']).toBe('IA');
      // ...e sem tema reconhecível cai no badge da seção (Recomendado).
      expect(badgeById['plain']).toBe('Recomendado');
    });

    it('does not mutate the input briefing', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({ id: 'old', publishedAt: '2026-06-11T08:00:00.000Z' }),
          makeItem({ id: 'new', publishedAt: '2026-06-13T08:00:00.000Z' }),
        ]),
      ]);
      const snapshot = JSON.parse(JSON.stringify(briefing));

      toRadarTodaySections(briefing);

      expect(briefing).toEqual(snapshot);
    });
  });
});

describe('radarBadgeFor', () => {
  it('uses the topical badge when the category is recognizable', () => {
    expect(radarBadgeFor('ai', 'recommended').label).toBe('IA');
    expect(radarBadgeFor('cloud', 'trends').label).toBe('Cloud');
    expect(radarBadgeFor('security', 'tools').label).toBe('Segurança');
  });

  it('is case- and accent-insensitive on the category', () => {
    expect(radarBadgeFor('AI', 'tools').label).toBe('IA');
    expect(radarBadgeFor('Segurança', 'releases').label).toBe('Segurança');
    expect(radarBadgeFor('Engineering', 'tools')).toEqual({
      icon: '⚙️',
      label: 'Engenharia',
    });
  });

  it('maps each real API category to its curated badge', () => {
    expect(radarBadgeFor('ai', 'tools')).toEqual({ icon: '🤖', label: 'IA' });
    expect(radarBadgeFor('ia', 'tools')).toEqual({ icon: '🤖', label: 'IA' });
    expect(radarBadgeFor('engineering', 'releases')).toEqual({
      icon: '⚙️',
      label: 'Engenharia',
    });
    expect(radarBadgeFor('community', 'trends')).toEqual({
      icon: '💬',
      label: 'Comunidade',
    });
    expect(radarBadgeFor('opensource', 'tools')).toEqual({
      icon: '🔓',
      label: 'Open Source',
    });
    expect(radarBadgeFor('frontend', 'recommended')).toEqual({
      icon: '🎨',
      label: 'Frontend',
    });
  });

  it('keeps every seeded category distinct from the section fallback (drift guard)', () => {
    const seededCategories = [
      'ai',
      'engineering',
      'community',
      'opensource',
      'frontend',
    ];
    const sectionKeys: RadarSectionKey[] = [
      'trends',
      'recommended',
      'tools',
      'releases',
    ];

    for (const category of seededCategories) {
      for (const key of sectionKeys) {
        expect(radarBadgeFor(category, key).label).not.toBe(
          radarBadgeFor(null, key).label,
        );
      }
    }
  });

  it('falls back to the section badge when no topical category matches', () => {
    expect(radarBadgeFor(null, 'trends').label).toBe('Tendência');
    expect(radarBadgeFor('backend', 'releases').label).toBe('Release');
    expect(radarBadgeFor(null, 'tools').label).toBe('Ferramenta');
    expect(radarBadgeFor(null, 'recommended').label).toBe('Recomendado');
  });

  it('always provides a non-empty icon', () => {
    expect(radarBadgeFor('ai', 'tools').icon.length).toBeGreaterThan(0);
    expect(radarBadgeFor(null, 'trends').icon.length).toBeGreaterThan(0);
  });
});

describe('resolveHighlight', () => {
  function makeSections(): RadarTodaySection[] {
    return toRadarTodaySections(
      makeBriefing([
        makeSection('trends', [
          makeItem({ id: 'trend-1' }),
          makeItem({ id: 'trend-2' }),
        ]),
        makeSection('recommended', [
          makeItem({ id: 'rec-1' }),
          makeItem({ id: 'rec-2' }),
        ]),
      ]),
    );
  }

  it('returns the featured item when featuredId matches an item in the first section', () => {
    expect(resolveHighlight(makeSections(), 'trend-1')?.id).toBe('trend-1');
  });

  it('returns a featured item from a later section instead of the positional first', () => {
    expect(resolveHighlight(makeSections(), 'rec-2')?.id).toBe('rec-2');
  });

  it('falls back to the first item of the first section when featuredId is null', () => {
    expect(resolveHighlight(makeSections(), null)?.id).toBe('trend-1');
  });

  it('falls back to the first item when featuredId is an empty string', () => {
    expect(resolveHighlight(makeSections(), '')?.id).toBe('trend-1');
  });

  it('falls back to the first item when featuredId matches no item', () => {
    expect(resolveHighlight(makeSections(), 'missing')?.id).toBe('trend-1');
  });

  it('returns null when there are no sections', () => {
    expect(resolveHighlight([], 'anything')).toBeNull();
    expect(resolveHighlight([], null)).toBeNull();
  });

  it('returns null when sections are present but contain no items', () => {
    const emptySections: RadarTodaySection[] = [
      { key: 'trends', label: 'Tendências', items: [] },
      { key: 'recommended', label: 'Recomendados', items: [] },
    ];

    expect(resolveHighlight(emptySections, null)).toBeNull();
    expect(resolveHighlight(emptySections, 'trend-1')).toBeNull();
  });
});
