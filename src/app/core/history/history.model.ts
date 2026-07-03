/** Situação de leitura de um conteúdo no histórico. */
export type HistoryStatus = 'READ' | 'OPENED';

/** Estado do registro, espelhando os POSTs de `/me/history/contents/:id/*`. */
export interface HistoryEntry {
  contentId: string;
  firstOpenedAt: string;
  lastOpenedAt: string;
  readAt: string | null;
  openCount: number;
  status: HistoryStatus;
}

/** Item do histórico com dados de exibição, espelhando `GET /me/history`. */
export interface HistoryItem {
  contentId: string;
  title: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  lastOpenedAt: string;
  readAt: string | null;
  status: HistoryStatus;
}

/** Página do `GET /me/history` (envelope de paginação do backend). */
export interface HistoryPage {
  data: HistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
