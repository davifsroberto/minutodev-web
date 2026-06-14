import { HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { RadarBriefing } from '@app/core/radar/radar.model';
import { CLOCK } from '@app/core/time/clock';
import { RadarTodayPageComponent } from './radar-today-page.component';

expect.extend(toHaveNoViolations);

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;
const matchRadar = (req: HttpRequest<unknown>): boolean =>
  req.url === ENDPOINT && req.params.get('date') === '2026-06-13';

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
    estimatedReadTimeMinutes: 7,
    sections: [
      {
        key: 'tools',
        items: [
          {
            id: 'tool-1',
            title: 'CLI de testes ganha modo interativo',
            summary: 'Ferramenta reduz o tempo de feedback no terminal.',
            url: 'https://example.com/tools/cli',
            sourceName: 'Dev Tools Weekly',
            category: null,
            contentType: 'TOOL',
            publishedAt: '2026-06-13T07:00:00.000Z',
          },
          {
            id: 'tool-2',
            title: 'Bundler nativo estabiliza plugin API',
            summary: 'Ecossistema ganha integrações mais previsíveis.',
            url: 'https://example.com/tools/bundler',
            sourceName: 'Build Notes',
            category: null,
            contentType: 'TOOL',
            publishedAt: '2026-06-13T06:00:00.000Z',
          },
        ],
      },
      {
        key: 'trends',
        items: [
          {
            id: 'trend-1',
            title: 'Signals se consolidam em frameworks web',
            summary: 'Bibliotecas convergem para reatividade granular.',
            url: 'https://example.com/trends/signals',
            sourceName: 'Engineering Daily',
            category: null,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
          {
            id: 'trend-2',
            title: 'Times adotam SSR parcial em apps internos',
            summary: 'Experiência inicial melhora sem abandonar SPAs.',
            url: 'https://example.com/trends/ssr',
            sourceName: 'Frontend Radar',
            category: null,
            contentType: 'DISCUSSION',
            publishedAt: '2026-06-12T08:00:00.000Z',
          },
        ],
      },
      {
        key: 'releases',
        items: [
          {
            id: 'release-1',
            title: 'Runtime popular lança versão LTS',
            summary: 'Atualização traz APIs estáveis e patches de segurança.',
            url: 'https://example.com/releases/runtime',
            sourceName: 'Release Notes',
            category: null,
            contentType: 'RELEASE',
            publishedAt: '2026-06-13T05:00:00.000Z',
          },
        ],
      },
    ],
  };
}

function emptyBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    estimatedReadTimeMinutes: 2,
    sections: [
      { key: 'trends', items: [] },
      { key: 'tools', items: [] },
      { key: 'releases', items: [] },
      { key: 'recommended', items: [] },
    ],
  };
}

describe('RadarTodayPageComponent', () => {
  let httpTesting: HttpTestingController;

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarTodayPageComponent],
      providers: [
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
    httpTesting.match(() => true);
  });

  describe('loading state', () => {
    it('sets loading true before flush and false once resolved', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      const request = httpTesting.expectOne(matchRadar);

      expect(fixture.componentInstance.loading()).toBe(true);
      expect(fixture.componentInstance.resolved()).toBe(false);

      request.flush(fullBriefing());
      await settle(fixture);

      expect(fixture.componentInstance.loading()).toBe(false);
      expect(fixture.componentInstance.resolved()).toBe(true);
    });

    it('shows a skeleton with aria-busy before the request resolves', () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-page__body')?.getAttribute('aria-busy'),
      ).toBe('true');
      expect(el.querySelector('.radar-page__skeleton')).not.toBeNull();
      expect(el.querySelectorAll('app-radar-today-section')).toHaveLength(0);
      expect(el.querySelector('.radar-state')).toBeNull();
      expect(el.querySelector('button')).toBeNull();
    });

    it('passes AXE while loading', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('resolved state', () => {
    it('renders the radar date, real read time, and non-empty sections in display order', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      const headings = Array.from(
        el.querySelectorAll<HTMLHeadingElement>('.radar-section__title'),
      ).map((heading) => heading.textContent?.trim());

      expect(el.textContent).toContain('2026-06-13');
      expect(el.textContent).toContain('Tempo estimado: 7 minutos');
      expect(headings).toEqual(['Tendências', 'Ferramentas', 'Releases']);
      expect(el.querySelectorAll('.radar-section__item')).toHaveLength(5);
      expect(el.querySelector('.radar-state')).toBeNull();
    });

    it('passes AXE when resolved', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('empty state', () => {
    it('sets empty true only for a resolved briefing that maps to zero sections', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(emptyBriefing());
      await settle(fixture);

      const component = fixture.componentInstance;
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(false);
      expect(component.empty()).toBe(true);
      expect(component.resolved()).toBe(false);
    });

    it('renders the exact friendly empty message without section content', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(emptyBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-state__message')?.textContent?.trim(),
      ).toBe('Nenhum conteúdo encontrado para este dia.');
      expect(el.querySelector('.radar-state')?.getAttribute('tabindex')).toBe(
        '-1',
      );
      expect(el.querySelectorAll('app-radar-today-section')).toHaveLength(0);
      expect(el.querySelector('button')).toBeNull();
    });

    it('passes AXE when empty', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(emptyBriefing());
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });

  describe('error + retry state', () => {
    it('sets error true when status is error and not loading', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush('Server error', {
        status: 500,
        statusText: 'Server Error',
      });
      await settle(fixture);

      const component = fixture.componentInstance;
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(true);
      expect(component.empty()).toBe(false);
      expect(component.resolved()).toBe(false);
    });

    it('renders the error message and retry control, then retry triggers a second GET', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush('Server error', {
        status: 500,
        statusText: 'Server Error',
      });
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-state__message')?.textContent?.trim(),
      ).toBe(
        'Não foi possível carregar o Radar de Hoje. Tente novamente mais tarde.',
      );
      expect(el.querySelector('.radar-state')?.getAttribute('tabindex')).toBe(
        '-1',
      );

      const retry = el.querySelector<HTMLButtonElement>('button');
      expect(retry?.textContent?.trim()).toBe('Tentar novamente');

      retry!.click();
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      expect(el.querySelectorAll('app-radar-today-section')).toHaveLength(3);
      expect(el.querySelector('.radar-state')).toBeNull();
    });

    it('passes AXE in the error state', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush('Server error', {
        status: 500,
        statusText: 'Server Error',
      });
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });
});
