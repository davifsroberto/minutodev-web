import { HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { AuthStatus } from '@app/core/auth/auth.model';
import { AuthService } from '@app/core/auth/auth.service';
import { RadarBriefing } from '@app/core/radar/radar.model';
import { CLOCK } from '@app/core/time/clock';
import { RadarTodayPageComponent } from './radar-today-page.component';

expect.extend(toHaveNoViolations);

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;
const FOR_YOU_ENDPOINT = `${environment.apiBaseUrl}/radar/for-you`;
const matchRadar = (req: HttpRequest<unknown>): boolean =>
  req.url === ENDPOINT && req.params.get('date') === '2026-06-13';
const matchForYou = (req: HttpRequest<unknown>): boolean =>
  req.url === FOR_YOU_ENDPOINT && req.params.get('date') === '2026-06-13';

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

function fullBriefing(featuredId: string | null = 'tool-2'): RadarBriefing {
  return {
    date: '2026-06-13',
    featuredId,
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

function fallbackBriefing(): RadarBriefing {
  return {
    ...fullBriefing(),
    date: '2026-06-10',
    estimatedReadTimeMinutes: 8,
  };
}

function emptyBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    featuredId: null,
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
  let authStatus: WritableSignal<AuthStatus>;

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  beforeEach(async () => {
    // Evita que o cooldown do warm (sessionStorage) vaze entre os testes.
    try {
      sessionStorage.clear();
    } catch {
      /* sem storage neste ambiente */
    }

    authStatus = signal<AuthStatus>('anonymous');

    await TestBed.configureTestingModule({
      imports: [RadarTodayPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: CLOCK,
          useValue: () => new Date(2026, 5, 13, 9, 0, 0),
        },
        // O RadarService troca a URL pelo estado de sessão; anônimo mantém
        // todos os cenários legados em `/radar/today`.
        { provide: AuthService, useValue: { status: authStatus } },
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
    it('renders the date, compact stats, a highlight, and the remaining sections', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const component = fixture.componentInstance;
      const el = fixture.nativeElement as HTMLElement;
      const headings = Array.from(
        el.querySelectorAll<HTMLHeadingElement>('.radar-section__title'),
      ).map((heading) => heading.textContent?.trim());

      expect(el.textContent).toContain('13/06/2026');
      expect(el.textContent).toContain('7 min de leitura');
      expect(el.textContent).toContain('5 conteúdos');
      expect(headings).toEqual(['Tendências', 'Ferramentas', 'Releases']);

      // O destaque editorial pode estar fora da primeira seção/posição.
      const highlight = el.querySelector('app-radar-highlight-card');
      expect(highlight?.textContent).toContain(
        'Bundler nativo estabiliza plugin API',
      );
      expect(component.highlight()?.id).toBe('tool-2');

      // 5 itens no total; 1 vira destaque, restando 4 cards nas listas.
      expect(el.querySelectorAll('.radar-card')).toHaveLength(4);
      expect(
        component
          .displaySections()
          .flatMap((section) => section.items)
          .map((item) => item.id),
      ).toEqual(['trend-1', 'trend-2', 'tool-1', 'release-1']);
      expect(el.querySelector('.radar-state')).toBeNull();
    });

    it.each([
      ['null', null],
      ['unknown', 'missing-featured'],
    ])(
      'falls back to the first item when featuredId is %s',
      async (_caseName, featuredId) => {
        const fixture = TestBed.createComponent(RadarTodayPageComponent);
        TestBed.tick();
        httpTesting.expectOne(matchRadar).flush(fullBriefing(featuredId));
        await settle(fixture);

        const component = fixture.componentInstance;
        expect(component.highlight()?.id).toBe('trend-1');
        expect(
          component
            .displaySections()
            .flatMap((section) => section.items)
            .some((item) => item.id === 'trend-1'),
        ).toBe(false);

        const highlight = (fixture.nativeElement as HTMLElement).querySelector(
          'app-radar-highlight-card',
        );
        expect(highlight?.textContent).toContain(
          'Signals se consolidam em frameworks web',
        );
      },
    );

    it('passes AXE when resolved', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });

    it('warms the highlight enrichment so its pt-BR translation gets generated', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const warm = httpTesting.expectOne(
        `${environment.apiBaseUrl}/contents/tool-2/enrichment`,
      );
      expect(warm.request.method).toBe('GET');
      warm.flush({});
    });
  });

  describe('fallback state (most recent available radar)', () => {
    it('does not flag fallback when the resolved date matches today', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const component = fixture.componentInstance;
      expect(component.isFallback()).toBe(false);
      expect(component.eyebrow()).toBe('Radar de Hoje');

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.radar-page__fallback-notice')).toBeNull();
    });

    it('flags fallback and shows the real date when the resolved date is earlier than today', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fallbackBriefing());
      await settle(fixture);

      const component = fixture.componentInstance;
      expect(component.isFallback()).toBe(true);
      expect(component.resolved()).toBe(true);
      expect(component.empty()).toBe(false);
      expect(component.eyebrow()).toBe('Último briefing disponível');

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.eyebrow')?.textContent?.trim()).toBe(
        'Último briefing disponível',
      );
      expect(el.textContent).toContain('10/06/2026');
      expect(el.textContent).toContain('8 min de leitura');
      expect(
        el.querySelectorAll('app-radar-today-section').length,
      ).toBeGreaterThan(0);
    });

    it('renders the discreet notice explaining the displayed radar is not from today', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fallbackBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-page__fallback-notice')?.textContent?.trim(),
      ).toBe(
        'Nenhum conteúdo encontrado para hoje. Exibindo o radar mais recente disponível.',
      );
    });

    it('passes AXE in the fallback state', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();
      httpTesting.expectOne(matchRadar).flush(fallbackBriefing());
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

  describe('personalização (12B)', () => {
    it('autenticado consome /radar/for-you e exibe o selo quando personalized', async () => {
      authStatus.set('authenticated');
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchForYou).flush({
        ...fullBriefing(),
        personalized: true,
        personalizationFallback: false,
      });
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(
        el.querySelector('.radar-page__personalized')?.textContent,
      ).toContain('Baseado nos seus interesses');
      expect(el.querySelector('.radar-page__interests-cta')).toBeNull();
      // A ordem dos itens dentro de cada seção é exatamente a da API — nada é
      // reordenado localmente (a ordem das seções é a fixa da UI).
      expect(
        fixture.componentInstance
          .sections()
          .flatMap((section) => section.items)
          .map((item) => item.id),
      ).toEqual(['trend-1', 'trend-2', 'tool-1', 'tool-2', 'release-1']);
    });

    it('autenticado sem interesses vê o CTA discreto para /app/preferences', async () => {
      authStatus.set('authenticated');
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchForYou).flush({
        ...fullBriefing(),
        personalized: false,
        personalizationFallback: true,
      });
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      const cta = el.querySelector<HTMLAnchorElement>(
        '.radar-page__interests-cta a',
      );
      expect(cta?.textContent?.trim()).toBe(
        'Escolha seus interesses para personalizar o Radar',
      );
      expect(cta?.getAttribute('href')).toBe('/app/preferences');
      expect(el.querySelector('.radar-page__personalized')).toBeNull();
    });

    it('anônimo continua no radar geral, sem selo e sem CTA', async () => {
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchRadar).flush(fullBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.radar-page__personalized')).toBeNull();
      expect(el.querySelector('.radar-page__interests-cta')).toBeNull();
    });

    it('degrada para o radar geral quando o for-you falha', async () => {
      authStatus.set('authenticated');
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchForYou).flush('Server error', {
        status: 500,
        statusText: 'Server Error',
      });

      // Sem `whenStable()` aqui: o fetch de fallback aberto pelo effect fica
      // pendente e impediria a estabilização — avança ticks até ele existir.
      let fallback;
      for (let attempt = 0; attempt < 20 && !fallback; attempt++) {
        TestBed.tick();
        [fallback] = httpTesting.match(matchRadar);
        if (!fallback) await Promise.resolve();
      }
      fallback!.flush(fullBriefing());
      await settle(fixture);

      const el = fixture.nativeElement as HTMLElement;
      expect(fixture.componentInstance.resolved()).toBe(true);
      expect(fixture.componentInstance.error()).toBe(false);
      expect(
        el.querySelectorAll('app-radar-today-section').length,
      ).toBeGreaterThan(0);
      expect(el.querySelector('.radar-page__personalized')).toBeNull();
      expect(el.querySelector('.radar-page__interests-cta')).toBeNull();
    });

    it('passa no AXE com o selo de personalização', async () => {
      authStatus.set('authenticated');
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchForYou).flush({
        ...fullBriefing(),
        personalized: true,
        personalizationFallback: false,
      });
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });

    it('passa no AXE com o CTA de interesses', async () => {
      authStatus.set('authenticated');
      const fixture = TestBed.createComponent(RadarTodayPageComponent);
      TestBed.tick();

      httpTesting.expectOne(matchForYou).flush({
        ...fullBriefing(),
        personalized: false,
        personalizationFallback: true,
      });
      await settle(fixture);

      await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
    });
  });
});
