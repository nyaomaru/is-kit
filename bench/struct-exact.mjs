import assert from 'node:assert/strict';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as current from '../dist/index.mjs';

const baselinePath = process.argv[2];
if (!baselinePath) {
  throw new Error('Usage: node bench/struct-exact.mjs <baseline-index.mjs>');
}
const baseline = await import(pathToFileURL(resolve(baselinePath)).href);

const WARMUP_ITERATIONS = 100_000;
const MEASURED_ITERATIONS = 1_000_000;
const SAMPLE_COUNT = 11;

const createGuards = ({
  struct,
  isString,
  isNumber,
  isBoolean,
  optionalKey
}) => {
  const schema = {
    id: isString,
    name: isString,
    active: isBoolean,
    age: isNumber
  };
  return {
    flat: struct(schema, { exact: true }),
    nonExact: struct(schema),
    nested: struct(
      {
        ...schema,
        address: struct({ city: isString, zip: isString }, { exact: true })
      },
      { exact: true }
    ),
    optional: struct(
      { ...schema, nickname: optionalKey(isString) },
      { exact: true }
    )
  };
};

const valid = { id: '1', name: 'Ada', active: true, age: 30 };
const hiddenRequired = Object.defineProperty({ ...valid }, 'id', {
  enumerable: false
});
const workloads = [
  { name: 'valid flat object', guard: 'flat', input: valid, expected: true },
  {
    name: 'wrong early field',
    guard: 'flat',
    input: { ...valid, id: 1 },
    expected: false
  },
  {
    name: 'wrong late field',
    guard: 'flat',
    input: { ...valid, age: '30' },
    expected: false
  },
  {
    name: 'extra key',
    guard: 'flat',
    input: { ...valid, extra: true },
    expected: false
  },
  {
    name: 'nested exact struct',
    guard: 'nested',
    input: { ...valid, address: { city: 'Tokyo', zip: '100-0001' } },
    expected: true
  },
  {
    name: 'reordered flat object',
    guard: 'flat',
    input: { age: 30, active: true, name: 'Ada', id: '1' },
    expected: true
  },
  {
    name: 'non-enumerable required key',
    guard: 'flat',
    input: hiddenRequired,
    expected: true
  },
  {
    name: 'optional key absent',
    guard: 'optional',
    input: valid,
    expected: true
  },
  {
    name: 'optional key present',
    guard: 'optional',
    input: { ...valid, nickname: 'A' },
    expected: true
  },
  {
    name: 'non-exact flat object',
    guard: 'nonExact',
    input: valid,
    expected: true
  }
];

const run = (guard, input, iterations) => {
  let matches = 0;
  for (let index = 0; index < iterations; index += 1) {
    if (guard(input)) matches += 1;
  }
  return matches;
};

const median = (samples) =>
  [...samples].sort((left, right) => left - right)[
    Math.floor(samples.length / 2)
  ];

const implementations = [createGuards(baseline), createGuards(current)];
console.log(`Node ${process.version} on ${process.platform}/${process.arch}`);
console.log(`CPU: ${cpus()[0]?.model ?? 'unknown'}`);
console.log(
  `Median of ${SAMPLE_COUNT} paired samples; ${WARMUP_ITERATIONS.toLocaleString()} warm-up calls per implementation; ${MEASURED_ITERATIONS.toLocaleString()} calls per sample. Measurement order alternates.`
);
console.log('| Workload | Baseline ns/call | Current ns/call | Speedup |');
console.log('| --- | ---: | ---: | ---: |');

for (const workload of workloads) {
  const guards = implementations.map((guards) => guards[workload.guard]);
  for (const guard of guards) {
    assert.equal(guard(workload.input), workload.expected, workload.name);
    run(guard, workload.input, WARMUP_ITERATIONS);
  }

  const samples = [[], []];
  for (let sample = 0; sample < SAMPLE_COUNT; sample += 1) {
    const order = sample % 2 === 0 ? [0, 1] : [1, 0];
    for (const index of order) {
      const startedAt = performance.now();
      const matches = run(guards[index], workload.input, MEASURED_ITERATIONS);
      samples[index].push(
        ((performance.now() - startedAt) * 1_000_000) / MEASURED_ITERATIONS
      );
      assert.equal(matches, workload.expected ? MEASURED_ITERATIONS : 0);
    }
  }

  const [before, after] = samples.map(median);
  console.log(
    `| ${workload.name} | ${before.toFixed(2)} | ${after.toFixed(2)} | ${(before / after).toFixed(2)}x |`
  );
}
