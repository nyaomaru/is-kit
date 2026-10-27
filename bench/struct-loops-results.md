# Struct Field Traversal Benchmark

Issue: [#339](https://github.com/nyaomaru/is-kit/issues/339).

## Scope and decision

Replace `Array.prototype.every` callbacks with `for...of` loops in the two
required/optional field-validation helpers. Read tuple members directly while
keeping the existing precomputed `[key, guard]` arrays. Keep standalone guard
calls: `entry[1](value)` would change the predicate's `this` receiver.

Required fields still run before optional fields, in their original relative
order. Each field checks ownership before reading its value. Missing optional
fields skip their guard. Failure short-circuits and exceptions propagate.
There are no public API or type changes.

The baseline already includes the required-only exact optimization from #337.
That path, schema construction, plain-object checks, and the allowed-key set
are unchanged. The main workloads use non-exact structs to isolate traversal;
the two exact controls use the same exactness logic in both builds.

## Setup and reproduction

- Baseline: `0497cbfe4cda6b83dd3b58c1859bde728be2cf76`.
- Measured on 2026-10-27 with Node 22.23.4, Linux x64.
- CPU: AMD Ryzen 9 7900 12-Core Processor.
- Both packages built with `mise exec -- pnpm build`.
- Schemas, guards, and 64-object corpora are constructed before timing.
  Number/string fields and values vary across the corpus; failed fields use
  a boolean that neither guard accepts.
- Each implementation receives 128,000 warm-up calls per workload, followed
  by 11 paired samples of 512,000 calls. Measurement order alternates.
- Reported times are medians in nanoseconds per call. Acceptance counts are
  checked for warm-up and every sample, including the 75%-valid mixed corpus.
- These are local microbenchmarks, not application-throughput estimates or CI
  performance thresholds. They measure the combined callback/destructuring
  change, without assigning separate gains to each operation.

Preserve the built ESM bundle from a separate baseline checkout:

```sh
# In a checkout at 0497cbfe4cda6b83dd3b58c1859bde728be2cf76:
mise exec -- pnpm build
cp dist/index.mjs /tmp/is-kit-339-baseline.mjs

# In the checkout containing this change:
mise exec -- pnpm build
mise exec -- node bench/struct-loops.mjs /tmp/is-kit-339-baseline.mjs

# Optional: isolate a workload in a fresh process.
mise exec -- node bench/struct-loops.mjs /tmp/is-kit-339-baseline.mjs dist/index.mjs '20 required / valid'
```

For the indexed alternative, replace each `for (const entry of entries) {`
header with `for (let index = 0; index < entries.length; index += 1) {` and
`const entry = entries[index];`, leaving both direct member reads and all other
code unchanged. Build and save that bundle separately; the benchmark's second
argument accepts any candidate ESM bundle. This also allows direct comparison
of the loop forms.

## Selected loops versus callbacks

First full-process run:

| Workload                                        | Baseline ns/call | For-of ns/call | Speedup |
| ----------------------------------------------- | ---------------: | -------------: | ------: |
| 2 required / valid                              |            50.69 |          43.62 |   1.16x |
| 2 required / first failure                      |            33.09 |          29.36 |   1.13x |
| 2 required / middle failure                     |            47.64 |          43.02 |   1.11x |
| 2 required / last failure                       |            47.30 |          43.21 |   1.09x |
| 6 required / valid                              |           107.75 |          99.54 |   1.08x |
| 6 required / first failure                      |            34.42 |          30.97 |   1.11x |
| 6 required / middle failure                     |            76.49 |          72.64 |   1.05x |
| 6 required / last failure                       |           102.87 |          96.97 |   1.06x |
| 20 required / valid                             |           332.99 |         312.69 |   1.06x |
| 20 required / first failure                     |            38.84 |          34.60 |   1.12x |
| 20 required / middle failure                    |           224.09 |         211.65 |   1.06x |
| 20 required / last failure                      |           350.90 |         330.73 |   1.06x |
| 2 required + 6 optional / absent                |            87.94 |          77.37 |   1.14x |
| 2 required + 6 optional / valid                 |           127.14 |         104.17 |   1.22x |
| 2 required + 6 optional / first invalid         |            67.17 |          57.64 |   1.17x |
| 2 required + 6 optional / middle invalid        |           104.89 |          88.91 |   1.18x |
| 2 required + 6 optional / last invalid          |           127.36 |         106.45 |   1.20x |
| nested (3 levels, 6 fields each) / valid        |           321.46 |         292.93 |   1.10x |
| nested (3 levels, 6 fields each) / deep failure |           304.30 |         285.27 |   1.07x |
| 6 required / mixed (75% valid)                  |            99.08 |          90.89 |   1.09x |
| exact control / 6 required                      |           118.33 |         112.09 |   1.06x |
| exact control / 6 required + optional           |           148.15 |         138.20 |   1.07x |

For two fields, the middle and last failure positions coincide. The nested
workloads have six fields at each level, including the child field, with the
failure at the last leaf field.

The initial valid required-field measurements save 7.07–20.30 ns/call
(about 6–14% of elapsed time). Present optional fields save 22.97 ns/call
(18%), and successful nested validation saves 28.53 ns/call (9%). The
improvement extends to early failures and the mixed corpus, which supports
the small increase in helper code without changing public composition.

A second full-process run confirmed the successful required, optional, and
nested workloads, with some process-dependent results in the controls:

| Workload                                 | Baseline ns/call | For-of ns/call | Speedup |
| ---------------------------------------- | ---------------: | -------------: | ------: |
| 2 required / valid                       |            51.39 |          43.14 |   1.19x |
| 6 required / valid                       |           105.99 |          97.59 |   1.09x |
| 20 required / valid                      |           361.88 |         329.43 |   1.10x |
| 20 required / first failure              |            41.16 |          43.69 |   0.94x |
| 2 required + 6 optional / absent         |            86.92 |          77.07 |   1.13x |
| 2 required + 6 optional / valid          |           126.35 |         103.10 |   1.23x |
| nested (3 levels, 6 fields each) / valid |           315.48 |         287.80 |   1.10x |
| 6 required / mixed (75% valid)           |           268.26 |         220.14 |   1.22x |
| exact control / 6 required               |           127.73 |         133.24 |   0.96x |
| exact control / 6 required + optional    |           148.38 |         138.73 |   1.07x |

The twenty-field first-failure and required-only exact cases regressed in
this run. Fresh processes filtered to those workloads measured 30.52 → 26.29
and 139.53 → 105.80 ns/call, respectively. The unusually high mixed-corpus
times also did not persist: a filtered process measured 99.62 → 94.84 ns/call.
These variations limit confidence in a specific speedup for any one control;
the repeatable gains are strongest on successful traversal and optional
fields. The data does not establish a universal speedup.

## Indexed alternative

A separate full-process comparison of callbacks against indexed loops with
direct member access also improved all workloads. Representative measurements:

| Workload                                 | Callback ns/call | Indexed ns/call | Speedup |
| ---------------------------------------- | ---------------: | --------------: | ------: |
| 2 required / valid                       |            49.21 |           41.49 |   1.19x |
| 6 required / valid                       |           105.77 |           95.15 |   1.11x |
| 20 required / valid                      |           353.49 |          329.34 |   1.07x |
| 2 required + 6 optional / absent         |            88.64 |           78.11 |   1.13x |
| 2 required + 6 optional / valid          |           127.37 |          105.26 |   1.21x |
| nested (3 levels, 6 fields each) / valid |           305.05 |          269.33 |   1.13x |

Absolute timings differ between processes, so these rows alone do not rank
indexed versus `for...of` traversal.

A third full-process run directly compared `for...of` against indexed loops.
Most cases differed by about 0–3%, including 42.42 → 41.39 ns/call for two
required fields, 328.76 → 328.07 for twenty, and 287.81 → 280.75 for nested
structs. Present valid optional fields regressed from 107.30 to 181.65 ns/call
with indexed traversal in this process, despite improving against callbacks
in the earlier run. This process-dependent result limits any claim that
indexed traversal is consistently faster. Retain the simpler `for...of` form:
the material improvement is removing the callback and per-entry tuple
destructuring, and indexed traversal has no convincing additional benefit.

## Validation

- `mise exec -- pnpm build` passed.
- `mise exec -- pnpm test --runInBand` passed: 24 suites, 265 tests.
- `mise exec -- pnpm test:types` passed, including the property-refinement
  TypeScript project.
- The library source and changed runtime test passed a focused `tsc --noEmit`
  check using a temporary config extending `tests/tsconfig.json`, with the
  installed Jest and transitive Node types explicitly resolved.
- `mise exec -- pnpm lint` fails on duplicate declarations in the pre-existing
  untracked `example.ts`. `mise exec -- pnpm lint --ignore-pattern example.ts`
  passed. That file was left untouched.
- The new tests cover traversal order, early failure, inherited fields,
  absent optional fields, hidden own fields, standalone predicate receivers,
  guard-driven optional-key mutation, and optional-guard exceptions, in both
  exact and non-exact modes.
- The existing differential matrix matched 248,837 baseline/current cases
  independently for ESM and CJS, including results, getter order, Proxy traps,
  and exceptions:

  ```sh
  mise exec -- node tests/struct-exact-compatibility.mjs /tmp/is-kit-339-baseline.mjs
  mise exec -- node tests/struct-exact-compatibility.mjs /tmp/is-kit-339-baseline.mjs dist/index.js
  ```

- Generated ESM and CJS public declarations are byte-for-byte identical to
  baseline. The ESM bundle grew from 38,611 to 38,795 bytes (+184), or from
  9,259 to 9,275 gzip bytes (+16).
