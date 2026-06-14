import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { RadarBriefing } from '@app/core/radar/radar.model';
import { WaitlistService } from '../../services/waitlist.service';
import { LandingPageComponent } from './landing-page.component';

const EMPTY_BRIEFING: RadarBriefing = {
  date: '2026-06-13',
  estimatedReadTimeMinutes: 0,
  sections: [],
};

describe('LandingPageComponent', () => {
  const joinMock = jest.fn().mockReturnValue(of(undefined));

  /**
   * Create the page, settle the self-fetching radar preview's GET (otherwise
   * the open request keeps the app unstable and `whenStable()` never resolves).
   */
  const createPage = async (): Promise<
    ComponentFixture<LandingPageComponent>
  > => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    TestBed.tick();

    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting
      .match((req) => req.url.endsWith('/radar/today'))
      .forEach((req) => req.flush(EMPTY_BRIEFING));

    await fixture.whenStable();
    return fixture;
  };

  beforeEach(async () => {
    joinMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: WaitlistService, useValue: { join: joinMock } },
      ],
    }).compileComponents();
  });

  it('creates the component and renders the main landmark with key sections', async () => {
    const fixture = await createPage();

    const el = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('main#conteudo')).not.toBeNull();
    expect(el.querySelector('app-landing-hero')).not.toBeNull();
    expect(el.querySelector('app-landing-final-cta')).not.toBeNull();
  });

  it('declares the radar preview with no radar inputs and drops the mock data', async () => {
    const fixture = await createPage();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-landing-radar-preview')).not.toBeNull();

    // The self-fetching preview owns its data now — the parent exposes neither
    // the mock array nor the hardcoded read-time.
    const instance = fixture.componentInstance as Record<string, unknown>;
    expect(instance['radarItems']).toBeUndefined();
    expect(instance['estimatedMinutes']).toBeUndefined();
  });

  it('submits a valid email, calls join() and shows the success message', async () => {
    const fixture = await createPage();

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
