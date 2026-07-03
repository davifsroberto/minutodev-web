import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { axe, toHaveNoViolations } from 'jest-axe';

import { authGuard } from '../../../core/auth/auth.guard';
import { ContentDetailPageComponent } from '../features/content-detail/content-detail-page.component';
import { RadarTodayPageComponent } from '../features/radar-today/radar-today-page.component';
import { radarAppRoutes } from '../radar-app.routes';
import { AppShellComponent } from './app-shell.component';

expect.extend(toHaveNoViolations);

const childStubTemplate = 'Filho roteado';

@Component({
  selector: 'app-radar-shell-child-stub',
  template: childStubTemplate,
})
class RoutedChildStubComponent {}

const expectNoAxeViolations = async (root: HTMLElement): Promise<void> => {
  document.body.appendChild(root);
  const results = await axe(root, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  root.remove();
  expect(results).toHaveNoViolations();
};

describe('AppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('renders the minutoDev brand in the top bar', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const topBar = el.querySelector<HTMLElement>('.app-shell__bar');
    const brand = el.querySelector<HTMLElement>('.app-shell__brand');

    expect(topBar).not.toBeNull();
    expect(brand?.getAttribute('aria-label')).toBe('minutoDev');
    expect(brand?.textContent).toContain('minuto');
    expect(brand?.textContent).toContain('Dev');
  });

  it('offers a way back to the radar: brand and "Radar" link point to /app', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const brandLink = el.querySelector<HTMLAnchorElement>(
      '.app-shell__brand-link',
    );
    const radarLink = el.querySelector<HTMLAnchorElement>(
      '.app-shell__radar-link',
    );

    expect(brandLink?.getAttribute('href')).toBe('/app');
    expect(radarLink?.getAttribute('href')).toBe('/app');
    expect(radarLink?.textContent).toContain('Radar');
  });

  it('does not render landing chrome, marketing navigation, or waitlist markup', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent ?? '';

    expect(el.querySelector('app-landing-header')).toBeNull();
    expect(el.querySelector('app-landing-footer')).toBeNull();
    expect(el.querySelector('app-waitlist-form')).toBeNull();
    expect(el.querySelector('.site-nav')).toBeNull();
    expect(el.querySelector('.site-header')).toBeNull();
    expect(text).not.toContain('Como funciona');
    expect(text).not.toContain('Para quem é');
    expect(text).not.toContain('Quero receber o lançamento');
  });

  it('passes automated AXE checks', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    await fixture.whenStable();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});

describe('AppShellComponent routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, RoutedChildStubComponent],
      providers: [
        provideHttpClient(),
        provideRouter([
          {
            path: '',
            component: AppShellComponent,
            children: [{ path: '', component: RoutedChildStubComponent }],
          },
        ]),
      ],
    }).compileComponents();
  });

  it('projects a routed child through its router outlet', async () => {
    const harness = await RouterTestingHarness.create('/');
    await harness.fixture.whenStable();

    const el = harness.fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app-shell__brand')?.textContent).toContain(
      'minutoDev',
    );
    expect(el.textContent).toContain('Filho roteado');
  });
});

describe('radarAppRoutes', () => {
  it('exposes the shell as a parent route with radar, preferences and history (guarded) and content detail as children', () => {
    expect(radarAppRoutes).toHaveLength(1);
    expect(radarAppRoutes[0]).toMatchObject({
      path: '',
      component: AppShellComponent,
    });

    const children = radarAppRoutes[0]?.children ?? [];
    expect(children.map((route) => route.path)).toEqual([
      '',
      'preferences',
      'history',
      'content/:id',
    ]);

    expect(children[0]).toMatchObject({
      path: '',
      component: RadarTodayPageComponent,
    });

    // Preferências é lazy e protegida pelo authGuard.
    expect(children[1]?.path).toBe('preferences');
    expect(children[1]?.canActivate).toEqual([authGuard]);
    expect(typeof children[1]?.loadComponent).toBe('function');

    // Histórico segue o mesmo padrão: lazy e restrito a sessão ativa.
    expect(children[2]?.path).toBe('history');
    expect(children[2]?.canActivate).toEqual([authGuard]);
    expect(typeof children[2]?.loadComponent).toBe('function');

    expect(children[3]).toMatchObject({
      path: 'content/:id',
      component: ContentDetailPageComponent,
    });
  });
});
