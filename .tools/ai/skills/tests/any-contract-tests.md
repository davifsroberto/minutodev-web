---
name: any-contract-tests
description: "Generate Jest unit tests that validate and protect runtime contracts extracted from weakly typed objects in Angular/TypeScript applications."
argument-hint: "path/to/file.ts"
user-invocable: true
---

# Skill: Any Contract Tests

## Purpose

Analyze Angular/TypeScript source files that use weak typings such as:

- `any`
- `unknown`
- `object`
- implicit object types
- generic API responses
- untyped arrays

and generate Jest unit tests that validate and protect the runtime contracts implicitly used by the implementation.

The goal is to transform implicit runtime assumptions into explicit and protected unit test coverage without modifying production code.

This skill is especially useful for:

- legacy Angular applications
- partially typed codebases
- gradual TypeScript migrations
- runtime safety hardening
- preventing undefined/null runtime failures

---

# Primary Objective

The primary objective of this skill is:

```txt
Document and protect implicit runtime contracts extracted from weak typings.
```

---

# Critical Restrictions

## Production Code Protection

The skill MUST NEVER:

- modify production source code
- modify the main class
- modify implementation logic
- add runtime guards
- add optional chaining
- refactor methods
- change method signatures
- change return types
- alter runtime behavior
- inject defensive logic
- alter public APIs
- change dependency injection
- change observables/signals behavior

The skill may ONLY:

- create test files
- extend existing `.spec.ts` files
- add test-only helpers
- add test-only fixtures
- add test-only utilities

---

# Test Structure Rules

Generated test files MUST:

- contain a single top-level `describe`
- avoid nested `describe` blocks unless strictly necessary
- only create additional `describe` blocks for:
  - reusable helpers
  - shared utility scenarios
  - grouped reusable behavior

The default structure should be:

```ts
describe("UserService", () => {
  it(...);
  it(...);
  it(...);
});
```

---

# Core Concept

If the implementation uses:

```ts
user.profile.name.toUpperCase();
```

then the tests must explicitly validate the runtime contract:

```txt
user
user.profile
user.profile.name
user.profile.name.toUpperCase
```

Even when the source uses:

```ts
user: any;
```

The generated tests must validate:

- object existence
- nested object existence
- property existence
- valid value types
- method availability
- branch behavior
- invalid runtime scenarios
- runtime failure behavior

---

# Weak Typing Detection

The skill must prioritize analysis of:

- `any`
- `unknown`
- `object`
- implicit object types
- generic API responses
- loosely typed observables
- untyped arrays
- event payloads
- template-bound objects

---

# Runtime Contract Analysis

The skill must analyze and extract all runtime contracts accessed from weakly typed values.

---

# Supported Runtime Analysis

## Property Access

Detect:

```ts
user.profile.name;
```

Extract:

```txt
user
user.profile
user.profile.name
```

---

## Nested Property Access

Detect deeply nested contracts:

```ts
response.data.items[0].price;
```

Extract:

```txt
response
response.data
response.data.items
response.data.items[]
response.data.items[].price
```

---

## Optional Chaining

Detect:

```ts
user?.profile?.name;
```

Generate tests validating:

- undefined handling
- null handling
- fallback behavior
- non-throwing behavior

---

## Array Access

Detect:

```ts
items[0].price;
```

Generate tests validating:

- array existence
- empty arrays
- invalid array types
- undefined indexes
- missing nested properties

---

## Method Invocation

Detect:

```ts
payload.items.map(...)
user.profile.name.toUpperCase()
```

Generate tests validating:

- method existence
- callable values
- invalid method scenarios
- undefined method failures

---

## Function Calls Returning Objects

Detect:

```ts
user.getProfile().name;
```

Generate tests validating:

- missing function
- invalid return values
- undefined returns
- incomplete returned structures

---

## Destructuring

Detect:

```ts
const { profile } = user;
const { name } = profile;
```

Generate tests validating missing:

- source object
- destructured object
- destructured properties

---

## Alias Tracking

Detect indirect usage:

```ts
const profile = user.profile;
return profile.name;
```

The analysis must preserve the complete original contract chain.

---

## Conditional Usage

Detect:

```ts
if (user.profile?.name)
```

Generate tests validating:

- truthy values
- falsy values
- undefined
- null
- empty strings

---

## Loops

Detect:

```ts
items.forEach((item) => item.price);
```

Generate tests validating:

- invalid arrays
- empty arrays
- invalid item structures

---

## Observable Responses

Detect contracts inside:

```ts
map((response) => response.data.items);
```

Generate runtime protection tests for observable payload structures.

---

## Angular Template Bindings

Detect template runtime contracts such as:

```html
{{ user.profile.name }}
```

or:

```html
[title]="product.details.name"
```

Generate tests validating template-bound runtime structures.

---

## Event Payload Usage

Detect:

```ts
onInput(event: any) {
  return event.target.value;
}
```

Generate tests validating:

- missing target
- missing value
- invalid event structures

---

# Test Generation Rules

For every detected runtime contract, generate:

- positive flow tests
- negative flow tests
- edge case tests
- branch validation tests
- incomplete structure tests
- invalid runtime structure tests

---

# Positive Flow Tests

Generate tests validating valid runtime structures.

Example:

```ts
it("should return uppercase profile name", async () => {
  const user = {
    profile: {
      name: "john",
    },
  };

  const result = await service.execute(user);

  expect(result).toBe("JOHN");
});
```

---

# Negative Flow Tests

Generate tests validating invalid or incomplete runtime structures.

Example:

```ts
it("should throw when profile name is missing", async () => {
  const user = {
    profile: {},
  };

  await expect(service.execute(user)).rejects.toThrow();
});
```

---

# Deep Runtime Validation

When detecting:

```ts
response.data.items[0].price;
```

Generate dedicated scenarios for:

- `response` undefined
- `data` undefined
- `items` undefined
- `items` not array
- empty array
- `items[0]` undefined
- `price` undefined

Every accessed runtime level must be validated individually.

---

# Runtime Safety Priorities

The skill must prioritize protection against:

- undefined property access
- null access
- invalid arrays
- invalid destructuring
- unsafe method calls
- incomplete API responses
- invalid observable payloads
- missing nested objects
- invalid template bindings

---

# Existing Test File Handling

If a `.spec.ts` file already exists:

- extend the existing tests
- preserve organization
- preserve naming consistency
- preserve existing structure
- avoid duplicate tests
- improve missing runtime protection coverage
- preserve current runtime behavior validation

---

# Mocking Rules

The skill should prefer real runtime structures instead of mocks.

The skill MUST NOT:

- mock the structure being validated
- hide missing properties behind mocks
- bypass runtime contract validation
- generate artificial coverage

---

# TypeScript Safety Rules

Generated tests MUST:

- avoid `any`
- avoid unsafe casts
- avoid `as any`
- avoid `as unknown as`
- avoid invalid mock typings
- use explicit interfaces whenever possible
- preserve TypeScript compatibility
- produce zero TypeScript/editor errors

---

# Fixture Rules

Even when production code uses `any`, generated tests should prefer:

- explicit local interfaces
- typed fixtures
- typed factory helpers

---

# Error Validation Rules

Tests MUST validate real runtime behavior.

Avoid generic assertions such as:

```ts
expect(() => fn()).toThrow();
```

Prefer validating:

- error type
- error message
- fallback behavior
- returned values
- branch outcomes

---

# Jest Testing Standards

All generated tests MUST:

- use Arrange / Act / Assert structure
- use English test names
- avoid unnecessary mocks
- validate real behavior
- validate branches explicitly
- preserve readability
- maintain isolation
- avoid shared mutable state
- avoid redundant tests

---

# Coverage Requirements

Generated tests MUST achieve:

```txt
100% Statements
100% Branches
100% Functions
100% Lines
```

Coverage must represent real runtime validation and not artificial execution.

---

# Coverage Integrity Rules

The skill MUST NOT:

- generate meaningless assertions
- inflate coverage artificially
- create tests without behavioral validation
- skip important runtime branches

---

# Validation Checklist

The process is only complete when ALL conditions below are satisfied:

```txt
✅ Test file created with .spec.ts extension
✅ Single top-level describe block
✅ ZERO TypeScript/editor errors
✅ No red underlines
✅ No unresolved imports
✅ No unresolved symbols
✅ No invalid mock typings
✅ No incompatible casts
✅ No unused imports
✅ No unused variables
✅ No warnings caused by generated code
✅ All tests pass
✅ 100% statements coverage
✅ 100% branch coverage
✅ 100% function coverage
✅ 100% line coverage
✅ No any types in test code
✅ Arrange / Act / Assert structure used
✅ Runtime contracts explicitly validated
✅ Positive and negative flows covered
✅ Edge cases covered
✅ Deep property chains covered
✅ Arrays and indexes validated
✅ Optional chaining scenarios validated
✅ Destructuring scenarios validated
✅ Observable payloads validated
✅ Event payloads validated
✅ Angular template contracts validated
✅ Clean and readable code
✅ Test isolation preserved
✅ Production source code untouched
✅ Main implementation class untouched
```

---

# Validation Process

## Step 1 — Validate TypeScript

Ensure:

- zero TypeScript errors
- zero editor errors
- no invalid typings
- no unresolved imports

---

## Step 2 — Validate Tests

Run:

```bash
npm test -- filename.spec.ts --coverage
```

Ensure:

- all tests pass
- all coverage metrics reach 100%
