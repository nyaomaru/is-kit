import type { GuardedOf, NoExtraKeys, Predicate } from '@/types';
import { define } from '../define';
import { isObject } from '../object';
import { isNumberPrimitive, isString, isSymbol } from '../primitive';
import { hasOwnPropertyKey } from '@/utils/own-properties';

type DiscriminantKey<T extends object> = {
  [K in keyof T]-?: [T] extends [Record<K, PropertyKey>] ? K : never;
}[keyof T];

type DiscriminantValues<T extends object, K extends DiscriminantKey<T>> =
  T extends Record<K, infer Value> ? Value & PropertyKey : never;

type DiscriminatedUnionGuardMap<
  T extends object,
  K extends DiscriminantKey<T>
> = {
  readonly [Value in DiscriminantValues<T, K>]: Predicate<
    Extract<T, Record<K, Value>>
  >;
};

const isPropertyKey = (value: unknown): value is PropertyKey =>
  isString(value) || isNumberPrimitive(value) || isSymbol(value);

/**
 * Creates an exhaustive guard for a union whose members share a literal discriminant.
 * Each discriminant value must have exactly one compatible branch guard.
 *
 * @param discriminant Required property that identifies each union member.
 * @param guards Branch guards keyed by the discriminant values.
 * @returns Predicate narrowing to the union accepted by the branch guards.
 */
export function discriminatedUnion<T extends object>() {
  return <
    const K extends DiscriminantKey<T>,
    const G extends DiscriminatedUnionGuardMap<T, K>
  >(
    discriminant: K,
    guards: NoExtraKeys<G, DiscriminatedUnionGuardMap<T, K>>
  ): Predicate<GuardedOf<G[keyof G]>> =>
    define<GuardedOf<G[keyof G]>>((input) => {
      if (!isObject(input) || !hasOwnPropertyKey(input, discriminant)) {
        return false;
      }

      const value = input[discriminant];
      if (!isPropertyKey(value) || !hasOwnPropertyKey(guards, value)) {
        return false;
      }

      // WHY: Property lookup follows JavaScript's key coercion, so numeric
      // discriminants select object-literal branch keys such as `1` correctly.
      const guard: Predicate<unknown> = guards[value as keyof G];
      return guard(input);
    });
}
