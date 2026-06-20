/**
 * Development environment. Swapped in for `environment.ts` via the
 * `development` build configuration's `fileReplacements` in `angular.json`.
 *
 * `apiBaseUrl` é relativo (vazio) de propósito: o dev-server (porta 4500)
 * proxia `/auth`, `/radar` e `/contents` para a API local (porta 3500) via
 * `proxy.conf.json`. Assim as chamadas ficam same-origin e o cookie de sessão
 * (httpOnly) é enviado sem fricção de SameSite/CORS em desenvolvimento.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
};
