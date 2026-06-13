/**
 * Development environment. Swapped in for `environment.ts` via the
 * `development` build configuration's `fileReplacements` in `angular.json`.
 *
 * Targets the local minutoDev API (NestJS) on port 3500.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3500',
};
