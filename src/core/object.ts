import { define } from './define';
import type { Guard } from '@/types';
import {
  getTag,
  OBJECT_TAG_ARRAY_BUFFER,
  OBJECT_TAG_DATA_VIEW,
  OBJECT_TAG_DATE,
  OBJECT_TAG_ERROR,
  OBJECT_TAG_MAP,
  OBJECT_TAG_REGEXP,
  OBJECT_TAG_SET,
  OBJECT_TAG_WEAK_MAP,
  OBJECT_TAG_WEAK_SET
} from '@/utils/object-tags';

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
    getTag(value) === OBJECT_TAG_DATE && !Number.isNaN((value as Date).getTime())
);

/**
 * Checks whether a value is a `RegExp`.
 *
 * @returns Predicate narrowing to `RegExp`.
 */
export const isRegExp = define<RegExp>(
  (value) => getTag(value) === OBJECT_TAG_REGEXP
);

/**
 * Checks whether a value is a `Map`.
 *
 * @returns Predicate narrowing to `Map<unknown, unknown>`.
 */
export const isMap = define<Map<unknown, unknown>>(
  (value) => getTag(value) === OBJECT_TAG_MAP
);

/**
 * Checks whether a value is a `Set`.
 *
 * @returns Predicate narrowing to `Set<unknown>`.
 */
export const isSet = define<Set<unknown>>(
  (value) => getTag(value) === OBJECT_TAG_SET
);

/**
 * Checks whether a value is a `WeakMap`.
 *
 * @returns Predicate narrowing to `WeakMap<object, unknown>`.
 */
export const isWeakMap = define<WeakMap<object, unknown>>(
  (value) => getTag(value) === OBJECT_TAG_WEAK_MAP
);

/**
 * Checks whether a value is a `WeakSet`.
 *
 * @returns Predicate narrowing to `WeakSet<object>`.
 */
export const isWeakSet = define<WeakSet<object>>(
  (value) => getTag(value) === OBJECT_TAG_WEAK_SET
);

/**
 * Checks whether a value is promise-like (has a `then` function).
 *
 * @returns Predicate narrowing to `PromiseLike<unknown>`.
 */
export const isPromiseLike = define<PromiseLike<unknown>>((value) => {
  if (!isObject(value) && !isFunction(value)) return false;
  return isFunction((value as Record<string, unknown>).then);
});

/**
 * Checks whether a value implements the `Iterable` protocol.
 *
 * @returns Predicate narrowing to `Iterable<unknown>`.
 */
export const isIterable = define<Iterable<unknown>>((value) => {
  if (!isObject(value) && !isFunction(value)) return false;
  return isFunction((value as Record<symbol, unknown>)[Symbol.iterator]);
});

/**
 * Checks whether a value implements the `AsyncIterable` protocol.
 *
 * @returns Predicate narrowing to `AsyncIterable<unknown>`.
 */
export const isAsyncIterable = define<AsyncIterable<unknown>>((value) => {
  if (!isObject(value) && !isFunction(value)) return false;
  return isFunction((value as Record<symbol, unknown>)[Symbol.asyncIterator]);
});

/**
 * Checks whether a value is an `ArrayBuffer`.
 *
 * @returns Predicate narrowing to `ArrayBuffer`.
 */
export const isArrayBuffer = define<ArrayBuffer>(
  (value) => getTag(value) === OBJECT_TAG_ARRAY_BUFFER
);

/**
 * Checks whether a value is a `DataView`.
 *
 * @returns Predicate narrowing to `DataView`.
 */
export const isDataView = define<DataView>(
  (value) => getTag(value) === OBJECT_TAG_DATA_VIEW
);

/**
 * Checks whether a value is a typed array view (any `ArrayBufferView` except DataView).
 *
 * @returns Predicate narrowing to `ArrayBufferView`.
 */
export const isTypedArray = define<ArrayBufferView>(
  (value) => ArrayBuffer.isView(value) && getTag(value) !== OBJECT_TAG_DATA_VIEW
);

/**
 * Checks whether a value is an `Error` (instance of Error or plain Error object tag).
 *
 * @returns Predicate narrowing to `Error`.
 */
export const isError = define<Error>(
  (value) => value instanceof Error || getTag(value) === OBJECT_TAG_ERROR
);

/**
 * Checks whether a value is a `URL` (in environments with URL available).
 *
 * @returns Predicate narrowing to `URL` when supported; otherwise always false.
 */
export const isURL =
  typeof URL !== 'undefined'
    ? define<URL>((value) => value instanceof URL)
    : define<URL>(() => false);

/**
 * Checks whether a value is a `Blob` (in environments with Blob available).
 *
 * @returns Predicate narrowing to `Blob` when supported; otherwise always false.
 */
export const isBlob =
  typeof Blob !== 'undefined'
    ? define<Blob>((value) => value instanceof Blob)
    : define<Blob>(() => false);

/**
 * Creates a guard that checks whether a value is an instance of `constructor`.
 *
 * @param constructor Constructor used as the right-hand side of `instanceof`.
 * @returns Predicate narrowing to `InstanceType<C>`.
 */
export const isInstanceOf = <
  C extends abstract new (...args: unknown[]) => unknown
>(
  constructor: C
): Guard<InstanceType<C>> =>
  define<InstanceType<C>>((value) => value instanceof constructor);
