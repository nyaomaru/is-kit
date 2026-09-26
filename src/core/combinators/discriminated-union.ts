import type { GuardedOf, NoExtraKeys, Predicate } from '@/types';
import { define } from '../define';
import { isFunction, isObject } from '../object';
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

type DiscriminantRuntimeKey<Value extends DiscriminantValue> =
  Value extends symbol
    ? Value
    : Value extends string | number | boolean
      ? `${Value}`
      : never;

type CollidingDiscriminantValues<
  Values extends DiscriminantValue,
  AllValues extends DiscriminantValue = Values
> = Values extends unknown
  ? DiscriminantRuntimeKey<Values> extends DiscriminantRuntimeKey<
      Exclude<AllValues, Values>
    >
    ? Values
    : never
  : never;

type NonCollidingDiscriminants<
  T extends object,
  K extends DiscriminantKey<T>
> = [CollidingDiscriminantValues<DiscriminantValues<T, K>>] extends [never]
  ? unknown
  : never;

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

const assertSafeProtoBranch = (guards: object): void => {
  if (hasOwnPropertyKey(guards, '__proto__')) return;

  // WHY: `{ __proto__: guard }` changes the object's prototype instead of
  // creating an own branch entry. A guard function as the prototype identifies
  // that likely typo and avoids silently rejecting the valid branch at runtime.
  if (isFunction(Object.getPrototypeOf(guards))) {
    throw new TypeError(
      "Use ['__proto__'] for a discriminatedUnion branch key so it is an own property."
    );
  }
};

/**
 * Creates an exhaustive guard for a union whose members share a literal discriminant.
 * Each discriminant value must have exactly one compatible branch guard. Values
 * that coerce to the same object key, such as `1` and `'1'`, are rejected.
 * Use `['__proto__']` for that literal discriminant so it becomes an own map key.
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
    guards: NoExtraKeys<G, DiscriminatedUnionGuardMap<T, K>> &
      NonCollidingDiscriminants<T, K>
  ): Predicate<GuardedOf<G[keyof G]>> => {
    assertSafeProtoBranch(guards);

    return define<GuardedOf<G[keyof G]>>((input) => {
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
  };
}
