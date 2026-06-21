import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { InterestsService } from './interests.service';

const CATALOG_URL = `${environment.apiBaseUrl}/interests/catalog`;
const MINE_URL = `${environment.apiBaseUrl}/me/interests`;

describe('InterestsService', () => {
  let service: InterestsService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  const settle = (): Promise<void> => appRef.whenStable();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InterestsService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('busca o catálogo de temas via GET /interests/catalog', async () => {
    TestBed.tick();

    const req = httpTesting.expectOne(CATALOG_URL);
    expect(req.request.method).toBe('GET');
    req.flush([{ slug: 'ai', label: 'IA' }]);
    httpTesting.expectOne(MINE_URL).flush({ interests: [] });
    await settle();

    expect(service.catalog.value()).toEqual([{ slug: 'ai', label: 'IA' }]);
  });

  it('busca os interesses do usuário via GET /me/interests', async () => {
    TestBed.tick();

    httpTesting.expectOne(CATALOG_URL).flush([]);
    const req = httpTesting.expectOne(MINE_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ interests: ['ai'] });
    await settle();

    expect(service.mine.value()).toEqual({ interests: ['ai'] });
  });

  it('salva via PUT /me/interests e atualiza o cache de `mine` sem refetch', async () => {
    TestBed.tick();
    httpTesting.expectOne(CATALOG_URL).flush([]);
    httpTesting.expectOne(MINE_URL).flush({ interests: [] });
    await settle();

    const promise = service.save(['ai', 'cloud']);

    const put = httpTesting.expectOne(MINE_URL);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ interests: ['ai', 'cloud'] });
    put.flush({ interests: ['ai', 'cloud'] });

    await expect(promise).resolves.toEqual({ interests: ['ai', 'cloud'] });
    await settle();

    expect(service.mine.value()).toEqual({ interests: ['ai', 'cloud'] });
    // Nenhum GET extra após o PUT — o cache foi atualizado localmente.
    httpTesting.expectNone(MINE_URL);
  });
});
