import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

/**
 * Bloco de autenticação do cabeçalho.
 *
 * Anônimo: botão "Entrar com Google". Autenticado: só o avatar fica na barra;
 * um dropdown (hover no mouse, clique/Enter em touch e teclado) revela nome,
 * e-mail, links de Histórico/Preferências e Sair. Durante o `loading` inicial
 * (restauração da sessão) não renderiza nada, evitando o flicker de mostrar o
 * botão de login para quem já está logado.
 */
@Component({
  selector: 'app-auth-menu',
  imports: [RouterLink],
  templateUrl: './auth-menu.component.html',
  styleUrl: './auth-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class AuthMenuComponent {
  private readonly auth = inject(AuthService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly status = this.auth.status;
  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly open = signal(false);

  // Distingue abertura por hover da abertura por clique (ver toggleMenu).
  private openedByHover = false;

  // Avatar que falhou ao carregar cai no círculo de iniciais.
  protected readonly avatarBroken = signal(false);

  /** Iniciais do usuário para o fallback do avatar ("Ana Dev" → "AD"). */
  protected readonly initials = computed(() => {
    const parts = (this.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';

    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';

    return `${first}${last}`.toUpperCase();
  });

  protected login(): void {
    this.auth.login();
  }

  protected async logout(): Promise<void> {
    this.open.set(false);
    await this.auth.logout();

    // O avatar some junto com a sessão e o foco cairia no <body>; devolve-o
    // ao botão de login assim que o branch anônimo renderizar.
    afterNextRender(
      () =>
        this.host.nativeElement
          .querySelector<HTMLButtonElement>('.auth-menu__login')
          ?.focus(),
      { injector: this.injector },
    );
  }

  protected toggleMenu(): void {
    if (!this.open()) {
      this.openedByHover = false;
      this.open.set(true);
      return;
    }

    // Absorve o clique que "confirma" um menu recém-aberto por hover — sem
    // isso, todo usuário de mouse que clica no avatar fecha o menu sem querer.
    if (this.openedByHover) {
      this.openedByHover = false;
      return;
    }

    this.open.set(false);
  }

  protected closeMenu(): void {
    this.open.set(false);
  }

  // Hover abre/fecha só para mouse: em touch o pointerenter dispara junto com
  // o tap e faria o clique fechar o menu recém-aberto.
  protected onHoverStart(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;

    if (!this.open()) this.openedByHover = true;
    this.open.set(true);
  }

  protected onHoverEnd(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.open.set(false);
  }

  /** Fecha quando o foco (teclado) sai do componente — ex.: Tab após o Sair. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;

    this.open.set(false);
  }

  protected onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected onEscape(): void {
    if (!this.open()) return;

    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }
}
