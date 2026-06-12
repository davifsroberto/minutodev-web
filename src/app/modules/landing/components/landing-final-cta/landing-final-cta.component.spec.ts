import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LandingFinalCtaComponent } from './landing-final-cta.component';

const hostTemplate =
  '<app-landing-final-cta><p class="projected">hi</p></app-landing-final-cta>';

@Component({
  imports: [LandingFinalCtaComponent],
  template: hostTemplate,
})
class HostComponent {}

describe('LandingFinalCtaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('renders the section heading', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h2')?.textContent).toContain(
      'Atualize-se em poucos minutos por dia.',
    );
  });

  it('projects the hosted waitlist form content', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const projected = el.querySelector('.projected');

    expect(projected).not.toBeNull();
    expect(projected?.textContent).toBe('hi');
  });

  it('links the section to its heading for accessibility', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section');

    expect(section?.getAttribute('aria-labelledby')).toBe('cta-title');
    expect(el.querySelector('#cta-title')).not.toBeNull();
  });
});
