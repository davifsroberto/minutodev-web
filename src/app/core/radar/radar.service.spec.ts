import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '@environments/environment';
import { CLOCK } from '@app/core/time/clock';
import { LocalDateUtil } from '@app/core/time/local-date.util';
import { RadarBriefing } from './radar.model';
import { RadarService } from './radar.service';

const BASE = `${environment.apiBaseUrl}/radar/today`;

const FIXED_NOW = new Date(2026, 5, 13, 22, 30, 0);
const LOCAL_DATE = '2026-06-13';
const ENDPOINT = `${BASE}?date=${LOCAL_DATE}`;

function makeBriefing(): RadarBriefing {
  return {
    date: LOCAL_DATE,
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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CLOCK, useValue: () => FIXED_NOW },
      ],
    });

    service = TestBed.inject(RadarService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('unit — request shape', () => {
    it('issues a single GET to `/radar/today` carrying the local `date`', () => {
      TestBed.tick();

      const req = httpTesting.expectOne(ENDPOINT);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe(BASE);

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
