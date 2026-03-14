import type { GuardedOf, Predicate } from '@/types';
import { define } from './define';
import { isObject } from './object';

// WHY: Control-flow analysis does not preserve the narrowed target of a generic
// predicate like `F extends Predicate<unknown>` at the call site. Re-expressing
// the guard through this helper gives TypeScript a concrete `GuardedOf<F>`
// predicate it can apply to `input`.
const guardedBy = <F extends Predicate<unknown>>(guard: F) =>
  define<GuardedOf<F>>((input) => guard(input));

/**
 * Creates a guard that matches values equal to the provided target using `Object.is` semantics.
 *
 * @param target Target value to compare against.
 * @returns Predicate narrowing to the exact literal type of `target`.
 */
export function equals<const T>(target: T): Predicate<T> {
  return define<T>((input) => Object.is(input, target));
}

/**
 * Creates a comparator builder based on a guard and selector.
 * Useful for checking whether a selected key or projection equals a target value.
 *
 * @param guard Guard for the base type before selecting a field.
 * @param selector Optional selector to project the comparable key; if omitted, returns a function to supply it later.
 * @returns Function that accepts a target and returns a predicate over the original value.
 */
export function equalsBy<F extends Predicate<unknown>>(
  guard: F
): <K>(
  selector: (value: GuardedOf<F>) => K
) => <const T extends K>(target: T) => Predicate<GuardedOf<F>>;
export function equalsBy<F extends Predicate<unknown>, K>(
  guard: F,
  selector: (value: GuardedOf<F>) => K
): <const T extends K>(target: T) => Predicate<GuardedOf<F>>;
export function equalsBy<F extends Predicate<unknown>, K>(
  guard: F,
  selector?: (value: GuardedOf<F>) => K
) {
  const matchesGuard = guardedBy(guard);
  const createComparator =
    <Selected>(selectorFn: (value: GuardedOf<F>) => Selected) =>
    <const T extends Selected>(target: T) =>
      define<GuardedOf<F>>((input) => {
        if (!matchesGuard(input)) return false;
        return Object.is(selectorFn(input), target);
      });

  if (selector) {
    return createComparator(selector);
  }

  return <Selected>(selectorFn: (value: GuardedOf<F>) => Selected) =>
    createComparator(selectorFn);
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
  const hasMatchingKey = define<Record<K, T>>((input) => {
    return (
      isObject(input) &&
      Object.prototype.hasOwnProperty.call(input, key) &&
      Object.is(input[key], target)
    );
  });

  return <A extends Record<K, unknown>>(
    input: unknown
  ): input is A & Record<K, T> => hasMatchingKey(input);
}
