import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RadarBriefing } from '@app/core/radar/radar.model';
import { LandingPageComponent } from './landing-page.component';

const EMPTY_BRIEFING: RadarBriefing = {
  date: '2026-06-13',
  featuredId: null,
  estimatedReadTimeMinutes: 0,
  sections: [],
};

describe('LandingPageComponent', () => {
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
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
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

  it('no longer renders the removed waitlist form', async () => {
    const fixture = await createPage();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-waitlist-form')).toBeNull();
    expect(el.querySelector('input[type=email]')).toBeNull();
  });
});
