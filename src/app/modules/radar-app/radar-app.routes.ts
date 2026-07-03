import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/auth.guard';
import { ContentDetailPageComponent } from './features/content-detail/content-detail-page.component';
import { RadarTodayPageComponent } from './features/radar-today/radar-today-page.component';
import { AppShellComponent } from './shell/app-shell.component';

export const radarAppRoutes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        component: RadarTodayPageComponent,
      },

      {
        path: 'preferences',
        loadComponent: () =>
          import('./features/preferences/preferences-page.component').then(
            (m) => m.PreferencesPageComponent,
          ),
        canActivate: [authGuard],
      },

      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history-page.component').then(
            (m) => m.HistoryPageComponent,
          ),
        canActivate: [authGuard],
      },

      {
        path: 'content/:id',
        component: ContentDetailPageComponent,
      },
    ],
  },
];
