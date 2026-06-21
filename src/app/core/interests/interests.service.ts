import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { environment } from '@environments/environment';
import { InterestTopic, UserInterests } from './interests.model';

/**
 * Acesso aos interesses do usuário e ao catálogo de temas.
 *
 * Leituras reativas via `httpResource` (catálogo e interesses atuais); a escrita
 * (replace total) usa `HttpClient.put` e atualiza o cache do resource `mine`
 * com o estado salvo, evitando um GET extra. O cookie de sessão viaja via
 * `credentialsInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class InterestsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Catálogo de temas disponíveis — fonte única vinda do backend. */
  readonly catalog = httpResource<InterestTopic[]>(() => ({
    url: `${this.baseUrl}/interests/catalog`,
  }));

  /** Interesses atuais do usuário autenticado. */
  readonly mine = httpResource<UserInterests>(() => ({
    url: `${this.baseUrl}/me/interests`,
  }));

  /** Substitui (replace total) os interesses do usuário pelos slugs informados. */
  async save(slugs: string[]): Promise<UserInterests> {
    const updated = await firstValueFrom(
      this.http.put<UserInterests>(`${this.baseUrl}/me/interests`, {
        interests: slugs,
      }),
    );

    this.mine.set(updated);

    return updated;
  }
}
