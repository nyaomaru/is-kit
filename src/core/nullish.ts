import type { Guard, Refine } from '@/types';

/**
 * Allows `null` in addition to values accepted by the given guard/refinement.
 * Use this instead of hand-writing `value === null || guard(value)` when the
 * widened predicate should stay reusable.
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `null`.
 * @example
 * const isNullableString = nullable(isString);
 * @see nullish
 */
export function nullable<T>(guard: Guard<T>): Guard<T | null>;
export function nullable<A, B extends A>(
  refine: Refine<A, B>
): Refine<A | null, B | null>;
export function nullable(fn: (value: unknown) => boolean) {
  return (value: unknown) => value === null || fn(value);
}

/**
 * Excludes `null` from the accepted values.
 *
 * @param guard Guard/refinement possibly including `null`.
 * @returns Guard/refinement with `null` excluded.
 * @example
 * const isNonNullString = nonNull(nullable(isString));
 */
export function nonNull<T>(guard: Guard<T>): Guard<Exclude<T, null>>;
export function nonNull<A, B extends A>(
  refine: Refine<A, B>
): Refine<Exclude<A, null>, Exclude<B, null>>;
export function nonNull(fn: (value: unknown) => boolean) {
  return (value: unknown) => value !== null && fn(value);
}

/**
 * Allows `null` or `undefined` in addition to values accepted by the guard.
 * Use this instead of hand-writing `isNil(value) || guard(value)` when widening
 * another guard.
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `null | undefined`.
 * @example
 * const isNullishString = nullish(isString);
 * @see isNil
 */
export function nullish<T>(guard: Guard<T>): Guard<T | null | undefined>;
export function nullish<A, B extends A>(
  refine: Refine<A, B>
): Refine<A | null | undefined, B | null | undefined>;
export function nullish(fn: (value: unknown) => boolean) {
  // WHY: Explicit strict checks preserve the declared nullish set for browser
  // values such as `document.all`, which loose equality treats as nullish.
  return (value: unknown) => value === null || value === undefined || fn(value);
}

/**
 * Allows `undefined` in addition to values accepted by the guard.
 * Use this for value-level optionality. For optional object keys in `struct`,
 * use `optionalKey(...)`.
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `undefined`.
 * @example
 * const isOptionalString = optional(isString);
 */
export function optional<T>(guard: Guard<T>): Guard<T | undefined>;
export function optional<A, B extends A>(
  refine: Refine<A, B>
): Refine<A | undefined, B | undefined>;
export function optional(fn: (value: unknown) => boolean) {
  return (value: unknown) => value === undefined || fn(value);
}

/**
 * Requires a value to be present (excludes `undefined`).
 *
 * @param guard Guard/refinement that may accept `undefined`.
 * @returns Guard/refinement with `undefined` removed.
 * @example
 * const isRequiredString = required(optional(isString));
 */
export function required<T>(guard: Guard<T | undefined>): Guard<T>;
export function required<A, B extends A>(
  refine: Refine<A | undefined, B | undefined>
): Refine<A, B>;
export function required(fn: (value: unknown) => boolean) {
  return (value: unknown) => value !== undefined && fn(value);
}
