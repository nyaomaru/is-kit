# Migration checklist

Replace manual runtime checks only when the result improves reuse, composition,
boundary safety, or type narrowing.

## Common conversions

| Existing pattern                      | Typical is-kit form                                               |
| ------------------------------------- | ----------------------------------------------------------------- | -------------------- | ----------------------------------------- |
| `typeof value === 'string'`           | `isString(value)`                                                 |
| `typeof value === 'number'`           | Choose `isNumber` or `isNumberPrimitive` by semantics             |
| `value === null                       |                                                                   | value === undefined` | `isNil(value)`                            |
| `value == null                        |                                                                   | guard(value)`        | `nullish(guard)` for a reusable guard     |
| `guardA(value)                        |                                                                   | guardB(value)`       | `or(guardA, guardB)` for a reusable guard |
| `base(value) && condition(value)`     | `and(base, refinement)` for a reusable guard                      |
| Repeated literal comparisons          | `oneOfValues(...)`                                                |
| Handwritten array `.every(...)` guard | `arrayOf(elementGuard)`                                           |
| Handwritten object-shape predicate    | `struct(...)` or `typedStruct<T>()(...)`                          |
| `JSON.parse(...) as T`                | `safeJsonParse(text, guard)` or decode to `unknown` then validate |
| `input as T` after manual checks      | Narrow with a guard and remove the assertion                      |

## Preserve intent

Before replacing a check, identify whether it is:

- reusable type validation;
- a local control-flow condition;
- runtime/platform feature detection;
- business policy rather than type validation;
- coercion or transformation rather than validation.

Do not convert environment checks such as `typeof window`, `typeof process`, or
optional-global detection. Do not disguise business policy as a generic type
guard. Do not replace validation libraries that provide transformations or
structured errors unless the task explicitly changes that contract.

## Respect project boundaries

If the repository centralizes `is-kit` imports:

1. Search the boundary's exports first.
2. Add the smallest missing export or composed guard there.
3. Import through the boundary everywhere else.
4. Verify no new direct imports escaped the boundary.

If no boundary exists, use direct package imports. Do not introduce an
abstraction layer as an incidental migration change.

Place single-consumer payload schemas next to their consumer. Put reusable,
domain-free guards in the project's shared guard location. Put domain decisions
in the owning domain module.

## Keep narrowing stable

Indexed and mutable property access can lose refinements. Extract the property
before validating it:

```ts
const accessToken = body.accessToken;
if (!isNonEmptyString(accessToken)) return null;

// accessToken is string here.
return accessToken;
```

Prefer this over asserting the property type after the guard.

## Verify the migration

- Search again for the targeted manual pattern.
- Confirm changed imports follow the project convention.
- Exercise accepted, rejected, and wrong-type inputs.
- Check missing, optional, and extra keys for object schemas.
- Run the repository's relevant unit tests and typecheck.
- Run lint and formatting only at the scope the repository supports.
- Review the diff and remove unrelated formatting changes.
