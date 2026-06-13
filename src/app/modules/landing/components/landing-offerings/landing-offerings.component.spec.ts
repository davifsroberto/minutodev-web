import { TestBed } from '@angular/core/testing';

import { LandingOfferingsComponent } from './landing-offerings.component';

describe('LandingOfferingsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingOfferingsComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingOfferingsComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent).toContain(
      'O que você encontra no radar.',
    );
  });

  it('renders all five offering titles', async () => {
    const fixture = TestBed.createComponent(LandingOfferingsComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const titles = Array.from(el.querySelectorAll('h3')).map((node) =>
      node.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Tendências',
      'Ferramentas',
      'Releases',
      'Projetos em destaque',
      'Conteúdos recomendados',
    ]);
  });
});
