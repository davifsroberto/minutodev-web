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
  summary30s: string | null;
  shortSummary: string | null;
  whyItMatters: string | null;
  keyInsight: string | null;
  keyPoints: string[];
  example: string | null;
  whenToUse: string | null;
  audienceFor: string[];
  audienceIgnore: string[];
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
