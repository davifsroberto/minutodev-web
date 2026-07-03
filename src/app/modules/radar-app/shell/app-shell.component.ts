import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthMenuComponent } from '../../../core/auth/components/auth-menu/auth-menu.component';

@Component({
  selector: 'app-radar-app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AuthMenuComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
