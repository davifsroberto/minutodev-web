import { HttpRequest, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { axe, toHaveNoViolations } from 'jest-axe';

import { environment } from '@environments/environment';
import { AuthService } from '@app/core/auth/auth.service';
import { RadarBriefing } from '@app/core/radar/radar.model';
import { CLOCK } from '@app/core/time/clock';
import { LandingRadarPreviewComponent } from '@app/modules/landing/components/landing-radar-preview/landing-radar-preview.component';
import { RadarTodayPageComponent } from '@app/modules/radar-app/features/radar-today/radar-today-page.component';

expect.extend(toHaveNoViolations);

const ENDPOINT = `${environment.apiBaseUrl}/radar/today`;
const matchRadar = (req: HttpRequest<unknown>): boolean => req.url === ENDPOINT;

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

/**
 * Briefing that mirrors the Sprint 6 contract: real API categories
 * (ai/community/frontend/opensource/engineering), mixed sourceCount, a
 * featuredId that is NOT the first positional item, and an item order that is
 * intentionally not sorted by publishedAt (relevance order owned by the API).
 */
function contractBriefing(): RadarBriefing {
  return {
    date: '2026-06-13',
    featuredId: 'eng-2',
    estimatedReadTimeMinutes: 7,
    sections: [
      {
        key: 'trends',
        items: [
          {
            id: 'ai-1',
            title: 'Agentes de código entram no fluxo diário',
            summary: 'Times adotam revisão assistida por modelos.',
            url: 'https://example.com/ai',
            sourceName: 'IA Weekly',
            category: 'ai',
            sourceCount: 5,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-10T08:00:00.000Z',
          },
          {
            id: 'comm-1',
            title: 'Comunidade debate governança de specs',
            summary: 'Discussão sobre RFCs abertas ganha tração.',
            url: 'https://example.com/community',
            sourceName: 'Dev Community',
            category: 'community',
            sourceCount: 1,
            contentType: 'DISCUSSION',
            publishedAt: '2026-06-13T08:00:00.000Z',
          },
        ],
      },
      {
        key: 'recommended',
        items: [
          {
            id: 'fe-1',
            title: 'Padrões de acessibilidade para formulários',
            summary: 'Guia prático com foco em WCAG AA.',
            url: 'https://example.com/frontend',
            sourceName: 'Frontend Digest',
            category: 'frontend',
            sourceCount: 2,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-12T08:00:00.000Z',
          },
        ],
      },
      {
        key: 'tools',
        items: [
          {
            id: 'os-1',
            title: 'Projeto open source lança plugin oficial',
            summary: 'Mantenedores publicam extensão estável.',
            url: 'https://example.com/opensource',
            sourceName: 'OSS News',
            category: 'opensource',
            sourceCount: 3,
            contentType: 'REPOSITORY',
            publishedAt: '2026-06-11T08:00:00.000Z',
          },
          {
            id: 'eng-2',
            title: 'Build remoto corta tempo de CI pela metade',
            summary: 'Engenharia de plataforma detalha o pipeline.',
            url: 'https://example.com/engineering',
            sourceName: 'Platform Eng',
            category: 'engineering',
            sourceCount: 1,
            contentType: 'ARTICLE',
            publishedAt: '2026-06-09T08:00:00.000Z',
          },
        ],
      },
      { key: 'releases', items: [] },
    ],
  };
}

const FEATURED_TITLE = 'Build remoto corta tempo de CI pela metade';
const FIRST_TREND_TITLE = 'Agentes de código entram no fluxo diário';

describe('radar acceptance demo (contract fixtures) — 6A.1/6A.2/6A.3/6A.5', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarTodayPageComponent, LandingRadarPreviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CLOCK, useValue: () => new Date(2026, 5, 13, 9, 0, 0) },
        // Sessão anônima estável: o RadarService reativo fica em /radar/today
        // (com o AuthService real, `loading` deixaria o resource ocioso).
        { provide: AuthService, useValue: { status: signal('anonymous') } },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.match(() => true);
  });

  const settle = (fixture: ComponentFixture<unknown>): Promise<void> =>
    fixture.whenStable();

  it('serves Radar and Landing the same featuredId highlight from one briefing', async () => {
    const radar = TestBed.createComponent(RadarTodayPageComponent);
    const landing = TestBed.createComponent(LandingRadarPreviewComponent);
    TestBed.tick();

    httpTesting.expectOne(matchRadar).flush(contractBriefing());
    await settle(radar);
    await settle(landing);
    httpTesting
      .match(`${environment.apiBaseUrl}/contents/eng-2/enrichment`)
      .forEach((warm) => warm.flush({}));

    const radarEl = radar.nativeElement as HTMLElement;
    const landingEl = landing.nativeElement as HTMLElement;

    const radarHighlight = radarEl
      .querySelector('app-radar-highlight-card')
      ?.textContent?.trim();
    const landingHighlight = landingEl
      .querySelector('app-radar-highlight-card')
      ?.textContent?.trim();

    expect(radar.componentInstance.highlight()?.id).toBe('eng-2');
    expect(radarHighlight).toContain(FEATURED_TITLE);
    expect(landingHighlight).toContain(FEATURED_TITLE);
    expect(radarHighlight).not.toContain(FIRST_TREND_TITLE);
    expect(landingHighlight).not.toContain(FIRST_TREND_TITLE);
  });

  it('preserves the API item order and de-duplicates the highlight on the Radar (6A.2/6A.5)', async () => {
    const radar = TestBed.createComponent(RadarTodayPageComponent);
    TestBed.tick();
    httpTesting.expectOne(matchRadar).flush(contractBriefing());
    await settle(radar);
    httpTesting
      .match(`${environment.apiBaseUrl}/contents/eng-2/enrichment`)
      .forEach((warm) => warm.flush({}));

    const ids = radar.componentInstance
      .displaySections()
      .flatMap((section) => section.items)
      .map((item) => item.id);

    expect(ids).toEqual(['ai-1', 'comm-1', 'fe-1', 'os-1']);
    expect(ids).not.toContain('eng-2');
  });

  it('shows the coverage badge only when sourceCount > 1 and renders curated category labels (6A.3/6A.4)', async () => {
    const radar = TestBed.createComponent(RadarTodayPageComponent);
    TestBed.tick();
    httpTesting.expectOne(matchRadar).flush(contractBriefing());
    await settle(radar);
    httpTesting
      .match(`${environment.apiBaseUrl}/contents/eng-2/enrichment`)
      .forEach((warm) => warm.flush({}));

    const radarEl = radar.nativeElement as HTMLElement;
    const coverageBadges = Array.from(
      radarEl.querySelectorAll('.radar-coverage-badge'),
    ).map((badge) => badge.textContent?.replace(/\s+/g, ' ').trim());
    const categoryBadges = Array.from(
      radarEl.querySelectorAll('.radar-badge'),
    ).map((badge) => badge.textContent?.replace(/\s+/g, ' ').trim());

    expect(coverageBadges).toEqual(
      expect.arrayContaining([
        'Coberto por 5 fontes',
        'Coberto por 3 fontes',
        'Coberto por 2 fontes',
      ]),
    );
    expect(coverageBadges).not.toContain('Coberto por 1 fontes');
    expect(categoryBadges).toEqual(
      expect.arrayContaining([
        '🤖 IA',
        '💬 Comunidade',
        '🔓 Open Source',
        '🎨 Frontend',
        '⚙️ Engenharia',
      ]),
    );
  });

  it('passes AXE on both Radar and Landing with the contract briefing', async () => {
    const radar = TestBed.createComponent(RadarTodayPageComponent);
    const landing = TestBed.createComponent(LandingRadarPreviewComponent);
    TestBed.tick();
    httpTesting.expectOne(matchRadar).flush(contractBriefing());
    await settle(radar);
    await settle(landing);
    httpTesting
      .match(`${environment.apiBaseUrl}/contents/eng-2/enrichment`)
      .forEach((warm) => warm.flush({}));

    await expectNoAxeViolations(radar.nativeElement as HTMLElement);
    await expectNoAxeViolations(landing.nativeElement as HTMLElement);
  });
});
