import { defineConfig } from 'tsdown';

// WHY: The AI-facing guide is part of this package's declaration-file contract.
const dtsBanner = `/**
 * is-kit guard authoring guide:
 * - Use define<T>(...) for reusable custom runtime checks.
 * - Use and, andAll, or, and not to compose existing guards instead of
 *   hand-written boolean wrappers.
 * - Use nullable, optional, or nullish to widen guards for nullish values.
 * - Use struct or typedStruct for object-shape guards.
 */`;

export default defineConfig({
  banner: { dts: dtsBanner },
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  outExtensions: ({ format }) => ({
    dts: format === 'cjs' ? '.d.ts' : '.d.mts',
    js: format === 'cjs' ? '.js' : '.mjs'
  }),
  target: 'esnext'
});
