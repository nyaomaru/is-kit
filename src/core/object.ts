import { define } from './define';
import type { Guard } from '@/types';
import { getTag, OBJECT_TAG_ERROR } from '@/utils';

// WHY: DOM constructors such as URL and Blob are declared as constructor
// objects with a prototype, not as the full Function interface. The helper
// only needs the prototype for typing; it checks function-ness at runtime
// before using the value as the right-hand side of `instanceof`.
type InstanceCheckTarget<T> = { readonly prototype: T };

type AnyFunction = (...args: never[]) => unknown;

const BUILTIN_BRAND_SENTINEL = Object.freeze({});

// WHY: Calling captured built-in intrinsics verifies internal slots. Unlike
// object tags, this rejects Symbol.toStringTag spoofing while still accepting
// cross-realm instances and subclasses.
const getIntrinsicGetter = (
  prototype: object,
  key: PropertyKey
): (() => unknown) => {
  const getter = Object.getOwnPropertyDescriptor(prototype, key)?.get;

  // WHY: Standard built-in accessors should always exist. Keeping the fallback
  // callable lets the exported guard remain total in a non-conforming runtime.
  return (
    getter ??
    (() => {
      throw new TypeError(`Missing intrinsic getter: ${String(key)}`);
    })
  );
};

const defineIntrinsicBrandGuard = <T>(
  checkBrand: (value: unknown) => unknown
): Guard<T> =>
  define<T>((value) => {
    try {
      checkBrand(value);
      return true;
    } catch {
      return false;
    }
  });

const dateGetTime = Date.prototype.getTime;
const mapHas = Map.prototype.has;
const setHas = Set.prototype.has;
const weakMapHas = WeakMap.prototype.has;
const weakSetHas = WeakSet.prototype.has;
const regExpSource = getIntrinsicGetter(RegExp.prototype, 'source');
const arrayBufferByteLength = getIntrinsicGetter(
  ArrayBuffer.prototype,
  'byteLength'
);
const dataViewByteLength = getIntrinsicGetter(DataView.prototype, 'byteLength');

const defineOptionalInstanceGuard = <T>(
  constructor: InstanceCheckTarget<T> | undefined
): Guard<T> =>
  constructor === undefined
    ? define<T>(() => false)
    : define<T>(
        (value) =>
          typeof constructor === 'function' && value instanceof constructor
      );

/**
 * Checks whether a value is a function.
 *
 * @returns Predicate narrowing to a callable value.
 */
export const isFunction = define<AnyFunction>(
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

const readObjectProperty = (value: unknown, key: PropertyKey): unknown => {
  if (!isObject(value) && !isFunction(value)) return undefined;
  return (value as Record<PropertyKey, unknown>)[key];
};

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
export const isDate = define<Date>((value) => {
  try {
    return !Number.isNaN(dateGetTime.call(value));
  } catch {
    return false;
  }
});

/**
 * Checks whether a value is a `RegExp`.
 *
 * @returns Predicate narrowing to `RegExp`.
 */
export const isRegExp = defineIntrinsicBrandGuard<RegExp>((value) =>
  regExpSource.call(value)
);

/**
 * Checks whether a value is a `Map`.
 *
 * @returns Predicate narrowing to `Map<unknown, unknown>`.
 */
export const isMap = defineIntrinsicBrandGuard<Map<unknown, unknown>>((value) =>
  mapHas.call(value, BUILTIN_BRAND_SENTINEL)
);

/**
 * Checks whether a value is a `Set`.
 *
 * @returns Predicate narrowing to `Set<unknown>`.
 */
export const isSet = defineIntrinsicBrandGuard<Set<unknown>>((value) =>
  setHas.call(value, BUILTIN_BRAND_SENTINEL)
);

/**
 * Checks whether a value is a `WeakMap`.
 *
 * @returns Predicate narrowing to `WeakMap<object, unknown>`.
 */
export const isWeakMap = defineIntrinsicBrandGuard<WeakMap<object, unknown>>(
  (value) => weakMapHas.call(value, BUILTIN_BRAND_SENTINEL)
);

/**
 * Checks whether a value is a `WeakSet`.
 *
 * @returns Predicate narrowing to `WeakSet<object>`.
 */
export const isWeakSet = defineIntrinsicBrandGuard<WeakSet<object>>((value) =>
  weakSetHas.call(value, BUILTIN_BRAND_SENTINEL)
);

/**
 * Checks whether a value is promise-like (has a `then` function).
 *
 * @returns Predicate narrowing to `PromiseLike<unknown>`.
 */
export const isPromiseLike = define<PromiseLike<unknown>>((value) =>
  isFunction(readObjectProperty(value, 'then'))
);

/**
 * Checks whether a value implements the `Iterable` protocol.
 *
 * @returns Predicate narrowing to `Iterable<unknown>`.
 */
export const isIterable = define<Iterable<unknown>>((value) =>
  isFunction(readObjectProperty(value, Symbol.iterator))
);

/**
 * Checks whether a value implements the `AsyncIterable` protocol.
 *
 * @returns Predicate narrowing to `AsyncIterable<unknown>`.
 */
export const isAsyncIterable = define<AsyncIterable<unknown>>((value) =>
  isFunction(readObjectProperty(value, Symbol.asyncIterator))
);

/**
 * Checks whether a value is an `ArrayBuffer`.
 *
 * @returns Predicate narrowing to `ArrayBuffer`.
 */
export const isArrayBuffer = defineIntrinsicBrandGuard<ArrayBuffer>((value) =>
  arrayBufferByteLength.call(value)
);

/**
 * Checks whether a value is a `DataView`.
 *
 * @returns Predicate narrowing to `DataView`.
 */
export const isDataView = defineIntrinsicBrandGuard<DataView>((value) =>
  dataViewByteLength.call(value)
);

/**
 * Checks whether a value is a typed array view (any `ArrayBufferView` except DataView).
 *
 * @returns Predicate narrowing to `ArrayBufferView`.
 */
export const isTypedArray = define<ArrayBufferView>(
  (value) => ArrayBuffer.isView(value) && !isDataView(value)
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
export const isURL = defineOptionalInstanceGuard<URL>(
  typeof URL === 'undefined' ? undefined : URL
);

/**
 * Checks whether a value is a `Blob` (in environments with Blob available).
 *
 * @returns Predicate narrowing to `Blob` when supported; otherwise always false.
 */
export const isBlob = defineOptionalInstanceGuard<Blob>(
  typeof Blob === 'undefined' ? undefined : Blob
);

/**
 * Checks whether a value is a `File` (in environments with File available).
 *
 * @returns Predicate narrowing to `File` when supported; otherwise always false.
 */
export const isFile = defineOptionalInstanceGuard<File>(
  typeof File === 'undefined' ? undefined : File
);

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
