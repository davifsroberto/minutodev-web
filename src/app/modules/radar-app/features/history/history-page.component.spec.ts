import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { HistoryItem, HistoryPage } from '@app/core/history/history.model';
import { HistoryPageComponent } from './history-page.component';

expect.extend(toHaveNoViolations);

const HISTORY_URL = `${environment.apiBaseUrl}/me/history?limit=50`;

const item = (overrides: Partial<HistoryItem> = {}): HistoryItem => ({
  contentId: 'c-1',
  title: 'Conteúdo Um',
  imageUrl: null,
  sourceName: 'Fonte X',
  publishedAt: '2026-07-01T09:00:00.000Z',
  lastOpenedAt: '2026-07-03T10:00:00.000Z',
  readAt: null,
  status: 'OPENED',
  ...overrides,
});

const page = (data: HistoryItem[]): HistoryPage => ({
  data,
  meta: { page: 1, limit: 50, total: data.length, totalPages: 1 },
});

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

describe('HistoryPageComponent', () => {
  let httpTesting: HttpTestingController;

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('mostra o skeleton com aria-busy antes da resposta', () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting.expectOne(HISTORY_URL);

    const el = fixture.nativeElement as HTMLElement;
    expect(
      el.querySelector('.history-page__loadstate')?.getAttribute('aria-busy'),
    ).toBe('true');
    expect(el.querySelector('.history-skeleton')).not.toBeNull();
    expect(el.querySelector('.history-list')).toBeNull();
  });

  it('lista os itens com link para o briefing interno e badge de status', async () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting.expectOne(HISTORY_URL).flush(
      page([
        item({
          contentId: 'c-read',
          title: 'Já lido',
          status: 'READ',
          readAt: '2026-07-03T11:00:00.000Z',
        }),
        item({ contentId: 'c-open', title: 'Só aberto' }),
      ]),
    );
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll<HTMLAnchorElement>('.history-item');
    expect(links).toHaveLength(2);

    // Abre o briefing interno, nunca a fonte original.
    expect(links[0].getAttribute('href')).toBe('/app/content/c-read');
    expect(links[1].getAttribute('href')).toBe('/app/content/c-open');

    const badges = el.querySelectorAll('.history-item__badge');
    expect(badges[0].textContent?.trim()).toBe('Lido');
    expect(badges[0].classList).toContain('history-item__badge--read');
    expect(badges[1].textContent?.trim()).toBe('Aberto');
  });

  it('formata o último acesso em pt-BR', async () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting.expectOne(HISTORY_URL).flush(page([item()]));
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.history-item__meta')?.textContent).toContain(
      'Último acesso em 03 de julho de 2026',
    );
  });

  it('mostra o estado vazio com convite para o radar', async () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting.expectOne(HISTORY_URL).flush(page([]));
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Você ainda não acessou nenhum conteúdo');
    expect(
      el
        .querySelector<HTMLAnchorElement>('.history-state a')
        ?.getAttribute('href'),
    ).toBe('/app');
  });

  it('mostra o estado de erro com botão de tentar novamente', async () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting
      .expectOne(HISTORY_URL)
      .flush('erro', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.history-state--error')).not.toBeNull();
    expect(el.querySelector('button')?.textContent?.trim()).toBe(
      'Tentar novamente',
    );
  });

  it('passa no AXE no estado resolvido', async () => {
    const fixture = TestBed.createComponent(HistoryPageComponent);
    TestBed.tick();
    httpTesting.expectOne(HISTORY_URL).flush(page([item()]));
    await settle(fixture);

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
