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

## ⌚ A 30-second Mental Model

If you are new to the library, these are the pieces to remember:

- `define<T>(fn)` turns a boolean check into a typed guard.
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
import { isNumber, isString, optionalKey, struct } from 'is-kit';

const isProfile = struct(
  {
    id: isNumber,
    name: isString,
    bio: optionalKey(isString)
  },
  { exact: true }
);
```

`optionalKey(guard)` means the property may be missing.

If the property must exist but the value may be `undefined`, use `optional(guard)` instead.

```ts
import { isString, optional, optionalKey, struct } from 'is-kit';

const isConfig = struct({
  label: isString,
  subtitle: optional(isString),
  note: optionalKey(optional(isString))
});
```

### 5. Validate arrays, tuples, maps, sets, and records

Collection combinators keep your element guards reusable.

```ts
import {
  arrayOf,
  isNumber,
  isString,
  mapOf,
  recordOf,
  setOf,
  tupleOf
} from 'is-kit';

const isStringArray = arrayOf(isString);
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

### 6. Handle null and undefined explicitly

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

### 7. Parse or assert unknown input

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

### 8. Narrow object keys

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

### API response checks

```ts
import { isNumber, isString, safeParse, struct } from 'is-kit';

const isPost = struct({
  id: isNumber,
  title: isString
});

const parsed = safeParse(isPost, payload);
if (parsed.valid) {
  renderPost(parsed.value);
}
```

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
- **Collections**: `arrayOf`, `tupleOf`, `setOf`, `mapOf`, `recordOf`
- **Literals**: `oneOfValues`, `equals`, `equalsBy`, `equalsKey`
- **Nullish handling**: `nullable`, `nonNull`, `nullish`, `optional`, `required`
- **Result helpers**: `safeParse`, `safeParseWith`, `assert`

For the full API list and dedicated pages, use the docs site below.

## 📚 Full Documentation

For detailed API pages and more examples, see:

https://is-kit-docs.vercel.app/

## 👨‍💻 Development

Requires Node 22 and pnpm 10.12.4.

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm test:types`

See `DEVELOPER.md` for setup details and `CONTRIBUTE.md` for contribution workflow.

Pick a guard, compose it, and ship with confidence 🚀
