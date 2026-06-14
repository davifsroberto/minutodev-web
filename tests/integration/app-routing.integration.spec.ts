import { HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '@environments/environment';
import { RadarBriefing } from '@app/core/radar/radar.model';
import { CLOCK } from '@app/core/time/clock';
import { routes } from 'src/app/app.routes';

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;
const matchRadar = (req: HttpRequest<unknown>): boolean =>
  req.url === ENDPOINT && req.params.get('date') === '2026-06-13';

function briefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    estimatedReadTimeMinutes: 4,
    sections: [
      {
        key: 'trends',
        items: [
          {
            id: 'trend-1',
            title: 'Signals viram padrão para estado local',
            summary: 'Times reduzem boilerplate em telas de leitura diária.',
            url: 'https://example.com/trends/signals',
            sourceName: 'Frontend Radar',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
        ],
      },
      { key: 'tools', items: [] },
      { key: 'releases', items: [] },
      { key: 'recommended', items: [] },
    ],
  };
}

describe('app routing integration', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CLOCK,
          useValue: () => new Date(2026, 5, 13, 9, 0, 0),
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('lazy-loads /app into the shell with Radar de Hoje as the default child', async () => {
    const harness = await RouterTestingHarness.create('/app');
    TestBed.tick();
    const request = httpTesting.expectOne(matchRadar);

    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush(briefing());
    await harness.fixture.whenStable();

    const el = harness.fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/app');
    expect(el.querySelector('.app-shell__brand')?.textContent).toContain(
      'minutoDev',
    );
    expect(el.querySelector('#radar-today-title')?.textContent).toContain(
      'Briefing diário',
    );
    expect(el.textContent).toContain('Radar de Hoje');
    expect(el.textContent).toContain('Signals viram padrão para estado local');
  });

  it('declares /app without auth guards or route-level providers', async () => {
    const appRoute = routes.find((route) => route.path === 'app');
    const loadedRoutes = (await appRoute?.loadChildren?.()) as Route[];
    const shellRoute = loadedRoutes[0];

    expect(appRoute).toMatchObject({ path: 'app' });
    expect(appRoute?.canActivate).toBeUndefined();
    expect(appRoute?.canMatch).toBeUndefined();
    expect(appRoute?.providers).toBeUndefined();
    expect(shellRoute?.canActivate).toBeUndefined();
    expect(shellRoute?.canMatch).toBeUndefined();
    expect(shellRoute?.providers).toBeUndefined();
  });
});
