import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { environment } from '@environments/environment';
import { AuthStatus, AuthUser } from './auth.model';

/**
 * Estado de sessão do cliente.
 *
 * A sessão vive num cookie httpOnly emitido pelo backend; o cliente nunca toca
 * no token. No boot consulta `GET /auth/me` para restaurar a sessão (sobrevive
 * a refresh), expõe o usuário como signal e centraliza login/logout.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _status = signal<AuthStatus>('loading');

  /** Usuário autenticado, ou `null`. */
  readonly user = this._user.asReadonly();
  /** Estado bruto da sessão (`loading` | `authenticated` | `anonymous`). */
  readonly status = this._status.asReadonly();
  /** Atalho para templates: sessão ativa? */
  readonly isAuthenticated = computed(() => this._status() === 'authenticated');

  private inflight: Promise<void> | null = null;

  /** Restaura a sessão consultando o backend (o cookie viaja sozinho). */
  refresh(): Promise<void> {
    this._status.set('loading');

    this.inflight = firstValueFrom(
      this.http.get<AuthUser>(`${this.baseUrl}/auth/me`),
    ).then(
      (user) => {
        this._user.set(user);
        this._status.set('authenticated');
      },
      () => {
        this._user.set(null);
        this._status.set('anonymous');
      },
    );

    return this.inflight;
  }

  /** URL que inicia o fluxo OAuth no backend (exposta para inspeção/teste). */
  get googleAuthUrl(): string {
    return `${this.baseUrl}/auth/google`;
  }

  /** Redireciona o browser para o início do fluxo OAuth no backend. */
  login(): void {
    if (!this.isBrowser) return;

    window.location.href = this.googleAuthUrl;
  }

  /** Encerra a sessão no backend e limpa o estado local (best-effort). */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/auth/logout`, {}));
    } catch {
      // Mesmo se a chamada falhar (rede/servidor), limpamos a sessão local.
    } finally {
      this._user.set(null);
      this._status.set('anonymous');
    }
  }

  /**
   * Resolve quando a sessão deixa de estar `loading` — para guards que
   * precisam de uma decisão estável logo após um refresh da página.
   */
  async ensureLoaded(): Promise<boolean> {
    // Se a restauração ainda não rodou (ex.: guard atingido antes do app
    // initializer), dispara agora; senão, aguarda a chamada em andamento/feita.
    await (this.inflight ?? this.refresh());

    return this.isAuthenticated();
  }
}
