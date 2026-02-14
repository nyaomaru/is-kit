# is-kit

<p align="center">
    <img src="https://raw.githubusercontent.com/nyaomaru/is-kit/main/docs/public/iskit_image.png" width="600px" align="center" alt="is-kit logo" />
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

Lightweight, zero-dependency toolkit for building `isFoo` style type guards in TypeScript.
Runtime-safe 🛡️, composable 🧩, and ergonomic ✨.

[📚 full documentation](https://is-kit-docs.vercel.app/)

## Why?

Tired of writing the same `isFoo` again and again?
Let `is-kit` do it for you:

- Less boilerplate
- Type-safe
- Composable
- Zero-dependency

> ☕ Grab a coffee, let `is-kit` do the boring work.

## Install

Node via npm

```bash
pnpm add is-kit
# or
bun add is-kit
# or
npm i is-kit
# or
yarn add is-kit
```

ESM and CJS builds are provided for npm consumers. Types are bundled.

### JSR (TypeScript source)

```ts
// Deno/Bun/JSR-aware tooling
import { define, and, or } from 'jsr:@nyaomaru/is-kit';
```

## Quick start

Build `is` functions from tiny, composable pieces:

```ts
import {
  define,
  and,
  or,
  not,
  struct,
  oneOfValues,
  optional,
  isNumber,
  isString,
  predicateToRefine
} from 'is-kit';

// Define small guards
const isShortString = define<string>((v) => isString(v) && v.length <= 3);
const isPositive = and(
  isNumber,
  predicateToRefine<number>((v) => v > 0)
);

// Combine them (or / not)
const isShortOrPositive = or(isShortString, isPositive);
const isOther = not(isShortOrPositive);

// Define object shapes
const isRole = oneOfValues(['admin', 'member'] as const);
const isUser = struct({
  id: isPositive, // number > 0
  name: isString, // string
  role: isRole, // 'admin' | 'member'
  nickname: optional(isShortString) // string <= 3 | undefined
});

// Use them
isPositive(3); // true
isShortOrPositive('foo'); // true
isShortOrPositive(false); // false
isOther('x'); // true

const maybeUser: unknown = { id: 7, name: 'Rin', role: 'admin' };
if (isUser(maybeUser)) {
  // The type is narrowed inside this block
  maybeUser.role; // 'admin' | 'member'
  maybeUser.nickname?.toUpperCase();
}
```

Composed guards stay reusable:
`isPositive` can be used standalone or as part of a `struct` definition.

When validating complex shapes, reach for `struct` — and friends like `arrayOf`, `recordOf`, or `oneOf`.

### Primitive guards

Built-in primitives: `isString`, `isNumber` (finite), `isBoolean`, `isBigInt`, `isSymbol`, `isUndefined`, `isNull` — and a preset `isPrimitive` for any primitive.

Numeric helpers are included for common cases: `isInteger`, `isSafeInteger`, `isPositive`, `isNegative`, `isZero`, `isNaN`, `isInfiniteNumber`.

```ts
import {
  isPrimitive,
  isNumber,
  isInteger,
  isSafeInteger,
  isPositive,
  isNegative,
  isZero,
  isNaN,
  isInfiniteNumber
} from 'is-kit';

// Any primitive
isPrimitive('x'); // true
isPrimitive(123); // true
isPrimitive(NaN); // true (use isNumber for finite only)
isPrimitive({}); // false

// Numeric helpers
isNumber(10); // true
isInteger(42); // true
isSafeInteger(2 ** 53); // false
isPositive(3); // true
isPositive(0); // false
isNegative(-3); // true
isNegative(-0); // false
isZero(0); // true
isZero(1); // false
isNaN(NaN); // true
isNaN(0); // false
isInfiniteNumber(Infinity); // true
isInfiniteNumber(1); // false
```

## Core Ideas

- **Define once**: `define<T>(fn)` turns a plain function into a type guard.
- **Upgrade predicates**: `predicateToRefine(fn)` adds narrowing.
- **Compose freely**: `and`, `or`, `not`, `oneOf`, `arrayOf`, `struct` …
- **Stay ergonomic**: helpers like `nullable`, `optional`, `equals`, `safeParse`, `assert`, `hasKey`, `narrowKeyTo`.

### Key Helpers

Use `hasKey` to check for a required own property before refining, and
`narrowKeyTo` when you need to narrow a property to a specific literal value.

```ts
import { hasKey, isString, isNumber, narrowKeyTo, or, struct } from 'is-kit';

// Base guard (e.g., via struct)
type User = { id: string; age: number; role: 'admin' | 'guest' | 'trial' };
const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial')
});

const hasRole = hasKey('role');
const byRole = narrowKeyTo(isUser, 'role');
const isGuest = byRole('guest'); // Readonly<User> & { role: 'guest' }
const isTrial = byRole('trial'); // Readonly<User> & { role: 'trial' }
const isGuestOrTrial = or(isGuest, isTrial);

declare const value: unknown;
if (hasRole(value)) {
  value.role;
}

if (isGuestOrTrial(value)) {
  // value.role is 'guest' | 'trial'
}
```

## API Reference

For full API details and runnable examples, visit

[📚 See full document](https://is-kit-docs.vercel.app/)

## Development

Requires Node 22 and pnpm 10.12.4 (via Corepack or mise).
Want to hack on `is-kit`?
See `DEVELOPER.md` for setup, scripts, and contribution workflow.

## Contributing

See `CONTRIBUTE.md` for workflow, commit style, and tool setup. 🚀
