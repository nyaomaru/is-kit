import { arrayOf, isNumber, nonEmptyArrayOf } from '../dist/index.mjs';

const WARMUP_ITERATIONS = 10_000;
const MEASURED_ITERATIONS = 50_000;
const SAMPLE_COUNT = 7;

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

const measure = (name, guard, input) => {
  for (let index = 0; index < WARMUP_ITERATIONS; index += 1) {
    guard(input);
  }

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

  return { name, matches, nanosecondsPerCall: median(samples) };
};

const isNumberArray = arrayOf(isNumber);
const isNonEmptyNumberArray = nonEmptyArrayOf(isNumber);
const results = [
  measure('arrayOf short valid', isNumberArray, shortValid),
  measure('arrayOf long valid', isNumberArray, longValid),
  measure('arrayOf failure at index 0', isNumberArray, failsAtStart),
  measure('arrayOf failure in the middle', isNumberArray, failsInMiddle),
  measure('arrayOf failure at the last index', isNumberArray, failsAtEnd),
  measure('arrayOf sparse array', isNumberArray, sparse),
  measure(
    'arrayOf subclass with overridden iterator',
    isNumberArray,
    overriddenIterator
  ),
  measure('nonEmptyArrayOf long valid', isNonEmptyNumberArray, longValid)
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
