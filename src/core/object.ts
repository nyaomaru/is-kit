import { define } from './define';

// WHY: Using Object.prototype.toString provides stable internal tags across realms
// and avoids false positives from overridden Symbol.toStringTag.
const getTag = (value: unknown) => Object.prototype.toString.call(value);

/**
 * Checks whether a value is a function.
 *
 * @returns Predicate narrowing to `Function`.
 */
export const isFunction = define<Function>(
  (value) => typeof value === 'function'
);

/**
 * Checks for non-null objects (including arrays, dates, etc.).
 *
 * @returns Predicate narrowing to `Record<PropertyKey, unknown>`.
 */
export const isObject = define<Record<PropertyKey, unknown>>(
  (value) => typeof value === 'object' && value !== null
);

/**
 * Checks for plain objects created by object literals or `Object.create(null)`.
 *
 * @returns Predicate narrowing to `Record<string, unknown>`.
 */
export const isPlainObject = define<Record<string, unknown>>((value) => {
  if (!isObject(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || Object.getPrototypeOf(proto) === null;
});

/**
 * Checks whether a value is an array.
 *
 * @returns Predicate narrowing to `readonly unknown[]`.
 */
export const isArray = define<readonly unknown[]>(Array.isArray);

/**
 * Checks whether a value is a valid `Date` instance (not `Invalid Date`).
 *
 * @returns Predicate narrowing to `Date`.
 */
export const isDate = define<Date>(
  (value) =>
    getTag(value) === '[object Date]' &&
    !Number.isNaN((value as Date).getTime())
);

/**
 * Checks whether a value is a `RegExp`.
 *
 * @returns Predicate narrowing to `RegExp`.
 */
export const isRegExp = define<RegExp>(
  (value) => getTag(value) === '[object RegExp]'
);

/**
 * Checks whether a value is a `Map`.
 *
 * @returns Predicate narrowing to `Map<unknown, unknown>`.
 */
export const isMap = define<Map<unknown, unknown>>(
  (value) => getTag(value) === '[object Map]'
);

/**
 * Checks whether a value is a `Set`.
 *
 * @returns Predicate narrowing to `Set<unknown>`.
 */
export const isSet = define<Set<unknown>>(
  (value) => getTag(value) === '[object Set]'
);

/**
 * Checks whether a value is promise-like (has a `then` function).
 *
 * @returns Predicate narrowing to `PromiseLike<unknown>`.
 */
export const isPromiseLike = define<PromiseLike<unknown>>(
  (value) =>
    !!value && typeof (value as Record<string, unknown>).then === 'function'
);

/**
 * Checks whether a value implements the `Iterable` protocol.
 *
 * @returns Predicate narrowing to `Iterable<unknown>`.
 */
export const isIterable = define<Iterable<unknown>>(
  (value) =>
    !!value &&
    typeof value === 'object' &&
    typeof (value as Record<symbol, unknown>)[Symbol.iterator] === 'function'
);

/**
 * Checks whether a value implements the `AsyncIterable` protocol.
 *
 * @returns Predicate narrowing to `AsyncIterable<unknown>`.
 */
export const isAsyncIterable = define<AsyncIterable<unknown>>(
  (value) =>
    !!value &&
    typeof value === 'object' &&
    typeof (value as Record<symbol, unknown>)[Symbol.asyncIterator] ===
      'function'
);

/**
 * Checks whether a value is an `ArrayBuffer`.
 *
 * @returns Predicate narrowing to `ArrayBuffer`.
 */
export const isArrayBuffer = define<ArrayBuffer>(
  (value) => getTag(value) === '[object ArrayBuffer]'
);

/**
 * Checks whether a value is a `DataView`.
 *
 * @returns Predicate narrowing to `DataView`.
 */
export const isDataView = define<DataView>(
  (value) => getTag(value) === '[object DataView]'
);

/**
 * Checks whether a value is a typed array view (any `ArrayBufferView` except DataView).
 *
 * @returns Predicate narrowing to `ArrayBufferView`.
 */
export const isTypedArray = define<ArrayBufferView>(
  (value) => ArrayBuffer.isView(value) && getTag(value) !== '[object DataView]'
);

/**
 * Checks whether a value is an `Error` (instance of Error or plain Error object tag).
 *
 * @returns Predicate narrowing to `Error`.
 */
export const isError = define<Error>(
  (value) => value instanceof Error || getTag(value) === '[object Error]'
);

/**
 * Checks whether a value is a `URL` (in environments with URL available).
 *
 * @returns Predicate narrowing to `URL` when supported; otherwise always false.
 */
export const isURL =
  typeof URL !== 'undefined'
    ? define<URL>((value) => value instanceof URL)
    : define<URL>((_value) => false);

/**
 * Checks whether a value is a `Blob` (in environments with Blob available).
 *
 * @returns Predicate narrowing to `Blob` when supported; otherwise always false.
 */
export const isBlob =
  typeof Blob !== 'undefined'
    ? define<Blob>((value) => value instanceof Blob)
    : define<Blob>((_value) => false);
