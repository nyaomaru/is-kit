# is-kit

<p align="center">
    <img src="https://raw.githubusercontent.com/nyaomaru/is-kit/docs/public/iskit_logo1.svg" width="200px" align="center" alt="is-kit logo" />
</p>

Lightweight, zero-dependency toolkit for building `isFoo` style type guards in TypeScript.
Runtime-safe 🛡️, composable 🧩, and ergonomic ✨.

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
  predicateToRefine,
  and,
  or,
  not,
  isString,
  isNumber,
} from 'is-kit';

// 1. define small pieces
const isShortString = define<string>(
  (value) => isString(value) && value.length <= 3
);
const isPositive = predicateToRefine<number>((num) => num > 0);

// 2. compose them
const isPositiveNumber = and(isNumber, isPositive);
const shortOrPositive = or(isShortString, isPositiveNumber);
const isOther = not(shortOrPositive);

// 3. use them
shortOrPositive('foo'); // true
shortOrPositive(42); // true
isOther(false); // true
```

These primitives plug into higher-level combinators like `struct` when you need to shape objects.

## Core Ideas

- **Define once**: `define<T>(fn)` turns a plain function into a type guard.
- **Upgrade predicates**: `predicateToRefine(fn)` adds narrowing.
- **Compose freely**: `and`, `or`, `not`, `oneOf`, `arrayOf`, `struct` …
- **Stay ergonomic**: helpers like `nullable`, `optional`, `equals`, `safeParse`.

## API Reference

👉 See the docs app under `docs/` (API Reference section). Each helper is documented with runnable examples.

## Development

Requires Node 22 and pnpm 10.12.4 (via Corepack or mise).
Want to hack on `is-kit`?
See `DEVELOPER.md` for setup, scripts, and contribution workflow.

## Contributing

See `CONTRIBUTE.md` for workflow, commit style, and tool setup. 🚀
