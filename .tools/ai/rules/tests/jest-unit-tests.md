---
name: jest-unit-tests
description: "Mandatory conventions for Jest unit tests across the project: structure, mocking patterns, coverage and quality standards."
applies-to: ["new-tests", "test-refactoring", "spec-files"]
---

# Rule: Jest Unit Tests

Conventions that **every** Jest unit test in the project must follow. This is a rule (mandatory conventions), not a generator. To *generate* tests that protect runtime contracts of weakly typed code, use the **`any-contract-tests`** skill (`.tools/ai/skills/tests/any-contract-tests.md`) — it follows these same conventions.

## Test Stack

- Jest + `jest-preset-angular`.
- Specs are **colocated** next to the code as `<name>.spec.ts` (same directory). See the module structure rule for placement.
- Integration tests live in `tests/integration/**/*.integration.spec.ts` and run via `npm run test:integration`.

## File & Structure

- File naming: `<name>.spec.ts`, colocated with the file under test.
- **Single top-level `describe`** per spec, named after the unit under test (class/helper/service). Avoid nested `describe` blocks unless grouping reusable helpers or shared scenarios.
- Use **Arrange / Act / Assert** structure in each test.
- **English test names**, describing observed behavior.

```ts
describe('TariffPriceHelper', () => {
  it('applies a percentage adjustment to the base price', () => {
    // Arrange / Act / Assert
  });
});
```

## What to Test

For any logic, cover:
- happy path
- empty values
- `null` / `undefined`
- error / failure flows
- relevant branches explicitly (no silent gaps)

For business rules specifically, the happy/empty/null-undefined/error matrix is mandatory.

## Mocking Patterns (follow the dominant project style)

- **Components:** `TestBed`, `jest.fn()` for service mocks, fake pipes, and `NO_ERRORS_SCHEMA` when the template depends on many child/HDS components.
- **HTTP services:** mock `HttpClient` with `jest.fn()` (dominant pattern). `HttpClientTestingModule` + `HttpTestingController` is acceptable when a spec already uses it — match the surrounding specs.
- **Pure helpers:** test directly via input/output assertions, no `TestBed`.
- Avoid unnecessary mocks; prefer real behavior where cheap and deterministic.

## Quality Standards

Every test MUST:
- validate **real behavior**, not just execution
- maintain isolation; no shared mutable state between tests
- avoid redundant tests and meaningless assertions
- avoid `any` in test code (see the typings resolver skill)
- stay clean and readable

## Coverage

- Coverage matters: **do not remove tests or reduce scenarios** to make a change easier.
- Aim for full statement/branch/function/line coverage on the unit under test, representing **real runtime validation** — never inflate coverage with assertion-free or behavior-free tests.

## Production Code Protection

Unit tests MUST NOT drive changes to production code. When adding/extending tests:
- only create or extend `.spec.ts` files, test helpers and fixtures
- never weaken typings, add defensive runtime guards, or alter public APIs just to make a test pass

## Useful Commands

```bash
npm run test              # run unit tests
npm run test:coverage     # run with coverage report
npm run test:integration  # run integration specs
npm run lint              # TSLint
```

## Checklist

- [ ] File is `<name>.spec.ts`, colocated with the unit under test
- [ ] Single top-level `describe`, named after the unit
- [ ] Arrange / Act / Assert in each test; English names
- [ ] Happy / empty / null-undefined / error paths covered
- [ ] Mocking follows the dominant pattern (`jest.fn()`, `NO_ERRORS_SCHEMA`, mocked `HttpClient`)
- [ ] No `any` in test code; no unused imports/variables
- [ ] Real behavior validated; no artificial coverage
- [ ] Production source code untouched
