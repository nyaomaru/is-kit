import assert from 'node:assert/strict';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [baselinePath, candidatePath = 'dist/index.mjs', filter = ''] =
  process.argv.slice(2);
if (!baselinePath) {
  throw new Error(
    'Usage: node bench/struct-loops.mjs <baseline-index.mjs> [candidate-index.mjs] [workload-filter]'
  );
}
const libraries = await Promise.all(
  [baselinePath, candidatePath].map(
    (path) => import(pathToFileURL(resolve(path)).href)
  )
);

const CORPUS_SIZE = 64;
const WARMUP_ITERATIONS = 128_000;
const MEASURED_ITERATIONS = 512_000;
const SAMPLE_COUNT = 11;

const requiredSchema = (library, count) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `field${index}`,
      index % 2 === 0 ? library.isNumber : library.isString
    ])
  );

const requiredInput = (count, seed) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `field${index}`,
      index % 2 === 0 ? seed + index : `value-${seed}-${index}`
    ])
  );

const workloads = [];
for (const count of [2, 6, 20]) {
  for (const [position, failedIndex] of [
    ['valid', null],
    ['first failure', 0],
    ['middle failure', Math.floor(count / 2)],
    ['last failure', count - 1]
  ]) {
    workloads.push({
      name: `${count} required / ${position}`,
      makeGuard: (library) => library.struct(requiredSchema(library, count)),
      inputs: Array.from({ length: CORPUS_SIZE }, (_, seed) => {
        const input = requiredInput(count, seed);
        if (failedIndex !== null) input[`field${failedIndex}`] = false;
        return input;
      }),
      expectedMatches: failedIndex === null ? CORPUS_SIZE : 0
    });
  }
}

for (const presence of [
  'absent',
  'valid',
  'first invalid',
  'middle invalid',
  'last invalid'
]) {
  const failedIndex = {
    'first invalid': 0,
    'middle invalid': 3,
    'last invalid': 5
  }[presence];
  workloads.push({
    name: `2 required + 6 optional / ${presence}`,
    makeGuard: (library) =>
      library.struct({
        ...requiredSchema(library, 2),
        ...Object.fromEntries(
          Array.from({ length: 6 }, (_, index) => [
            `optional${index}`,
            library.optionalKey(library.isNumber)
          ])
        )
      }),
    inputs: Array.from({ length: CORPUS_SIZE }, (_, seed) => {
      const input = requiredInput(2, seed);
      if (presence === 'absent') return input;
      for (let index = 0; index < 6; index += 1) {
        input[`optional${index}`] =
          index === failedIndex ? false : seed + index;
      }
      return input;
    }),
    expectedMatches: failedIndex === undefined ? CORPUS_SIZE : 0
  });
}

for (const invalid of [false, true]) {
  workloads.push({
    name: `nested (3 levels, 6 fields each) / ${invalid ? 'deep failure' : 'valid'}`,
    makeGuard: (library) => {
      const leaf = library.struct(requiredSchema(library, 6));
      const middle = library.struct({
        ...requiredSchema(library, 5),
        child: leaf
      });
      return library.struct({ ...requiredSchema(library, 5), child: middle });
    },
    inputs: Array.from({ length: CORPUS_SIZE }, (_, seed) => {
      const leaf = requiredInput(6, seed);
      if (invalid) leaf.field5 = false;
      return {
        ...requiredInput(5, seed),
        child: { ...requiredInput(5, seed), child: leaf }
      };
    }),
    expectedMatches: invalid ? 0 : CORPUS_SIZE
  });
}

workloads.push({
  name: '6 required / mixed (75% valid)',
  makeGuard: (library) => library.struct(requiredSchema(library, 6)),
  inputs: Array.from({ length: CORPUS_SIZE }, (_, seed) => {
    const input = requiredInput(6, seed);
    if (seed % 4 === 0) input[`field${seed % 6}`] = false;
    return input;
  }),
  expectedMatches: CORPUS_SIZE * 0.75
});

// WHY: Exact-mode controls use the same existing exactness path in both builds;
// the main workloads isolate field traversal without exact-key enumeration.
for (const optional of [false, true]) {
  workloads.push({
    name: `exact control / ${optional ? '6 required + optional' : '6 required'}`,
    makeGuard: (library) =>
      library.struct(
        {
          ...requiredSchema(library, 6),
          ...(optional ? { extra: library.optionalKey(library.isNumber) } : {})
        },
        { exact: true }
      ),
    inputs: Array.from({ length: CORPUS_SIZE }, (_, seed) => ({
      ...requiredInput(6, seed),
      ...(optional && seed % 2 === 0 ? { extra: seed } : {})
    })),
    expectedMatches: CORPUS_SIZE
  });
}

const run = (guard, inputs, iterations) => {
  let matches = 0;
  for (let index = 0; index < iterations; index += 1) {
    if (guard(inputs[index % inputs.length])) matches += 1;
  }
  return matches;
};

const median = (samples) =>
  [...samples].sort((left, right) => left - right)[
    Math.floor(samples.length / 2)
  ];

console.log(`Node ${process.version} on ${process.platform}/${process.arch}`);
console.log(`CPU: ${cpus()[0]?.model ?? 'unknown'}`);
console.log(
  `64-input corpora; median of ${SAMPLE_COUNT} paired samples; ${WARMUP_ITERATIONS.toLocaleString()} warm-up calls and ${MEASURED_ITERATIONS.toLocaleString()} measured calls per sample. Measurement order alternates.`
);
console.log('| Workload | Baseline ns/call | Candidate ns/call | Speedup |');
console.log('| --- | ---: | ---: | ---: |');

const selected = workloads.filter(({ name }) => name.includes(filter));
assert.ok(selected.length > 0, `No workloads matched: ${filter}`);
for (const workload of selected) {
  const guards = libraries.map(workload.makeGuard);
  for (const guard of guards) {
    // WHY: Verify every fixture, including failures, outside the timed region.
    assert.equal(
      run(guard, workload.inputs, CORPUS_SIZE),
      workload.expectedMatches
    );
    assert.equal(
      run(guard, workload.inputs, WARMUP_ITERATIONS),
      (WARMUP_ITERATIONS / CORPUS_SIZE) * workload.expectedMatches
    );
  }

  const samples = [[], []];
  for (let sample = 0; sample < SAMPLE_COUNT; sample += 1) {
    for (const index of sample % 2 === 0 ? [0, 1] : [1, 0]) {
      const startedAt = performance.now();
      const matches = run(guards[index], workload.inputs, MEASURED_ITERATIONS);
      samples[index].push(
        ((performance.now() - startedAt) * 1_000_000) / MEASURED_ITERATIONS
      );
      assert.equal(
        matches,
        (MEASURED_ITERATIONS / CORPUS_SIZE) * workload.expectedMatches
      );
    }
  }
  const [before, after] = samples.map(median);
  console.log(
    `| ${workload.name} | ${before.toFixed(2)} | ${after.toFixed(2)} | ${(before / after).toFixed(2)}x |`
  );
}
