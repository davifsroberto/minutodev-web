/**
 * API wire contract — mirrors `GET /radar/today` JSON exactly (camelCase).
 * See TechSpec "Core Interfaces". Do not add view concerns here.
 */
export type RadarSectionKey = 'releases' | 'tools' | 'trends' | 'recommended';

export type ContentType =
  | 'ARTICLE'
  | 'RELEASE'
  | 'TOOL'
  | 'DISCUSSION'
  | 'REPOSITORY';

export interface RadarApiItem {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  sourceName: string;
  category: string | null;
  contentType: ContentType;
  publishedAt: string | null;
}

export interface RadarSection {
  key: RadarSectionKey;
  items: RadarApiItem[];
}

export interface RadarBriefing {
  date: string;
  sections: RadarSection[];
  estimatedReadTimeMinutes: number;
}
