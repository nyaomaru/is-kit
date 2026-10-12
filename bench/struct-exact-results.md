# Required-only Exact Struct Benchmark

Issue: [#337](https://github.com/nyaomaru/is-kit/issues/337).

## Compatibility constraint

The proposed `Object.keys(input).length === requiredEntries.length` check is
not equivalent to the existing exactness contract. Required own fields may be
non-enumerable. For example, a valid `{ id, age }` with a non-enumerable `id`
has only one enumerable key, while adding an enumerable `extra` brings the
count back to two despite violating exactness. Getters or guards can also
change keys after earlier required fields have passed validation.

Instead, after the existing required-field checks, the required-only exact
path enumerates keys once and:

1. Rejects a count greater than the number of schema keys.
2. Accepts each key that matches the schema key at the same index without a
   `Set.has` lookup.
3. Uses the existing allowed-key set for each mismatching index.

Matching schema order is a sufficient condition for membership, rather than
a requirement. Reordered objects and non-enumerable required fields retain
membership validation. Optional schemas keep the existing validation path.
There are no new public APIs, dependencies, or type changes.

## Setup and reproduction

- Baseline: `416099be18cf83364b5928a5514ae75a6781c6ed`.
- Runtime: Node 22.22.0, Linux x64.
- CPU: AMD Ryzen 9 7900 12-Core Processor.
- Both revisions built with `mise exec -- pnpm build` using the same toolchain.
- Guards are built before timing. Each workload uses one fixed input object.
- 100,000 warm-up calls per implementation and workload.
- 11 paired samples of 1,000,000 calls per implementation; measurement order
  alternates between baseline-first and current-first.
- Results are medians in nanoseconds per call. Each sample's acceptance count
  is checked, including rejected inputs.

Build the baseline revision in a separate checkout, preserving its generated
ESM bundle before building the changed revision:

```sh
# In the baseline checkout at 416099be18cf83364b5928a5514ae75a6781c6ed:
mise exec -- pnpm build
cp dist/index.mjs /tmp/is-kit-337-baseline.mjs

# In the checkout containing this change:
mise exec -- pnpm build
mise exec -- node bench/struct-exact.mjs /tmp/is-kit-337-baseline.mjs
```

## Results

Measured on 2026-10-12:

| Workload                    | Baseline ns/call | Current ns/call | Speedup |
| --------------------------- | ---------------: | --------------: | ------: |
| valid flat object           |           110.39 |           96.13 |   1.15x |
| wrong early field           |            40.83 |           39.82 |   1.03x |
| wrong late field            |            83.05 |           82.92 |   1.00x |
| extra key                   |           115.51 |           94.49 |   1.22x |
| nested exact struct         |           198.32 |          171.13 |   1.16x |
| reordered flat object       |           107.65 |          107.99 |   1.00x |
| non-enumerable required key |           105.10 |          103.51 |   1.02x |
| optional key absent         |           115.54 |          115.88 |   1.00x |
| optional key present        |           120.53 |          121.34 |   0.99x |
| non-exact flat object       |            87.45 |           89.50 |   0.98x |

The same-order successful flat and nested workloads improved by about 13%
and 14% in elapsed time, respectively. Other workloads remained close to
baseline, with the extra-key rejection improving by about 18%. These are
local microbenchmarks, not a claim about application throughput or a CI
performance threshold.

A second process run measured the valid flat case at 107.15 → 96.60 ns/call
and nested exact case at 193.95 → 170.19 ns/call, confirming the improvement.
A final rebuild and process run measured 112.04 → 98.00 ns/call for valid
flat inputs and 199.73 → 173.83 ns/call for nested exact inputs. Non-exact
flat validation measured 88.09 → 91.46 ns/call in that run: across these
runs, this control showed a small 2–4% increase (roughly 2–3 ns/call).
The optimization therefore trades a small cost on the non-exact control
for a larger reduction on the targeted required-only exact workload.

The ESM bundle grew from 32,761 to 33,112 bytes (+351), or from 8,019 to
8,090 gzip bytes (+71). Generated public declarations are byte-for-byte
identical to the baseline.

## Validation

- Build passed.
- All 24 runtime suites / 220 tests passed.
- `pnpm test:types` passed, including exact-mode inference and narrowing.
- An additional `tsc --noEmit -p tests/tsconfig.json` check fails in unchanged
  test files (Node/Deno type availability, consumer fixtures, and guard/mock
  signatures). The modified struct runtime test and library source were also
  checked separately with a temporary config extending `tests/tsconfig.json`.
  That focused check passed.
- Lint passed with the pre-existing untracked `example.ts` excluded. The
  unmodified `pnpm lint` command fails on duplicate declarations in that file.
- Regression coverage includes hidden required fields with and without extra
  keys, key reordering, numeric keys, null-prototype objects, inherited fields,
  symbols, non-enumerable extra fields, empty schemas, getter-driven key
  mutation, enumeration order relative to validation, and nested exact structs.

## Post-commit review

Reviewed implementation commit `4a48080` against its parent. No behavior
mismatch was found. The fast path still enumerates with `Object.keys` after
required-field validation. A key-count overflow necessarily contains an
extra key, while a positional match necessarily belongs to the private
schema-key snapshot. Every other key goes through the original set. This
remains true when guards or getters remove fields, change enumerability,
or add fields during validation.

The initial tests did not explicitly cover early-failure suppression of
later getters and enumeration, enumeration exceptions, removal of an
already-validated required field by a guard, or required-only exact
`typedStruct` schemas. Added regression tests for those cases without
changing the implementation.

`tests/struct-exact-compatibility.mjs` matched 248,837 baseline/current cases:
all combinations of three key sets (ordinary, special names, and numeric),
required/optional masks, exact/non-exact modes, missing/valid/invalid/hidden/
getter/throwing fields, three prototype layouts, forward/reverse key order,
and four extra-key configurations. Selected cases also compare every Proxy
trap, and five cases exercise guard-driven mutation. Both implementations
receive independently constructed fixtures so mutations cannot contaminate
the comparison.

The additional corpus benchmark rotates 64 inputs per workload rather than
repeatedly validating one object. Objects are constructed before timing;
11 alternating paired samples follow 128,000 warm-up calls, with 1,024,000
calls per measured sample. Match counts are checked against the known
accepted fraction on every warm-up and sample.

| Workload                             | Baseline ns/call | Current ns/call | Speedup |
| ------------------------------------ | ---------------: | --------------: | ------: |
| 64 valid JSON payloads               |           106.79 |           93.16 |   1.15x |
| 64 mixed payloads (75% valid)        |            99.35 |           85.71 |   1.16x |
| 64 heterogeneous valid objects       |           126.39 |          115.71 |   1.09x |
| 64 reversed-key valid objects        |           110.10 |          107.81 |   1.02x |
| 64 nested valid JSON payloads        |           196.26 |          170.06 |   1.15x |
| 64 wide valid objects (16 fields)    |           379.52 |          334.60 |   1.13x |
| 64 reversed wide objects (16 fields) |           379.13 |          389.92 |   0.97x |
| 64 optional-key valid payloads       |           118.50 |          119.90 |   0.99x |
| 64 non-exact mixed payloads          |            78.66 |           81.16 |   0.97x |

The target benefit holds for varied inputs and for mixed validation results,
but this is not a universal speedup: the wide reversed-key control is about
3% slower, as is the non-exact mixed control. The optimization favors
required-only exact objects whose key order matches the schema.

A second full-corpus process run again improved valid JSON payloads
(109.35 → 99.75 ns/call), mixed payloads (101.55 → 88.31), nested payloads
(194.98 → 166.86), and same-order wide objects (380.79 → 334.25).
The non-exact control remained slightly slower (78.13 → 79.87).
Reversed wide objects varied substantially in that run (454.98 → 397.31),
so this particular full-run result should not be treated as a stable win.

Fresh processes filtered to individual workloads confirmed valid flat JSON
payloads at 108.66 → 95.38 ns/call and nested JSON payloads at
196.07 → 171.93 ns/call, both about 12% faster in elapsed time. A process
filtered to reversed wide objects measured 304.28 → 312.56 ns/call, about
3% slower. Absolute timings depend on the process and earlier workload
profile; the data supports a targeted speedup rather than universal gains.
The filtered non-exact control measured 80.20 → 80.89 ns/call (about 1%
slower), a smaller cost than the roughly 2–4% seen in full-workload runs.

Reproduce the review using the baseline saved above:

```sh
mise exec -- node tests/struct-exact-compatibility.mjs /tmp/is-kit-337-baseline.mjs
mise exec -- node tests/struct-exact-compatibility.mjs /tmp/is-kit-337-baseline.mjs dist/index.js
mise exec -- node bench/struct-exact-mixed.mjs /tmp/is-kit-337-baseline.mjs
mise exec -- node bench/struct-exact-mixed.mjs /tmp/is-kit-337-baseline.mjs 'valid JSON'
mise exec -- node bench/struct-exact-mixed.mjs /tmp/is-kit-337-baseline.mjs 'reversed wide'
```

After the additional regression tests, all 24 runtime suites / 224 tests,
type tests, build, focused runtime-test type checking, and lint excluding
the pre-existing `example.ts` errors passed. Generated ESM and CJS public
declarations remain byte-for-byte identical to the baseline declarations.
The differential matrix passed independently for both the current ESM
and CJS bundles, 248,837 comparisons per format.
