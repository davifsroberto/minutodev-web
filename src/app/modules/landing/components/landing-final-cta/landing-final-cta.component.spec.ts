import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { LandingFinalCtaComponent } from './landing-final-cta.component';

describe('LandingFinalCtaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFinalCtaComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingFinalCtaComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent).toContain(
      'Atualize-se em poucos minutos por dia.',
    );
  });

  it('renders an "Acessar o Radar" CTA linking to /app', async () => {
    const fixture = TestBed.createComponent(LandingFinalCtaComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const cta = el.querySelector<HTMLAnchorElement>('.final-cta__action a');
    const routerLink = fixture.debugElement
      .query(By.css('.final-cta__action a'))
      .injector.get(RouterLink);

    expect(cta?.textContent?.trim()).toBe('Acessar o Radar');
    expect(cta?.getAttribute('href')).toBe('/app');
    expect(routerLink.href).toBe('/app');
  });

  it('links the section to its heading for accessibility', async () => {
    const fixture = TestBed.createComponent(LandingFinalCtaComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section');

    expect(section?.getAttribute('aria-labelledby')).toBe('cta-title');
    expect(el.querySelector('#cta-title')).not.toBeNull();
  });
});
