# Separate Property Refinement Absence Contracts

**Captured:** 2026-08-23
**Context:** Lifting known-domain refinements through required properties, optional properties, and array indices
**Tags:** typescript, type-guards, refinements, optional-properties, arrays, compiler-api, api-design, tsd

## Problem

A required property, an optional property, and an indexed array element can all
produce a child value, but they do not share one safe runtime contract.

- A required property may legitimately contain `undefined` when both its
  declared type and supplied refinement accept it.
- An optional property may be missing or explicitly contain `undefined`.
- An array index may be out of bounds, a sparse hole, or explicitly contain
  `undefined`, even when `noUncheckedIndexedAccess` is disabled.

Reading an index is not enough to distinguish a sparse hole from an element.
Normal property access can resolve a numeric property inherited from the array
prototype, causing a hole to appear defined.

Collapsing these cases into one overload makes the treatment of `undefined`
depend on overload selection. Calling a narrow-domain refinement such as a
TypeScript Compiler API `ts.isX` function with `undefined` is outside its input
contract and may throw.

## Solution

Use separate helpers with explicit semantics:

1. `refineKey` accepts a required property and forwards its value exactly once
   to the supplied refinement.
2. `refineDefinedKey` accepts an optional property, reads it once, and returns
   `false` without invoking the refinement when the value is `undefined`.
3. `refineIndex` accepts a readonly array, requires an own property at the
   selected index, reads that element once, and returns `false` without invoking
   the refinement for an out-of-bounds, sparse, inherited, or `undefined`
   element.

Check ownership before reading the element:

```ts
if (!Object.hasOwn(value, index)) return false;

const element = value[index];
return element !== undefined && refinement(element);
```

Property refinements intentionally use normal property access and may accept
inherited values or accessors. Do not extract the three helpers into one shared
lookup path because their ownership and absence contracts differ.

For optional objects, include value-level `undefined` in the constraint:

```ts
ObjectType extends Partial<Record<K, PropertyInput | undefined>>
```

This is required for declarations such as `body?: Block | undefined` under
`exactOptionalPropertyTypes`.

Do not model arrays as `Partial<Record<0, ElementInput>>`. TypeScript rejects a
readonly array against that weak optional-object type. Return a non-generic
refinement over `readonly ElementInput[]` instead; control-flow narrowing
intersects it with the concrete array, tuple, or `NodeArray` at the call site.
This also avoids unresolved-generic forwarding failures when the index helper
is nested through a property helper.

## Example

```ts
const hasCallInitializer = refineDefinedKey(
  'initializer',
  ts.isCallExpression
);

const hasStringArgument = refineIndex(0, ts.isStringLiteral);

const isBlockStartingWithReturn = and(
  ts.isBlock,
  refineKey('statements', refineIndex(0, ts.isReturnStatement))
);
```

## When To Use

Apply this pattern whenever a combinator projects a refinement through an
object property or collection index. Test the API with both
`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`, and include runtime
assertions that the child refinement is not invoked for undefined values. For
index refinements, also create a sparse array with an inherited numeric value
and verify that the result is `false` without invoking the child refinement.

Do not add a missing-value-passes variant without a separate design. Its output
type and present-`undefined` behavior are materially different.

## Related Files

- `typescript-compiler-api-design.md`
- `src/core/key.ts`
- `tests/core/key.test.ts`
- `tests-d/core/key.test-d.ts`
- `tests-d/core/compiler-api.test-d.ts`
