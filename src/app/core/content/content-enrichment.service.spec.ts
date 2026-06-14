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
    shortSummary: 'Resumo.',
    whyItMatters: null,
    keyPoints: [],
    briefContent: 'Resumo.',
    originalUrl: 'https://example.com/post',
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
});
