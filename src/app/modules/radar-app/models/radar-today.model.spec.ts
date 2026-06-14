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
  toRadarTodaySections,
} from './radar-today.model';

function makeItem(overrides: Partial<RadarApiItem> = {}): RadarApiItem {
  return {
    id: 'id-1',
    title: 'Item title',
    summary: 'Item summary',
    url: 'https://example.com/item',
    sourceName: 'Example Source',
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
    sections,
    estimatedReadTimeMinutes: 6,
  };
}

describe('toRadarTodaySections', () => {
  describe('constants', () => {
    it('defines the app display order, PT-BR labels, and shared cap', () => {
      expect(RADAR_APP_DISPLAY_ORDER).toEqual([
        'trends',
        'tools',
        'releases',
        'recommended',
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
        'tools',
        'releases',
        'recommended',
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
        'Ferramentas',
        'Releases',
        'Recomendados',
      ]);
    });
  });

  describe('item ordering', () => {
    it('sorts a section newest-first by publishedAt descending', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({
            id: 'oldest',
            publishedAt: '2026-06-11T08:00:00.000Z',
          }),
          makeItem({
            id: 'newest',
            publishedAt: '2026-06-13T08:00:00.000Z',
          }),
          makeItem({
            id: 'middle',
            publishedAt: '2026-06-12T08:00:00.000Z',
          }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.items.map((item) => item.id)).toEqual([
        'newest',
        'middle',
        'oldest',
      ]);
    });

    it('sorts null publishedAt values last and preserves stable order among equal and null dates', () => {
      const briefing = makeBriefing([
        makeSection('tools', [
          makeItem({ id: 'null-a', publishedAt: null }),
          makeItem({
            id: 'same-a',
            publishedAt: '2026-06-13T08:00:00.000Z',
          }),
          makeItem({ id: 'null-b', publishedAt: null }),
          makeItem({
            id: 'same-b',
            publishedAt: '2026-06-13T08:00:00.000Z',
          }),
          makeItem({
            id: 'older',
            publishedAt: '2026-06-12T08:00:00.000Z',
          }),
        ]),
      ]);

      const [section] = toRadarTodaySections(briefing);

      expect(section.items.map((item) => item.id)).toEqual([
        'same-a',
        'same-b',
        'older',
        'null-a',
        'null-b',
      ]);
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
        },
      ]);
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
