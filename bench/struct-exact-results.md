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
