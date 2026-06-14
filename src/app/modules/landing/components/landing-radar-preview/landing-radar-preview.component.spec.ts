import { HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { RadarBriefing } from '../../models/radar.model';
import { LandingRadarPreviewComponent } from './landing-radar-preview.component';

expect.extend(toHaveNoViolations);

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;

// The service appends a `date` query param (the user's local day), so match on
// the param-less URL — these tests don't care which day is requested.
const matchRadar = (req: HttpRequest<unknown>): boolean => req.url === ENDPOINT;

/**
 * Run AXE against the WCAG A/AA rule set. `color-contrast` is disabled because
 * jsdom has no layout engine to compute it (it is guaranteed by the design
 * tokens and must be verified in a real browser); all other AA rules apply.
 */
const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

function fullBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    estimatedReadTimeMinutes: 6,
    sections: [
      {
        key: 'trends',
        items: [
          {
            id: 'trend-1',
            title: 'Signals viram padrão de reatividade',
            summary: 'Frameworks convergem para signals.',
            url: 'https://example.com/trends',
            sourceName: 'Blogs de engenharia',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
        ],
      },
      {
        key: 'tools',
        items: [
          {
            id: 'tool-1',
            title: 'Bundler nativo ganha tração',
            summary: 'Builds mais rápidos e configuração mínima.',
            url: 'https://example.com/tools',
            sourceName: 'GitHub Trending',
            category: null,
            contentType: 'TOOL',
            publishedAt: '2026-06-13T07:00:00.000Z',
          },
        ],
      },
      {
        key: 'releases',
        items: [
          {
            id: 'release-1',
            title: 'Runtime popular lança versão LTS',
            summary: 'Melhorias de performance e APIs estáveis.',
            url: 'https://example.com/releases',
            sourceName: 'Release notes',
            category: null,
            contentType: 'RELEASE',
            publishedAt: '2026-06-13T06:00:00.000Z',
          },
        ],
      },
      {
        key: 'recommended',
        items: [
          {
            id: 'rec-1',
            title: 'Guia prático de testes modernos',
            summary: 'Passo a passo para elevar a confiabilidade.',
            url: 'https://example.com/recommended',
            sourceName: 'Newsletter da comunidade',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T05:00:00.000Z',
          },
        ],
      },
    ],
  };
}

/** Single trend section whose item has a null summary (no description paragraph). */
function nullDescriptionBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    estimatedReadTimeMinutes: 4,
    sections: [
      {
        key: 'trends',
        items: [
          {
            id: 'trend-1',
            title: 'Tendência sem resumo',
            summary: null,
            url: 'https://example.com/no-summary',
            sourceName: 'Fonte sem resumo',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
        ],
      },
    ],
  };
}

/** Resolved briefing that maps to zero cards (every section empty). */
function emptyBriefing(): RadarBriefing {
  return { date: '2026-06-13', estimatedReadTimeMinutes: 3, sections: [] };
}

describe('LandingRadarPreviewComponent', () => {
  let httpTesting: HttpTestingController;

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingRadarPreviewComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Drain any request left open by a state still mid-flight (e.g. loading).
    httpTesting.match(() => true);
  });

  describe('loading state', () => {
    it('shows the skeleton with aria-busy and no cards/empty/error before flush', () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-card__body')?.getAttribute('aria-busy'),
      ).toBe('true');
      expect(el.querySelector('.radar-item--skeleton')).not.toBeNull();
      expect(el.querySelectorAll('.radar-item__link')).toHaveLength(0);
      expect(el.querySelector('.radar-state')).toBeNull();
      expect(el.querySelector('button')).toBeNull();
    });

    it('passes AXE while loading', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('resolved state', () => {
    it('renders four safe source links with accessible names and visible sources', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      const links = el.querySelectorAll<HTMLAnchorElement>('.radar-item__link');
      expect(links).toHaveLength(4);

      links.forEach((link) => {
        expect(link.getAttribute('href')).toBeTruthy();
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        // Discernible accessible name comes from the link's text content.
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
        expect(
          link.querySelector('.radar-item__source')?.textContent,
        ).toContain('Fonte:');
      });

      // Trend is first in display order and keeps the success accent.
      expect(links[0].querySelector('.badge')?.classList).toContain(
        'badge--success',
      );
      links.forEach((link, index) => {
        if (index > 0) {
          expect(link.querySelector('.badge')?.classList).toContain(
            'badge--neutral',
          );
        }
      });
    });

    it('renders the real read-time and drops the illustrative disclaimer', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-card__head .badge')?.textContent,
      ).toContain('Tempo estimado: 6 minutos');
      expect(el.textContent).not.toContain('Conteúdo ilustrativo');
      expect(el.textContent).not.toContain('Tempo estimado: 8 minutos');
    });

    it('omits the description paragraph when the summary is null', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(nullDescriptionBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.radar-item__link')).toHaveLength(1);
      expect(el.querySelector('.radar-item__description')).toBeNull();
    });

    it('passes AXE when resolved', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('empty state', () => {
    it('shows the friendly empty message with no cards and no error', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(emptyBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.radar-state__message')?.textContent).toContain(
        'Nenhuma novidade no radar hoje',
      );
      expect(el.querySelectorAll('.radar-item__link')).toHaveLength(0);
      expect(el.querySelector('button')).toBeNull();
    });

    it('passes AXE when empty', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(emptyBriefing());
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('error + retry flow', () => {
    it('shows the error message and retry; retry re-requests and resolves to cards', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).error(new ProgressEvent('error'), {
        status: 503,
        statusText: 'Service Unavailable',
      });
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.radar-state__message')?.textContent).toContain(
        'Não foi possível carregar o Radar de Hoje',
      );
      const retry = el.querySelector<HTMLButtonElement>('button');
      expect(retry?.textContent).toContain('Tentar novamente');
      expect(el.querySelectorAll('.radar-item__link')).toHaveLength(0);

      // Retry triggers a second request that resolves to live cards.
      retry!.click();
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      expect(el.querySelectorAll('.radar-item__link')).toHaveLength(4);
      expect(el.querySelector('.radar-state')).toBeNull();
    });

    it('passes AXE in the error state', async () => {
      const fixture = TestBed.createComponent(LandingRadarPreviewComponent);
      TestBed.tick();
      httpTesting
        .expectOne(matchRadar)
        .error(new ProgressEvent('error'), { status: 503, statusText: 'down' });
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });
});
