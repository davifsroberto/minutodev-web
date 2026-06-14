import {
  RadarApiItem,
  RadarBriefing,
  RadarSection,
  RadarSectionKey,
} from '@app/core/radar/radar.model';

export interface RadarTodayItem {
  id: string;
  title: string;
  summary: string | null;
  sourceName: string;
  url: string;
}

export interface RadarTodaySection {
  key: RadarSectionKey;
  label: string;
  items: RadarTodayItem[];
}

export const RADAR_APP_DISPLAY_ORDER: readonly RadarSectionKey[] = [
  'trends',
  'tools',
  'releases',
  'recommended',
];

export const RADAR_APP_SECTION_LABELS: Record<RadarSectionKey, string> = {
  trends: 'Tendências',
  tools: 'Ferramentas',
  releases: 'Releases',
  recommended: 'Recomendados',
};

export const RADAR_ITEMS_PER_SECTION = 5;

export function toRadarTodaySections(
  briefing: RadarBriefing,
  cap = RADAR_ITEMS_PER_SECTION,
): RadarTodaySection[] {
  const sectionsByKey = new Map<RadarSectionKey, RadarSection>(
    briefing.sections.map((section) => [section.key, section]),
  );

  const sections: RadarTodaySection[] = [];

  for (const sectionKey of RADAR_APP_DISPLAY_ORDER) {
    const items =
      sectionsByKey.get(sectionKey)?.items.slice().sort(compareNewestFirst) ??
      [];
    const cappedItems = items.slice(0, cap).map(toRadarTodayItem);

    if (!cappedItems.length) continue;

    sections.push({
      key: sectionKey,
      label: RADAR_APP_SECTION_LABELS[sectionKey],
      items: cappedItems,
    });
  }

  return sections;
}

function compareNewestFirst(current: RadarApiItem, next: RadarApiItem): number {
  if (current.publishedAt === next.publishedAt) return 0;
  if (current.publishedAt === null) return 1;
  if (next.publishedAt === null) return -1;

  return Date.parse(next.publishedAt) - Date.parse(current.publishedAt);
}

function toRadarTodayItem(item: RadarApiItem): RadarTodayItem {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    sourceName: item.sourceName,
    url: item.url,
  };
}
