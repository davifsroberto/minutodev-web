---
name: module-folder-structure
description: 'Mandatory folder structure for feature modules following Angular best practices and project conventions.'
applies-to: ['new-modules', 'module-refactoring', 'code-organization']
---

# Rule: Module Folder Structure

This rule defines the mandatory folder structure for **any** feature module under `src/app/modules`. It is generic on purpose: replace every `<placeholder>` with your module's real names. All new modules and refactorings must follow this structure to ensure consistency, maintainability, and scalability across the codebase.

> Throughout this document `<module-name>`, `<feature>`, `<component>`, `<service>`, etc. are placeholders. A concrete module (`fluctuation-tariff`) is shown at the end only as a reference example — do **not** copy tariff-specific names into other modules.

## Mandatory Structure

Every feature module must follow this hierarchical structure:

```
<module-name>/
│
├── <module-name>.module.ts          # Main module definition
├── <module-name>.routes.ts          # Lazy-loaded routes (if applicable)
│
├── components/                       # Dumb/presentational components
│   ├── <component>/
│   │   ├── <component>.component.ts
│   │   ├── <component>.component.html
│   │   ├── <component>.component.scss
│   │   └── <component>.component.spec.ts
│   └── ...
│
├── features/                         # Smart/container components with business logic
│   ├── <feature>/
│   │   ├── <feature>.component.ts
│   │   ├── <feature>.component.html
│   │   ├── <feature>.component.scss
│   │   ├── <feature>.component.spec.ts
│   │   ├── <feature>.validators.ts   # (optional) validators scoped to this feature
│   │   ├── styles/                   # (optional) shared scss partials for the feature
│   │   │   └── _<partial>.scss
│   │   └── components/               # sub-components, may group by domain subfolder
│   │       ├── <sub-component>/
│   │       │   ├── <sub-component>.component.ts
│   │       │   ├── <sub-component>.component.html
│   │       │   ├── <sub-component>.component.scss
│   │       │   └── <sub-component>.component.spec.ts
│   │       └── <group>/<sub-component>/...
│   └── ...
│
├── helpers/                          # Pure utility functions and transformers
│   ├── <name>.helper.ts
│   ├── <name>.helper.spec.ts
│   └── ...
│
├── models/                           # TypeScript interfaces and types
│   ├── <name>.model.ts
│   └── ...
│
└── services/                         # Angular services (HTTP, business logic, state)
    ├── <name>.service.ts
    ├── <name>.service.spec.ts
    └── ...
```

## Folder-by-Folder Requirements

### Root Level Files

**Required:**

- `<module-name>.module.ts` — Main module definition with declarations, imports, exports
- `<module-name>.routes.ts` — Lazy-loaded routes (required if the module is lazy-loaded)

---

### `/components` — Presentational/Dumb Components

**Purpose:** Reusable UI components without business logic.

**Rules:**

- Each component must have its own subfolder: `<component>/`
- File set: `<component>.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
- Components receive data via `@Input()` and emit actions via `@Output()`
- No direct service injection (except UI services like Material, HDS)
- Must include a `.spec.ts` test file
- Use SCSS for new components; preserve LESS only in existing legacy code

**Example structure (generic):**

```
components/
├── <component-a>/
│   ├── <component-a>.component.ts
│   ├── <component-a>.component.html
│   ├── <component-a>.component.scss
│   └── <component-a>.component.spec.ts
└── <component-b>/
    └── ...
```

---

### `/features` — Smart/Container Components

**Purpose:** Components with business logic, state management, and service integration.

**Rules:**

- Each feature must have its own subfolder: `<feature>/`
- File set: `<feature>.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
- Sub-components live in a `components/` subfolder within the feature; when there are many, group them by domain (e.g. `components/<group>/<sub-component>/`)
- Feature-scoped validators may live alongside the feature as `<feature>.validators.ts`
- Shared SCSS partials for the feature may live in a `styles/` subfolder
- Can inject services directly
- Responsible for state, data fetching, and orchestration
- Must include a `.spec.ts` test file

**Example structure (generic):**

```
features/
├── <feature>/
│   ├── <feature>.component.ts
│   ├── <feature>.component.html
│   ├── <feature>.component.scss
│   ├── <feature>.component.spec.ts
│   └── components/
│       ├── <group>/
│       │   └── <sub-component>/
│       │       └── <sub-component>.component.ts (+ .html/.scss/.spec.ts)
│       └── <sub-component>/
│           └── ...
```

---

### `/helpers` — Pure Utility Functions

**Purpose:** Reusable, pure transformation and helper functions.

**Rules:**

- File naming: `<name>.helper.ts`, `<name>.helper.spec.ts`
- No dependencies on services or components
- Pure functions that transform data
- Must include a `.spec.ts` file validating input/output transformations

---

### `/models` — TypeScript Types and Interfaces

**Purpose:** Centralized type definitions for the module.

**Rules:**

- File naming: **kebab-case** + `.model.ts` (e.g. `<name>.model.ts`, `<another-name>.model.ts`)
- No logic, only type definitions
- Use `interface` for contracts, `type` for unions/aliases
- **Preserve PascalCase for API field names inside the model** (`Id`, `Name`, `RoomRates`, `DerivedBarId`) — this applies to the _properties_, not the file name
- Export directly, no barrel files needed
- Models do not require a `.spec.ts` when they are pure type definitions

---

### `/services` — Business Logic and HTTP Services

**Purpose:** Data access, API communication, and business logic orchestration.

**Rules:**

- File naming: `<name>.service.ts`, `<name>.service.spec.ts`
- Services handle HTTP calls, data transformation, and state management
- Prefer Observable/RxJS over Promise/async-await
- Must include a `.spec.ts` test file
- For HTTP tests, follow the dominant project pattern: mock `HttpClient` with `jest.fn()`. `HttpClientTestingModule` + `HttpTestingController` is also acceptable — match the style of the specs around you

---

### Feature-scoped Validators (Optional)

**Purpose:** Specialized form validation logic tied to a single feature.

**Rules:**

- Place the file **inside the feature folder** it serves: `features/<feature>/<feature>.validators.ts`
- A separate top-level `/validators` folder is **not** used in this project
- A `.spec.ts` is recommended but not mandatory for validators

---

## Naming Conventions

### Component Files

```
<kebab-case-name>.component.ts
<kebab-case-name>.component.html
<kebab-case-name>.component.scss
<kebab-case-name>.component.spec.ts
```

### Service Files

```
<kebab-case-name>.service.ts
<kebab-case-name>.service.spec.ts
```

### Helper Files

```
<kebab-case-name>.helper.ts
<kebab-case-name>.helper.spec.ts
```

### Model Files

```
<kebab-case-name>.model.ts
```

### Routes File

```
<module-name>.routes.ts   # exports a `Routes` const named <camelCaseModule>Routes
```

### Class Names

```
PascalCaseNameComponent
PascalCaseNameService
PascalCaseNameHelper
```

### Selector Names

```
app-<kebab-case-name>
```

---

## Test File Colocation

**Rule:** Every `.ts` file containing logic must have a corresponding `.spec.ts` file in the same directory.

**Exceptions (no spec required):**

- Model/interface files (`*.model.ts`) — pure type definitions
- Module definition files (`*.module.ts`) — unless they contain logic
- Routes files (`*.routes.ts`) — pure route configuration
- Validators (`*.validators.ts`) — spec recommended, not mandatory

---

## Import Conventions

**Rules:**

- Use relative imports within the same module
- Use `src/app/...` or mapped aliases (`@app`, `@shared`) for cross-module imports
- Follow the pattern of the file/feature being edited

**Example (generic):**

```ts
// Within a feature
import { <Name>Service } from '../../../services/<name>.service';

// Cross-module (shared)
import { <Name>Model } from 'src/app/models/<name>.model';
```

---

## Module Declaration Example

A properly structured module declares its features/components and provides its services:

```ts
// <module-name>.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { <module-name>Routes } from './<module-name>.routes';
import { <Feature>Component } from './features/<feature>/<feature>.component';
import { <Component>Component } from './components/<component>/<component>.component';
import { <Name>Service } from './services/<name>.service';

@NgModule({
  declarations: [
    <Feature>Component,
    <Component>Component,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(<module-name>Routes),
  ],
  providers: [
    <Name>Service,
  ],
})
export class <ModuleName>Module {}
```

---

## Lazy Loading Routes Example

Routes are exported as a `Routes` const (not a `RoutingModule` class):

```ts
// <module-name>.routes.ts
import { Routes } from '@angular/router';

import { <Feature>Component } from './features/<feature>/<feature>.component';

export const <camelCaseModule>Routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: <Feature>Component },
  // ...
];
```

---

## Reference Example: `fluctuation-tariff`

A real module that follows this structure. Use it to see the shape applied — **do not copy these names into other modules**.

```
fluctuation-tariff/
├── fluctuation-tariff.module.ts
├── fluctuation-tariff.routes.ts        # exports `fluctuationTariffRoutes: Routes`
├── components/
│   ├── tariff-header/                  # .ts/.html/.scss/.spec.ts
│   ├── general-data/
│   └── pricing-grid/
├── features/
│   ├── tariff-list/
│   │   ├── tariff-list.component.{ts,html,scss,spec.ts}
│   │   ├── styles/_checkbox.scss
│   │   └── components/
│   │       ├── toolbar/
│   │       ├── empty-state/
│   │       ├── tariff-import-modal/
│   │       └── table/                  # domain group
│   │           ├── table-container/
│   │           ├── table-row/
│   │           └── table-row-actions/
│   ├── tariff-new/
│   │   └── components/copy-modal/
│   └── tariff-new-derived/
│       ├── tariff-new-derived.component.{ts,html,scss,spec.ts}
│       ├── tariff-new-derived.validators.ts   # feature-scoped, no spec
│       └── components/derived-settings/
├── helpers/
│   ├── tariff-list.helper.ts (+ .spec.ts)
│   ├── tariff-new.helper.ts (+ .spec.ts)
│   └── tariff-price.helper.ts (+ .spec.ts)
├── models/                             # all kebab-case, no specs
│   ├── tariff.model.ts
│   ├── channel-manager.model.ts
│   ├── derived-adjustment.model.ts
│   └── ...
└── services/
    ├── tariff.service.ts (+ .spec.ts)
    ├── tariff-validation.service.ts (+ .spec.ts)
    ├── tariff-new-derived.service.ts (+ .spec.ts)
    └── ...
```

---

## Checklist for New Modules

When creating a new feature module, ensure:

- [ ] Module folder created with correct name (kebab-case)
- [ ] `<module-name>.module.ts` created with declarations and imports
- [ ] `<module-name>.routes.ts` created if lazy-loaded (exports a `Routes` const)
- [ ] `/components` folder for presentational components (each with `.ts`/`.html`/`.scss`/`.spec.ts`)
- [ ] `/features` folder for smart components (sub-components under `components/`, grouped if many)
- [ ] `/helpers` folder for pure utility functions
- [ ] `/models` folder with kebab-case type definitions
- [ ] `/services` folder with business logic
- [ ] Feature-scoped validators colocated in the feature folder (if validation logic exists)
- [ ] Every logic `.ts` has a corresponding `.spec.ts` (see exceptions above)
- [ ] All components use selector `app-<kebab-case-name>`
- [ ] All classes follow PascalCase naming
- [ ] Imports follow the local file/feature pattern
- [ ] i18n keys added to `pt.json`, `en.json`, `es.json`

---

## When to Refactor

Refactor folder structure when:

1. A feature folder grows beyond 5-8 components
2. Multiple services handle different domains
3. Validators become complex enough to warrant separate files
4. Helpers exceed 5+ utility functions
5. Sub-components in a feature warrant grouping into a domain subfolder

---

## Non-Negotiable Rules

These rules **must** be followed without exception:

1. ✅ Every logic `.ts` file has a corresponding `.spec.ts` (except models, modules, routes, validators)
2. ✅ Components must live in `/components` or `/features`
3. ✅ Services must live in `/services`
4. ✅ Models must live in `/models` and be kebab-case
5. ✅ Helpers must live in `/helpers`
6. ✅ File and folder names must be kebab-case
7. ✅ Classes must follow PascalCase
8. ✅ Component selectors must start with `app-`
9. ✅ No business logic in presentational components
10. ✅ Each component ships its `.ts`, `.html` and `.scss` (SCSS for new code)
11. ✅ No orphaned `.ts` files outside these folders
