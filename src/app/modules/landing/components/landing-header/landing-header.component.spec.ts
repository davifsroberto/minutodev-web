import { TestBed } from '@angular/core/testing';

import { LandingHeaderComponent } from './landing-header.component';

describe('LandingHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHeaderComponent],
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
});
