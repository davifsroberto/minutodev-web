export type RadarCategory = 'trend' | 'tool' | 'release' | 'content';

export interface RadarItem {
  category: RadarCategory;
  categoryLabel: string;
  title: string;
  description: string | null;
  source: string;
  url: string;
}
