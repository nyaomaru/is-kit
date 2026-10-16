import { arrayOf, define, isNumber, nonEmptyArrayOf } from '../dist/index.mjs';

const WARMUP_ITERATIONS = 10_000;
const MEASURED_ITERATIONS = 50_000;
const SAMPLE_COUNT = 7;
const predicateCalls = new Int32Array(
  new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
);
const arrayValues = Array.prototype.values;

const shortValid = [1, 2, 3, 4];
const longValid = Array.from({ length: 1_024 }, (_, index) => index);
const failsAtStart = ['invalid', ...longValid.slice(1)];
const failsInMiddle = [...longValid];
failsInMiddle[Math.floor(failsInMiddle.length / 2)] = 'invalid';
const failsAtEnd = [...longValid];
failsAtEnd[failsAtEnd.length - 1] = 'invalid';
const sparse = Array.from({ length: 1_024 }, (_, index) => index);
delete sparse[Math.floor(sparse.length / 2)];

class NumberArray extends Array {}

const overriddenIterator = new NumberArray(1, 2, 3, 4);
Object.defineProperty(overriddenIterator, Symbol.iterator, {
  value: () => {
    throw new Error('custom iterator should not run');
  }
});

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};

const countedIsNumber = (value) => {
  // WHY: Atomics makes every predicate invocation observable, preventing V8
  // from replacing a repeated guard call over a constant input with a constant.
  Atomics.add(predicateCalls, 0, 1);
  return isNumber(value);
};

const everyIteratorArrayValue = (values, predicate) => {
  for (const value of arrayValues.call(values)) {
    if (!predicate(value)) return false;
  }

  return true;
};

const iteratorArrayOf = define(
  (input) =>
    Array.isArray(input) && everyIteratorArrayValue(input, countedIsNumber)
);

const iteratorNonEmptyArrayOf = define(
  (input) =>
    Array.isArray(input) &&
    input.length > 0 &&
    everyIteratorArrayValue(input, countedIsNumber)
);

const indexedArrayOf = arrayOf(countedIsNumber);
const indexedNonEmptyArrayOf = nonEmptyArrayOf(countedIsNumber);

const measure = (guard, input, expectedChecks) => {
  for (let index = 0; index < WARMUP_ITERATIONS; index += 1) {
    guard(input);
  }

  Atomics.store(predicateCalls, 0, 0);
  const samples = [];
  let matches = 0;

  for (let sample = 0; sample < SAMPLE_COUNT; sample += 1) {
    const startedAt = performance.now();
    matches = 0;

    for (let index = 0; index < MEASURED_ITERATIONS; index += 1) {
      if (guard(input)) matches += 1;
    }

    const elapsedMilliseconds = performance.now() - startedAt;
    samples.push((elapsedMilliseconds * 1_000_000) / MEASURED_ITERATIONS);
  }

  const calls = Atomics.load(predicateCalls, 0);
  const expectedCalls = expectedChecks * MEASURED_ITERATIONS * SAMPLE_COUNT;
  if (calls !== expectedCalls) {
    throw new Error(
      `Expected ${expectedCalls} predicate calls, received ${calls}`
    );
  }

  return { matches, nanosecondsPerCall: median(samples) };
};

const cases = [
  { name: 'arrayOf short valid', input: shortValid, checks: 4 },
  { name: 'arrayOf long valid', input: longValid, checks: 1_024 },
  { name: 'arrayOf failure at index 0', input: failsAtStart, checks: 1 },
  {
    name: 'arrayOf failure in the middle',
    input: failsInMiddle,
    checks: 513
  },
  {
    name: 'arrayOf failure at the last index',
    input: failsAtEnd,
    checks: 1_024
  },
  { name: 'arrayOf sparse array', input: sparse, checks: 513 },
  {
    name: 'arrayOf subclass with overridden iterator',
    input: overriddenIterator,
    checks: 4
  },
  {
    name: 'nonEmptyArrayOf long valid',
    input: longValid,
    checks: 1_024,
    iteratorGuard: iteratorNonEmptyArrayOf,
    indexedGuard: indexedNonEmptyArrayOf
  }
];

console.log(`Node ${process.version} on ${process.platform}/${process.arch}`);
console.log(
  `Median of ${SAMPLE_COUNT} samples after ${WARMUP_ITERATIONS.toLocaleString()} warm-up calls; ${MEASURED_ITERATIONS.toLocaleString()} calls per sample.`
);

for (const benchmarkCase of cases) {
  const iterator = measure(
    benchmarkCase.iteratorGuard ?? iteratorArrayOf,
    benchmarkCase.input,
    benchmarkCase.checks
  );
  const indexed = measure(
    benchmarkCase.indexedGuard ?? indexedArrayOf,
    benchmarkCase.input,
    benchmarkCase.checks
  );
  const improvement =
    ((iterator.nanosecondsPerCall - indexed.nanosecondsPerCall) /
      iterator.nanosecondsPerCall) *
    100;

  console.log(
    `${benchmarkCase.name}: ${iterator.nanosecondsPerCall.toFixed(2)} -> ${indexed.nanosecondsPerCall.toFixed(2)} ns/call (${improvement.toFixed(1)}% faster; ${indexed.matches} matches/sample)`
  );
}
