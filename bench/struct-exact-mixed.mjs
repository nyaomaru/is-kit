import assert from 'node:assert/strict';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as current from '../dist/index.mjs';

const baselinePath = process.argv[2];
if (!baselinePath) {
  throw new Error(
    'Usage: node bench/struct-exact-mixed.mjs <baseline-index.mjs> [workload-filter]'
  );
}
const baseline = await import(pathToFileURL(resolve(baselinePath)).href);

const calls = 1_024_000;
const warmup = 128_000;
const samples = 11;
const size = 64;
const payload = (index) => ({
  id: String(index),
  name: `user-${index}`,
  active: index % 2 === 0,
  age: index
});
const flatSchema = (lib) => ({
  id: lib.isString,
  name: lib.isString,
  active: lib.isBoolean,
  age: lib.isNumber
});
const validInputs = Array.from({ length: size }, (_, index) =>
  JSON.parse(JSON.stringify(payload(index)))
);
const reordered = validInputs.map((input) => ({
  age: input.age,
  active: input.active,
  name: input.name,
  id: input.id
}));
const mixedInputs = validInputs.map((input, index) => {
  if (index % 4 !== 0) return input;
  if (index % 16 === 0) return { ...input, extra: true };
  if (index % 16 === 4) return { ...input, age: 'wrong' };
  if (index % 16 === 8) return { ...input, id: 42 };
  return null;
});
const heterogeneous = validInputs.map((input, index) => {
  if (index % 4 === 0) return reordered[index];
  if (index % 4 === 1)
    return Object.defineProperty({ ...input }, 'name', { enumerable: false });
  if (index % 4 === 2) return { ...input, [Symbol('extra')]: true };
  return Object.assign(Object.create(null), input);
});
const wideInputs = Array.from({ length: size }, (_, index) =>
  Object.fromEntries(
    Array.from({ length: 16 }, (_, key) => [`field${key}`, `value${index}`])
  )
);
const wideReordered = wideInputs.map((input) =>
  Object.fromEntries(Object.entries(input).reverse())
);
const cases = [
  [
    '64 valid JSON payloads',
    (lib) => lib.struct(flatSchema(lib), { exact: true }),
    validInputs,
    64
  ],
  [
    '64 mixed payloads (75% valid)',
    (lib) => lib.struct(flatSchema(lib), { exact: true }),
    mixedInputs,
    48
  ],
  [
    '64 heterogeneous valid objects',
    (lib) => lib.struct(flatSchema(lib), { exact: true }),
    heterogeneous,
    64
  ],
  [
    '64 reversed-key valid objects',
    (lib) => lib.struct(flatSchema(lib), { exact: true }),
    reordered,
    64
  ],
  [
    '64 nested valid JSON payloads',
    (lib) =>
      lib.struct(
        {
          ...flatSchema(lib),
          address: lib.struct(
            { city: lib.isString, zip: lib.isString },
            { exact: true }
          )
        },
        { exact: true }
      ),
    validInputs.map((input, index) => ({
      ...input,
      address: { city: `city${index}`, zip: String(index) }
    })),
    64
  ],
  [
    '64 wide valid objects (16 fields)',
    (lib) =>
      lib.struct(
        Object.fromEntries(
          Array.from({ length: 16 }, (_, index) => [
            `field${index}`,
            lib.isString
          ])
        ),
        { exact: true }
      ),
    wideInputs,
    64
  ],
  [
    '64 reversed wide objects (16 fields)',
    (lib) =>
      lib.struct(
        Object.fromEntries(
          Array.from({ length: 16 }, (_, index) => [
            `field${index}`,
            lib.isString
          ])
        ),
        { exact: true }
      ),
    wideReordered,
    64
  ],
  [
    '64 optional-key valid payloads',
    (lib) =>
      lib.struct(
        { ...flatSchema(lib), nickname: lib.optionalKey(lib.isString) },
        { exact: true }
      ),
    validInputs.map((input, index) =>
      index % 2 ? { ...input, nickname: `nick${index}` } : input
    ),
    64
  ],
  [
    '64 non-exact mixed payloads',
    (lib) => lib.struct(flatSchema(lib)),
    mixedInputs,
    52
  ]
];
// WHY: A filtered fresh process can check whether a result depends on the
// JIT profile left by earlier workloads in the full corpus comparison.
const workloadFilter = process.argv[3];
const selectedCases = cases.filter(
  ([label]) => !workloadFilter || label.includes(workloadFilter)
);
if (selectedCases.length === 0) throw new Error('No matching workload');
const run = (guard, inputs, iterations) => {
  let matches = 0;
  for (let index = 0; index < iterations; index += 1)
    if (guard(inputs[index % inputs.length])) matches += 1;
  return matches;
};
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
console.log(
  `Node ${process.version}; ${samples} paired alternating samples; ${warmup} warmup calls; ${calls} calls/sample; 64 objects/corpus.`
);
console.log(`CPU: ${cpus()[0]?.model ?? 'unknown'}`);
console.log('| Workload | Baseline ns/call | Current ns/call | Speedup |');
console.log('| --- | ---: | ---: | ---: |');
for (const [label, createGuard, inputs, expectedPerCycle] of selectedCases) {
  const guards = [baseline, current].map(createGuard);
  for (const guard of guards)
    assert.equal(
      run(guard, inputs, warmup),
      (warmup / size) * expectedPerCycle,
      label
    );
  const times = [[], []];
  for (let sample = 0; sample < samples; sample += 1) {
    for (const index of sample % 2 === 0 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      const matches = run(guards[index], inputs, calls);
      times[index].push(((performance.now() - start) * 1e6) / calls);
      assert.equal(matches, (calls / size) * expectedPerCycle, label);
    }
  }
  const [oldTime, newTime] = times.map(median);
  console.log(
    `| ${label} | ${oldTime.toFixed(2)} | ${newTime.toFixed(2)} | ${(oldTime / newTime).toFixed(2)}x |`
  );
}
