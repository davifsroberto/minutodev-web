import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

/**
 * Bloco de autenticação do cabeçalho.
 *
 * Mostra "Entrar com Google" quando anônimo e avatar + nome + Preferências +
 * Sair quando autenticado. Durante o `loading` inicial (restauração da sessão)
 * não renderiza nada, evitando o flicker de mostrar o botão de login para quem
 * já está logado.
 */
@Component({
  selector: 'app-auth-menu',
  imports: [RouterLink],
  templateUrl: './auth-menu.component.html',
  styleUrl: './auth-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthMenuComponent {
  private readonly auth = inject(AuthService);

  protected readonly status = this.auth.status;
  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected login(): void {
    this.auth.login();
  }

  protected logout(): void {
    void this.auth.logout();
  }
}
