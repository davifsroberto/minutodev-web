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

/** Estado de leitura do usuário — presente apenas no `GET /radar/for-you`. */
export interface RadarViewerState {
  opened: boolean;
  read: boolean;
}

export interface RadarApiItem {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  sourceName: string;
  // O backend sempre envia (string|null); opcional aqui só para não obrigar
  // fixtures/mocks legados a preenchê-lo. Leia sempre como `imageUrl ?? null`.
  imageUrl?: string | null;
  sourceCount?: number;
  category: string | null;
  contentType: ContentType;
  publishedAt: string | null;
  // Só no `/radar/for-you` (autenticado); ausente no `/radar/today`.
  viewerState?: RadarViewerState;
}

export interface RadarSection {
  key: RadarSectionKey;
  items: RadarApiItem[];
}

export interface RadarBriefing {
  date: string;
  featuredId: string | null;
  sections: RadarSection[];
  estimatedReadTimeMinutes: number;
  // Presentes apenas no `GET /radar/for-you`; o radar geral não os envia.
  personalized?: boolean;
  personalizationFallback?: boolean;
}
