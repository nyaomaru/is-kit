# Test Packed Artifacts From a Consumer Project

**Captured:** 2026-08-02
**Updated:** 2026-10-09
**Context:** Verifying that the npm artifact consumers install matches the source-level public API contract.
**Tags:** release-safety, packaging, npm, esm, commonjs, typescript, smoke-testing, ci, nodenext

## Problem

Source-level runtime and type tests can pass while the published package is
broken. In is-kit, type tests map `is-kit` directly to `src/index.ts`, so they do
not exercise `package.json` export conditions, generated `dist` files, the
published file allowlist, or consumer-side declaration resolution.

A successful build is also insufficient: it proves that artifacts were
generated, but not that Node and TypeScript can resolve them through the packed
package metadata.

## Solution

Build the package, create the real npm tarball, and install that tarball into a
temporary consumer project. Run independent checks through the installed
package name:

1. Import runtime exports from an ESM file.
2. Require runtime exports from a CommonJS file.
3. Compile two strict `NodeNext` TypeScript projects from that same install:
   an explicit `.mts` ES module and an explicit `.cts` CommonJS module. A
   `.ts` file in a `"type": "module"` package is only implicitly ESM.

Set `compilerOptions.types` to `[]` so `@types` packages in parent directories
cannot leak into the consumer. Keep one install; do not pack or install a
second tarball for the second module format.

NodeNext still matches the published `types` condition from both modes. A
single `./dist/index.d.ts` can be valid for both. Add `.d.mts` / `.d.cts`
export targets only when one of these compiles fails.

Use a temporary npm cache so the smoke test does not depend on or mutate the
developer's global cache. Install only the local tarball with lifecycle scripts,
audits, funding output, and lockfile generation disabled. Always remove the
temporary project in a `finally` block.

Run this check on pull requests that change the build and again immediately
before npm publication. The source-level exact export contract and packed
consumer smoke cover different failure modes, so retain both.

## Example

```js
run('npm', ['pack', '--pack-destination', packageDirectory], repositoryRoot);
run('npm', ['install', '--ignore-scripts', '--no-audit', tarballPath]);

run(process.execPath, ['esm-smoke.mjs']);
run(process.execPath, ['cjs-smoke.cjs']);
run(process.execPath, [typescriptCli, '--project', 'tsconfig.esm.json']);
run(process.execPath, [typescriptCli, '--project', 'tsconfig.cjs.json']);
```

Discover the generated `.tgz` in the isolated package directory instead of
depending on human-oriented npm stdout. This remains stable when command
wrappers or environment settings alter npm output formatting.

## When To Use

Use this pattern before releases and whenever package exports, entry points,
build output, declaration bundling, or the npm `files` list changes. It is
especially important before a major-version public export cleanup because it
confirms that intentional removals do not mask unrelated ESM, CommonJS, or type
resolution regressions.

Verify with:

```sh
pnpm build
pnpm test:package
pnpm lint
pnpm test
pnpm test:types
```

## Related Files

- `tests/package-smoke.mjs`
- `package.json`
- `mise.toml`
- `.github/workflows/build.yaml`
- `.github/workflows/npm-publish.yaml`
- `tests-d/index.test-d.ts`
