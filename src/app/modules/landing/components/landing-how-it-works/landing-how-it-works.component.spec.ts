import { TestBed } from '@angular/core/testing';

import { LandingHowItWorksComponent } from './landing-how-it-works.component';

describe('LandingHowItWorksComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingHowItWorksComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingHowItWorksComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h2')?.textContent).toContain(
      'Seu radar de tecnologia, pronto todo dia.',
    );
  });

  it('renders all three step titles in order', async () => {
    const fixture = TestBed.createComponent(LandingHowItWorksComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const titles = Array.from(element.querySelectorAll('h3')).map((h3) =>
      h3.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Coletamos os sinais',
      'Organizamos o essencial',
      'Você se atualiza em minutos',
    ]);
  });

  it('renders an accessible ordered list of steps', async () => {
    const fixture = TestBed.createComponent(LandingHowItWorksComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const items = element.querySelectorAll('ol > li');

    expect(items.length).toBe(3);
    expect(
      element.querySelector('section')?.getAttribute('aria-labelledby'),
    ).toBe('como-title');
  });
});
