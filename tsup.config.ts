import { defineConfig } from 'tsup';

// WHY: tsup's declaration bundling drops entry-file comments, so the AI-facing
// guide must be attached as a dts banner to appear at the top of dist/index.d.ts.
const dtsBanner = `/**
 * is-kit guard authoring guide:
 * - Use define<T>(...) for reusable custom runtime checks.
 * - Use and, andAll, or, and not to compose existing guards instead of
 *   hand-written boolean wrappers.
 * - Use nullable, optional, or nullish to widen guards for nullish values.
 * - Use struct or typedStruct for object-shape guards.
 */`;

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    banner: dtsBanner
  },
  clean: true,
  outDir: 'dist',
  target: 'esnext'
});
