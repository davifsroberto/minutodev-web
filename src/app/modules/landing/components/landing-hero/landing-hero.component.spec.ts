import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LandingHeroComponent } from './landing-hero.component';

describe('LandingHeroComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHeroComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the hero title with the exact headline', async () => {
    const fixture = TestBed.createComponent(LandingHeroComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('h1#hero-title');

    expect(title?.textContent?.trim()).toBe(
      'Atualize-se em tecnologia em poucos minutos por dia.',
    );
  });

  it('renders both CTA links with the correct hrefs', async () => {
    const fixture = TestBed.createComponent(LandingHeroComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const primary = el.querySelector<HTMLAnchorElement>('a.btn--primary');
    const secondary = el.querySelector<HTMLAnchorElement>('a.btn--outline');

    expect(primary?.getAttribute('href')).toBe('/app');
    expect(primary?.textContent?.trim()).toBe('Acessar o Radar');
    expect(secondary?.getAttribute('href')).toBe('#radar');
    expect(secondary?.textContent?.trim()).toBe('Ver exemplo do radar');
  });
});
