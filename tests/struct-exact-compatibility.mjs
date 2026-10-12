import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const baselinePath = process.argv[2];
if (!baselinePath) {
  throw new Error(
    'Usage: node tests/struct-exact-compatibility.mjs <baseline-index.mjs> [current-bundle]'
  );
}
const beforeModule = await import(pathToFileURL(resolve(baselinePath)).href);
const before = beforeModule.default ?? beforeModule;
const currentPath = process.argv[3];
const afterModule = await import(
  currentPath ? pathToFileURL(resolve(currentPath)).href : '../dist/index.mjs'
);
const after = afterModule.default ?? afterModule;

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
  const descriptor = { configurable: true, enumerable: state !== 2 };
  if (state === 4 || state === 5) {
    descriptor.get = () => {
      trace.push(`get:${key}`);
      if (state === 5) throw new Error('field error');
      return 1;
    };
  } else {
    descriptor.value = state === 3 ? 'wrong' : 1;
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
  { keys, states, prototypeKind, reversed, extra },
  trace
) => {
  const prototypes = {
    plain: Object.prototype,
    null: null,
    inherited: Object.assign(
      Object.create(null),
      Object.fromEntries(keys.map((key) => [key, 1]))
    )
  };
  const input = Object.create(prototypes[prototypeKind]);
  const order = reversed ? [2, 1, 0] : [0, 1, 2];
  for (const index of order) {
    const state = Math.floor(states / 6 ** index) % 6;
    if (state === 0) continue;
    Object.defineProperty(
      input,
      keys[index],
      fieldDescriptor(state, keys[index], trace)
    );
  }
  addExtra(input, extra);
  // WHY: Sample proxy traps in the same matrix while keeping ordinary objects
  // as the majority, and build fresh fixtures for guards with side effects.
  return states % 7 === 0 ? traceProxy(input, trace) : input;
};

for (const keys of keySets) {
  for (let optionalMask = 0; optionalMask < 8; optionalMask += 1) {
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

      for (let states = 0; states < 216; states += 1) {
        for (const prototypeKind of ['plain', 'null', 'inherited']) {
          for (const reversed of [false, true]) {
            for (const extra of ['none', 'enumerable', 'hidden', 'symbol']) {
              const makeInput = (trace) =>
                createFixture(
                  { keys, states, prototypeKind, reversed, extra },
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
                  states,
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
    const input = { a: 1, b: 1 };
    const guard = library.struct(
      {
        a: (value) => {
          trace.push('a');
          return value === 1;
        },
        b: (value) => {
          trace.push('b');
          mutate(input);
          return value === 1;
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
