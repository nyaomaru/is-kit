import {
  isFunction,
  isObject,
  isPlainObject,
  isArray,
  isDate,
  isRegExp,
  isMap,
  isSet,
  isPromiseLike,
  isIterable,
  isAsyncIterable,
  isArrayBuffer,
  isDataView,
  isTypedArray,
  isError,
  isURL,
  isBlob,
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

    const pLike = { then: () => {} };
    expect(isPromiseLike(pLike)).toBe(true);
    expect(isPromiseLike({})).toBe(false);
  });

  it('detects iterable and async iterable', () => {
    expect(isIterable([1, 2, 3])).toBe(true);
    expect(isIterable({})).toBe(false);

    async function* gen() {
      yield 1;
    }
    expect(isAsyncIterable(gen())).toBe(true);
    expect(isAsyncIterable([])).toBe(false);
  });

  it('handles typed arrays and buffers', () => {
    expect(isArrayBuffer(new ArrayBuffer(8))).toBe(true);
    expect(isDataView(new DataView(new ArrayBuffer(8)))).toBe(true);
    expect(isTypedArray(new Uint8Array(2))).toBe(true);
    expect(isTypedArray(new DataView(new ArrayBuffer(8)))).toBe(false);
  });

  it('detects Error, URL, Blob', () => {
    expect(isError(new Error('x'))).toBe(true);
    expect(isURL(new URL('https://example.com'))).toBe(true);

    // Blob and URL are available in Node 18+
    const b = new Blob(["abc"], { type: 'text/plain' });
    expect(isBlob(b)).toBe(true);
  });
});

