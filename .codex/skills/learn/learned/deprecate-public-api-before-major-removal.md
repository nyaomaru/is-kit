# Deprecate Public APIs Before Major Removal

**Captured:** 2026-08-01
**Context:** Cleaning up root exports that are implemented and used as internal helpers but have already shipped as public API.
**Tags:** api-design, backward-compatibility, deprecation, exports, release-safety, tsd

## Problem

Barrel exports can expose implementation helpers without a deliberate
user-facing design. Removing those exports immediately would break consumers,
while keeping them forever makes the root API harder to understand and expands
the semantic-versioning surface. Missing documentation or discoverable public
usage is useful evidence, but it does not prove that private consumers do not
import an export.

## Solution

Inventory runtime and type-only exports separately, then give every export an
explicit keep, deprecate, or remove classification.

For a runtime export selected for removal:

1. Keep the export available for the rest of the current major version.
2. Add an editor-visible `@deprecated` notice and a concrete migration path.
3. Record the planned removal in the changelog and major-version migration
   guide.
4. Keep the exact root-export contract unchanged until the major release.
5. In the next major, remove only the public re-export when the implementation
   is still useful internally, then update the exact export contract.

Do not create a new public utility subpath solely to relocate accidental API.
Require a concrete standalone use case before adding another public boundary.
Treat type-only exports separately: they have no runtime or bundle cost, so
remove them only when a specific maintenance or correctness problem justifies
the break.

## Example

```ts
// v1: keep the compatibility export while the definition is deprecated.
export { everyArrayValue } from './utils/guard-collections';

// v2: remove the root re-export. Internal combinators may still import the
// implementation directly from utils/guard-collections.
```

For is-kit v2, this process classified all 79 runtime root exports: 73 remain
public, while six iteration adapters are deprecated during v1 and removed from
the v2 root entry point.

## When To Use

Use this pattern when a shipped root export looks internal, redundant, poorly
documented, or inconsistent with the library's public mental model. It is
especially important when barrel exports made the original public exposure
easy to overlook.

Validate similar changes with the exact root export contract, runtime and type
tests, lint, and a package build:

```sh
pnpm lint
pnpm build
pnpm test
pnpm test:types
```

## Related Files

- `src/index.ts`
- `src/utils/guard-collections.ts`
- `src/utils/to-boolean-predicates.ts`
- `tests-d/index.test-d.ts`
- `v2-design.md`
