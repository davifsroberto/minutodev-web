import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
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

  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly status = this.auth.status;
  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly open = signal(false);

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

  protected logout(): void {
    this.open.set(false);
    void this.auth.logout();
  }

  protected toggleMenu(): void {
    this.open.update((value) => !value);
  }

  protected closeMenu(): void {
    this.open.set(false);
  }

  // Hover abre/fecha só para mouse: em touch o pointerenter dispara junto com
  // o tap e faria o clique fechar o menu recém-aberto.
  protected onHoverStart(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.open.set(true);
  }

  protected onHoverEnd(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.open.set(false);
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
