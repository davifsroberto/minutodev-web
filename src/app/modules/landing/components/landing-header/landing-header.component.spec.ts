import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { LandingHeaderComponent } from './landing-header.component';

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

describe('LandingHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the wordmark and a navigation link', async () => {
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.wordmark')?.textContent).toContain('minuto');
    expect(el.querySelector('.wordmark__accent')?.textContent).toContain('Dev');
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.site-nav__link'),
    );
    expect(
      links.some((link) => link.textContent?.includes('Como funciona')),
    ).toBe(true);
  });

  it('toggles menuOpen and reflects it on aria-expanded', async () => {
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('.menu-toggle');

    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-label')).toBe('Abrir menu');

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle?.getAttribute('aria-label')).toBe('Fechar menu');
    expect(el.querySelector('.site-nav')?.classList.contains('is-open')).toBe(
      true,
    );

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders the Radar app CTA with a RouterLink to /app', async () => {
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const cta = getByRole(el, 'link', { name: 'Acessar o Radar' });
    const routerLink = fixture.debugElement
      .query(By.css('.site-header__cta'))
      .injector.get(RouterLink);

    expect(cta.getAttribute('href')).toBe('/app');
    expect(cta.classList.contains('btn--primary')).toBe(true);
    expect(routerLink.href).toBe('/app');
  });

  it('keeps the Radar app CTA keyboard reachable with a discernible name', async () => {
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const cta = getByRole(el, 'link', { name: 'Acessar o Radar' });
    const user = userEvent.setup();

    while (document.activeElement !== cta) {
      await user.tab();
    }

    expect(document.activeElement).toBe(cta);
    el.remove();
  });

  it('passes automated AXE checks', async () => {
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    await fixture.whenStable();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
