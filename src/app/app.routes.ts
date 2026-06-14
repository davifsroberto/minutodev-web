import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/landing/landing.routes').then((m) => m.landingRoutes),
  },

  {
    path: 'app',
    loadChildren: () =>
      import('./modules/radar-app/radar-app.routes').then(
        (m) => m.radarAppRoutes,
      ),
  },
];
