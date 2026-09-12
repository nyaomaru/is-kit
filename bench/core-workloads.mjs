import {
  arrayOf,
  isBoolean,
  isNumber,
  isPrimitive,
  isString,
  optionalKey,
  struct
} from '../dist/index.mjs';

const WARMUP_ITERATIONS = 100_000;
const MEASURED_ITERATIONS = 1_000_000;
const SAMPLE_COUNT = 7;

const isUserPayload = struct(
  {
    id: isString,
    name: isString,
    active: isBoolean,
    scores: arrayOf(isNumber),
    nickname: optionalKey(isString)
  },
  { exact: true }
);

const primitiveInputs = [
  'text',
  42,
  true,
  null,
  undefined,
  Symbol('value'),
  {},
  () => undefined
];

const payloadInputs = [
  { id: '1', name: 'Ada', active: true, scores: [1, 2], nickname: 'A' },
  { id: '2', name: 'Grace', active: false, scores: [] },
  { id: 3, name: 'Lin', active: true, scores: [1] },
  { id: '4', name: 'Ken', active: 'yes', scores: [1] },
  { id: '5', name: 'Mina', active: true, scores: [1, 'two'] },
  { id: '6', name: 'Noa', active: true, scores: [], extra: true },
  null
];

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};

const run = (guard, inputs, iterations) => {
  let matches = 0;

  for (let index = 0; index < iterations; index += 1) {
    if (guard(inputs[index % inputs.length])) matches += 1;
  }

  return matches;
};

const measure = (name, guard, inputs) => {
  run(guard, inputs, WARMUP_ITERATIONS);

  const samples = [];
  let matches = 0;

  for (let sample = 0; sample < SAMPLE_COUNT; sample += 1) {
    const startedAt = performance.now();
    matches = run(guard, inputs, MEASURED_ITERATIONS);
    const elapsedMilliseconds = performance.now() - startedAt;
    samples.push((elapsedMilliseconds * 1_000_000) / MEASURED_ITERATIONS);
  }

  return { name, matches, nanosecondsPerCall: median(samples) };
};

const results = [
  measure('mixed primitive classification', isPrimitive, primitiveInputs),
  measure('mixed exact user payload validation', isUserPayload, payloadInputs)
];

console.log(`Node ${process.version} on ${process.platform}/${process.arch}`);
console.log(
  `Median of ${SAMPLE_COUNT} samples after ${WARMUP_ITERATIONS.toLocaleString()} warm-up calls; ${MEASURED_ITERATIONS.toLocaleString()} calls per sample.`
);

for (const result of results) {
  console.log(
    `${result.name}: ${result.nanosecondsPerCall.toFixed(2)} ns/call (${result.matches} matches/sample)`
  );
}

console.log(
  'Use this to investigate a reported boundary workload. Do not treat these environment-specific figures as release targets.'
);
