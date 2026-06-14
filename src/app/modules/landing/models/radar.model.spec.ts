import {
  RadarApiItem,
  RadarBriefing,
  RadarSection,
  RadarSectionKey,
} from '@app/core/radar/radar.model';
import { toRadarItems } from './radar.model';

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

describe('toRadarItems', () => {
  describe('section → category + label mapping', () => {
    it('maps trends to category "trend" with the PT-BR label and the trend accent', () => {
      const briefing = makeBriefing([
        makeSection('trends', [makeItem({ title: 'Trend item' })]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.category).toBe('trend');
      expect(card.categoryLabel).toBe('Tendência do dia');
      // The trend accent badge is derived from `category === 'trend'`.
      expect(card.category === 'trend').toBe(true);
    });

    it('maps tools to "Ferramenta em destaque" without the trend accent', () => {
      const briefing = makeBriefing([
        makeSection('tools', [makeItem({ title: 'Tool item' })]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.category).toBe('tool');
      expect(card.categoryLabel).toBe('Ferramenta em destaque');
      expect(card.category === 'trend').toBe(false);
    });

    it('maps releases to "Release relevante" without the trend accent', () => {
      const briefing = makeBriefing([
        makeSection('releases', [makeItem({ title: 'Release item' })]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.category).toBe('release');
      expect(card.categoryLabel).toBe('Release relevante');
      expect(card.category === 'trend').toBe(false);
    });

    it('maps recommended to "Conteúdo recomendado" without the trend accent', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [makeItem({ title: 'Recommended item' })]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.category).toBe('content');
      expect(card.categoryLabel).toBe('Conteúdo recomendado');
      expect(card.category === 'trend').toBe(false);
    });
  });

  describe('selection', () => {
    it('uses only the newest item (items[0]) when a section has multiple', () => {
      const briefing = makeBriefing([
        makeSection('trends', [
          makeItem({ id: 'newest', title: 'Newest' }),
          makeItem({ id: 'older', title: 'Older' }),
          makeItem({ id: 'oldest', title: 'Oldest' }),
        ]),
      ]);

      const cards = toRadarItems(briefing);

      expect(cards).toHaveLength(1);
      expect(cards[0].title).toBe('Newest');
    });
  });

  describe('ordering', () => {
    it('returns cards in the fixed display order regardless of backend section order', () => {
      const briefing = makeBriefing([
        makeSection('recommended', [makeItem({ title: 'Recommended' })]),
        makeSection('releases', [makeItem({ title: 'Release' })]),
        makeSection('tools', [makeItem({ title: 'Tool' })]),
        makeSection('trends', [makeItem({ title: 'Trend' })]),
      ]);

      const categories = toRadarItems(briefing).map((card) => card.category);

      expect(categories).toEqual(['trend', 'tool', 'release', 'content']);
    });
  });

  describe('empty handling', () => {
    it('omits a section whose items array is empty (no placeholder card)', () => {
      const briefing = makeBriefing([
        makeSection('trends', [makeItem({ title: 'Trend' })]),
        makeSection('tools', []),
        makeSection('releases', [makeItem({ title: 'Release' })]),
      ]);

      const categories = toRadarItems(briefing).map((card) => card.category);

      expect(categories).toEqual(['trend', 'release']);
    });

    it('yields [] when all sections are empty', () => {
      const briefing = makeBriefing([
        makeSection('trends', []),
        makeSection('tools', []),
        makeSection('releases', []),
        makeSection('recommended', []),
      ]);

      expect(toRadarItems(briefing)).toEqual([]);
    });

    it('yields [] when the briefing has no sections at all', () => {
      expect(toRadarItems(makeBriefing([]))).toEqual([]);
    });
  });

  describe('field carry-through', () => {
    it('preserves a null summary as a null description (not coerced)', () => {
      const briefing = makeBriefing([
        makeSection('tools', [makeItem({ summary: null })]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.description).toBeNull();
    });

    it('carries url through and derives source from sourceName', () => {
      const briefing = makeBriefing([
        makeSection('releases', [
          makeItem({
            url: 'https://example.com/release-notes',
            sourceName: 'Release notes',
          }),
        ]),
      ]);

      const [card] = toRadarItems(briefing);

      expect(card.url).toBe('https://example.com/release-notes');
      expect(card.source).toBe('Release notes');
    });

    it('does not mutate the input briefing (pure function)', () => {
      const briefing = makeBriefing([
        makeSection('trends', [makeItem({ title: 'Trend' })]),
      ]);
      const snapshot = JSON.parse(JSON.stringify(briefing));

      toRadarItems(briefing);

      expect(briefing).toEqual(snapshot);
    });
  });

  describe('integration — full realistic briefing', () => {
    it('maps all four populated sections to exactly four ordered cards', () => {
      const briefing: RadarBriefing = {
        date: '2026-06-13',
        estimatedReadTimeMinutes: 8,
        sections: [
          makeSection('releases', [
            makeItem({
              id: 'rel-1',
              title: 'Node 24 LTS lançado',
              summary: 'APIs estáveis e ganhos de performance.',
              url: 'https://nodejs.org/blog/release/v24',
              sourceName: 'Node.js Blog',
              contentType: 'RELEASE',
            }),
            makeItem({ id: 'rel-2', title: 'Release secundário' }),
          ]),
          makeSection('tools', [
            makeItem({
              id: 'tool-1',
              title: 'Novo bundler nativo',
              summary: 'Builds rápidos com configuração mínima.',
              url: 'https://github.com/trending',
              sourceName: 'GitHub Trending',
              contentType: 'TOOL',
            }),
          ]),
          makeSection('trends', [
            makeItem({
              id: 'trend-1',
              title: 'Signals viram padrão de reatividade',
              summary: 'Frameworks convergem para signals.',
              url: 'https://example.com/signals',
              sourceName: 'Blogs de engenharia',
              contentType: 'ARTICLE',
            }),
          ]),
          makeSection('recommended', [
            makeItem({
              id: 'rec-1',
              title: 'Guia prático de testes',
              summary: null,
              url: 'https://example.com/testing-guide',
              sourceName: 'Newsletter da comunidade',
              contentType: 'ARTICLE',
            }),
          ]),
        ],
      };

      const cards = toRadarItems(briefing);

      expect(cards).toHaveLength(4);
      expect(cards).toEqual([
        {
          category: 'trend',
          categoryLabel: 'Tendência do dia',
          title: 'Signals viram padrão de reatividade',
          description: 'Frameworks convergem para signals.',
          source: 'Blogs de engenharia',
          url: 'https://example.com/signals',
        },
        {
          category: 'tool',
          categoryLabel: 'Ferramenta em destaque',
          title: 'Novo bundler nativo',
          description: 'Builds rápidos com configuração mínima.',
          source: 'GitHub Trending',
          url: 'https://github.com/trending',
        },
        {
          category: 'release',
          categoryLabel: 'Release relevante',
          title: 'Node 24 LTS lançado',
          description: 'APIs estáveis e ganhos de performance.',
          source: 'Node.js Blog',
          url: 'https://nodejs.org/blog/release/v24',
        },
        {
          category: 'content',
          categoryLabel: 'Conteúdo recomendado',
          title: 'Guia prático de testes',
          description: null,
          source: 'Newsletter da comunidade',
          url: 'https://example.com/testing-guide',
        },
      ]);
      // Trend accent lives on the first card.
      expect(cards[0].category).toBe('trend');
    });
  });
});
