import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { RadarTodaySection } from '../../../../models/radar-today.model';
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
    },
    {
      id: 'trend-2',
      title: 'Runtime novo ganha tração',
      summary: null,
      sourceName: 'Release Radar',
      url: 'https://example.com/runtime',
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

  it('renders one list entry per item with title and source name', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll<HTMLLIElement>('.radar-section__item');

    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain(
      'Signals se consolidam nos frameworks',
    );
    expect(items[0].textContent).toContain('Fonte: Engineering Daily');
    expect(items[1].textContent).toContain('Runtime novo ganha tração');
    expect(items[1].textContent).toContain('Fonte: Release Radar');
  });

  it('renders summaries when present and omits the summary element when summary is null', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll<HTMLAnchorElement>(
      '.radar-section__link',
    );

    expect(links[0].querySelector('.radar-section__summary')?.textContent).toBe(
      'Adoção cresce em bibliotecas de UI modernas.',
    );
    expect(links[1].querySelector('.radar-section__summary')).toBeNull();
    expect(el.querySelectorAll('.radar-section__summary')).toHaveLength(1);
  });

  it('links each item to its internal content route instead of the external source', () => {
    const fixture = createComponent();
    const links = fixture.debugElement.queryAll(By.css('.radar-section__link'));

    expect(links).toHaveLength(2);
    links.forEach((link, index) => {
      const routerLink = link.injector.get(RouterLink);
      const anchor = link.nativeElement as HTMLAnchorElement;
      const expectedHref = `/app/content/${sectionFixture.items[index].id}`;

      expect(routerLink.href).toBe(expectedHref);
      expect(anchor.getAttribute('href')).toBe(expectedHref);
    });
  });

  it('no longer opens the original source in a new tab from the card', () => {
    const fixture = createComponent();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll<HTMLAnchorElement>(
      '.radar-section__link',
    );

    links.forEach((link) => {
      expect(link.getAttribute('target')).toBeNull();
      expect(link.querySelector('.visually-hidden')).toBeNull();
    });
  });

  it('passes automated AXE checks with multiple items', async () => {
    const fixture = createComponent();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
