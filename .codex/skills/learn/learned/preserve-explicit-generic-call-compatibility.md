# Preserve Explicit Generic Call Compatibility

**Captured:** 2026-08-19
**Context:** Generalizing public combinators from unknown-input guards to known-domain refinements
**Tags:** typescript, type-guards, refinements, api-design, backward-compatibility, tsd

## Problem

A generalized signature can preserve inference for ordinary calls while still
breaking consumers that explicitly supply generic arguments. TypeScript treats
the number, order, and constraints of public type parameters as observable API.
Runtime parity and unchanged inferred hover types therefore do not prove source
compatibility.

For example, changing `and` from `<A, B extends A>` to
`<Precondition extends BooleanRefinement, B extends GuardedOf<Precondition>>`
keeps `and(isString, isLiteralA)` working, but changes the meaning of the first
explicit type argument. A previously valid call such as
`and<string, 'a'>(isString, isLiteralA)` no longer compiles because `string`
does not satisfy the new function constraint.

## Solution

Audit both inferred and explicit-generic calls whenever a public generic
signature is replaced. Add `tsd` fixtures that exercise representative explicit
type arguments for every changed overload.

If the feature must ship in a minor release, retain compatibility overloads for
the old generic parameter shape and add the generalized refinement overloads
alongside them. Verify that overload order preserves existing inference. If the
legacy overloads cannot coexist without ambiguity or degraded inference, treat
the signature change as semver-major even when runtime behavior is unchanged.

## Example

```ts
const isLiteralA = (value: string): value is 'a' => value === 'a';

// Inferred use can remain compatible after a signature rewrite.
const inferred = and(isString, isLiteralA);

// This is also public source surface and needs a compatibility test.
const explicit = and<string, 'a'>(isString, isLiteralA);
```

Apply the same audit to variadic combinators such as `andAll`, `or`, and
`oneOf`, whose tuple or leading-function generic parameters can also change
meaning across signature rewrites.

## When To Use

Use this pattern when changing public overloads, generic parameter order,
generic constraints, or conditional return types, especially when broadening a
guard API to accept known-domain refinements.

Run at least:

```text
pnpm lint
pnpm build
pnpm test
pnpm test:types
pnpm test:package
```

## Related Files

- `src/core/logic.ts`
- `src/core/combinators/one-of.ts`
- `src/types/core.ts`
- `tests-d/core/logic.test-d.ts`
- `tests-d/core/combinators/one-of.test-d.ts`
- `tests-d/core/compiler-api.test-d.ts`
- `typescript-compiler-api-design.md`
