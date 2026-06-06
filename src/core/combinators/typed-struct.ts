import type { OptionalSchemaField, Predicate, Schema } from '@/types';
import { struct } from './struct';

type Simplify<T> = { [K in keyof T]: T[K] };

type StringKeyOf<T> = Extract<keyof T, string>;

type OptionalKeys<T> = {
  // WHY: Optional keys accept an empty object when picked in isolation.
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

type TypedStructShape<T extends object> = {
  readonly [K in Extract<RequiredKeys<T>, string>]-?: Predicate<T[K]>;
} & {
  readonly [K in Extract<OptionalKeys<T>, string>]-?: OptionalSchemaField<
    Predicate<T[K]>
  >;
};

type NoExtraKeys<S, Shape> = S & {
  readonly [K in Exclude<keyof S, keyof Shape>]: never;
};

type TypedStructTarget<T extends object> = Simplify<
  Readonly<Pick<T, StringKeyOf<T>>>
>;

/**
 * Creates a `struct` builder checked against an existing object type.
 * Optional target keys must also be declared with `optionalKey` so type drift
 * stays visible when the target type changes.
 *
 * @returns Builder that rejects missing, extra, or incompatible struct fields.
 */
export function typedStruct<T extends object>() {
  return <const S extends TypedStructShape<T>>(
    fields: NoExtraKeys<S, TypedStructShape<T>>,
    options?: { exact?: boolean }
  ): Predicate<TypedStructTarget<T>> =>
    // WHY: `typedStruct` keeps `struct` runtime behavior while using the target
    // type only to check that hand-written guard fields stay in sync.
    struct(fields as Schema, options) as Predicate<TypedStructTarget<T>>;
}
