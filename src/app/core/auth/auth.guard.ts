import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Base para as futuras rotas autenticadas da V2 (ainda não aplicada a nenhuma
 * rota — ver Sprint 10, item 10.5). Aguarda a sessão estabilizar após um
 * refresh antes de decidir, evitando redirecionar enquanto o /auth/me carrega.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authenticated = await auth.ensureLoaded();

  return authenticated ? true : router.createUrlTree(['/']);
};
