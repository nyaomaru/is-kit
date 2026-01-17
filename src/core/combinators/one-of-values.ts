import type { Primitive, Predicate } from '@/types';
import { define } from '@/core/define';
import { and } from '@/core/logic';
import { isNumber } from '@/core/primitive';
import { predicateToRefine } from '@/core/predicate';

// WHY: For small literal sets, a linear scan with Object.is preserves
// equality semantics (NaN, +0/-0) without Set overhead; use Set when larger.
const ONE_OF_VALUES_LINEAR_SCAN_MAX = 8;

const isSingleArrayArg = define<readonly [readonly Primitive[]]>(
  (value): value is readonly [readonly Primitive[]] =>
    Array.isArray(value) && value.length === 1 && Array.isArray(value[0]),
);

const isZeroNumber = and(
  isNumber,
  predicateToRefine<number>((value) => value === 0),
);

const normalizeValues = (
  args: readonly Primitive[] | [readonly Primitive[]],
): readonly Primitive[] => (isSingleArrayArg(args) ? args[0] : args);

const createLinearPredicate = (
  items: readonly Primitive[],
): Predicate<Primitive> => {
  return function (input: unknown): input is Primitive {
    return items.some((value) => Object.is(value, input));
  };
};

const createSetPredicate = (
  items: readonly Primitive[],
): Predicate<Primitive> => {
  // WHY: Set uses SameValueZero (treats +0 and -0 as equal). To preserve
  // Object.is semantics for zeros while keeping O(1) lookups, track -0/+0
  // explicitly and use Set for all other values.
  let hasPositiveZero = false;
  let hasNegativeZero = false;
  const valueSet = new Set<unknown>();
  for (const literalValue of items) {
    if (isZeroNumber(literalValue)) {
      if (Object.is(literalValue, -0)) hasNegativeZero = true;
      else hasPositiveZero = true;
    } else {
      valueSet.add(literalValue);
    }
  }

  return function (input: unknown): input is Primitive {
    if (isZeroNumber(input)) {
      return Object.is(input, -0) ? hasNegativeZero : hasPositiveZero;
    }
    return valueSet.has(input);
  };
};

/**
 * Creates a guard that matches when the input is one of the provided literal values.
 * Uses `Object.is` for exact value semantics. For large sets, keeps O(1) lookups while
 * preserving `+0` vs `-0` by tracking zero variants explicitly in addition to a `Set`.
 *
 * @param values Literal primitives to compare against (varargs or single readonly tuple array).
 * @returns Predicate narrowing to the union of the provided literal values.
 */
export function oneOfValues<const T extends ReadonlyArray<Primitive>>(
  ...values: T
): Predicate<T[number]>;
export function oneOfValues<const T extends ReadonlyArray<Primitive>>(
  values: T,
): Predicate<T[number]>;
export function oneOfValues<const T extends ReadonlyArray<Primitive>>(
  ...valuesOrArray: T | [T]
): Predicate<T[number]>;
export function oneOfValues(
  ...args: readonly Primitive[] | [readonly Primitive[]]
): Predicate<Primitive> {
  const items = normalizeValues(args);

  return items.length <= ONE_OF_VALUES_LINEAR_SCAN_MAX
    ? createLinearPredicate(items)
    : createSetPredicate(items);
}
