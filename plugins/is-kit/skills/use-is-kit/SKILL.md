---
name: use-is-kit
description: Create, compose, migrate, and review TypeScript runtime type guards with is-kit. Use when adding reusable guards; replacing typeof, null checks, or handwritten type predicates; narrowing unknown values; validating JSON or API responses; building collection or object schemas with struct or typedStruct; or reviewing existing is-kit usage. Do not use for one-off environment checks or validation that requires data transformation or rich error reporting.
---

# Use is-kit

Build runtime checks that preserve TypeScript control-flow narrowing without
inventing project architecture or duplicating guards that already exist.

## 1. Inspect before editing

1. Read the repository instructions and relevant package scripts.
2. Confirm the installed `is-kit` version from the package manifest and lockfile.
3. Inspect the installed declarations, package exports, or monorepo source before
   relying on an API name. Prefer the installed version over online examples.
4. Search for an equivalent local guard, wrapper, barrel export, schema, or
   established import boundary.
5. Reuse an existing guard when it already expresses the required semantics.

Do not add a wrapper layer merely because this skill mentions one. If the
project already has an `is-kit` boundary, respect it; otherwise import from
`is-kit` directly.

## 2. Choose the smallest correct guard

Read [guard-selection.md](references/guard-selection.md) when choosing between
built-ins, logical combinators, custom predicates, equality guards, and
collection combinators.

For object or API response validation, always read
[object-validation.md](references/object-validation.md) before choosing
`struct`, `typedStruct`, `optionalKey`, or `safeParse`.

For replacement or cleanup work, read
[migration-checklist.md](references/migration-checklist.md) before changing
manual checks.

Prefer composition over a handwritten type-predicate signature. Keep guards
total, deterministic, and side-effect free.

## 3. Place the guard by responsibility

- Put broadly reusable, domain-free guards in the project's existing shared
  guard location, if one exists.
- Keep a schema beside the boundary that consumes the validated value when the
  schema exists for one API, file, parser, or integration.
- Keep business decisions and domain state predicates in their owning feature
  or domain module.
- Add or update barrel exports only when the project already uses them.
- Follow the repository's naming, documentation, and test-collocation rules.

Avoid creating a global guard from a one-off payload projection. Avoid moving
domain knowledge into a generic guard module.

## 4. Implement without weakening the boundary

- Accept untrusted input as `unknown`.
- Narrow before reading or returning typed data.
- Remove an `as` assertion when the new guard makes it unnecessary.
- Store an indexed property in a local constant before narrowing when
  TypeScript does not retain the property refinement.
- Use `safeParse` when the success branch consumes the validated value; call a
  guard directly when only a boolean decision is needed.
- Default to forward-compatible object validation. Reject extra keys only when
  the contract explicitly requires an exact object.

## 5. Verify behavior and types

Add focused tests using the project's existing test tools:

- at least one accepted value;
- at least one rejected value;
- at least one value of the wrong runtime type;
- object cases for missing, optional, and extra keys when relevant;
- type-level assertions when the repository already tests inference or
  narrowing.

Run the narrowest relevant test, typecheck, lint, and formatting commands.
Inspect the final diff for unrelated formatting or generated-file changes.

## Boundaries

- Do not replace runtime or platform detection such as
  `typeof window === 'undefined'` merely for stylistic consistency.
- Do not replace a clear one-off primitive check unless reuse, composition, or
  narrowing materially improves.
- Do not upgrade `is-kit` unless the task requires an API unavailable in the
  installed version or the user requests the upgrade.
- Recommend a schema validator instead when the requirement depends on data
  transformation, coercion, detailed issue paths, or rich validation errors.
