import {
  RadarApiItem,
  RadarBriefing,
  RadarSection,
  RadarSectionKey,
} from '@app/core/radar/radar.model';

export interface RadarBadge {
  icon: string;
  label: string;
}

export interface RadarTodayItem {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string;
  url: string;
  imageUrl: string | null;
  sourceCount: number;
  badge: RadarBadge;
}

export interface RadarTodaySection {
  key: RadarSectionKey;
  label: string;
  items: RadarTodayItem[];
}

/**
 * Ordem visual da Home (Sprint 5D-4.7): destaque no topo, depois Tendências e
 * Recomendados, então as demais. Independe da ordem que o backend devolve.
 */
export const RADAR_APP_DISPLAY_ORDER: readonly RadarSectionKey[] = [
  'trends',
  'recommended',
  'tools',
  'releases',
];

export const RADAR_APP_SECTION_LABELS: Record<RadarSectionKey, string> = {
  trends: 'Tendências',
  tools: 'Ferramentas',
  releases: 'Releases',
  recommended: 'Recomendados',
};

export const RADAR_ITEMS_PER_SECTION = 5;

/**
 * Badge base por seção — o "porquê" do conteúdo aparecer (Sprint 5D-4.4).
 * Todo item cai em uma seção, então há sempre um badge.
 */
const SECTION_BADGE: Record<RadarSectionKey, RadarBadge> = {
  trends: { icon: '🔥', label: 'Tendência' },
  tools: { icon: '🛠️', label: 'Ferramenta' },
  releases: { icon: '🚀', label: 'Release' },
  recommended: { icon: '⭐', label: 'Recomendado' },
};

/**
 * Badge temático (deriva da `category` do conteúdo) que se sobrepõe ao da seção
 * quando reconhecível — dá um sinal mais específico que o agrupamento.
 */
const TOPIC_BADGE: Record<string, RadarBadge> = {
  ai: { icon: '🤖', label: 'IA' },
  ia: { icon: '🤖', label: 'IA' },
  cloud: { icon: '☁️', label: 'Cloud' },
  security: { icon: '🔒', label: 'Segurança' },
  seguranca: { icon: '🔒', label: 'Segurança' },
};

export function radarBadgeFor(
  category: string | null,
  sectionKey: RadarSectionKey,
): RadarBadge {
  const topic = category ? TOPIC_BADGE[normalizeCategory(category)] : undefined;

  return topic ?? SECTION_BADGE[sectionKey];
}

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function toRadarTodaySections(
  briefing: RadarBriefing,
  cap = RADAR_ITEMS_PER_SECTION,
): RadarTodaySection[] {
  const sectionsByKey = new Map<RadarSectionKey, RadarSection>(
    briefing.sections.map((section) => [section.key, section]),
  );

  const sections: RadarTodaySection[] = [];

  for (const sectionKey of RADAR_APP_DISPLAY_ORDER) {
    const items = sectionsByKey.get(sectionKey)?.items ?? [];
    const cappedItems = items
      .slice(0, cap)
      .map((item) => toRadarTodayItem(item, sectionKey));

    if (!cappedItems.length) continue;

    sections.push({
      key: sectionKey,
      label: RADAR_APP_SECTION_LABELS[sectionKey],
      items: cappedItems,
    });
  }

  return sections;
}

function toRadarTodayItem(
  item: RadarApiItem,
  sectionKey: RadarSectionKey,
): RadarTodayItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    sourceName: item.sourceName,
    url: item.url,
    imageUrl: item.imageUrl ?? null,
    sourceCount: item.sourceCount ?? 1,
    badge: radarBadgeFor(item.category, sectionKey),
  };
}
