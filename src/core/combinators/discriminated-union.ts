import type { GuardedOf, NoExtraKeys, Predicate } from '@/types';
import { define } from '../define';
import { isFunction, isObject } from '../object';
import { isBoolean, isNumberPrimitive, isString, isSymbol } from '../primitive';
import { hasOwnPropertyKey } from '@/utils/own-properties';

type DiscriminantValue = PropertyKey | boolean;

type IsFixedDiscriminantValue<Value extends DiscriminantValue> =
  Value extends unknown
    ? Value extends boolean
      ? true
      : Value extends PropertyKey
        ? {} extends Record<Value, unknown>
          ? false
          : true
        : false
    : never;

type IsFiniteDiscriminantValue<Values extends DiscriminantValue> =
  false extends IsFixedDiscriminantValue<Values> ? false : true;

type DiscriminantKey<T extends object> = {
  [K in keyof T]-?: [T] extends [Record<K, DiscriminantValue>]
    ? IsFiniteDiscriminantValue<T[K] & DiscriminantValue> extends true
      ? K
      : never
    : never;
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

type IsUnion<Value, Whole = Value> = Value extends unknown
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

type HasUnionElement<Values extends readonly unknown[]> =
  Values extends readonly [infer Head, ...infer Tail extends readonly unknown[]]
    ? true extends IsUnion<Head>
      ? true
      : HasUnionElement<Tail>
    : false;

type ExactDiscriminantValues<
  T extends object,
  K extends DiscriminantKey<T>,
  Values extends readonly DiscriminantValue[]
> = Values extends unknown
  ? number extends Values['length']
    ? never
    : HasUnionElement<Values> extends true
      ? never
      : [DiscriminantValues<T, K>] extends [Values[number]]
        ? [Values[number]] extends [DiscriminantValues<T, K>]
          ? unknown
          : never
        : never
  : never;

type MatchingDiscriminantMember<
  T extends object,
  K extends DiscriminantKey<T>,
  Value extends DiscriminantValue
> =
  T extends Record<K, DiscriminantValue>
    ? Value extends T[K]
      ? T
      : never
    : never;

type DiscriminatedUnionGuardMap<
  T extends object,
  K extends DiscriminantKey<T>,
  Values extends DiscriminantValue
> = {
  readonly [Value in Values as DiscriminantMapKey<Value>]: Predicate<
    MatchingDiscriminantMember<T, K, Value>
  >;
};

type InvalidGuardDiscriminantValues<
  K extends PropertyKey,
  Values extends DiscriminantValue,
  G extends object
> = {
  [Value in Values as DiscriminantMapKey<Value>]: G extends Record<
    DiscriminantMapKey<Value>,
    infer Guard
  >
    ? GuardedOf<Guard> extends Record<K, DiscriminantValue>
      ? Value extends GuardedOf<Guard>[K]
        ? never
        : Value
      : Value
    : Value;
}[DiscriminantMapKey<Values>];

type GuardsMatchDiscriminantValues<
  K extends PropertyKey,
  Values extends DiscriminantValue,
  G extends object
> = [InvalidGuardDiscriminantValues<K, Values, G>] extends [never]
  ? unknown
  : never;

const isDiscriminantValue = (value: unknown): value is DiscriminantValue =>
  isString(value) ||
  isNumberPrimitive(value) ||
  isSymbol(value) ||
  isBoolean(value);

const toRuntimeKey = (value: DiscriminantValue): PropertyKey =>
  isSymbol(value) ? value : String(value);

const assertSafeProtoBranch = (
  values: readonly DiscriminantValue[],
  guards: object
): void => {
  if (!values.includes('__proto__')) return;
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

const assertBranchKeys = (
  values: readonly DiscriminantValue[],
  guards: object
): ReadonlySet<PropertyKey> => {
  const keys = new Set<PropertyKey>();

  for (const value of values) {
    const key = toRuntimeKey(value);
    if (keys.has(key)) {
      throw new TypeError(
        `Duplicate discriminatedUnion discriminant value for ${String(value)}.`
      );
    }

    keys.add(key);

    if (!hasOwnPropertyKey(guards, key)) {
      throw new TypeError(
        `Missing discriminatedUnion branch guard for ${String(value)}.`
      );
    }
  }

  return keys;
};

/**
 * Creates an exhaustive guard for a union whose members share a literal discriminant.
 * A tuple of every discriminant value keeps finite coverage explicit at runtime
 * and compile time. Values that coerce to the same object key, such as `1` and
 * `'1'`, are rejected.
 * Use `['__proto__']` for that literal discriminant so it becomes an own map key.
 *
 * @param discriminant Required property that identifies each union member.
 * @param values Finite tuple containing every discriminant value.
 * @param guards Branch guards keyed by the discriminant values.
 * @returns Predicate narrowing to the union accepted by the branch guards.
 */
export function discriminatedUnion<T extends object>() {
  return <
    const K extends DiscriminantKey<T>,
    const Values extends readonly DiscriminantValue[],
    const G extends DiscriminatedUnionGuardMap<T, K, Values[number]>
  >(
    discriminant: K,
    values: Values & ExactDiscriminantValues<T, K, Values>,
    guards: NoExtraKeys<G, DiscriminatedUnionGuardMap<T, K, Values[number]>> &
      NonCollidingDiscriminants<T, K> &
      GuardsMatchDiscriminantValues<K, Values[number], G>
  ): Predicate<GuardedOf<G[keyof G]>> => {
    assertSafeProtoBranch(values, guards);
    const declaredKeys = assertBranchKeys(values, guards);

    return define<GuardedOf<G[keyof G]>>((input) => {
      if (
        (!isObject(input) && !isFunction(input)) ||
        !hasOwnPropertyKey(input, discriminant)
      ) {
        return false;
      }

      const value = Reflect.get(input, discriminant);
      if (!isDiscriminantValue(value)) {
        return false;
      }

      const key = toRuntimeKey(value);
      if (!declaredKeys.has(key) || !hasOwnPropertyKey(guards, key)) {
        return false;
      }

      const guard: Predicate<unknown> = guards[key as keyof G];
      return guard(input);
    });
  };
}
