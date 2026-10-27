# Core Performance Workloads

Run `pnpm build`, then run `pnpm bench:core` to measure the current built
package on mixed primitive and boundary-schema inputs.

The script reports median absolute nanoseconds per call, its Node version, and
the input match count. It is intentionally opt-in and has no CI threshold:
machine-specific microbenchmarks are evidence for investigating a reported
workload, not release targets.

Before changing an implementation for performance, record the workload and
the runtime/type contract that must remain unchanged. Compare absolute results
and explain why they outweigh the compositional implementation's clarity and
coverage. Add targeted regression tests for the motivating edge case.

For the required-only exact `struct` optimization, use
`node bench/struct-exact.mjs <baseline-index.mjs>` after building both revisions.
The script compares the actual built packages, alternates measurement order,
and checks match counts. See [setup and results](struct-exact-results.md) for
the baseline revision, reproduction steps, compatibility constraints, and
measurements.

`node bench/struct-exact-mixed.mjs <baseline-index.mjs>` broadens that comparison
to 64-object corpora, mixed valid/invalid payloads, different object layouts,
and wider schemas. `node tests/struct-exact-compatibility.mjs <baseline-index.mjs>`
compares return values, exceptions, getters, and Proxy traps across a systematic
fixture matrix. Both commands use the same saved baseline bundle.

For required/optional `struct` field traversal, use
`node bench/struct-loops.mjs <baseline-index.mjs> [candidate-index.mjs] [workload-filter]`.
The candidate defaults to `dist/index.mjs`. It compares 64-input corpora for
2-, 6-, and 20-field schemas, early/middle/late failures, absent and present
optional keys, nested schemas, and mixed results. Exact-mode controls keep
the existing exactness implementation fixed. See [setup and results](struct-loops-results.md)
for the loop comparison and reproduction steps.
