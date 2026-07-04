import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { RadarTodayItem } from '@app/core/radar/radar-view.model';
import { RadarHighlightCardComponent } from './radar-highlight-card.component';

expect.extend(toHaveNoViolations);

const itemFixture: RadarTodayItem = {
  id: 'highlight-1',
  title: 'Signals viram padrão de reatividade',
  summary: 'Frameworks convergem para reatividade granular em 2026.',
  sourceName: 'Engineering Daily',
  url: 'https://example.com/signals',
  imageUrl: 'https://cdn.test/signals.png',
  sourceCount: 1,
  badge: { icon: '🔥', label: 'Tendência' },
  read: false,
};

function createComponent(
  item: RadarTodayItem = itemFixture,
): ComponentFixture<RadarHighlightCardComponent> {
  const fixture = TestBed.createComponent(RadarHighlightCardComponent);
  fixture.componentRef.setInput('item', item);
  fixture.detectChanges();
  return fixture;
}

describe('RadarHighlightCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarHighlightCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders title, summary, source, badge, CTA and thumbnail', () => {
    const el = createComponent().nativeElement as HTMLElement;

    expect(el.querySelector('.radar-highlight__title')?.textContent).toContain(
      'Signals viram padrão de reatividade',
    );
    expect(
      el.querySelector('.radar-highlight__summary')?.textContent,
    ).toContain('Frameworks convergem');
    expect(el.querySelector('.radar-highlight__source')?.textContent).toContain(
      'Engineering Daily',
    );
    expect(el.querySelector('.radar-badge')?.textContent).toContain(
      'Tendência',
    );
    expect(el.querySelector('.radar-highlight__cta')?.textContent).toContain(
      'Ler resumo',
    );
    expect(el.querySelector('img.radar-thumb')?.getAttribute('src')).toBe(
      'https://cdn.test/signals.png',
    );
  });

  it('omits the summary element when the item has no summary', () => {
    const el = createComponent({ ...itemFixture, summary: null })
      .nativeElement as HTMLElement;

    expect(el.querySelector('.radar-highlight__summary')).toBeNull();
  });

  it('links to the internal content detail route', () => {
    const fixture = createComponent();
    const link = fixture.debugElement.query(By.css('.radar-highlight'));
    const routerLink = link.injector.get(RouterLink);

    expect(routerLink.href).toBe('/app/content/highlight-1');
    expect((link.nativeElement as HTMLAnchorElement).getAttribute('href')).toBe(
      '/app/content/highlight-1',
    );
  });

  it('renders the coverage badge when multiple sources cover the item', () => {
    const el = createComponent({ ...itemFixture, sourceCount: 4 })
      .nativeElement as HTMLElement;
    const coverageBadge = el.querySelector('.radar-coverage-badge');

    expect(coverageBadge?.textContent?.trim()).toBe('Coberto por 4 fontes');
    expect(coverageBadge?.getAttribute('aria-hidden')).toBeNull();
  });

  it('omits the coverage badge for a single-source item', () => {
    const el = createComponent().nativeElement as HTMLElement;

    expect(el.querySelector('.radar-coverage-badge')).toBeNull();
  });

  it('shows the "Lido" badge on the highlight only when the item is read', () => {
    const read = createComponent({ ...itemFixture, read: true })
      .nativeElement as HTMLElement;
    const badge = read.querySelector('.radar-read-badge');

    expect(badge?.textContent?.trim()).toBe('✓ Lido');
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
    const root = createComponent({ ...itemFixture, sourceCount: 4 })
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
