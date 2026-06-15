import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { RadarTodayItem } from '../../../../models/radar-today.model';
import { RadarContentCardComponent } from './radar-content-card.component';

const itemFixture: RadarTodayItem = {
  id: 'content-1',
  title: 'Signals se consolidam nos frameworks',
  summary: 'Adoção cresce em bibliotecas de UI modernas.',
  sourceName: 'Engineering Daily',
  url: 'https://example.com/signals',
  imageUrl: 'https://cdn.test/signals.png',
  badge: { icon: '🔥', label: 'Tendência' },
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
});
