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
  badge: { icon: '🔥', label: 'Tendência' },
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

  it('passes automated AXE checks', async () => {
    const root = createComponent().nativeElement as HTMLElement;
    document.body.appendChild(root);
    const results = await axe(root, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      rules: { 'color-contrast': { enabled: false } },
    });
    root.remove();

    expect(results).toHaveNoViolations();
  });
});
