import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '@environments/environment';

/**
 * Garante o envio do cookie de sessão (httpOnly) nas requisições à API.
 *
 * Necessário porque o front e a API podem estar em origens distintas; sem
 * `withCredentials` o browser não anexa o cookie. Restrito à `apiBaseUrl` para
 * não vazar credenciais para outros hosts.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiBaseUrl)) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(req);
};
