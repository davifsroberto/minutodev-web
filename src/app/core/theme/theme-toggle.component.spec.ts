import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  const root = document.documentElement;

  beforeEach(async () => {
    root.removeAttribute('data-theme');
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();
  });

  afterEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('renders an accessible toggle button, defaulting to dark', async () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    );

    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.getAttribute('aria-label')).toBe('Tema escuro');
    expect(button?.getAttribute('title')).toBe('Ativar tema claro');
  });

  it('toggles the theme and reflects it on aria-pressed when clicked', async () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    const service = TestBed.inject(ThemeService);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    );

    button?.click();
    await fixture.whenStable();

    expect(service.isDark()).toBe(false);
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.getAttribute('title')).toBe('Ativar tema escuro');
  });
});
