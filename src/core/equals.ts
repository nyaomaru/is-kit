import type { GuardedOf, Predicate } from '@/types';
import { isObject } from './object';

/**
 * Creates a guard that matches values equal to the provided target using `Object.is` semantics.
 *
 * @param target Target value to compare against.
 * @returns Predicate narrowing to the exact literal type of `target`.
 */
export function equals<const T>(target: T): Predicate<T> {
  return function (input: unknown): input is T {
    return Object.is(input, target);
  };
}

/**
 * Creates a comparator builder based on a guard and selector.
 * Useful for checking whether a selected key or projection equals a target value.
 *
 * @param guard Guard for the base type before selecting a field.
 * @param selector Optional selector to project the comparable key; if omitted, returns a function to supply it later.
 * @returns Function that accepts a target and returns a predicate over the original value.
 */
export function equalsBy<F extends (value: unknown) => value is unknown>(
  guard: F
): <K>(
  selector: (value: GuardedOf<F>) => K
) => <const T extends K>(target: T) => Predicate<GuardedOf<F>>;
export function equalsBy<F extends (value: unknown) => value is unknown, K>(
  guard: F,
  selector: (value: GuardedOf<F>) => K
): <const T extends K>(target: T) => Predicate<GuardedOf<F>>;
export function equalsBy(
  guard: (value: unknown) => value is unknown,
  selector?: (value: unknown) => unknown
) {
  type Guarded = GuardedOf<typeof guard>;

  const createComparator =
    (selectorFn: (value: Guarded) => unknown) =>
    <T>(target: T) =>
    (input: unknown): input is Guarded => {
      if (!guard(input)) return false;
      return Object.is(selectorFn(input as Guarded), target);
    };

  if (selector) {
    return createComparator(selector as (value: Guarded) => unknown);
  }

  return (selector: (value: Guarded) => unknown) => createComparator(selector);
}

/**
 * Creates a guard that matches objects having a key equal to the target value.
 *
 * @param key Property key to compare.
 * @param target Value to compare using `Object.is`.
 * @returns Predicate narrowing to objects where `key` exists and equals `target`.
 */
export function equalsKey<K extends PropertyKey, const T>(
  key: K,
  target: T
): <A extends Record<K, unknown>>(input: unknown) => input is A & Record<K, T> {
  return function <A extends Record<K, unknown>>(
    input: unknown
  ): input is A & Record<K, T> {
    return (
      isObject(input) &&
      Object.prototype.hasOwnProperty.call(input, key) &&
      Object.is((input as Record<K, unknown>)[key], target)
    );
  };
}
