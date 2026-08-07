# Object and boundary validation

Validate object shapes at untrusted boundaries such as decoded JSON, network
responses, storage, messages, environment-derived data, and third-party input.

## Choose `typedStruct` or `struct`

| Situation                                                                      | Choice                                               |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| A trustworthy target type exists and the whole contract must stay synchronized | `typedStruct<T>()(...)`                              |
| No target type exists                                                          | `struct(...)`                                        |
| The declared type disagrees with observed runtime data                         | `struct(...)`, with a concise reason near the schema |
| Only a projection of a larger payload is consumed                              | `struct(...)`                                        |
| Adding any target key must force schema maintenance                            | `typedStruct<T>()(...)`                              |

Do not use `typedStruct` merely to assign a preferred output type. It is a
compile-time synchronization contract: all required and optional target keys
must be declared, incompatible guards are rejected, and extra schema keys are
rejected.

```ts
import { isNumber, isString, optionalKey, typedStruct } from 'is-kit';

type User = {
  id: number;
  displayName?: string;
};

const isUser = typedStruct<User>()({
  id: isNumber,
  displayName: optionalKey(isString)
});
```

Use `struct` when the guard intentionally defines or projects the runtime
shape:

```ts
import { isNumber, safeParse, struct } from 'is-kit';

const isActorProjection = struct({
  id: isNumber,
  organization: struct({ id: isNumber })
});

export const parseActor = (input: unknown) => {
  const parsed = safeParse(isActorProjection, input);
  if (!parsed.valid) return null;

  return {
    actorId: parsed.value.id,
    organizationId: parsed.value.organization.id
  };
};
```

When a declared/generated type conflicts with runtime data, do not cast the
payload to the declared type. Validate the runtime projection actually used and
record why it intentionally differs.

## Key presence and value optionality

Schema keys are required unless wrapped in `optionalKey`.

```ts
import { isString, optional, optionalKey, struct } from 'is-kit';

const mayBeMissing = struct({
  label: optionalKey(isString)
});

const mustExistButMayBeUndefined = struct({
  label: optional(isString)
});
```

These contracts differ:

- `optionalKey(isString)`: the key may be absent; when present, it must contain
  a string.
- `optional(isString)`: the key must exist; its value may be a string or
  `undefined`.
- `optionalKey(optional(isString))`: the key may be absent or contain a string
  or `undefined`.

## Extra keys and plain objects

`struct` and `typedStruct` accept schema-external keys by default. Keep this
forward-compatible behavior for most API responses. Use `{ exact: true }` only
when extra own enumerable string keys violate the contract.

```ts
const isExactPoint = struct({ x: isNumber, y: isNumber }, { exact: true });
```

These builders validate plain objects. Do not use them for arrays, `Date`,
`Error`, maps, sets, or class instances. Prefer the matching built-in or
collection guard, or use `isInstanceOf` for a project class when appropriate.

## Consume validated values

Call a guard directly for control flow:

```ts
if (!isUser(input)) return null;
return input.id;
```

Use `safeParse` when a tagged result makes the value flow clearer:

```ts
const parsed = safeParse(isUser, input);
if (!parsed.valid) return null;
return parsed.value.id;
```

Avoid validating a payload and then continuing to read from the original
`unknown` variable or an asserted alias.

## Partial recovery

Do not require an entire object to be valid when the product intentionally
recovers independent fields. Validate the outer value as a record/plain object,
extract each field into a local constant, and guard fields independently.
Document this as partial recovery so a later refactor does not accidentally
turn it into all-or-nothing validation.
