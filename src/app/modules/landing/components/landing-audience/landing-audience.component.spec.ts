import { TestBed } from '@angular/core/testing';

import { LandingAudienceComponent } from './landing-audience.component';

describe('LandingAudienceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingAudienceComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingAudienceComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent).toContain(
      'Feito para quem vive de tecnologia.',
    );
  });

  it('renders all four audience titles', async () => {
    const fixture = TestBed.createComponent(LandingAudienceComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const titles = Array.from(el.querySelectorAll('h3')).map((node) =>
      node.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Desenvolvedores',
      'Tech Leads',
      'Arquitetos de Software',
      'Profissionais de tecnologia',
    ]);
  });
});
