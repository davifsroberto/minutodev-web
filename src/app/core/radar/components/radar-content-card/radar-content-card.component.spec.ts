import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { RadarTodayItem } from '@app/core/radar/radar-view.model';
import { RadarContentCardComponent } from './radar-content-card.component';

expect.extend(toHaveNoViolations);

const itemFixture: RadarTodayItem = {
  id: 'content-1',
  title: 'Signals se consolidam nos frameworks',
  summary: 'Adoção cresce em bibliotecas de UI modernas.',
  sourceName: 'Engineering Daily',
  url: 'https://example.com/signals',
  imageUrl: 'https://cdn.test/signals.png',
  sourceCount: 1,
  badge: { icon: '🔥', label: 'Tendência' },
  read: false,
};

function createComponent(
  item: RadarTodayItem = itemFixture,
): ComponentFixture<RadarContentCardComponent> {
  const fixture = TestBed.createComponent(RadarContentCardComponent);
  fixture.componentRef.setInput('item', item);
  fixture.detectChanges();
  return fixture;
}

describe('RadarContentCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarContentCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the title, source and badge label', () => {
    const el = createComponent().nativeElement as HTMLElement;

    expect(el.querySelector('.radar-card__title')?.textContent).toContain(
      'Signals se consolidam nos frameworks',
    );
    expect(el.querySelector('.radar-card__source')?.textContent).toContain(
      'Engineering Daily',
    );
    expect(el.querySelector('.radar-badge')?.textContent).toContain(
      'Tendência',
    );
  });

  it('renders a thumbnail and does not show the summary (compact card)', () => {
    const el = createComponent().nativeElement as HTMLElement;

    expect(el.querySelector('img.radar-thumb')?.getAttribute('src')).toBe(
      'https://cdn.test/signals.png',
    );
    expect(el.textContent).not.toContain(
      'Adoção cresce em bibliotecas de UI modernas.',
    );
  });

  it('links to the internal briefing route, never the external source', () => {
    const fixture = createComponent();
    const link = fixture.debugElement.query(By.css('.radar-card'));
    const routerLink = link.injector.get(RouterLink);
    const anchor = link.nativeElement as HTMLAnchorElement;

    expect(anchor.getAttribute('href')).toBe('/app/content/content-1');
    expect(routerLink.href).toBe('/app/content/content-1');
    expect(anchor.getAttribute('target')).toBeNull();
  });

  it('renders the coverage badge when multiple sources cover the item', () => {
    const el = createComponent({ ...itemFixture, sourceCount: 3 })
      .nativeElement as HTMLElement;
    const coverageBadge = el.querySelector('.radar-coverage-badge');

    expect(coverageBadge?.textContent?.trim()).toBe('Coberto por 3 fontes');
    expect(coverageBadge?.getAttribute('aria-hidden')).toBeNull();
  });

  it('omits the coverage badge for a single-source item', () => {
    const el = createComponent().nativeElement as HTMLElement;

    expect(el.querySelector('.radar-coverage-badge')).toBeNull();
  });

  it('shows the "Lido" badge only when the item is read', () => {
    const read = createComponent({ ...itemFixture, read: true })
      .nativeElement as HTMLElement;
    const badge = read.querySelector('.radar-read-badge');

    expect(badge?.textContent?.trim()).toBe('✓ Lido');
    // O ícone é decorativo; o texto "Lido" carrega o significado.
    expect(badge?.querySelector('.radar-read-badge__icon')?.textContent).toBe(
      '✓',
    );
    expect(
      badge
        ?.querySelector('.radar-read-badge__icon')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');

    const unread = createComponent({ ...itemFixture, read: false })
      .nativeElement as HTMLElement;
    expect(unread.querySelector('.radar-read-badge')).toBeNull();
  });

  it('passes automated AXE checks with the coverage badge present', async () => {
    const root = createComponent({ ...itemFixture, sourceCount: 3 })
      .nativeElement as HTMLElement;
    document.body.appendChild(root);
    const results = await axe(root, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      rules: { 'color-contrast': { enabled: false } },
    });
    root.remove();

    expect(results).toHaveNoViolations();
  });

  it('passes automated AXE checks with the "Lido" badge present', async () => {
    const root = createComponent({ ...itemFixture, read: true })
      .nativeElement as HTMLElement;
    document.body.appendChild(root);
    const results = await axe(root, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      rules: { 'color-contrast': { enabled: false } },
    });
    root.remove();

    expect(results).toHaveNoViolations();
  });
});
