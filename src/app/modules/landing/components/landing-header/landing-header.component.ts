import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';

import { ThemeToggleComponent } from '../../../../core/theme/theme-toggle.component';

@Component({
  selector: 'app-landing-header',
  imports: [ThemeToggleComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent {
  protected readonly menuOpen = signal(false);

  protected readonly toggleLabel = computed<string>(() =>
    this.menuOpen() ? 'Fechar menu' : 'Abrir menu',
  );

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
