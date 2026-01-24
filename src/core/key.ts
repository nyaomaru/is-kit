import type { Guard, GuardedOf, Predicate } from '@/types';
import { equalsKey } from './equals';
import { define } from './define';

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
  key: K,
): <const T extends A[K]>(target: T) => Predicate<A & Record<K, T>>;
export function narrowKeyTo<
  K extends PropertyKey,
  F extends Predicate<Record<K, unknown>>,
>(
  guard: F,
  key: K,
): <const T>(target: T) => Predicate<GuardedOf<F> & Record<K, T>> {
  // WHY: Provide two overloads to balance type safety and flexibility.
  // - When base type A and key K are known, enforce T extends A[K] for precise literal narrowing.
  // - For generic guards, accept F extends Predicate<Record<K, unknown>> and return GuardedOf<F> & Record<K, T>.
  //   This keeps the API usable with inferred/anonymous guards.
  // Use equalsKey for Object.is semantics and own-property presence; wrap with define to coerce the result to boolean for consistent guard behavior (as documented in define), not just to produce a typed Predicate.
  return function <const T>(target: T) {
    const keyEquals = equalsKey(key, target);
    return define<GuardedOf<F> & Record<K, T>>(function (input: unknown) {
      return guard(input) && keyEquals(input);
    });
  };
}
