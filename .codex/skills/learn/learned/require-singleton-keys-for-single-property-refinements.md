# Require Singleton Keys for Single-Property Refinements

**Captured:** 2026-08-23
**Context:** Type predicates that check one runtime property and narrow it on the parent object
**Tags:** typescript, type-guards, refinements, property-keys, unions, soundness, tsd, api-design

## Problem

A helper may accept `K extends PropertyKey`, read `value[key]` once, and return
`value is ObjectType & Record<K, Output>`. This is sound only when `K` denotes
one property.

If `K` is `'a' | 'b'`, the runtime key selects either `a` or `b`, while
`Record<K, Output>` claims that both properties were checked. Broad `string`,
`number`, or `symbol` keys are worse because the predicate appears to narrow
every compatible property after reading only one.

## Solution

Require the key to be one non-union literal before using `Record<K, Output>` as
the predicate result. Reject broad primitive key types and detect literal
unions with a distributive conditional type.

```ts
type IsUnion<Value, Whole = Value> = Value extends Whole
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

type SinglePropertyKey<Key extends PropertyKey> =
  string extends Key
    ? never
    : number extends Key
      ? never
      : symbol extends Key
        ? never
        : true extends IsUnion<Key>
          ? never
          : Key;

function refineKey<const K extends PropertyKey>(
  key: K & SinglePropertyKey<K>
): unknown;
```

An alternative is to return a union with one narrowed member for each literal
key. That is more complex, still cannot safely model broad key types, and gives
less direct control-flow narrowing. Prefer the singleton constraint when the
API represents one concrete property access.

This constraint necessarily rejects forwarding an unconstrained generic
`K extends PropertyKey`: its callers could instantiate `K` with a union. A
higher-order helper must also fix or enforce a singleton key.

## When To Use

Apply this pattern whenever one runtime lookup is reflected with a mapped type
or `Record<K, ...>` in a type predicate. Add negative `tsd` cases for string,
number, and symbol unions and their broad primitive types, alongside positive
cases for each singleton literal kind.

Validate similar changes with `pnpm build`, `pnpm test:types`, `pnpm lint`, and
the packed-package smoke test so the emitted declaration has the same
constraint as the source API.

## Related Files

- `src/core/key.ts`
- `tests-d/core/key.test-d.ts`
- `tests-d/core/compiler-api.test-d.ts`
