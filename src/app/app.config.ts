import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { credentialsInterceptor } from './core/auth/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    // Restaura a sessão no boot (fire-and-forget): não bloqueia o primeiro
    // paint — o cabeçalho fica em `loading` até o /auth/me responder.
    provideAppInitializer(() => {
      void inject(AuthService).refresh();
    }),
  ],
};
