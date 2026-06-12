import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { WaitlistService } from '../../services/waitlist.service';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  const joinMock = jest.fn().mockReturnValue(of(undefined));

  beforeEach(async () => {
    joinMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [{ provide: WaitlistService, useValue: { join: joinMock } }],
    }).compileComponents();
  });

  it('creates the component and renders the main landmark with key sections', async () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('main#conteudo')).not.toBeNull();
    expect(el.querySelector('app-landing-hero')).not.toBeNull();
    expect(el.querySelector('app-landing-final-cta')).not.toBeNull();
  });

  it('submits a valid email, calls join() and shows the success message', async () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('input[type=email]');
    const form = el.querySelector<HTMLFormElement>('form');
    expect(input).not.toBeNull();
    expect(form).not.toBeNull();

    input!.value = 'dev@minutodev.com';
    input!.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    form!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(joinMock).toHaveBeenCalledWith({ email: 'dev@minutodev.com' });
    expect(el.querySelector('.status--success')?.textContent).toContain(
      'Você está na lista',
    );
  });
});
