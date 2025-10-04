import type { Guard, Refine } from '@/types';

/**
 * Allows `null` in addition to values accepted by the given guard/refinement.
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `null`.
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
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `null | undefined`.
 */
export function nullish<T>(guard: Guard<T>): Guard<T | null | undefined>;
export function nullish<A, B extends A>(
  refine: Refine<A, B>
): Refine<A | null | undefined, B | null | undefined>;
export function nullish(fn: (value: unknown) => boolean) {
  return (value: unknown) => value == null || fn(value);
}

/**
 * Allows `undefined` in addition to values accepted by the guard.
 *
 * @param guard Guard/refinement for the base type.
 * @returns Guard/refinement widened to include `undefined`.
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
 */
export function required<T>(guard: Guard<T | undefined>): Guard<T>;
export function required<A, B extends A>(
  refine: Refine<A | undefined, B | undefined>
): Refine<A, B>;
export function required(fn: (value: unknown) => boolean) {
  return (value: unknown) => value !== undefined && fn(value);
}
