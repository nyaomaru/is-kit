# is-kit

<p align="center">
  <img
    src="https://raw.githubusercontent.com/nyaomaru/is-kit/main/docs/public/iskit_image.png"
    width="600"
    alt="is-kit logo"
  />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/is-kit">
    <img src="https://img.shields.io/npm/v/is-kit.svg" alt="npm version">
  </a>
  <a href="https://jsr.io/@nyaomaru/is-kit">
    <img src="https://img.shields.io/jsr/v/@nyaomaru/is-kit" alt="JSR">
  </a>
  <a href="https://www.npmjs.com/package/is-kit">
    <img src="https://img.shields.io/npm/dt/is-kit.svg" alt="npm downloads">
  </a>
  <a href="https://github.com/nyaomaru/is-kit/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/is-kit.svg?sanitize=true" alt="License">
  </a>
</p>

`is-kit` is a lightweight, zero-dependency toolkit for building reusable TypeScript **type guards**.

It helps you write small `isFoo` functions, compose them into **richer runtime checks**, and keep **TypeScript narrowing** natural inside regular control flow.

**Runtime-safe** 🛡️, **composable** 🧩, and **ergonomic** ✨ without asking you to adopt a heavy schema workflow.

- Build and reuse **typed guards**
- **Compose guards** with `and`, `or`, `not`, `oneOf`
- **Validate object** shapes and collections
- **Parse or assert** `unknown` values without a large schema framework

[📚 Documentation Site](https://is-kit-docs.vercel.app/)

> Best for **app-internal narrowing, filtering, and reusable guards**.

## 🤔 Why use `is-kit`?

Tired of rewriting the same `isFoo` checks again and again?

`is-kit` is a good fit when you want to:

- **write reusable `isX`** functions instead of one-off inline checks
- keep runtime validation **lightweight and dependency-free**
- **narrow values directly** in `if`, `filter`, and other TypeScript control flow
- **compose validation logic** from small guards instead of large schema objects

`is-kit` is probably not the best first choice if you mainly want:

- rich, structured validation errors
- schema-first workflows
- data transformation pipelines

In those cases, a schema validator such as `Zod` may be a better fit. (Of course, you can combine them 🍲)

`is-kit` is meant to take the boring part out of writing guards, while still feeling like normal TypeScript.

> Grab a coffee ☕ and let `is-kit` handle the repetitive part.

## 📥 Install

```bash
pnpm add is-kit
# or
bun add is-kit
# or
npm install is-kit
# or
yarn add is-kit
```

ESM and CJS builds are available for npm consumers, and bundled types are included.

### JSR

```ts
import { and, define, or } from 'jsr:@nyaomaru/is-kit';
```

## ✨ Quick Start

Start with a plain object guard and parse an `unknown` value.

```ts
import { isNumber, isString, optionalKey, safeParse, struct } from 'is-kit';

declare const input: unknown;

const isUser = struct({
  id: isNumber,
  name: isString,
  nickname: optionalKey(isString)
});

const result = safeParse(isUser, input);

if (result.valid) {
  result.value.id;
  result.value.name;
  result.value.nickname?.toUpperCase();
}
```

This is the core idea of `is-kit`:

1. Build small guards.
2. Compose them.
3. Reuse them anywhere TypeScript narrowing matters.

## 🧭 Guard Composition Guide

When writing reusable guards with `is-kit`, start from the library primitives:
use `define` for custom runtime checks, and use logic combinators such as
`and`, `or`, and `not` when combining existing guards. This keeps the result
reusable as a named guard and preserves the type-level intent in hover,
completion, and generated declarations.

```ts
import {
  and,
  define,
  isNil,
  isNumber,
  isString,
  nullish,
  or,
  predicateToRefine
} from 'is-kit';

const isId = or(isString, isNumber);
const isNullishString = nullish(isString);

const isSlug = define<string>(
  (value) => isString(value) && /^[a-z0-9-]+$/.test(value)
);

const isPositiveNumber = and(
  isNumber,
  predicateToRefine<number>((value) => value > 0)
);

isNil(null); // true
isNil(undefined); // true
isId('user-1'); // true
isNullishString(undefined); // true
isSlug('release-110'); // true
isPositiveNumber(1); // true
```

Prefer these forms when generating or reviewing code:

```ts
declare const value: unknown;

// Prefer
const isId = or(isString, isNumber);
const isMaybeName = nullish(isString);
const isSlug = define<string>(
  (value) => isString(value) && /^[a-z0-9-]+$/.test(value)
);

// Avoid
const isId = (value: unknown) => isString(value) || isNumber(value);
const isMaybeName = (value: unknown) => value == null || isString(value);
const isSlug = (value: unknown): value is string =>
  isString(value) && /^[a-z0-9-]+$/.test(value);
```

### AI agent setup

Add the recommended `is-kit` selection and usage rules to a repository's AI
agent instructions:

```bash
npx is-kit init-agent
```

The command updates an `is-kit`-managed section in `AGENTS.md` without
overwriting other instructions. If a repository uses `CLAUDE.md`, target it
explicitly:

```bash
npx is-kit init-agent --target claude
```

See [docs/agent-rules.md](./docs/agent-rules.md) for the installed rules.

## ⌚ A 30-second Mental Model

If you are new to the library, these are the pieces to remember:

- `define<T>(fn)` turns a boolean check into a typed guard.
- `lazy(factory)` defers a guard definition so recursive structures can refer to themselves.
- `predicateToRefine(fn)` upgrades an existing predicate so it can participate in narrowing chains.
- `struct({...})` builds an object-shape guard.
- `safeParse(guard, value)` gives you a small tagged result object.
- `assert(guard, value)` throws if the value does not match.

## ⚒️ Common Usage

### 1. Create a custom guard

Use `define` when you already know the runtime condition you want.

```ts
import { define, isString } from 'is-kit';

const isShortString = define<string>(
  (value) => isString(value) && value.length <= 3
);
```

### 2. Add refinements to an existing guard

Use `and` plus `predicateToRefine` when you want a broad guard first and a narrower condition after that.

```ts
import { and, isNumber, predicateToRefine } from 'is-kit';

const isPositiveNumber = and(
  isNumber,
  predicateToRefine<number>((value) => value > 0)
);
```

### 3. Compose multiple guards

Use `or` and `oneOf` to combine smaller guards into readable predicates.

```ts
import { oneOf, or, isBoolean, isNumber, isString } from 'is-kit';

const isStringOrNumber = or(isString, isNumber);
const isScalar = oneOf(isString, isNumber, isBoolean);
```

Use `not(...)` when you want the complement of an existing guard or refinement.

### 4. Validate object shapes

Use `struct` for plain-object payloads. Keys are required by default.

```ts
import { isNumber, isString, optional, optionalKey, struct } from 'is-kit';

const isProfile = struct(
  {
    id: isNumber,
    name: isString,
    bio: optionalKey(isString)
  },
  { exact: true }
);

const isConfig = struct({
  label: isString,
  subtitle: optional(isString),
  note: optionalKey(optional(isString))
});
```

`optionalKey(guard)` means the property may be missing.

Use `struct(schema, { exact: true })` when extra own enumerable string keys
should be rejected. Exact mode follows `Object.keys(...)` semantics, so symbol
keys and non-enumerable properties are outside its key matching.

If the property must exist but the value may be `undefined`, use `optional(guard)` instead.

### 5. Validate arrays, tuples, maps, sets, and records

Collection combinators keep your element guards reusable.

```ts
import {
  arrayOf,
  isNumber,
  isString,
  mapOf,
  nonEmptyArrayOf,
  recordOf,
  setOf,
  tupleOf
} from 'is-kit';

const isStringArray = arrayOf(isString);
const isNonEmptyTagList = nonEmptyArrayOf(isString);
const isPoint = tupleOf(isNumber, isNumber);
const isTagSet = setOf(isString);
const isScoreMap = mapOf(isString, isNumber);
const isStringRecord = recordOf(isString, isString);
```

Use `oneOfValues` for unions of literal primitives.

```ts
import { oneOfValues } from 'is-kit';

const isStatus = oneOfValues('draft', 'published', 'archived');
```

### 6. Validate recursive structures

Use `lazy` when a guard needs to refer to itself. The factory runs on first use,
and the resulting guard is cached.

```ts
import { arrayOf, isString, lazy, typedStruct } from 'is-kit';
import type { Predicate } from 'is-kit';

type Tree = {
  readonly value: string;
  readonly children: readonly Tree[];
};

const isTree: Predicate<Tree> = lazy(() =>
  typedStruct<Tree>()({
    value: isString,
    children: arrayOf(isTree)
  })
);
```

`lazy` does not detect circular references in the input value.

### 7. Handle null and undefined explicitly

Use the nullish helpers to say exactly what is allowed.

```ts
import {
  isString,
  nonNull,
  nullable,
  nullish,
  optional,
  required
} from 'is-kit';

const isNullableString = nullable(isString);
const isNullishString = nullish(isString);
const isOptionalString = optional(isString);
const isDefinedString = required(optional(isString));
const isNonNullString = nonNull(nullable(isString));
```

For a plain "is it `null` or `undefined`?" check, reach for `isNil` instead of
hand-rolling `isNull(x) || isUndefined(x)`:

```ts
import { isNil } from 'is-kit';

isNil(null); // true
isNil(undefined); // true
isNil(0); // false
```

### 8. Parse or assert unknown input

Use `safeParse` when you want a result object, and `assert` when invalid data should stop execution.

```ts
import { assert, isString, safeParse } from 'is-kit';

declare const input: unknown;

const parsed = safeParse(isString, input);

if (parsed.valid) {
  parsed.value.toUpperCase();
}

assert(isString, input, 'Expected a string');
input.toUpperCase();
```

### 9. Decode and validate JSON input

Use `safeJsonParse` at a JSON text boundary. It decodes the text, treats the
result as `unknown`, and only returns the value after the guard accepts it.
Invalid JSON and guard mismatches both return `{ valid: false }`; values are not
coerced to satisfy the guard.

```ts
import { isString, safeJsonParse, typedStruct } from 'is-kit';

type User = {
  id: string;
  name: string;
};

const isUser = typedStruct<User>()({
  id: isString,
  name: isString
});

declare const input: string;
const result = safeJsonParse(input, isUser);

if (result.valid) {
  result.value.name.toUpperCase();
}
```

`safeJsonParse` is a decode-then-guard helper. It does not perform schema
coercion and does not depend on a transport or schema format such as HTTP or
OpenAPI.

### 10. Narrow object keys

Use key helpers when the important part of a value is one property.

```ts
import {
  hasKey,
  hasKeys,
  isNumber,
  isString,
  narrowKeyTo,
  oneOfValues,
  struct
} from 'is-kit';

const isUser = struct({
  id: isNumber,
  name: isString,
  role: oneOfValues('admin', 'member', 'guest')
});

const hasRole = hasKey('role');
const hasRoleAndId = hasKeys('role', 'id');
const byRole = narrowKeyTo(isUser, 'role');
const isAdmin = byRole('admin');

const value: unknown = { id: 1, name: 'nyaomaru', role: 'admin' };

if (hasRole(value)) {
  value.role;
}

if (hasRoleAndId(value)) {
  value.role;
  value.id;
}

if (isAdmin(value)) {
  value.role;
  value.name;
}
```

## 🌍 Real-world use cases

Here are the kinds of problems `is-kit` is especially good at solving:

### Typed object guard checks

```ts
import {
  isNumber,
  isString,
  optionalKey,
  safeParse,
  typedStruct
} from 'is-kit';

type PostResponse = ApiResponse<'/posts/{id}', 'get'>;

const isPost = typedStruct<PostResponse>()({
  id: isNumber,
  title: isString,
  summary: optionalKey(isString)
});

const payload: unknown = await fetchPost();
const parsed = safeParse(isPost, payload);

if (parsed.valid) {
  renderPost(parsed.value);
}
```

`typedStruct<T>()` is a small helper for keeping hand-written `struct` guards in
sync with an existing object type. Optional keys in `T` must still be declared
with `optionalKey(...)`; this makes drift visible when the target type changes.
OpenAPI-generated response types are one useful case, but the helper is not an
OpenAPI validator or schema generator.

### Safe array filtering

```ts
import { isNumber } from 'is-kit';

const values: unknown[] = [1, 'two', 3];
const numbers = values.filter(isNumber);
```

### Narrowing by discriminant

```ts
import { isNumber, isString, narrowKeyTo, oneOfValues, struct } from 'is-kit';

const isEvent = struct({
  type: oneOfValues('click', 'submit'),
  label: isString,
  timestamp: isNumber
});

const byType = narrowKeyTo(isEvent, 'type');
const isSubmitEvent = byType('submit');
```

## 🎯 API Overview

The library is organized around a few small building blocks:

- **Primitives**: `isString`, `isNumber`, `isBoolean`, `isInteger`, ...
- **Composition**: `define`, `and`, `andAll`, `or`, `not`, `oneOf`
- **Object shapes**: `struct`, `optionalKey`, `hasKey`, `hasKeys`, `narrowKeyTo`
- **Collections**: `arrayOf`, `nonEmptyArrayOf`, `tupleOf`, `setOf`, `mapOf`, `recordOf`
- **Literals**: `oneOfValues`, `equals`, `equalsBy`, `equalsKey`
- **Nullish handling**: `isNil`, `nullable`, `nonNull`, `nullish`, `optional`, `required`
- **Result helpers**: `safeParse`, `safeParseWith`, `safeJsonParse`, `assert`

For the full API list and dedicated pages, use the docs site below.

## 📚 Full Documentation

For detailed API pages and more examples, see:

https://is-kit-docs.vercel.app/

## 👨‍💻 Development

Requires Node 22.22.0 and pnpm 11.2.2.

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm test:types`

See `DEVELOPER.md` for setup details and `CONTRIBUTE.md` for contribution workflow.

Pick a guard, compose it, and ship with confidence 🚀
