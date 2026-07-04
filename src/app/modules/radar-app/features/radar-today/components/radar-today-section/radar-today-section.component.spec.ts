import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { RadarTodaySection } from '@app/core/radar/radar-view.model';
import { RadarTodaySectionComponent } from './radar-today-section.component';

expect.extend(toHaveNoViolations);

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

const sectionFixture: RadarTodaySection = {
  key: 'trends',
  label: 'Tendências',
  items: [
    {
      id: 'trend-1',
      title: 'Signals se consolidam nos frameworks',
      summary: 'Adoção cresce em bibliotecas de UI modernas.',
      sourceName: 'Engineering Daily',
      url: 'https://example.com/signals',
      imageUrl: 'https://cdn.test/signals.png',
      badge: { icon: '🔥', label: 'Tendência' },
      read: false,
    },
    {
      id: 'trend-2',
      title: 'Runtime novo ganha tração',
      summary: null,
      sourceName: 'Release Radar',
      url: 'https://example.com/runtime',
      imageUrl: null,
      badge: { icon: '🤖', label: 'IA' },
      read: false,
    },
  ],
};

function createComponent(
  section: RadarTodaySection = sectionFixture,
): ComponentFixture<RadarTodaySectionComponent> {
  const fixture = TestBed.createComponent(RadarTodaySectionComponent);
  fixture.componentRef.setInput('section', section);
  fixture.detectChanges();
  return fixture;
}

describe('RadarTodaySectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarTodaySectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the section PT-BR label as a heading', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector<HTMLHeadingElement>('h2');

    expect(heading?.textContent?.trim()).toBe('Tendências');
    expect(heading?.id).toBe('radar-section-trends');
    expect(el.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      'radar-section-trends',
    );
  });

  it('renders one card per item with title and source name', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll<HTMLAnchorElement>('.radar-card');

    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain(
      'Signals se consolidam nos frameworks',
    );
    expect(cards[0].textContent).toContain('Engineering Daily');
    expect(cards[1].textContent).toContain('Runtime novo ganha tração');
    expect(cards[1].textContent).toContain('Release Radar');
  });

  it('renders the badge label on each card', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const badges = Array.from(
      el.querySelectorAll<HTMLElement>('.radar-badge'),
    ).map((badge) => badge.textContent?.trim());

    expect(badges).toHaveLength(2);
    expect(badges[0]).toContain('Tendência');
    expect(badges[1]).toContain('IA');
  });

  it('renders a thumbnail per card: real image when present, branded cover when null', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const images = el.querySelectorAll<HTMLImageElement>('img.radar-thumb');

    expect(images).toHaveLength(2);
    images.forEach((image) => {
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
    });
    expect(images[0].getAttribute('src')).toBe('https://cdn.test/signals.png');
    expect(images[1].getAttribute('src')).toContain('data:image/svg+xml');
  });

  it('does not show item summaries on the home cards (density reduced)', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).not.toContain(
      'Adoção cresce em bibliotecas de UI modernas.',
    );
  });

  it('links each card to its internal content route instead of the external source', () => {
    const fixture = createComponent();
    const links = fixture.debugElement.queryAll(By.css('.radar-card'));

    expect(links).toHaveLength(2);
    links.forEach((link, index) => {
      const routerLink = link.injector.get(RouterLink);
      const anchor = link.nativeElement as HTMLAnchorElement;
      const expectedHref = `/app/content/${sectionFixture.items[index].id}`;

      expect(routerLink.href).toBe(expectedHref);
      expect(anchor.getAttribute('href')).toBe(expectedHref);
    });
  });

  it('does not open the original source in a new tab from the card', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll<HTMLAnchorElement>('.radar-card');

    cards.forEach((card) => {
      expect(card.getAttribute('target')).toBeNull();
    });
  });

  it('passes automated AXE checks with multiple items', async () => {
    const fixture = createComponent();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
