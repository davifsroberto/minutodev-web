import { TestBed } from '@angular/core/testing';

import { LandingProblemComponent } from './landing-problem.component';

describe('LandingProblemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingProblemComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(LandingProblemComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent).toContain(
      'Informação demais. Tempo de menos.',
    );
  });

  it('renders all six scattered source labels', async () => {
    const fixture = TestBed.createComponent(LandingProblemComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('.sources__label')).map(
      (node) => node.textContent?.trim(),
    );

    expect(labels).toEqual([
      'Blogs',
      'GitHub',
      'Newsletters',
      'LinkedIn',
      'Comunidades',
      'Vídeos',
    ]);
  });
});
