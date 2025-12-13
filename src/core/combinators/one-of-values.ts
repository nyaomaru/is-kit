import type { Primitive, Predicate } from '@/types';
import { define } from '@/core/define';

// WHY: For small literal sets, a linear scan with Object.is preserves
// equality semantics (NaN, +0/-0) without Set overhead; use Set when larger.
const ONE_OF_VALUES_LINEAR_SCAN_MAX = 8;

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
  values: T
): Predicate<T[number]>;
export function oneOfValues<const T extends ReadonlyArray<Primitive>>(
  ...valuesOrArray: T | [T]
): Predicate<T[number]>;
export function oneOfValues(
  ...args: readonly Primitive[] | [readonly Primitive[]]
): Predicate<Primitive> {
  // Detects the overload form with a single readonly array argument.
  const isSingleArrayArg = define<readonly [readonly Primitive[]]>((value) => {
    if (!Array.isArray(value)) return false;
    return value.length === 1 && Array.isArray(value[0]);
  });

  // Accept either varargs or a single readonly tuple array argument.
  const items: readonly Primitive[] = isSingleArrayArg(args) ? args[0] : args;

  if (items.length <= ONE_OF_VALUES_LINEAR_SCAN_MAX) {
    return function (input: unknown): input is Primitive {
      return items.some((value) => Object.is(value, input));
    };
  }

  // WHY: Set uses SameValueZero (treats +0 and -0 as equal). To preserve
  // Object.is semantics for zeros while keeping O(1) lookups, track -0/+0
  // explicitly and use Set for all other values.
  let hasPositiveZero = false;
  let hasNegativeZero = false;
  const valueSet = new Set<unknown>();
  for (const literalValue of items) {
    if (
      typeof literalValue === 'number' &&
      (Object.is(literalValue, 0) || Object.is(literalValue, -0))
    ) {
      if (Object.is(literalValue, -0)) hasNegativeZero = true;
      else hasPositiveZero = true;
    } else {
      valueSet.add(literalValue);
    }
  }

  return function (input: unknown): input is Primitive {
    if (
      typeof input === 'number' &&
      (Object.is(input, 0) || Object.is(input, -0))
    ) {
      return Object.is(input, -0) ? hasNegativeZero : hasPositiveZero;
    }
    return valueSet.has(input);
  };
}
