import type { Guard, GuardedOf, Predicate } from '@/types';
import { equalsKey } from './equals';

/**
 * Builds a guard that narrows a specific key to the provided literal value.
 *
 * Given a base guard and a property key, returns a function that accepts a
 * target value and produces a guard of the base type intersected with
 * `{ [key]: target }`.
 *
 * @param guard Base guard for objects that include `key`.
 * @param key Property key to narrow.
 * @returns Builder that takes a literal `target` and returns a guard that
 * narrows `key` to that literal.
 */
export function narrowKeyTo<A, K extends keyof A>(
  guard: Guard<A>,
  key: K
): <const T extends A[K]>(target: T) => Predicate<A & Record<K, T>>;
export function narrowKeyTo<
  K extends PropertyKey,
  F extends Predicate<Record<K, unknown>>,
>(
  guard: F,
  key: K
): <const T>(target: T) => Predicate<GuardedOf<F> & Record<K, T>> {
  return function <const T>(target: T) {
    const keyEquals = equalsKey(key, target);
    return function (input: unknown): input is GuardedOf<F> & Record<K, T> {
      return guard(input) && keyEquals(input as Record<K, unknown>);
    };
  };
}
