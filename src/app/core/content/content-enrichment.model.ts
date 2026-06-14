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
  briefContent: string | null;
  originalUrl: string;
  provider: string | null;
  model: string | null;
  status: EnrichmentStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}
