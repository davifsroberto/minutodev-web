import {
  RadarBriefing,
  RadarSection,
  RadarSectionKey,
} from '@app/core/radar/radar.model';
import { RadarCategory, RadarItem } from './radar-item.model';

/**
 * Fixed display order for the landing cards (ADR-002 / TechSpec "Data Models").
 * Trends first so the accent badge stays at the top, matching the current mock.
 */
const DISPLAY_ORDER: readonly RadarSectionKey[] = [
  'trends',
  'tools',
  'releases',
  'recommended',
];

/**
 * Frontend-owned mapping from a backend section key to its view-model
 * category and localized PT-BR label (ADR-002). The trend accent badge is
 * derived downstream from `category === 'trend'`, so no separate flag is kept.
 */
const SECTION_VIEW: Record<
  RadarSectionKey,
  { category: RadarCategory; categoryLabel: string }
> = {
  trends: { category: 'trend', categoryLabel: 'Tendência do dia' },
  tools: { category: 'tool', categoryLabel: 'Ferramenta em destaque' },
  releases: { category: 'release', categoryLabel: 'Release relevante' },
  recommended: { category: 'content', categoryLabel: 'Conteúdo recomendado' },
};

/**
 * Maps a briefing to the landing cards: the newest item (`items[0]`) of each
 * non-empty section, in fixed display order, with PT-BR labels applied.
 * Empty sections are omitted; an all-empty briefing yields `[]`.
 *
 * Pure (no I/O) and fully unit-testable.
 */
export function toRadarItems(briefing: RadarBriefing): RadarItem[] {
  const sectionsByKey = new Map<RadarSectionKey, RadarSection>(
    briefing.sections.map((section) => [section.key, section]),
  );

  const cards: RadarItem[] = [];

  for (const displayOrderKey of DISPLAY_ORDER) {
    const newest = sectionsByKey.get(displayOrderKey)?.items[0];

    if (!newest) continue;

    const { title, summary, sourceName, url } = newest;
    const { category, categoryLabel } = SECTION_VIEW[displayOrderKey];

    cards.push({
      category: category,
      categoryLabel: categoryLabel,
      title: title,
      description: summary,
      source: sourceName,
      url: url,
    });
  }

  return cards;
}
