// Core builders and control-flow helpers
export { assert } from './core/assert';
export { define } from './core/define';
export { equals, equalsBy, equalsKey } from './core/equals';
export { hasKey, hasKeys, narrowKeyTo } from './core/key';
export { lazy } from './core/lazy';
export { and, andAll, guardIn, not, or } from './core/logic';
export { nullable, nonNull, nullish, optional, required } from './core/nullish';
export { safeJsonParse, safeParse, safeParseWith } from './core/parse';
export { predicateToRefine } from './core/predicate';

// Primitive guards
export {
  isBigInt,
  isBoolean,
  isFiniteNumber,
  isInfiniteNumber,
  isInteger,
  isNaN,
  isNegative,
  isNil,
  isNull,
  isNumber,
  isNumberPrimitive,
  isPositive,
  isPrimitive,
  isSafeInteger,
  isString,
  isSymbol,
  isUndefined,
  isZero
} from './core/primitive';

// Object and platform guards
export {
  isArray,
  isArrayBuffer,
  isAsyncIterable,
  isBlob,
  isDataView,
  isDate,
  isError,
  isFile,
  isFunction,
  isInstanceOf,
  isIterable,
  isMap,
  isObject,
  isPlainObject,
  isPromiseLike,
  isRegExp,
  isSet,
  isTypedArray,
  isURL,
  isWeakMap,
  isWeakSet
} from './core/object';

// Combinators
export { arrayOf, nonEmptyArrayOf } from './core/combinators/array';
export { mapOf } from './core/combinators/map';
export { oneOf } from './core/combinators/one-of';
export { oneOfValues } from './core/combinators/one-of-values';
export { recordOf } from './core/combinators/record';
export { setOf } from './core/combinators/set';
export { optionalKey, struct } from './core/combinators/struct';
export { typedStruct } from './core/combinators/typed-struct';
export { tupleOf } from './core/combinators/tuple';

// Public types
export type {
  ChainResult,
  Guard,
  GuardedOf,
  GuardedWithin,
  OutOfGuards,
  ParseResult,
  Predicate,
  Refine,
  RefineChain,
  Refinement
} from './types/core';
export type { Primitive } from './types/primitive';
export type {
  InferSchema,
  OptionalSchemaField,
  Schema,
  SchemaField
} from './types/schema';

// Utility helpers
export {
  everyArrayValue,
  everyMapEntry,
  everyOwnEnumerableEntry,
  everySetValue,
  everyTupleValue
} from './utils/guard-collections';
export { toBooleanPredicates } from './utils/to-boolean-predicates';
