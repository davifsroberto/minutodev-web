import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'minutodev-theme';

describe('ThemeService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    root.removeAttribute('data-theme');
    localStorage.clear();
  });

  // The DOM/storage writes happen in an effect, so flush them before asserting.
  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  it('defaults to dark when nothing is stored', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('restores the persisted choice over the dark default', () => {
    localStorage.setItem(STORAGE_KEY, 'light');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
  });

  it('honours a pre-resolved data-theme on <html> when nothing is stored', () => {
    root.setAttribute('data-theme', 'light');

    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });

  it('toggle() flips the theme and mirrors it to the DOM and storage', () => {
    const service = TestBed.inject(ThemeService);
    flush();
    expect(root.getAttribute('data-theme')).toBe('dark');

    service.toggle();
    flush();

    expect(service.theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('setTheme() applies and persists the requested theme', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('dark');
    flush();
    expect(root.getAttribute('data-theme')).toBe('dark');

    service.setTheme('light');
    flush();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });
});
