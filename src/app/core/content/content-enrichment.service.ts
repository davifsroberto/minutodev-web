import {
  HttpClient,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';

import { environment } from '@environments/environment';
import { ContentEnrichment } from './content-enrichment.model';

/** Janela de cooldown do warm: não re-aquece o mesmo conteúdo nesse intervalo. */
const WARM_COOLDOWN_MS = 10 * 60 * 1000;
const WARM_KEY_PREFIX = 'mn:warm:';

@Injectable({ providedIn: 'root' })
export class ContentEnrichmentService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/contents`;
  private readonly warmed = new Set<string>();

  loadById(
    id: Signal<string | null | undefined>,
  ): HttpResourceRef<ContentEnrichment | undefined> {
    return httpResource<ContentEnrichment>(() => {
      const value = id();

      return value ? `${this.endpoint}/${value}/enrichment` : undefined;
    });
  }

  /**
   * Dispara (fire-and-forget) a geração sob demanda do enrichment de um conteúdo
   * — gera a tradução pt-BR que o radar reaproveita na próxima carga (ex.: o
   * conteúdo em destaque da Home). Não renderiza nada.
   *
   * O cooldown via sessionStorage sobrevive a reloads/abas: sem ele, cada F5 da
   * Home re-dispararia a geração de um destaque ainda PENDING (rate limit),
   * martelando a quota da IA. Cai para um Set em memória se o storage falhar.
   */
  warm(id: string): void {
    if (this.recentlyWarmed(id)) return;
    this.rememberWarm(id);

    this.http.get(`${this.endpoint}/${id}/enrichment`).subscribe({
      error: () => this.forgetWarm(id),
    });
  }

  private recentlyWarmed(id: string): boolean {
    if (this.warmed.has(id)) return true;

    const at = this.readWarmStamp(id);

    return at !== null && Date.now() - at < WARM_COOLDOWN_MS;
  }

  private rememberWarm(id: string): void {
    this.warmed.add(id);
    this.store()?.setItem(WARM_KEY_PREFIX + id, String(Date.now()));
  }

  private forgetWarm(id: string): void {
    this.warmed.delete(id);
    this.store()?.removeItem(WARM_KEY_PREFIX + id);
  }

  private readWarmStamp(id: string): number | null {
    const raw = this.store()?.getItem(WARM_KEY_PREFIX + id);
    if (!raw) return null;

    const at = Number(raw);

    return Number.isFinite(at) ? at : null;
  }

  private store(): Storage | null {
    try {
      return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
    } catch {
      return null;
    }
  }
}
