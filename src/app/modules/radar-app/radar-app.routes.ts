import { Routes } from '@angular/router';

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
        path: 'content/:id',
        component: ContentDetailPageComponent,
      },
    ],
  },
];
