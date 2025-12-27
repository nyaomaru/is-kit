import { and, or } from './logic';
import { predicateToRefine } from './predicate';
import { define } from './define';

/**
 * Checks whether a value is a string.
 *
 * @returns Predicate narrowing to `string`.
 */
export const isString = define<string>((value) => typeof value === 'string');

/**
 * Checks whether a value is a number primitive (may include NaN/±Infinity).
 *
 * @returns Predicate narrowing to `number` (primitive-only).
 */
export const isNumberPrimitive = define<number>(
  (value) => typeof value === 'number'
);
/**
 * Checks whether a number is finite.
 * @returns Refinement that accepts only finite numbers.
 */
export const isFiniteNumber = predicateToRefine<number>(Number.isFinite);
/**
 * Checks whether a value is a finite number.
 * @returns Predicate narrowing to finite `number`.
 */
export const isNumber = and(isNumberPrimitive, isFiniteNumber);

/**
 * Checks whether a value is an integer number.
 *
 * Equivalent to `Number.isInteger(value)`.
 * @returns Predicate narrowing to integer `number`.
 */
export const isInteger = define<number>(Number.isInteger);

/**
 * Checks whether a value is a safe integer.
 *
 * Equivalent to `Number.isSafeInteger(value)`.
 * @returns Predicate narrowing to safe-integer `number`.
 */
export const isSafeInteger = define<number>(Number.isSafeInteger);

/**
 * Checks whether a value is a positive finite number (> 0).
 *
 * Uses `isNumber` internally to exclude NaN and ±Infinity.
 * @returns Predicate narrowing to positive `number`.
 */
export const isPositive = and(
  isNumber,
  predicateToRefine<number>((n) => n > 0)
);

/**
 * Checks whether a value is a negative finite number (< 0).
 *
 * Uses `isNumber` internally to exclude NaN and ±Infinity.
 * Note: `-0` is not considered negative (consistent with `< 0`).
 * @returns Predicate narrowing to negative `number`.
 */
export const isNegative = and(
  isNumber,
  predicateToRefine<number>((n) => n < 0)
);

/**
 * Checks whether a value is a boolean.
 *
 * @returns Predicate narrowing to `boolean`.
 */
export const isBoolean = define<boolean>((value) => typeof value === 'boolean');

/**
 * Checks whether a value is a bigint.
 *
 * @returns Predicate narrowing to `bigint`.
 */
export const isBigInt = define<bigint>((value) => typeof value === 'bigint');

/**
 * Checks whether a value is a symbol.
 *
 * @returns Predicate narrowing to `symbol`.
 */
export const isSymbol = define<symbol>((value) => typeof value === 'symbol');

/**
 * Checks whether a value is exactly `undefined`.
 *
 * @returns Predicate narrowing to `undefined`.
 */
export const isUndefined = define<undefined>((value) => value === undefined);

/**
 * Checks whether a value is exactly `null`.
 *
 * @returns Predicate narrowing to `null`.
 */
export const isNull = define<null>((value) => value === null);

/**
 * Checks whether a value is a JavaScript primitive.
 *
 * Primitives: string, number, boolean, bigint, symbol, undefined, null.
 * Note: `number` here includes NaN and ±Infinity (use `isNumber` for finite only).
 *
 * @returns Predicate narrowing to `Primitive`.
 */
export const isPrimitive = or(
  isString,
  isNumberPrimitive,
  isBoolean,
  isBigInt,
  isSymbol,
  isUndefined,
  isNull
);
