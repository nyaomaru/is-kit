# Order Precise Overloads Before Generic Fallbacks

**Captured:** 2026-08-20
**Context:** Variadic refinement APIs that support both concrete narrowing tuples and generic homogeneous arrays
**Tags:** typescript, type-guards, refinements, overloads, tuples, arrays, inference, tsd

## Problem

TypeScript selects the first applicable overload, even when a later overload
would preserve more type information. A broad homogeneous-array overload such
as `readonly Refine<B, B>[]` can accept a concrete tuple whose refinements all
accept `B` but progressively narrow to subtypes of `B`.

If that array overload appears before a recursive tuple overload, TypeScript
returns its conservative `Refinement<A, B>` result and discards the tuple's
final narrowed type. Removing the array overload is not sufficient because
recursive conditional types such as `RefineChain<B, Steps>` remain unresolved
for generic rest tuples and ordinary arrays, causing `TS2769`.

## Solution

Order overloads from the most type-preserving shape to the broadest fallback:

1. Fixed-arity overloads for common calls.
2. A recursive tuple overload that computes the final narrowed type.
3. A homogeneous-array overload that accepts unresolved generic arrays and
   conservatively retains the initial narrowed type.

Use `NoInfer` in the fallback's step domain so the array cannot widen the type
inferred from the precondition. Keep the runtime implementation unchanged;
this is an overload-resolution concern.

## Example

```ts
export function andAll<A, B extends A, Chain extends readonly unknown[]>(
  precondition: Refinement<A, B>,
  ...steps: Chain & RefineChain<NoInfer<B>, Chain>
): Refinement<A, ChainResult<B, Chain>>;

// Keep this after the recursive tuple overload.
export function andAll<A, B extends A>(
  precondition: Refinement<A, B>,
  ...steps: readonly Refine<NoInfer<B>, NoInfer<B>>[]
): Refinement<A, B>;
```

Test both sides of the overload boundary:

```ts
// A concrete tuple must preserve its final refinement.
expectType<Refine<Input, Final>>(andAll(precondition, ...concreteSteps));

// An unresolved generic array must remain accepted.
function compose<
  A,
  B extends A,
  Steps extends readonly Refine<B, B>[]
>(precondition: Refine<A, B>, steps: Steps) {
  expectType<Refine<A, B>>(andAll(precondition, ...steps));
}
```

## When To Use

Use this pattern when an overloaded variadic API must support both concrete
tuples with position-dependent inference and generic or ordinary arrays whose
length and element sequence are unresolved.

Verify both successful call categories and inspect TypeScript diagnostics:

```text
pnpm lint
pnpm build
pnpm exec tsc -p tests-d/tsconfig.json
pnpm test
pnpm test:types
```

## Related Files

- `src/core/logic.ts`
- `src/types/core.ts`
- `tests-d/core/logic.test-d.ts`
