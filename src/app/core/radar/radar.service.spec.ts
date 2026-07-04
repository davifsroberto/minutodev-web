import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { ApplicationRef, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { AuthStatus } from '@app/core/auth/auth.model';
import { AuthService } from '@app/core/auth/auth.service';
import { CLOCK } from '@app/core/time/clock';
import { LocalDateUtil } from '@app/core/time/local-date.util';
import { RadarBriefing } from './radar.model';
import { RadarService } from './radar.service';

const TODAY_BASE = `${environment.apiBaseUrl}/radar/today`;
const FOR_YOU_BASE = `${environment.apiBaseUrl}/radar/for-you`;

const FIXED_NOW = new Date(2026, 5, 13, 22, 30, 0);
const LOCAL_DATE = '2026-06-13';
const ENDPOINT = `${TODAY_BASE}?date=${LOCAL_DATE}`;
const FOR_YOU_ENDPOINT = `${FOR_YOU_BASE}?date=${LOCAL_DATE}`;

function makeBriefing(overrides: Partial<RadarBriefing> = {}): RadarBriefing {
  return {
    date: LOCAL_DATE,
    featuredId: 'trend-1',
    estimatedReadTimeMinutes: 7,
    sections: [
      {
        key: 'trends',
        items: [
          {
            id: 'trend-1',
            title: 'Signals viram padrão de reatividade',
            summary: 'Frameworks convergem para signals.',
            url: 'https://example.com/signals',
            sourceName: 'Blogs de engenharia',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('RadarService', () => {
  let service: RadarService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;
  let authStatus: WritableSignal<AuthStatus>;

  const settle = (): Promise<void> => appRef.whenStable();

  /**
   * Aguarda a requisição aberta pelo effect de degradação. Não dá para usar
   * `whenStable()` aqui: o próprio fetch de fallback fica pendente e impediria
   * a estabilização — então avança ticks/microtasks até a requisição existir.
   */
  const nextRequest = async (endpoint: string): Promise<TestRequest> => {
    for (let attempt = 0; attempt < 20; attempt++) {
      TestBed.tick();
      const [request] = httpTesting.match(
        (req) => req.urlWithParams === endpoint,
      );
      if (request) return request;
      await Promise.resolve();
    }

    throw new Error(`Requisição não disparada: ${endpoint}`);
  };

  beforeEach(() => {
    authStatus = signal<AuthStatus>('anonymous');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CLOCK, useValue: () => FIXED_NOW },
        { provide: AuthService, useValue: { status: authStatus } },
      ],
    });

    service = TestBed.inject(RadarService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('unit — request shape (anônimo)', () => {
    it('issues a single GET to `/radar/today` carrying the local `date`', () => {
      TestBed.tick();

      const req = httpTesting.expectOne(ENDPOINT);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(TODAY_BASE);

      req.flush(makeBriefing());
    });

    it('sends the user local day as the only query param, no Authorization', () => {
      TestBed.tick();

      const req = httpTesting.expectOne(ENDPOINT);
      expect(req.request.headers.has('Authorization')).toBe(false);
      expect(req.request.params.keys()).toEqual(['date']);
      expect(req.request.params.get('date')).toBe(
        LocalDateUtil.toLocalDateParam(FIXED_NOW),
      );
      expect(req.request.urlWithParams).toBe(ENDPOINT);

      req.flush(makeBriefing());
    });

    it('exposes the flushed briefing through `today.value()`', async () => {
      const briefing = makeBriefing();
      TestBed.tick();

      httpTesting.expectOne(ENDPOINT).flush(briefing);
      await settle();

      expect(service.today.value()).toEqual(briefing);
      expect(service.today.status()).toBe('resolved');
    });
  });

  describe('unit — troca de URL por estado de sessão (12B)', () => {
    it('stays idle while the session is loading — no duplicate boot fetch', () => {
      authStatus.set('loading');
      TestBed.tick();

      httpTesting.expectNone(() => true);
      expect(service.today.status()).toBe('idle');
    });

    it('requests `/radar/for-you` once the session resolves as authenticated', () => {
      authStatus.set('loading');
      TestBed.tick();
      httpTesting.expectNone(() => true);

      authStatus.set('authenticated');
      TestBed.tick();

      const req = httpTesting.expectOne(FOR_YOU_ENDPOINT);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('date')).toBe(LOCAL_DATE);

      req.flush(
        makeBriefing({ personalized: true, personalizationFallback: false }),
      );
    });

    it('requests `/radar/today` once the session resolves as anonymous', () => {
      authStatus.set('loading');
      TestBed.tick();
      httpTesting.expectNone(() => true);

      authStatus.set('anonymous');
      TestBed.tick();

      httpTesting.expectOne(ENDPOINT).flush(makeBriefing());
    });

    it('exposes the for-you personalization flags untouched', async () => {
      authStatus.set('authenticated');
      TestBed.tick();

      httpTesting
        .expectOne(FOR_YOU_ENDPOINT)
        .flush(
          makeBriefing({ personalized: true, personalizationFallback: false }),
        );
      await settle();

      expect(service.today.value()?.personalized).toBe(true);
      expect(service.today.value()?.personalizationFallback).toBe(false);
    });
  });

  describe('integration — degradação do for-you para o radar geral (12B)', () => {
    it('falls back to `/radar/today` when `/radar/for-you` fails', async () => {
      authStatus.set('authenticated');
      TestBed.tick();

      httpTesting.expectOne(FOR_YOU_ENDPOINT).flush('Falha no servidor', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      // O effect degrada a URL e o resource refaz o fetch sozinho.
      const fallback = await nextRequest(ENDPOINT);
      fallback.flush(makeBriefing());
      await settle();

      expect(service.today.status()).toBe('resolved');
      expect(service.today.value()?.personalized).toBeUndefined();
    });

    it('keeps the error state (with no extra fetch) when the general radar also fails', async () => {
      authStatus.set('authenticated');
      TestBed.tick();

      httpTesting.expectOne(FOR_YOU_ENDPOINT).flush('Falha', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const fallback = await nextRequest(ENDPOINT);
      fallback.flush('Falha', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      await settle();

      expect(service.today.error()).toBeTruthy();
      httpTesting.expectNone(() => true);
    });

    it('retries `/radar/for-you` after a new session transition', async () => {
      authStatus.set('authenticated');
      TestBed.tick();
      httpTesting.expectOne(FOR_YOU_ENDPOINT).flush('Falha', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      (await nextRequest(ENDPOINT)).flush(makeBriefing());
      await settle();

      // Logout + login: o linkedSignal zera a falha e volta a personalizar.
      authStatus.set('anonymous');
      TestBed.tick();
      httpTesting.expectOne(ENDPOINT).flush(makeBriefing());
      await settle();

      authStatus.set('authenticated');
      TestBed.tick();
      httpTesting
        .expectOne(FOR_YOU_ENDPOINT)
        .flush(
          makeBriefing({ personalized: true, personalizationFallback: false }),
        );
      await settle();

      expect(service.today.value()?.personalized).toBe(true);
    });
  });

  describe('integration — request / reload behavior', () => {
    it('re-requests the same URL when `reload()` is called', async () => {
      TestBed.tick();
      httpTesting.expectOne(ENDPOINT).flush(makeBriefing());
      await settle();

      service.today.reload();
      TestBed.tick();

      const second = httpTesting.expectOne(ENDPOINT);
      expect(second.request.method).toBe('GET');

      second.flush(makeBriefing());
      await settle();
    });

    it('surfaces a failed request through `error()` without resolving', async () => {
      TestBed.tick();

      httpTesting.expectOne(ENDPOINT).flush('Falha no servidor', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      await settle();

      expect(service.today.error()).toBeTruthy();
      expect(service.today.status()).not.toBe('resolved');
    });
  });
});
