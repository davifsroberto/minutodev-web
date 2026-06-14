import { Routes } from '@angular/router';

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
    ],
  },
];
