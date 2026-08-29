import type { Guard, Predicate } from '@/types';
import { hasOwnPropertyKey, hasOwnPropertyKeys } from '@/utils/own-properties';
import { define } from './define';
import { equalsKey } from './equals';
import type {
  KeyPresence,
  KeyPresences,
  SinglePropertyKey
} from './key-internals';
import { isObject } from './object';

type NarrowKeyPredicate<A, K extends PropertyKey, T> = [
  SinglePropertyKey<K>
] extends [never]
  ? Predicate<A>
  : Predicate<A & Record<K, T>>;

/**
 * Checks whether a value has the specified own key.
 *
 * @param key Property key to check.
 * @returns Predicate with key-specific narrowing for a singleton literal key,
 * or object-only narrowing for a multi-value key domain.
 */
export function hasKey<const K extends PropertyKey>(
  key: K
): Predicate<KeyPresence<K>>;
export function hasKey(key: PropertyKey): Predicate<object> {
  return define<object>(
    (input) => isObject(input) && hasOwnPropertyKey(input, key)
  );
}

/**
 * Checks whether a value has all specified own keys.
 *
 * @param keys Property keys to check.
 * @returns Predicate with key-specific narrowing when every argument is a
 * singleton literal key, or object-only narrowing otherwise.
 */
export function hasKeys<
  const KS extends readonly [PropertyKey, ...PropertyKey[]]
>(...keys: KS): Predicate<KeyPresences<KS>>;
export function hasKeys(...keys: readonly PropertyKey[]): Predicate<object> {
  // WHY: Type-level non-empty constraints can be bypassed from JavaScript or `any`.
  // Return a predicate that always fails so misuse does not crash applications.
  if (keys.length === 0) {
    return define<object>(() => false);
  }

  return define<object>(
    (input) => isObject(input) && hasOwnPropertyKeys(input, keys)
  );
}

/**
 * Builds a guard that narrows a specific key to the provided literal value.
 *
 * Given a base guard and a property key, returns a function that accepts a
 * target value and produces a guard of the base type intersected with
 * `{ [key]: target }`.
 *
 * @param guard Base guard for objects that include `key`.
 * @param key Property key to compare; singleton literals narrow that property.
 * @returns Builder that takes a literal `target` and returns a guard that
 * narrows a singleton `key` to that literal. Multi-value key domains preserve
 * only the base guard's type.
 */
export function narrowKeyTo<A, const K extends keyof A & PropertyKey>(
  guard: Guard<A>,
  key: K
): <const T extends A[K]>(target: T) => NarrowKeyPredicate<A, K, T>;
export function narrowKeyTo(
  guard: Guard<unknown>,
  key: PropertyKey
): (target: unknown) => Predicate<unknown> {
  // WHY: A broad or union key remains useful as a runtime check, but only a
  // singleton key overload may claim that one specific property was narrowed.
  return (target) => {
    const keyEquals = equalsKey(key, target);
    return define<unknown>(
      (input: unknown) => guard(input) && keyEquals(input)
    );
  };
}
