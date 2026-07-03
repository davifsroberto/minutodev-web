import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { HistoryEntry, HistoryPage } from './history.model';
import { HistoryService } from './history.service';

const BASE_URL = `${environment.apiBaseUrl}/me/history`;

const entry: HistoryEntry = {
  contentId: 'c-1',
  firstOpenedAt: '2026-07-03T10:00:00.000Z',
  lastOpenedAt: '2026-07-03T10:00:00.000Z',
  readAt: null,
  openCount: 1,
  status: 'OPENED',
};

describe('HistoryService', () => {
  let service: HistoryService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  const settle = (): Promise<void> => appRef.whenStable();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HistoryService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('registra a abertura via POST /me/history/contents/:id/open', async () => {
    const promise = service.registerOpen('c-1');

    const req = httpTesting.expectOne(`${BASE_URL}/contents/c-1/open`);
    expect(req.request.method).toBe('POST');
    req.flush(entry);

    await expect(promise).resolves.toEqual(entry);
  });

  it('não propaga falhas do registro de abertura (best-effort)', async () => {
    const promise = service.registerOpen('c-1');

    httpTesting
      .expectOne(`${BASE_URL}/contents/c-1/open`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    await expect(promise).resolves.toBeNull();
  });

  it('marca como lido via POST /me/history/contents/:id/read', async () => {
    const read: HistoryEntry = {
      ...entry,
      readAt: '2026-07-03T10:05:00.000Z',
      status: 'READ',
    };

    const promise = service.markAsRead('c-1');

    const req = httpTesting.expectOne(`${BASE_URL}/contents/c-1/read`);
    expect(req.request.method).toBe('POST');
    req.flush(read);

    await expect(promise).resolves.toEqual(read);
  });

  it('propaga a falha do marcar como lido para o chamador', async () => {
    const promise = service.markAsRead('c-1');

    httpTesting
      .expectOne(`${BASE_URL}/contents/c-1/read`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    await expect(promise).rejects.toBeTruthy();
  });

  it('lista o histórico via GET /me/history com o limite padrão', async () => {
    const page: HistoryPage = {
      data: [
        {
          contentId: 'c-1',
          title: 'Conteúdo Um',
          imageUrl: null,
          sourceName: 'Fonte X',
          publishedAt: '2026-07-01T09:00:00.000Z',
          lastOpenedAt: '2026-07-03T10:00:00.000Z',
          readAt: null,
          status: 'OPENED',
        },
      ],
      meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };

    const resource = runInInjectionContext(TestBed.inject(Injector), () =>
      service.list(),
    );
    TestBed.tick();

    const req = httpTesting.expectOne(`${BASE_URL}?limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush(page);
    await settle();

    expect(resource.value()).toEqual(page);
  });
});
