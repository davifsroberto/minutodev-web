import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { PreferencesPageComponent } from './preferences-page.component';

expect.extend(toHaveNoViolations);

const CATALOG_URL = `${environment.apiBaseUrl}/interests/catalog`;
const MINE_URL = `${environment.apiBaseUrl}/me/interests`;

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

describe('PreferencesPageComponent', () => {
  let httpTesting: HttpTestingController;

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  const flushInitial = (
    catalog: { slug: string; label: string }[],
    interests: string[],
  ): void => {
    httpTesting.expectOne(CATALOG_URL).flush(catalog);
    httpTesting.expectOne(MINE_URL).flush({ interests });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  it('mostra o skeleton com aria-busy antes das respostas', () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    httpTesting.expectOne(CATALOG_URL);
    httpTesting.expectOne(MINE_URL);

    const el = fixture.nativeElement as HTMLElement;
    expect(
      el.querySelector('.prefs-page__loadstate')?.getAttribute('aria-busy'),
    ).toBe('true');
    expect(el.querySelector('.prefs-skeleton')).not.toBeNull();
    expect(el.querySelector('form')).toBeNull();
  });

  it('renderiza um checkbox por tema, marcando os já selecionados', async () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    flushInitial(
      [
        { slug: 'ai', label: 'IA' },
        { slug: 'cloud', label: 'Cloud' },
      ],
      ['ai'],
    );
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const checkboxes = el.querySelectorAll<HTMLInputElement>(
      '.prefs-check__input',
    );
    expect(checkboxes).toHaveLength(2);

    const checkedByValue = new Map(
      Array.from(checkboxes).map((input) => [input.value, input.checked]),
    );
    expect(checkedByValue.get('ai')).toBe(true);
    expect(checkedByValue.get('cloud')).toBe(false);
  });

  it('alterna um tema e salva via PUT enviando os slugs selecionados', async () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    flushInitial(
      [
        { slug: 'ai', label: 'IA' },
        { slug: 'cloud', label: 'Cloud' },
      ],
      [],
    );
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const aiCheckbox = el.querySelector<HTMLInputElement>(
      '.prefs-check__input[value="ai"]',
    );
    aiCheckbox!.checked = true;
    aiCheckbox!.dispatchEvent(new Event('change'));

    el.querySelector('form')!.dispatchEvent(
      new Event('submit', { cancelable: true }),
    );

    const put = httpTesting.expectOne(MINE_URL);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({ interests: ['ai'] });
    put.flush({ interests: ['ai'] });
    await settle(fixture);

    expect(el.textContent).toContain('Preferências salvas');
  });

  it('aceita salvar com nenhum tema selecionado (Radar Geral)', async () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    flushInitial([{ slug: 'ai', label: 'IA' }], ['ai']);
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const aiCheckbox = el.querySelector<HTMLInputElement>(
      '.prefs-check__input[value="ai"]',
    );
    aiCheckbox!.checked = false;
    aiCheckbox!.dispatchEvent(new Event('change'));

    el.querySelector('form')!.dispatchEvent(
      new Event('submit', { cancelable: true }),
    );

    const put = httpTesting.expectOne(MINE_URL);
    expect(put.request.body).toEqual({ interests: [] });
    put.flush({ interests: [] });
    await settle(fixture);
  });

  it('mostra o estado de erro com botão de tentar novamente', async () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    httpTesting
      .expectOne(CATALOG_URL)
      .flush('erro', { status: 500, statusText: 'Server Error' });
    httpTesting
      .expectOne(MINE_URL)
      .flush('erro', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.prefs-state--error')).not.toBeNull();
    expect(el.querySelector('button')?.textContent?.trim()).toBe(
      'Tentar novamente',
    );
  });

  it('passa no AXE no estado resolvido', async () => {
    const fixture = TestBed.createComponent(PreferencesPageComponent);
    TestBed.tick();
    flushInitial(
      [
        { slug: 'ai', label: 'IA' },
        { slug: 'cloud', label: 'Cloud' },
      ],
      ['ai'],
    );
    await settle(fixture);

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
