import type { Primitive, Predicate } from '@/types';

// WHY: For small literal sets, a linear scan with Object.is preserves
// equality semantics (NaN, +0/-0) without Set overhead; use Set when larger.
const ONE_OF_VALUES_LINEAR_SCAN_MAX = 8;

/**
 * Creates a guard that matches when the input is one of the provided literal values.
 * Uses `Object.is` for exact value semantics.
 *
 * @param values Literal primitives to compare against.
 * @returns Predicate narrowing to the union of the provided literal values.
 */
export function oneOfValues<const T extends ReadonlyArray<Primitive>>(
  ...values: T
): Predicate<T[number]> {
  if (values.length <= ONE_OF_VALUES_LINEAR_SCAN_MAX) {
    const items = values as readonly unknown[];
    return function (input: unknown): input is T[number] {
      return items.some((value) => Object.is(value, input));
    };
  }
  const valueSet = new Set(values as readonly unknown[]);
  return function (input: unknown): input is T[number] {
    return valueSet.has(input);
  };
}
