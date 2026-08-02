# Model Transformations as Decoders, Not Guards

**Captured:** 2026-08-01
**Context:** Modeling explicit boundary conversions where the output is a new value rather than a narrower view of the input.
**Tags:** api-design, typescript, decoder, parse-result, type-guards, tsd, composition

## Problem

A type guard can only narrow the value it receives. It cannot correctly model a
conversion such as string to number because the output is a different value.
Pretending that coercion is a predicate weakens the guard-first mental model and
hides when data changes representation.

The transformation contract must also stay small enough that core does not grow
into an error-reporting or transformation framework before boundary modules
demonstrate that need.

## Solution

Model explicit transformations as function types that return the existing
tagged parse result:

```ts
export type Decoder<Input, Output> = (
  input: Input
) => ParseResult<Output>;
```

Use these rules for the base contract:

- expected conversion failures return `{ valid: false }`
- successful conversions return `{ valid: true, value: Output }`
- unexpected exceptions propagate to the caller
- sequential composition calls the next decoder only after success
- codes, messages, inputs, paths, and composition helpers stay outside the base
  abstraction until repeated use proves they are needed
- keep the contract internal while prototyping the boundary module that needs
  it

Concrete conversion policy belongs to each decoder. For example, whether a
number decoder accepts whitespace or alternate numeric syntax is not part of
the generic `Decoder` contract.

## Example

```ts
const stringToNumber: Decoder<string, number> = (input) => {
  if (input.trim() === '') return { valid: false };

  const value = Number(input);
  return Number.isFinite(value) ? { valid: true, value } : { valid: false };
};

const numberToBoolean: Decoder<number, boolean> = (input) => ({
  valid: true,
  value: input !== 0
});

const stringToBoolean: Decoder<string, boolean> = (input) => {
  const result = stringToNumber(input);
  return result.valid ? numberToBoolean(result.value) : result;
};
```

For negative tsd assertions, prefer an assignability assertion over calling a
function with an invalid argument:

```ts
expectNotAssignable<Parameters<typeof stringToNumber>[0]>(42);
```

`expectError(stringToNumber(42))` passes under tsd, but the invalid call still
appears as a TypeScript error in VSCode. `expectNotAssignable` preserves the
negative test while keeping `tests-d/tsconfig.json` clean in the editor.

## When To Use

Use this pattern for explicit coercion or decoding at string, URL, environment,
form, or similar boundaries. Continue using `Predicate<T>` when validation only
narrows the original value without creating a replacement.

Verify both tsd behavior and the editor's TypeScript project:

```sh
pnpm test:types
node_modules/.bin/tsc -p tests-d/tsconfig.json --pretty false
pnpm lint
pnpm build
pnpm test
```

## Related Files

- `src/types/core.ts`
- `tests-d/types/decoder.test-d.ts`
- `tests-d/core/key.test-d.ts`
- `tests-d/tsconfig.json`
- `v2-design.md`
