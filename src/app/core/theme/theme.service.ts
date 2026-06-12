import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export type Theme = 'light' | 'dark';

/** localStorage key — must match the inline bootstrap script in index.html. */
const STORAGE_KEY = 'minutodev-theme';

/** Browser chrome colour per theme (the `theme-color` meta tag). */
const META_THEME_COLOR: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#14151a',
};

/**
 * Owns the light/dark theme as a signal and mirrors it to the DOM
 * (`data-theme` on <html>), to `localStorage`, and to the `theme-color` meta.
 * The user's explicit choice wins; otherwise dark is the default.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _theme = signal<Theme>(this.resolveInitialTheme());

  /** The active theme. */
  readonly theme = this._theme.asReadonly();
  /** Whether the dark theme is active — handy for templates. */
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Sync the signal out to the DOM / storage / browser chrome on every
    // change (and once on init, re-affirming the inline bootstrap script).
    effect(() => this.applyTheme(this._theme()));
  }

  /** Set the theme explicitly. */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  /** Flip between light and dark. */
  toggle(): void {
    this._theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  private resolveInitialTheme(): Theme {
    if (!this.isBrowser) {
      return 'dark';
    }

    const stored = this.readStoredTheme();
    if (stored) {
      return stored;
    }

    // The inline bootstrap script may have already applied the default to
    // <html> — honour it so the signal matches what is on screen.
    const fromDom = this.document.documentElement.dataset['theme'];
    if (fromDom === 'light' || fromDom === 'dark') {
      return fromDom;
    }

    return 'dark';
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.dataset['theme'] = theme;

    if (!this.isBrowser) {
      return;
    }

    this.persistTheme(theme);

    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', META_THEME_COLOR[theme]);
  }

  private readStoredTheme(): Theme | null {
    try {
      const value = this.window?.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      // Storage can be blocked (private mode, strict cookie settings).
      return null;
    }
  }

  private persistTheme(theme: Theme): void {
    try {
      this.window?.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Best-effort only — ignore when storage is unavailable.
    }
  }

  private get window(): (Window & typeof globalThis) | null {
    return this.document.defaultView;
  }
}
