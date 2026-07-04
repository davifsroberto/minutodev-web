import { httpResource } from '@angular/common/http';
import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  untracked,
} from '@angular/core';

import { environment } from '@environments/environment';
import { AuthService } from '@app/core/auth/auth.service';
import { CLOCK } from '@app/core/time/clock';
import { LocalDateUtil } from '@app/core/time/local-date.util';
import { RadarBriefing } from './radar.model';

/**
 * Radar diário como resource único reativo: a URL acompanha o estado da
 * sessão — anônimo consome `/radar/today`, autenticado `/radar/for-you`.
 * Enquanto a sessão está `loading` o resource fica ocioso (request undefined),
 * evitando o fetch duplicado no boot. Se o `/radar/for-you` falhar, degrada
 * para o radar geral. O ranking vem sempre pronto do backend; aqui nada é
 * reordenado ou recalculado.
 */
@Injectable({ providedIn: 'root' })
export class RadarService {
  private readonly auth = inject(AuthService);
  private readonly now = inject(CLOCK);
  private readonly baseUrl = environment.apiBaseUrl;

  // Reseta a cada transição de sessão: um novo login volta a tentar o for-you.
  private readonly forYouFailed = linkedSignal({
    source: this.auth.status,
    computation: () => false,
  });

  private readonly wantsForYou = computed(
    () => this.auth.status() === 'authenticated' && !this.forYouFailed(),
  );

  readonly today = httpResource<RadarBriefing>(() => {
    if (this.auth.status() === 'loading') return undefined;

    return {
      url: `${this.baseUrl}/radar/${this.wantsForYou() ? 'for-you' : 'today'}`,
      params: { date: LocalDateUtil.toLocalDateParam(this.now()) },
    };
  });

  constructor() {
    // Degradação: erro no for-you troca a URL para o radar geral (o resource
    // refaz o fetch sozinho). Erro já no radar geral fica para a UI de retry.
    effect(() => {
      if (this.today.status() === 'error' && untracked(this.wantsForYou)) {
        this.forYouFailed.set(true);
      }
    });
  }
}
