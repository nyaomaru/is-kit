# Require Singleton Keys for Single-Property Refinements

**Captured:** 2026-08-23
**Updated:** 2026-08-24
**Context:** Type predicates that check one runtime property and narrow it on the parent object
**Tags:** typescript, type-guards, refinements, property-keys, unions, template-literals, branded-types, soundness, tsd, api-design

## Problem

A helper may accept `K extends PropertyKey`, read `value[key]` once, and return
`value is ObjectType & Record<K, Output>`. This is sound only when `K` denotes
one property.

If `K` is `'a' | 'b'`, the runtime key selects either `a` or `b`, while
`Record<K, Output>` claims that both properties were checked. Broad `string`,
`number`, or `symbol` keys are worse because the predicate appears to narrow
every compatible property after reading only one.

Infinite template-literal types such as `` `field-${string}` `` and
`` `field-${number}` `` have the same problem. Neither `string extends Key`
nor a union detector rejects them, even though each type represents many
possible runtime keys.

Opaque intersections such as `number & Brand` and `symbol & Brand` are also
multi-value key domains. Checks such as `number extends Key` and
`symbol extends Key` do not reject them because the branded subtype is narrower
than its primitive base.

## Solution

Require the key to be one finite, non-union literal before using
`Record<K, Output>` as the predicate result. Detect literal unions separately,
then apply the mapped-type test to every `PropertyKey` subtype, not only
strings. `Record<Key, never>` becomes an index signature for broad, patterned,
or opaque multi-value domains, which an object with no declared properties
satisfies. A record over a concrete literal still requires that property.

```ts
type IsUnion<Value, Whole = Value> = Value extends Whole
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

type SinglePropertyKey<Key extends PropertyKey> = [Key] extends [never]
  ? never
  : true extends IsUnion<Key>
    ? never
    : {} extends Record<Key, never>
      ? never
      : Key;

type ArrayIndex<Index extends number> =
  SinglePropertyKey<Index> extends never
    ? never
    : `${Index}` extends `-${string}`
      ? never
      : `${Index}` extends `${bigint}`
        ? Index
        : never;

function refineKey<const K extends PropertyKey>(
  key: K & SinglePropertyKey<K>
): unknown;
```

Keep this singleton constraint as the common first stage for narrower key
contracts. For example, `ArrayIndex` reuses it before checking that the one
number literal is also a non-negative integer. This prevents separate broad,
union, and branded-domain checks from drifting between APIs.

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
number, and symbol unions, their broad primitive types, and infinite template
patterns such as `` `field-${string}` `` and `` `field-${number}` ``. Include
opaque `number & Brand` and `symbol & Brand` domains, and keep positive cases
for each singleton literal kind. When another API needs a singleton key as one
part of a stricter contract, reuse this constraint rather than duplicating its
individual exclusions.

Validate similar changes with `pnpm build`, `pnpm test:types`, `pnpm lint`, and
the packed-package smoke test so the emitted declaration has the same
constraint as the source API.

## Related Files

- `src/core/key.ts`
- `tests-d/core/key.test-d.ts`
- `tests-d/core/compiler-api.test-d.ts`
