import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { RadarBriefing } from '../models/radar.model';
import { RadarService } from './radar.service';

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;

function makeBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
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
  };
}

describe('RadarService', () => {
  let service: RadarService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  const settle = (): Promise<void> => appRef.whenStable();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RadarService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('unit — request shape', () => {
    it('issues a single GET to `${apiBaseUrl}/radar/today` on first read', () => {
      TestBed.tick();

      const req = httpTesting.expectOne(ENDPOINT);
      expect(req.request.method).toBe('GET');

      req.flush(makeBriefing());
    });

    it('sends no Authorization header and no query params', () => {
      TestBed.tick();

      const req = httpTesting.expectOne(ENDPOINT);
      expect(req.request.headers.has('Authorization')).toBe(false);
      expect(req.request.params.keys()).toHaveLength(0);
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
