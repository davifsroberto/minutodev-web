/**
 * Production environment (default build configuration).
 *
 * `apiBaseUrl` is a deliberate TBD placeholder until the deployed API host is
 * finalized (see PRD "Open Questions" / TechSpec "Technical Dependencies").
 * During development builds this file is swapped for `environment.development.ts`
 * via `fileReplacements` in `angular.json`.
 */
export const environment = {
  production: true,
  // TODO(deploy): replace with the deployed API host once finalized.
  apiBaseUrl: 'https://TBD-production-api-host.invalid',
};
