import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { ThemeService } from './theme.service';

/**
 * Icon button that toggles light/dark. Renders a moon in light mode (click →
 * dark) and a sun in dark mode (click → light). Exposed as an accessible
 * toggle button: a stable name plus `aria-pressed` reflecting the dark state.
 */
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly isDark = this.themeService.isDark;
  protected readonly actionLabel = computed(() =>
    this.isDark() ? 'Ativar tema claro' : 'Ativar tema escuro',
  );

  protected toggle(): void {
    this.themeService.toggle();
  }
}
