import type { Predicate } from '@/types';

/**
 * Wraps a user function as a typed predicate.
 * Prefer `define<T>(...)` when creating a reusable custom guard from a runtime
 * boolean check.
 *
 * Note: The correctness of the predicate is the caller's responsibility.
 * Its result is coerced to a boolean using `!!` for consistent guard behavior.
 *
 * @param fn Function that returns truthy when the value matches the target shape.
 * @returns Predicate narrowing to the intended type when it returns true.
 * @example
 * const isSlug = define<string>(
 *   (value) => isString(value) && /^[a-z0-9-]+$/.test(value)
 * );
 */
export function define<T>(fn: (value: unknown) => value is T): Predicate<T>;
export function define<T>(fn: (value: unknown) => boolean): Predicate<T>;
export function define<T>(
  fn: ((value: unknown) => value is T) | ((value: unknown) => boolean)
): Predicate<T> {
  return (value: unknown): value is T => !!fn(value);
}
