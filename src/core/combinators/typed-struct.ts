import type { InferSchema, OptionalSchemaField, Predicate } from '@/types';
import { struct } from './struct';

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

type TypedStructFields<T extends object, S extends TypedStructShape<T>> =
  NoExtraKeys<S, TypedStructShape<T>>;

/**
 * Creates a `struct` builder checked against an existing object type.
 * Optional target keys must also be declared with `optionalKey` so type drift
 * stays visible when the target type changes.
 *
 * @returns Builder that rejects missing, extra, or incompatible struct fields.
 */
export function typedStruct<T extends object>() {
  return <const S extends TypedStructShape<T>>(
    fields: TypedStructFields<T, S>,
    options?: { exact?: boolean }
  ): Predicate<InferSchema<TypedStructFields<T, S>>> =>
    // WHY: `typedStruct` keeps `struct` runtime behavior while using the target
    // type only to check that hand-written guard fields stay in sync.
    struct(fields, options);
}
