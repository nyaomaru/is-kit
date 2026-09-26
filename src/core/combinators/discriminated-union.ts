import type { GuardedOf, NoExtraKeys, Predicate } from '@/types';
import { define } from '../define';
import { isObject } from '../object';
import { isBoolean, isNumberPrimitive, isString, isSymbol } from '../primitive';
import { hasOwnPropertyKey } from '@/utils/own-properties';

type DiscriminantValue = PropertyKey | boolean;

type DiscriminantKey<T extends object> = {
  [K in keyof T]-?: [T] extends [Record<K, DiscriminantValue>] ? K : never;
}[keyof T];

type DiscriminantValues<T extends object, K extends DiscriminantKey<T>> =
  T extends Record<K, infer Value> ? Value & DiscriminantValue : never;

type DiscriminantMapKey<Value extends DiscriminantValue> = Value extends boolean
  ? `${Value}`
  : Value;

type DiscriminatedUnionGuardMap<
  T extends object,
  K extends DiscriminantKey<T>
> = {
  readonly [Value in DiscriminantValues<
    T,
    K
  > as DiscriminantMapKey<Value>]: Predicate<Extract<T, Record<K, Value>>>;
};

const isDiscriminantValue = (value: unknown): value is DiscriminantValue =>
  isString(value) ||
  isNumberPrimitive(value) ||
  isSymbol(value) ||
  isBoolean(value);

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
      if (!isDiscriminantValue(value)) {
        return false;
      }

      // WHY: Object keys coerce booleans to strings. Type-level mapping uses
      // the same `true`/`false` key spelling, so Result-style unions dispatch
      // to the branch whose compile-time key was required.
      const key = isBoolean(value) ? String(value) : value;
      if (!hasOwnPropertyKey(guards, key)) return false;

      const guard: Predicate<unknown> = guards[key as keyof G];
      return guard(input);
    });
}
