# is-kit

<p align="center">
    <img src="https://raw.githubusercontent.com/nyaomaru/is-kit/main/docs/public/iskit_image.png" width="600px" align="center" alt="is-kit logo" />
</p>

<p align="center">
    <a href="(https://www.npmjs.com/package/is-kit">
        <img src="https://img.shields.io/npm/v/is-kit.svg" alt="npm version">
    </a>
    <a href="https://jsr.io/@nyaomaru/is-kit">
        <img src="https://img.shields.io/jsr/v/@nyaomaru/is-kit" alt="JSR">
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
  predicateToRefine,
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
  nickname: optional(isShortString), // string <= 3 | undefined
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

## Core Ideas

- **Define once**: `define<T>(fn)` turns a plain function into a type guard.
- **Upgrade predicates**: `predicateToRefine(fn)` adds narrowing.
- **Compose freely**: `and`, `or`, `not`, `oneOf`, `arrayOf`, `struct` …
- **Stay ergonomic**: helpers like `nullable`, `optional`, `equals`, `safeParse`.

## API Reference

For full API details and runnable examples, visit

[📚 See full document](https://is-kit-docs.vercel.app/)

## Development

Requires Node 22 and pnpm 10.12.4 (via Corepack or mise).
Want to hack on `is-kit`?
See `DEVELOPER.md` for setup, scripts, and contribution workflow.

## Contributing

See `CONTRIBUTE.md` for workflow, commit style, and tool setup. 🚀
