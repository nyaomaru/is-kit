# Balance Runtime Cost With Compositional Design

**Captured:** 2026-09-05
**Context:** Refactoring built-in guards that are implemented with is-kit's public composition helpers
**Tags:** typescript, type-guards, performance, benchmarking, api-design, composition

## Problem

A direct predicate can benchmark several times faster than the same check built
with `define`, `and`, or `or`. Relative ratios alone can make the composed
version appear unacceptably expensive even when the absolute difference is only
a few nanoseconds per call. Flattening every built-in guard also removes the
library's own examples and exercise of its composition model, weakening the
architectural message for users.

## Solution

Treat composition as the default for is-kit's built-in guards. Before replacing
it, measure both relative and absolute cost in a production-shaped workload and
estimate a realistic call volume. Depart from composition when it violates the
runtime/type contract, relies on unusually expensive control flow such as
expected exceptions, or creates a demonstrated material bottleneck.

Correctness remains non-negotiable: a small direct check is appropriate when a
composed or abbreviated form accepts values outside the declared type. Pure
microbenchmark wins must also outweigh the value of dogfooding the public API
before they justify architectural inconsistency.

## Example

```ts
export const isPositive = and(
  isNumber,
  predicateToRefine<number>((value) => value > 0)
);
```

Although the equivalent direct predicate removes several calls, retain the
composition unless realistic profiling shows that its absolute cost matters.
In contrast, use strict direct comparisons for nullish guards when loose
equality would classify browser `document.all` outside the promised type.

## When To Use

Apply this decision process when reviewing wrappers, callbacks, or combinators
on runtime validation paths. Include warm-up and mixed inputs in benchmarks,
report nanoseconds or elapsed workload time alongside ratios, and verify the
chosen implementation with lint, build, Jest, and `tsd`.

## Related Files

- `runtime-guard-refactoring-design.md`
- `src/core/primitive.ts`
- `src/core/logic.ts`
- `src/core/define.ts`
- `tests/core/primitive.test.ts`
- `tests-d/core/primitive.test-d.ts`
