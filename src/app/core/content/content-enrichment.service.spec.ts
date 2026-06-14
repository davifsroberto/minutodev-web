import { HttpResourceRef, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { ContentEnrichment } from './content-enrichment.model';
import { ContentEnrichmentService } from './content-enrichment.service';

const BASE = `${environment.apiBaseUrl}/contents`;

function makeEnrichment(
  overrides: Partial<ContentEnrichment> = {},
): ContentEnrichment {
  return {
    id: 'enrichment-1',
    contentId: 'content-1',
    language: 'pt-BR',
    translatedTitle: 'Título',
    summary30s: null,
    shortSummary: 'Resumo.',
    whyItMatters: null,
    keyInsight: null,
    keyPoints: [],
    example: null,
    whenToUse: null,
    audienceFor: [],
    audienceIgnore: [],
    briefContent: 'Resumo.',
    originalUrl: 'https://example.com/post',
    imageUrl: null,
    sourceName: 'Fonte',
    publishedAt: null,
    provider: null,
    model: null,
    status: 'PENDING',
    errorMessage: null,
    createdAt: '2026-06-14T09:00:00.000Z',
    updatedAt: '2026-06-14T09:00:00.000Z',
    ...overrides,
  };
}

describe('ContentEnrichmentService', () => {
  let service: ContentEnrichmentService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;
  let id: WritableSignal<string | null>;

  const settle = (): Promise<void> => appRef.whenStable();

  const load = (): HttpResourceRef<ContentEnrichment | undefined> =>
    TestBed.runInInjectionContext(() => service.loadById(id));

  beforeEach(() => {
    // sessionStorage é global no jsdom; limpa o cooldown de warm entre testes.
    try {
      sessionStorage.clear();
    } catch {
      /* sem storage neste ambiente */
    }

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ContentEnrichmentService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
    id = signal<string | null>('content-1');
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('issues a single GET to /contents/:id/enrichment for the current id', () => {
    load();
    TestBed.tick();

    const req = httpTesting.expectOne(`${BASE}/content-1/enrichment`);
    expect(req.request.method).toBe('GET');

    req.flush(makeEnrichment());
  });

  it('exposes the flushed enrichment through value()', async () => {
    const resource = load();
    const enrichment = makeEnrichment();
    TestBed.tick();

    httpTesting.expectOne(`${BASE}/content-1/enrichment`).flush(enrichment);
    await settle();

    expect(resource.value()).toEqual(enrichment);
    expect(resource.status()).toBe('resolved');
  });

  it('does not issue a request while the id is null', () => {
    id.set(null);
    load();
    TestBed.tick();

    httpTesting.expectNone(() => true);
  });

  it('re-requests the enrichment when the id changes', async () => {
    load();
    TestBed.tick();
    httpTesting
      .expectOne(`${BASE}/content-1/enrichment`)
      .flush(makeEnrichment());
    await settle();

    id.set('content-2');
    TestBed.tick();

    const req = httpTesting.expectOne(`${BASE}/content-2/enrichment`);
    expect(req.request.method).toBe('GET');
    req.flush(makeEnrichment({ contentId: 'content-2' }));
    await settle();
  });

  it('surfaces a failed request through error()', async () => {
    const resource = load();
    TestBed.tick();

    httpTesting.expectOne(`${BASE}/content-1/enrichment`).flush('Erro', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await settle();

    expect(resource.error()).toBeTruthy();
    expect(resource.status()).not.toBe('resolved');
  });

  describe('warm', () => {
    it('issues a fire-and-forget GET to trigger on-demand generation', () => {
      service.warm('content-1');

      const req = httpTesting.expectOne(`${BASE}/content-1/enrichment`);
      expect(req.request.method).toBe('GET');
      req.flush(makeEnrichment());
    });

    it('is idempotent per id within the session', () => {
      service.warm('content-1');
      httpTesting
        .expectOne(`${BASE}/content-1/enrichment`)
        .flush(makeEnrichment());

      service.warm('content-1');
      httpTesting.expectNone(`${BASE}/content-1/enrichment`);
    });

    it('allows a retry after a failed warm', () => {
      service.warm('content-1');
      httpTesting.expectOne(`${BASE}/content-1/enrichment`).flush('Erro', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      service.warm('content-1');
      const retry = httpTesting.expectOne(`${BASE}/content-1/enrichment`);
      expect(retry.request.method).toBe('GET');
      retry.flush(makeEnrichment());
    });

    it('does not warm again within the cooldown, even after a reload (sessionStorage)', () => {
      // Carimbo recente persistido simula um warm de uma carga anterior da Home.
      sessionStorage.setItem('mn:warm:content-9', String(Date.now()));

      service.warm('content-9');

      httpTesting.expectNone(`${BASE}/content-9/enrichment`);
    });

    it('warms again once the cooldown has expired', () => {
      sessionStorage.setItem(
        'mn:warm:content-9',
        String(Date.now() - 11 * 60 * 1000),
      );

      service.warm('content-9');

      httpTesting.expectOne(`${BASE}/content-9/enrichment`).flush({});
    });
  });
});
