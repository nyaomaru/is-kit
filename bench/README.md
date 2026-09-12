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
