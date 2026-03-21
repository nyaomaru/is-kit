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

type Simplify<T> = { [K in keyof T]: T[K] };

type InferSchemaField<F> = F extends Predicate<unknown>
  ? GuardedOf<F>
  : F extends OptionalSchemaField<infer G>
    ? GuardedOf<G>
    : never;

type RequiredSchemaKeys<S extends Schema> = {
  [K in keyof S]-?: S[K] extends OptionalSchemaField<Predicate<unknown>>
    ? never
    : K;
}[keyof S];

type OptionalSchemaKeys<S extends Schema> = {
  [K in keyof S]-?: S[K] extends OptionalSchemaField<Predicate<unknown>>
    ? K
    : never;
}[keyof S];

/**
 * Infers the readonly object type produced by a `struct` schema.
 */
export type InferSchema<S extends Schema> = Simplify<
  {
    readonly [K in RequiredSchemaKeys<S>]: InferSchemaField<S[K]>;
  } & {
    readonly [K in OptionalSchemaKeys<S>]?: InferSchemaField<S[K]>;
  }
>;
