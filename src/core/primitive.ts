import { and } from './logic';
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
