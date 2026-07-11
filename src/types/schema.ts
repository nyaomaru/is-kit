import type { GuardedOf, Predicate } from './core';

/**
 * Marks a `struct` schema field as optional at the key level.
 */
export type OptionalSchemaField<G extends Predicate<unknown>> = Readonly<{
  optional: true;
  guard: G;
}>;

/**
 * Field accepted by `struct` schemas.
 */
export type SchemaField =
  | Predicate<unknown>
  | OptionalSchemaField<Predicate<unknown>>;

/**
 * Object schema consumed by `struct`.
 */
export type Schema = Readonly<Record<string, SchemaField>>;

/**
 * Object schema shape preserving concrete keys.
 */
export type SchemaShape<S extends object> = Readonly<{
  [K in keyof S]: SchemaField;
}>;

type Simplify<T> = { [K in keyof T]: T[K] };

type InferSchemaField<F> =
  F extends Predicate<unknown>
    ? GuardedOf<F>
    : F extends OptionalSchemaField<infer G>
      ? GuardedOf<G>
      : never;

type RequiredSchemaKeys<S extends SchemaShape<S>> = {
  [K in keyof S]-?: S[K] extends OptionalSchemaField<Predicate<unknown>>
    ? never
    : K;
}[keyof S];

type OptionalSchemaKeys<S extends SchemaShape<S>> = {
  [K in keyof S]-?: S[K] extends OptionalSchemaField<Predicate<unknown>>
    ? K
    : never;
}[keyof S];

/**
 * Infers the readonly object type produced by a `struct` schema.
 */
export type InferSchema<S extends SchemaShape<S>> = Simplify<
  {
    readonly [K in RequiredSchemaKeys<S>]: InferSchemaField<S[K]>;
  } & {
    readonly [K in OptionalSchemaKeys<S>]?: InferSchemaField<S[K]>;
  }
>;

/**
 * Extracts optional keys from an object type.
 */
export type OptionalObjectKeys<T> = {
  // WHY: Optional keys accept an empty object when picked in isolation.
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Extracts required keys from an object type.
 */
export type RequiredObjectKeys<T> = Exclude<keyof T, OptionalObjectKeys<T>>;

/**
 * Schema shape checked against an existing object type by `typedStruct`.
 */
export type TypedStructShape<T extends object> = {
  readonly [K in Extract<RequiredObjectKeys<T>, string>]-?: Predicate<T[K]>;
} & {
  readonly [K in Extract<OptionalObjectKeys<T>, string>]-?: OptionalSchemaField<
    Predicate<T[K]>
  >;
};

/**
 * Keeps a schema type while rejecting keys outside the expected shape.
 */
export type NoExtraKeys<S, Shape> = S & {
  readonly [K in Exclude<keyof S, keyof Shape>]: never;
};

/**
 * Field set accepted by `typedStruct` for a target object type.
 */
export type TypedStructFields<
  T extends object,
  S extends TypedStructShape<T>
> = NoExtraKeys<S, TypedStructShape<T>>;
