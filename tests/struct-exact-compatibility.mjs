import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [baselinePath, currentPath] = process.argv.slice(2);
if (!baselinePath) {
  throw new Error(
    'Usage: node tests/struct-exact-compatibility.mjs <baseline-index.mjs> [current-bundle]'
  );
}
const beforeModule = await import(pathToFileURL(resolve(baselinePath)).href);
const before = beforeModule.default ?? beforeModule;
const afterModule = await import(
  currentPath ? pathToFileURL(resolve(currentPath)).href : '../dist/index.mjs'
);
const after = afterModule.default ?? afterModule;

const VALID_FIELD_VALUE = 1;
const INVALID_FIELD_VALUE = 'wrong';
const KEY_OPTIONALITY_COUNT = 2;
const FIELD_STATE = {
  MISSING: 'missing',
  VALID: 'valid',
  HIDDEN: 'hidden',
  INVALID: 'invalid',
  GETTER: 'getter',
  THROWING_GETTER: 'throwing-getter'
};
const FIELD_STATES = Object.values(FIELD_STATE);
const FIELD_STATE_COUNT = FIELD_STATES.length;
// WHY: Sampling every N+1 combinations keeps ordinary objects as the majority
// and is coprime to the state count, so the sample covers every field state.
const PROXY_SAMPLE_INTERVAL = FIELD_STATE_COUNT + 1;

// WHY: Each base-N digit selects one field's state, covering every tuple once.
const fieldStateAt = (combination, index) =>
  FIELD_STATES[
    Math.floor(combination / FIELD_STATE_COUNT ** index) % FIELD_STATE_COUNT
  ];

let checked = 0;
const keySets = [
  ['a', 'b', 'c'],
  ['__proto__', 'constructor', 'toString'],
  ['2', '1', '01']
];
const capture = (guard, makeInput) => {
  const trace = [];
  const input = makeInput(trace);
  try {
    return { result: guard(input), trace };
  } catch (error) {
    return { error: `${error.name}: ${error.message}`, trace };
  }
};

const fieldDescriptor = (state, key, trace) => {
  const descriptor = {
    configurable: true,
    enumerable: state !== FIELD_STATE.HIDDEN
  };
  if (state === FIELD_STATE.GETTER || state === FIELD_STATE.THROWING_GETTER) {
    descriptor.get = () => {
      trace.push(`get:${key}`);
      if (state === FIELD_STATE.THROWING_GETTER) throw new Error('field error');
      return VALID_FIELD_VALUE;
    };
  } else {
    descriptor.value =
      state === FIELD_STATE.INVALID ? INVALID_FIELD_VALUE : VALID_FIELD_VALUE;
  }
  return descriptor;
};

const addExtra = (input, extra) => {
  if (extra === 'enumerable') input.extra = true;
  if (extra === 'hidden')
    Object.defineProperty(input, 'extra', { value: true });
  if (extra === 'symbol') input[Symbol('extra')] = true;
};

const traceProxy = (input, trace) =>
  new Proxy(input, {
    getPrototypeOf(target) {
      trace.push('prototype');
      return Reflect.getPrototypeOf(target);
    },
    getOwnPropertyDescriptor(target, key) {
      trace.push(`descriptor:${String(key)}`);
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
    get(target, key, receiver) {
      trace.push(`value:${String(key)}`);
      return Reflect.get(target, key, receiver);
    },
    ownKeys(target) {
      trace.push('keys');
      return Reflect.ownKeys(target);
    }
  });

const createFixture = (
  { keys, stateCombination, prototypeKind, reversed, extra },
  trace
) => {
  const prototypes = {
    plain: Object.prototype,
    null: null,
    inherited: Object.assign(
      Object.create(null),
      Object.fromEntries(keys.map((key) => [key, VALID_FIELD_VALUE]))
    )
  };
  const input = Object.create(prototypes[prototypeKind]);
  const order = keys.map((_, index) => index);
  if (reversed) order.reverse();
  for (const index of order) {
    const state = fieldStateAt(stateCombination, index);
    if (state === FIELD_STATE.MISSING) continue;
    Object.defineProperty(
      input,
      keys[index],
      fieldDescriptor(state, keys[index], trace)
    );
  }
  addExtra(input, extra);
  // WHY: Sample proxy traps in the same matrix while keeping ordinary objects
  // as the majority, and build fresh fixtures for guards with side effects.
  return stateCombination % PROXY_SAMPLE_INTERVAL === 0
    ? traceProxy(input, trace)
    : input;
};

for (const keys of keySets) {
  const optionalMaskCount = KEY_OPTIONALITY_COUNT ** keys.length;
  const fieldStateCombinationCount = FIELD_STATE_COUNT ** keys.length;
  for (
    let optionalMask = 0;
    optionalMask < optionalMaskCount;
    optionalMask += 1
  ) {
    for (const exact of [false, true]) {
      const guards = [before, after].map((library) => {
        const schema = Object.create(null);
        for (let index = 0; index < keys.length; index += 1) {
          schema[keys[index]] =
            optionalMask & (1 << index)
              ? library.optionalKey(library.isNumber)
              : library.isNumber;
        }
        return library.struct(schema, { exact });
      });

      for (
        let stateCombination = 0;
        stateCombination < fieldStateCombinationCount;
        stateCombination += 1
      ) {
        for (const prototypeKind of ['plain', 'null', 'inherited']) {
          for (const reversed of [false, true]) {
            for (const extra of ['none', 'enumerable', 'hidden', 'symbol']) {
              const makeInput = (trace) =>
                createFixture(
                  { keys, stateCombination, prototypeKind, reversed, extra },
                  trace
                );
              const oldResult = capture(guards[0], makeInput);
              const newResult = capture(guards[1], makeInput);
              assert.deepEqual(
                newResult,
                oldResult,
                JSON.stringify({
                  keys,
                  optionalMask,
                  exact,
                  fieldStates: keys.map((_, index) =>
                    fieldStateAt(stateCombination, index)
                  ),
                  prototypeKind,
                  reversed,
                  extra
                })
              );
              checked += 1;
            }
          }
        }
      }
    }
  }
}

const mutations = {
  delete: (input) => {
    delete input.a;
  },
  replace: (input) => {
    delete input.a;
    input.extra = true;
  },
  'hide-extra': (input) => {
    input.extra = true;
    Object.defineProperty(input, 'a', { enumerable: false });
  },
  symbol: (input) => {
    input[Symbol('extra')] = true;
  },
  throw: () => {
    throw new Error('guard error');
  }
};

for (const [mutation, mutate] of Object.entries(mutations)) {
  const run = (library) => {
    const trace = [];
    const input = { a: VALID_FIELD_VALUE, b: VALID_FIELD_VALUE };
    const guard = library.struct(
      {
        a: (value) => {
          trace.push('a');
          return value === VALID_FIELD_VALUE;
        },
        b: (value) => {
          trace.push('b');
          mutate(input);
          return value === VALID_FIELD_VALUE;
        }
      },
      { exact: true }
    );
    const outcome = capture(
      guard,
      () =>
        new Proxy(input, {
          ownKeys(target) {
            trace.push('keys');
            return Reflect.ownKeys(target);
          }
        })
    );
    return { ...outcome, trace: [...trace, ...outcome.trace] };
  };
  assert.deepEqual(run(after), run(before), mutation);
  checked += 1;
}

console.log(
  `${checked.toLocaleString()} baseline/current cases matched, including results, getter order, proxy traps, and field exceptions.`
);
