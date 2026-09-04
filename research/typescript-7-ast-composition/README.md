# TypeScript 7 AST Composition Evidence

This directory preserves the fixture matrix used to decide how is-kit should
describe TypeScript Compiler API composition. It is research evidence, not a
normal compatibility suite or a nightly-monitoring job.

The result is recorded in the bundled [research report](./report.md):

- TypeScript 7's shipped broad `Node` and `Expression` inputs are not
  discriminated unions, so direct `kind` comparisons do not replace `isX`
  predicates for those inputs.
- `refineKey`, `refineDefinedKey`, and `refineIndex` preserve reusable
  parent-property intersections without handwritten predicate annotations.
- Generic controls reproduce the same result without importing TypeScript, so
  the capability belongs to generic property refinement rather than an
  AST-specific is-kit API.

## Run the frozen matrix

From the repository root:

```bash
node research/typescript-7-ast-composition/run.mjs
```

The runner packs the current repository, creates isolated temporary consumers,
installs the exact compiler versions below, and emits declarations for the
strict baseline plus three `exactOptionalPropertyTypes` /
`noUncheckedIndexedAccess` combinations:

- TypeScript 6.0.3
- TypeScript 7.0.2
- TypeScript 7.1.0-dev.20260902.1

Network access is required for the isolated package installs. Pass `--keep` to
retain the temporary consumers printed by the runner for inspection.

## Fixture roles

- `fixtures/ts6/matrix.ts` exercises the TypeScript 6 package-root Compiler
  API.
- `fixtures/ts7/matrix.ts` exercises `typescript/unstable/ast` in the stable
  TypeScript 7 release and the pinned nightly.
- `fixtures/ts7/kind-probes.ts` distinguishes broad AST base interfaces from a
  generated discriminated-union control.
- `fixtures/common/generic-controls.ts` assigns ownership by reproducing the
  same property-refinement behavior on ordinary TypeScript types.

## Revisit gate

Do not update the pinned nightly merely because the rolling `next` tag moves.
Re-run the investigation only when TypeScript publishes a stable AST
programmatic API that replaces the unstable entry point. At that point, update
the fixtures to the stable surface, re-check the broad input model and emitted
predicate types, and then decide whether the documentation conclusion changes.
