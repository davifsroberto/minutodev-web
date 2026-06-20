import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('ativa withCredentials em requisições para a API', () => {
    http.get(`${environment.apiBaseUrl}/auth/me`).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/me`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('não envia credenciais para hosts fora da API', () => {
    http.get('https://outro-host.example/recurso').subscribe();

    const req = httpTesting.expectOne('https://outro-host.example/recurso');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});
