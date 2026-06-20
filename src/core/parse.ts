import type { Guard, Predicate, Refine, ParseResult } from '@/types';

/**
 * Executes a guard or refinement and returns a tagged result with the value when valid.
 *
 * @param guard Guard/refinement to evaluate.
 * @param value Value to check.
 * @returns `{ valid: true, value }` when the guard passes; `{ valid: false }` otherwise.
 */
export function safeParse<T>(guard: Guard<T>, value: unknown): ParseResult<T>;
export function safeParse<A, B extends A>(
  refine: Refine<A, B>,
  value: A
): ParseResult<B>;
export function safeParse(
  fn: (value: unknown) => boolean,
  value: unknown
): ParseResult<unknown>;
export function safeParse(
  fn: (value: unknown) => boolean,
  value: unknown
): ParseResult<unknown> {
  const valid = fn(value);
  return valid ? { valid: true, value } : { valid: false };
}

/**
 * Curried variant of `safeParse` for reuse.
 *
 * @param guard Guard/refinement to evaluate.
 * @returns Function that takes a value and returns the `ParseResult`.
 */
export function safeParseWith<T>(
  guard: Guard<T>
): (value: unknown) => ParseResult<T>;
export function safeParseWith<A, B extends A>(
  refine: Refine<A, B>
): (value: A) => ParseResult<B>;
export function safeParseWith(fn: (value: unknown) => boolean) {
  return (value: unknown) => safeParse(fn, value);
}

/**
 * Decodes JSON text and validates the decoded value without coercion.
 *
 * @param input JSON text to decode.
 * @param guard Guard used to validate the decoded `unknown` value.
 * @returns The decoded value when valid; `{ valid: false }` for invalid JSON or a guard mismatch.
 */
export function safeJsonParse<T>(
  input: string,
  guard: Predicate<T>
): ParseResult<T> {
  let value: unknown;

  try {
    // WHY: JSON.parse returns `any`; contain it as `unknown` at the decode
    // boundary so callers only receive values that pass the guard.
    value = JSON.parse(input);
  } catch {
    return { valid: false };
  }

  return safeParse(guard, value);
}
