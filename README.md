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

<h2 align="center">Build small guards. Compose them.</h2>

`is-kit` is a lightweight, zero-dependency toolkit for building reusable TypeScript **type guards**.

It helps you write small `isFoo` functions, compose them into **richer runtime checks**, and keep **TypeScript narrowing** natural inside regular control flow.

**Runtime-safe** 🛡️, **composable** 🧩, and **ergonomic** ✨ without asking you to adopt a heavy schema workflow.

- Build and reuse **typed guards**
- **Compose guards** with `and`, `or`, `not`, `oneOf`
- **Validate object** shapes and collections
- **Parse or assert** `unknown` values without a large schema framework

[📚 Documentation Site](https://is-kit.dev/) ·
[🧭 Practical Guides](https://is-kit.dev/guides)

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
# or
vlt install is-kit
```

ESM and CJS builds are available for npm consumers, and bundled types are included.
The published declarations support TypeScript 5.7 and newer. CI compiles the
packed package against every TypeScript minor from 5.7 through the current
stable release.

TypeScript 7 can type-check is-kit declarations, but TypeScript 7.0 does not
ship the legacy JavaScript Compiler API. Tools that need that API can follow
the official [TypeScript 7 side-by-side guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0)
and use `@typescript/typescript6` for programmatic access.

vlt requires registry configuration before installing a package by name. Run
`vlt setup` once if a registry has not been configured yet.

### JSR

Install the JSR package with vlt:

```bash
vlt install jsr:@nyaomaru/is-kit
```

Or import it directly in runtimes that support `jsr:` specifiers:

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

#### Recommended: Codex Marketplace plugin

Install the `is-kit` plugin from this repository's Codex Marketplace:

```bash
codex plugin marketplace add nyaomaru/is-kit
codex plugin add is-kit@is-kit
```

This is the primary distribution channel for the `use-is-kit` skill. It gives
Codex an on-demand workflow for selecting guards, replacing manual runtime
checks, and validating object boundaries with `is-kit`.

#### Compatibility: instruction-only setup

For agents that do not support skills or plugins, add the lightweight selection
and usage rules to the repository's agent instructions:

```bash
npx --yes is-kit@latest init-agent
```

The command updates an `is-kit`-managed section in `AGENTS.md` without
overwriting other instructions. If a repository uses `CLAUDE.md`, target it
explicitly:

```bash
npx --yes is-kit@latest init-agent --target claude
```

See [docs/agent-rules.md](./docs/agent-rules.md) for the installed rules.

## ⌚ A 30-second Mental Model

If you are new to the library, these are the pieces to remember:

- `define<T>(fn)` turns a boolean check into a typed guard.
- `lazy(factory)` defers a guard definition so recursive structures can refer to themselves.
- `predicateToRefine(fn)` upgrades an existing predicate so it can participate in narrowing chains.
- `refineKey(key, guard)` carries a child refinement back onto its parent type.
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

### 7. Refine properties on existing types

Use the property helpers when an object is already typed and one child value
needs additional narrowing.

```ts
import { isString, refineDefinedKey, refineIndex, refineKey } from 'is-kit';

const hasStringValue = refineKey('value', isString);
const hasDefinedStringLabel = refineDefinedKey('label', isString);
const hasStringAtZero = refineIndex(0, isString);
```

- `refineKey` refines one required property using normal property access.
- `refineDefinedKey` returns `false` for a missing or `undefined` property.
- `refineIndex` returns `false` for an out-of-bounds, sparse, or `undefined`
  own element.

The property helpers accept inherited values and accessors. The index helper
requires an own element so a sparse hole cannot pass through an inherited
numeric property.

Each key or index must identify one concrete runtime location. This keeps one
successful lookup from incorrectly narrowing multiple properties.

### 8. Handle null and undefined explicitly

Use the nullish helpers to say exactly what is allowed.

```ts
import {
  isNil,
  isNotNil,
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

isNil(null); // true
isNil(undefined); // true
isNil(0); // false

const values: Array<string | null | undefined> = ['value', null, undefined];
const presentValues = values.filter(isNotNil); // string[]
```

Use `isNil` for a direct nullish check instead of hand-rolling
`isNull(x) || isUndefined(x)`. Use `isNotNil` for the inverse check or to
remove nullish values while preserving `Array.prototype.filter` narrowing.

### 9. Parse or assert unknown input

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

### 10. Decode and validate JSON input

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

### 11. Narrow object keys

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
OpenAPI validator or schema generator. Drift detection is limited to
string-keyed properties; numeric and symbol properties are excluded from the
checked shape and cannot be validated by the resulting guard.

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
- **Object shapes**: `struct`, `optionalKey`, `hasKey`, `hasKeys`, `narrowKeyTo`, `refineKey`, `refineDefinedKey`, `refineIndex`
- **Collections**: `arrayOf`, `nonEmptyArrayOf`, `tupleOf`, `setOf`, `mapOf`, `recordOf`
- **Literals**: `oneOfValues`, `equals`, `equalsBy`, `equalsKey`
- **Nullish handling**: `isNil`, `isNotNil`, `nullable`, `nonNull`, `nullish`, `optional`, `required`
- **Result helpers**: `safeParse`, `safeParseWith`, `safeJsonParse`, `assert`

For the full API list and dedicated pages, use the docs site below.

### Public types

Start with the primary types for guard authoring, parsing, and schema inference:

- `Predicate`, `Guard`, `Refinement`, `Refine`, `ParseResult`, `Primitive`
- `InferSchema`, `StructOptions`, `TypedStructShape`, `TypedStructFields`

Advanced building blocks support reusable wrappers and type-level extensions:

- `GuardedOf`, `GuardedWithin`, `OutOfGuards`, `RefineChain`, `ChainResult`
- `OptionalSchemaField`, `SchemaField`, `Schema`, `NoExtraKeys`
- `OptionalObjectKeys`, `RequiredObjectKeys`

Both groups are supported public API and follow semantic versioning. The
classification only controls discoverability. `SchemaShape` remains internal
and is not exported from the package root.

### v2 migration notice

Six low-level utility adapters remain available in v1 for compatibility but are
deprecated and will no longer be exported from the package root in v2:

| Deprecated export         | Migration path                                                         |
| ------------------------- | ---------------------------------------------------------------------- |
| `everyArrayValue`         | Use `Array.prototype.every` or the `arrayOf` guard.                    |
| `everyTupleValue`         | Use the `tupleOf` guard or compare tuple values directly.              |
| `everySetValue`           | Use the `setOf` guard or iterate the set directly.                     |
| `everyMapEntry`           | Use the `mapOf` guard or iterate the map directly.                     |
| `everyOwnEnumerableEntry` | Use the `recordOf` guard or `Object.entries(value).every(...)`.        |
| `toBooleanPredicates`     | Use the original predicate array directly; this helper is an identity. |

The underlying internal helpers may remain in the implementation. Only their
public root exports are planned for removal.

## 📚 Full Documentation

For detailed API pages and more examples, see:

- [Practical guides](https://is-kit.dev/guides)
- [Keep hand-written type guards in sync with TypeScript types](https://is-kit.dev/guides/keep-type-guards-in-sync)
- [Use is-kit with the TypeScript Compiler API](https://is-kit.dev/guides/typescript-compiler-api)
- [Validate unknown without a schema library](https://is-kit.dev/guides/validate-unknown-without-schema-library)
- [API reference](https://is-kit.dev/api-reference)
- [Documentation home](https://is-kit.dev/)

Start with [How to safely filter null and undefined from arrays in
TypeScript](https://is-kit.dev/guides/filter-null-and-undefined).

## 👨‍💻 Development

Requires Node 22.22.0 and pnpm 11.2.2.

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm test:types`
- `pnpm test:package`

See `DEVELOPER.md` for setup details and `CONTRIBUTE.md` for contribution workflow.

Pick a guard, compose it, and ship with confidence 🚀
