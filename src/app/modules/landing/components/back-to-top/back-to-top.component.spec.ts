import { TestBed } from '@angular/core/testing';

import { BackToTopComponent } from './back-to-top.component';

describe('BackToTopComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackToTopComponent],
    }).compileComponents();
  });

  it('anchors to the top of the page', async () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    await fixture.whenStable();

    const link = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLAnchorElement>('a.back-to-top');

    expect(link?.getAttribute('href')).toBe('#topo');
    expect(link?.getAttribute('aria-label')).toBe('Voltar ao topo');
  });

  it('stays hidden and unfocusable until the page is scrolled past the hero', async () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    await fixture.whenStable();

    const link = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLAnchorElement>('a.back-to-top')!;

    expect(link.classList.contains('is-visible')).toBe(false);
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.getAttribute('aria-hidden')).toBe('true');
  });

  it('reveals itself once scrolled well past the threshold', async () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    await fixture.whenStable();

    Object.defineProperty(window, 'scrollY', {
      value: 800,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const link = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLAnchorElement>('a.back-to-top')!;

    expect(link.classList.contains('is-visible')).toBe(true);
    expect(link.getAttribute('tabindex')).toBeNull();
    expect(link.getAttribute('aria-hidden')).toBeNull();
  });
});
