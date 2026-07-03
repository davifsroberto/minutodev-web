import {
  HttpClient,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { environment } from '@environments/environment';
import { HistoryEntry, HistoryPage } from './history.model';

/** Tamanho da página inicial do histórico (paginação de UI fica para depois). */
const HISTORY_PAGE_SIZE = 50;

/**
 * Histórico de leitura do usuário autenticado (`/me/history`).
 *
 * O registro de abertura é best-effort: nunca deve quebrar a página de
 * conteúdo, então falhas viram `null` em vez de erro. A listagem é um resource
 * criado sob demanda (`list()`) — e não um campo eager como em outros serviços —
 * porque este serviço também é injetado na página de conteúdo, onde um GET
 * automático de `/me/history` seria um 401 inútil para visitantes anônimos.
 * O cookie de sessão viaja via `credentialsInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Registra a abertura de um conteúdo; `null` quando a chamada falha. */
  async registerOpen(contentId: string): Promise<HistoryEntry | null> {
    try {
      return await firstValueFrom(
        this.http.post<HistoryEntry>(
          `${this.baseUrl}/me/history/contents/${contentId}/open`,
          {},
        ),
      );
    } catch {
      return null;
    }
  }

  /** Marca o conteúdo como lido; erros propagam para feedback do chamador. */
  markAsRead(contentId: string): Promise<HistoryEntry> {
    return firstValueFrom(
      this.http.post<HistoryEntry>(
        `${this.baseUrl}/me/history/contents/${contentId}/read`,
        {},
      ),
    );
  }

  /** Resource do histórico, ordenado pelo backend por último acesso. */
  list(): HttpResourceRef<HistoryPage | undefined> {
    return httpResource<HistoryPage>(() => ({
      url: `${this.baseUrl}/me/history`,
      params: { limit: HISTORY_PAGE_SIZE },
    }));
  }
}
