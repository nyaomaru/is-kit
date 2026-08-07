# Guard selection

Use the installed `is-kit` declarations as the source of truth. This reference
describes selection strategy, not a guarantee that every API exists in every
version.

## Decision table

| Need                                            | Prefer                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Primitive or platform value                     | Existing `isString`, `isNumber`, `isBoolean`, `isDate`, `isError`, and similar guard |
| Exact primitive literal                         | `equals(value)` or `oneOfValues(...)`                                                |
| Union of guarded types                          | `or(...)`                                                                            |
| Base guard plus one refinement                  | `and(base, refinement)`                                                              |
| Base guard plus multiple narrowing steps        | `andAll(base, ...steps)`                                                             |
| Reusable negation                               | `not(guard)`                                                                         |
| Accept `null`, `undefined`, or both             | `nullable`, `optional`, or `nullish`                                                 |
| Direct `null \| undefined` check                | `isNil`                                                                              |
| Custom guard from an `unknown` runtime check    | `define<T>(check)`                                                                   |
| Boolean condition over an already narrowed type | `predicateToRefine<T>(check)`                                                        |
| Homogeneous array, record, set, or map          | Matching collection combinator                                                       |
| Fixed tuple                                     | `tupleOf(...)`                                                                       |
| Object payload                                  | `struct(...)` or `typedStruct<T>()(...)`                                             |

## Reuse before composition

Search in this order:

1. An equivalent project guard or schema.
2. An equivalent export in the installed `is-kit` version.
3. A composition of existing guards.
4. A new custom guard.

Do not create aliases whose only purpose is renaming unless the project uses a
guard boundary or the alias establishes meaningful domain vocabulary.

## Primitive semantics

Confirm semantics instead of choosing by name alone. For example, current
versions distinguish a finite-number guard from a number-primitive guard that
also accepts `NaN` and infinities. Select the behavior required by the runtime
contract.

```ts
import { isNumber, isNumberPrimitive } from 'is-kit';

isNumber(Infinity); // false
isNumberPrimitive(Infinity); // true
```

## Logical composition

Create reusable unions and refinements with combinators so inference survives
reuse.

```ts
import { and, isNumber, isString, or, predicateToRefine } from 'is-kit';

export const isIdentifier = or(isString, isNumber);

export const isNonEmptyString = and(
  isString,
  predicateToRefine<string>((value) => value.length > 0)
);
```

Use `define<T>` when the complete runtime check starts from `unknown`:

```ts
import { define, isString } from 'is-kit';

export const isSlug = define<string>(
  (value) => isString(value) && /^[a-z0-9-]+$/.test(value)
);
```

Do not write a type-predicate annotation solely to convince TypeScript that an
unchecked boolean function is a guard.

## Nullability

Distinguish value optionality from object-key optionality:

```ts
import { isString, nullish, optional } from 'is-kit';

const isOptionalStringValue = optional(isString);
const isNullishStringValue = nullish(isString);
```

Use `optionalKey` only inside `struct` or `typedStruct`; see
[object-validation.md](object-validation.md).

## Literals and discriminants

Use literal guards rather than repeating equality chains:

```ts
import { equalsKey, oneOfValues } from 'is-kit';

const isStatus = oneOfValues('idle', 'loading', 'success', 'error');
const isSuccessResult = equalsKey('status', 'success');
```

Use `equalsKey` for a discriminant check, not as a substitute for validating
the rest of a payload that will be consumed.

## Collections

Use the combinator matching the runtime container and contract:

```ts
import { arrayOf, isNumber, isString, recordOf, tupleOf } from 'is-kit';

const isNames = arrayOf(isString);
const isScores = recordOf(isString, isNumber);
const isPoint = tupleOf(isNumber, isNumber);
```

Use `nonEmptyArrayOf` only when non-emptiness is part of the runtime contract.
