import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { ContentEnrichment } from '@app/core/content/content-enrichment.model';
import { ContentDetailPageComponent } from './content-detail-page.component';

expect.extend(toHaveNoViolations);

const ENDPOINT = `${environment.apiBaseUrl}/contents/content-1/enrichment`;

function makeEnrichment(
  overrides: Partial<ContentEnrichment> = {},
): ContentEnrichment {
  return {
    id: 'enrichment-1',
    contentId: 'content-1',
    language: 'pt-BR',
    translatedTitle: 'TypeScript 5.7 lançado',
    shortSummary: 'A nova versão traz melhorias no compilador.',
    whyItMatters: null,
    keyPoints: [],
    example: null,
    whenToUse: null,
    briefContent: 'A nova versão traz melhorias no compilador.',
    originalUrl: 'https://devblogs.microsoft.com/typescript/',
    imageUrl: null,
    sourceName: 'TypeScript Blog',
    publishedAt: '2026-06-13T09:12:00.000Z',
    provider: null,
    model: null,
    status: 'PENDING',
    errorMessage: null,
    createdAt: '2026-06-14T09:00:00.000Z',
    updatedAt: '2026-06-14T09:00:00.000Z',
    ...overrides,
  };
}

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

describe('ContentDetailPageComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'app/content/:id', component: ContentDetailPageComponent },
        ]),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  const navigate = (): Promise<RouterTestingHarness> =>
    RouterTestingHarness.create('/app/content/content-1');

  const rootOf = (harness: RouterTestingHarness): HTMLElement =>
    harness.routeNativeElement as HTMLElement;

  it('reads the route id and requests that content enrichment', async () => {
    await navigate();
    TestBed.tick();

    const req = httpTesting.expectOne(ENDPOINT);
    expect(req.request.method).toBe('GET');

    req.flush(makeEnrichment());
  });

  it('shows the "Gerando versão resumida" loading state before the enrichment resolves', async () => {
    const harness = await navigate();
    TestBed.tick();

    const el = rootOf(harness);
    expect(el.querySelector('.content-skeleton')).not.toBeNull();
    expect(el.textContent ?? '').toContain('Gerando versão resumida');

    httpTesting.expectOne(ENDPOINT).flush(makeEnrichment());
  });

  it('renders the editorial sections and the source link in a new tab', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(
      makeEnrichment({
        whyItMatters: 'Afeta toda a base de código.',
        keyPoints: ['Compilador mais rápido', 'Novos tipos utilitários'],
        example: 'tsc --noEmit ficou 20% mais rápido.',
        whenToUse: 'Vale a pena em monorepos grandes.',
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);
    const text = el.textContent ?? '';

    expect(el.querySelector('#content-detail-title')?.textContent).toContain(
      'TypeScript 5.7 lançado',
    );
    expect(text).toContain('O que é');
    expect(text).toContain('Por que importa');
    expect(text).toContain('Principais aprendizados');
    expect(text).toContain('Compilador mais rápido');
    expect(text).toContain('Exemplo citado no artigo');
    expect(text).toContain('tsc --noEmit ficou 20% mais rápido.');
    expect(text).toContain('Quando vale a pena usar');
    expect(text).toContain('Vale a pena em monorepos grandes.');
    expect(text).toContain('Conteúdo detalhado');

    const source = el.querySelector<HTMLAnchorElement>('.content-source__link');
    expect(source?.getAttribute('href')).toBe(
      'https://devblogs.microsoft.com/typescript/',
    );
    expect(source?.getAttribute('target')).toBe('_blank');
    expect(source?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders the hero with the article image, source and reading time', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(
      makeEnrichment({
        imageUrl: 'https://cdn.example.test/cover.png',
        briefContent: 'palavra '.repeat(450),
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);
    const image = el.querySelector<HTMLImageElement>('.content-hero__image');
    expect(image?.getAttribute('src')).toBe(
      'https://cdn.example.test/cover.png',
    );
    expect(image?.getAttribute('loading')).toBe('lazy');

    const text = el.textContent ?? '';
    expect(text).toContain('TypeScript Blog');
    expect(text).toMatch(/\d+ min de leitura/);
  });

  it('falls back to the minutoDev placeholder when there is no image', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(makeEnrichment({ imageUrl: null }));
    await harness.fixture.whenStable();
    harness.detectChanges();

    const image = rootOf(harness).querySelector<HTMLImageElement>(
      '.content-hero__image',
    );
    expect(image?.getAttribute('src')).toBe('/content-placeholder.svg');
  });

  it('swaps to the placeholder when the article image fails to load', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting
      .expectOne(ENDPOINT)
      .flush(
        makeEnrichment({ imageUrl: 'https://cdn.example.test/broken.png' }),
      );
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);
    const image = el.querySelector<HTMLImageElement>('.content-hero__image');
    image?.dispatchEvent(new Event('error'));
    harness.detectChanges();

    expect(
      el
        .querySelector<HTMLImageElement>('.content-hero__image')
        ?.getAttribute('src'),
    ).toBe('/content-placeholder.svg');
  });

  it('shows the error message and a retry action when the request fails', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting
      .expectOne(ENDPOINT)
      .flush('erro', { status: 500, statusText: 'Internal Server Error' });
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);

    expect(el.querySelector('.content-state--error')?.textContent).toContain(
      'Não foi possível carregar este conteúdo.',
    );
    expect(el.querySelector('button')?.textContent).toContain(
      'Tentar novamente',
    );
  });

  it('shows the preliminary notice and empty fallback while keeping the source link', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(
      makeEnrichment({
        shortSummary: null,
        briefContent: null,
        whyItMatters: null,
        keyPoints: [],
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);
    const text = el.textContent ?? '';

    expect(text).toContain('Versão preliminar');
    expect(text).toContain('Ainda não há um resumo disponível');
    expect(el.querySelector('.content-source__link')).not.toBeNull();
  });

  it('shows the failure notice but keeps the fallback content and source link when status is FAILED', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(
      makeEnrichment({
        status: 'FAILED',
        errorMessage:
          'Não foi possível gerar a versão resumida com IA no momento. Tente novamente mais tarde.',
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);
    const text = el.textContent ?? '';

    expect(el.querySelector('.content-article__notice--error')).not.toBeNull();
    expect(text).toContain('Não foi possível gerar a versão resumida com IA');
    // o conteúdo de fallback (resumo original) e a fonte continuam visíveis
    expect(text).toContain('A nova versão traz melhorias no compilador.');
    expect(el.querySelector('.content-source__link')).not.toBeNull();
  });

  it('shows the in-progress notice while status is PROCESSING', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting
      .expectOne(ENDPOINT)
      .flush(makeEnrichment({ status: 'PROCESSING' }));
    await harness.fixture.whenStable();
    harness.detectChanges();

    const el = rootOf(harness);

    expect(el.textContent ?? '').toContain('Gerando a versão resumida com IA');
    expect(el.querySelector('.content-source__link')).not.toBeNull();
  });

  it('passes automated AXE checks once resolved', async () => {
    const harness = await navigate();
    TestBed.tick();
    httpTesting.expectOne(ENDPOINT).flush(
      makeEnrichment({
        whyItMatters: 'Afeta toda a base de código.',
        keyPoints: ['Compilador mais rápido'],
      }),
    );
    await harness.fixture.whenStable();
    harness.detectChanges();

    await expectNoAxeViolations(rootOf(harness));
  });
});
