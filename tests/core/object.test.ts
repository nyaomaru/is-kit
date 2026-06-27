import {
  isFunction,
  isObject,
  isPlainObject,
  isArray,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isPromiseLike,
  isIterable,
  isAsyncIterable,
  isArrayBuffer,
  isDataView,
  isTypedArray,
  isError,
  isURL,
  isBlob,
  isFile,
  isInstanceOf
} from '@/core/object';

describe('core/object guards', () => {
  it('detects functions and objects', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(123 as unknown)).toBe(false);

    expect(isObject({})).toBe(true);
    expect(isObject(null)).toBe(false);
  });

  it('distinguishes plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    class X {}
    expect(isPlainObject(new X())).toBe(false);
  });

  it('checks common built-ins', () => {
    expect(isArray([])).toBe(true);
    expect(isArray('not')).toBe(false);

    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('invalid'))).toBe(false);

    expect(isRegExp(/a/)).toBe(true);
    expect(isMap(new Map())).toBe(true);
    expect(isSet(new Set())).toBe(true);
    expect(isWeakMap(new WeakMap())).toBe(true);
    expect(isWeakSet(new WeakSet())).toBe(true);

    const pLike = { then: () => {} };
    expect(isPromiseLike(pLike)).toBe(true);
    expect(isPromiseLike(Object.assign(() => {}, pLike))).toBe(true);
    expect(isPromiseLike({})).toBe(false);
  });

  it('detects iterable and async iterable', () => {
    const iterableFunction = Object.assign(() => {}, {
      [Symbol.iterator]: function* () {}
    });

    expect(isIterable([1, 2, 3])).toBe(true);
    expect(isIterable(iterableFunction)).toBe(true);
    expect(isIterable({})).toBe(false);

    async function* gen() {
      yield 1;
    }

    const asyncIterableFunction = Object.assign(() => {}, {
      [Symbol.asyncIterator]: async function* () {}
    });

    expect(isAsyncIterable(gen())).toBe(true);
    expect(isAsyncIterable(asyncIterableFunction)).toBe(true);
    expect(isAsyncIterable([])).toBe(false);
  });

  it('handles typed arrays and buffers', () => {
    expect(isArrayBuffer(new ArrayBuffer(8))).toBe(true);
    expect(isDataView(new DataView(new ArrayBuffer(8)))).toBe(true);
    expect(isTypedArray(new Uint8Array(2))).toBe(true);
    expect(isTypedArray(new DataView(new ArrayBuffer(8)))).toBe(false);
  });

  it('detects Error, URL, Blob, File', () => {
    expect(isError(new Error('x'))).toBe(true);
    expect(isURL(new URL('https://example.com'))).toBe(true);

    // Blob and URL are available in Node 18+
    const b = new Blob(['abc'], { type: 'text/plain' });
    expect(isBlob(b)).toBe(true);

    if (typeof File !== 'undefined') {
      const f = new File(['abc'], 'example.txt', { type: 'text/plain' });
      expect(isFile(f)).toBe(true);
      expect(isBlob(f)).toBe(true);
      expect(isFile(b)).toBe(false);
    }
  });

  it('returns false for unavailable platform constructors', () => {
    const originalURL = Object.getOwnPropertyDescriptor(globalThis, 'URL');
    const originalBlob = Object.getOwnPropertyDescriptor(globalThis, 'Blob');
    const originalFile = Object.getOwnPropertyDescriptor(globalThis, 'File');

    try {
      Object.defineProperty(globalThis, 'URL', {
        configurable: true,
        value: undefined
      });
      Object.defineProperty(globalThis, 'Blob', {
        configurable: true,
        value: undefined
      });
      Object.defineProperty(globalThis, 'File', {
        configurable: true,
        value: undefined
      });

      jest.isolateModules(() => {
        const objectGuards =
          jest.requireActual<typeof import('@/core/object')>('@/core/object');

        expect(objectGuards.isURL({})).toBe(false);
        expect(objectGuards.isBlob({})).toBe(false);
        expect(objectGuards.isFile({})).toBe(false);
      });
    } finally {
      if (originalURL) Object.defineProperty(globalThis, 'URL', originalURL);
      else Reflect.deleteProperty(globalThis, 'URL');

      if (originalBlob) Object.defineProperty(globalThis, 'Blob', originalBlob);
      else Reflect.deleteProperty(globalThis, 'Blob');

      if (originalFile) Object.defineProperty(globalThis, 'File', originalFile);
      else Reflect.deleteProperty(globalThis, 'File');
    }
  });

  it('creates a guard from a constructor with isInstanceOf', () => {
    class Animal {}
    class Dog extends Animal {}

    const isAnimal = isInstanceOf(Animal);
    expect(isAnimal(new Animal())).toBe(true);
    expect(isAnimal(new Dog())).toBe(true);
    expect(isAnimal({})).toBe(false);
  });
});
