import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { AuthUser } from './auth.model';
import { AuthService } from './auth.service';

const ME = `${environment.apiBaseUrl}/auth/me`;
const LOGOUT = `${environment.apiBaseUrl}/auth/logout`;

const user: AuthUser = {
  id: 'u1',
  email: 'ana@example.com',
  name: 'Ana',
  avatarUrl: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('inicia em loading sem disparar requisição (refresh é explícito)', () => {
    expect(service.status()).toBe('loading');
    httpTesting.expectNone(ME);
  });

  it('restaura a sessão autenticada no refresh', async () => {
    const done = service.refresh();
    httpTesting.expectOne(ME).flush(user);
    await done;

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
    expect(service.status()).toBe('authenticated');
  });

  it('fica anônimo quando /auth/me responde 401', async () => {
    const done = service.refresh();
    httpTesting
      .expectOne(ME)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await done;

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.status()).toBe('anonymous');
  });

  it('fica anônimo quando /auth/me falha por erro de rede', async () => {
    const done = service.refresh();
    httpTesting.expectOne(ME).error(new ProgressEvent('error'));
    await done;

    expect(service.isAuthenticated()).toBe(false);
    expect(service.status()).toBe('anonymous');
  });

  it('logout limpa o estado local mesmo com sessão ativa', async () => {
    const refreshed = service.refresh();
    httpTesting.expectOne(ME).flush(user);
    await refreshed;

    const out = service.logout();
    httpTesting.expectOne(LOGOUT).flush({ success: true });
    await out;

    expect(service.user()).toBeNull();
    expect(service.status()).toBe('anonymous');
  });

  it('logout limpa o estado local mesmo se a requisição falhar', async () => {
    const refreshed = service.refresh();
    httpTesting.expectOne(ME).flush(user);
    await refreshed;

    const out = service.logout();
    httpTesting.expectOne(LOGOUT).error(new ProgressEvent('error'));
    await out;

    expect(service.user()).toBeNull();
    expect(service.status()).toBe('anonymous');
  });

  it('ensureLoaded aguarda o refresh em andamento estabilizar', async () => {
    const done = service.refresh();
    const pending = service.ensureLoaded();
    httpTesting.expectOne(ME).flush(user);

    await expect(pending).resolves.toBe(true);
    await done;
  });

  it('expõe a URL de início do OAuth no backend', () => {
    expect(service.googleAuthUrl).toBe(`${environment.apiBaseUrl}/auth/google`);
  });
});
