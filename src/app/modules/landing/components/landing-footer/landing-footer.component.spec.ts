import { TestBed } from '@angular/core/testing';

import { LandingFooterComponent } from './landing-footer.component';

describe('LandingFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFooterComponent],
    }).compileComponents();
  });

  it('renders the footer landmark', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('footer')).not.toBeNull();
  });

  it('renders the tagline text', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-footer__tagline')?.textContent).toContain(
      'O radar diário para devs que querem se manter atualizados.',
    );
  });

  it('renders the in-page navigation anchors', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const nav = el.querySelector('nav[aria-label="Rodapé"]');
    const hrefs = Array.from(nav?.querySelectorAll('a') ?? []).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['#como-funciona', '#radar', '#publico']);
  });

  it('renders the small print with the literal year 2026', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.site-footer__small')?.textContent).toContain(
      '© 2026 minutoDev. Em construção — V1 em validação.',
    );
  });
});
