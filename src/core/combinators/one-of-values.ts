import type { Primitive, Predicate } from '@/types';

// WHY: For small literal sets, a linear scan with Object.is preserves
// equality semantics (NaN, +0/-0) without Set overhead; use Set when larger.
const ONE_OF_VALUES_LINEAR_SCAN_MAX = 8;

/**
 * Creates a guard that matches when the input is one of the provided literal values.
 * Uses `Object.is` for exact value semantics on small sets; switches to `Set` for larger sets.
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
export function oneOfValues(
  ...valuesOrArray: ReadonlyArray<Primitive> | [ReadonlyArray<Primitive>]
): Predicate<Primitive> {
  // Accept either varargs or a single readonly tuple array argument.
  const items: readonly unknown[] =
    valuesOrArray.length === 1 && Array.isArray(valuesOrArray[0])
      ? valuesOrArray[0]
      : valuesOrArray;

  if (items.length <= ONE_OF_VALUES_LINEAR_SCAN_MAX) {
    return function (input: unknown): input is Primitive {
      return items.some((value) => Object.is(value, input));
    };
  }

  const valueSet = new Set(items);
  return function (input: unknown): input is Primitive {
    return valueSet.has(input);
  };
}
