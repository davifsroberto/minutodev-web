# Skill: Smart Any Type Resolver

## Purpose

Analyze TypeScript project files to identify weak, generic, or missing typings and replace them with proper explicit models, interfaces, or types.

The skill must prioritize semantic correctness and domain consistency over simple structural reuse.

---

# Responsibilities

This skill should:

- Read and analyze TypeScript files
- Inspect:
  - classes
  - interfaces
  - methods
  - properties
  - parameters
  - return types
  - inline object structures
- Detect weak or unsafe typings
- Search for compatible existing models
- Create new models when necessary
- Replace weak typings with explicit types
- Update related test files when applicable
- Validate the project build after modifications

---

# Weak Typings

The following typings should be considered weak or unsafe:

- `any`
- `unknown`
- `object`
- implicit return types
- inline object types
- untyped arrays
- generic untyped responses

---

# Typing Rules

- Never use `any` unless explicitly requested
- Avoid using `unknown` when the type can be inferred
- Always try to create or reuse a proper model/interface
- Prefer explicit typing over generic typing
- Inline object types should be extracted into reusable models when appropriate
- Method return types should always be explicitly defined
- Arrays must always contain explicit item types
- Preserve readability and architectural consistency

---

# Model Reuse Rules

A model should only be reused when:

- it belongs to the same domain
- it has a compatible context
- it represents the same entity/concept
- the semantic meaning is compatible

Structural similarity alone is NOT enough.

---

# New Model Creation Rules

Create a new model when:

- no compatible model exists
- the domain is different
- the context is different
- the semantic meaning is different
- reuse would create improper coupling

Even if the structure is similar.

---

# Type Inference Strategy

When a weak type is detected:

1. Analyze the surrounding context
2. Search for compatible models in the same domain
3. Validate semantic compatibility
4. Reuse the model if appropriate
5. Otherwise create a new model/interface
6. Replace the weak typing with the inferred type

---

# Test File Synchronization

If the analyzed file has related test files, the skill must also:

- update weak typings inside test files
- update mocks and fixtures
- preserve test readability
- ensure test compatibility with the new typings

Examples:

```txt
user.service.ts
user.service.spec.ts
```

```txt
invoice.repository.ts
invoice.repository.spec.ts
```

---

# Build Validation

After all modifications are completed, the skill must always validate the application build.

Required command:

```bash
npm run build
```

The skill should:

- verify build success
- identify type errors introduced during refactoring
- fix generated typing inconsistencies when possible

The process is only considered complete if the build succeeds.

---

# Domain Context Analysis

The skill should consider:

- folder structure
- module name
- feature name
- class name
- file name
- related imports
- naming conventions

Example:

```txt
src/modules/billing/services
```

Detected domain:

```txt
billing
```

---

# Example

## Input

```ts
class CreateInvoiceService {
  async execute(data: any): Promise<any> {
    return {
      id: "1",
      total: 100,
    };
  }
}
```

---

## Expected Output

```ts
interface InvoiceModel {
  id: string;
  total: number;
}
```

```ts
async execute(data: CreateInvoiceInput): Promise<InvoiceModel>
```

---

# Priorities

1. Improve type safety
2. Eliminate weak typings
3. Respect domain boundaries
4. Avoid incorrect model reuse
5. Maintain architectural consistency
6. Generate readable and maintainable typings
7. Preserve test integrity
8. Ensure successful application build

---

# Notes

- Similar structures should not automatically share the same model
- Structural compatibility does not guarantee semantic compatibility
- Prefer clarity over excessive abstraction
- Favor domain isolation when in doubt
