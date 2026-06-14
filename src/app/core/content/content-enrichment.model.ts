export type EnrichmentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface ContentEnrichment {
  id: string;
  contentId: string;
  language: string;
  translatedTitle: string | null;
  shortSummary: string | null;
  whyItMatters: string | null;
  keyPoints: string[];
  example: string | null;
  whenToUse: string | null;
  briefContent: string | null;
  originalUrl: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  provider: string | null;
  model: string | null;
  status: EnrichmentStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
