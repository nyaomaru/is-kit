import type { Guard, Refine } from '@/types';

const DEFAULT_ASSERT_MESSAGE = 'Assertion failed';

/**
 * Asserts that a value satisfies a guard or refinement, otherwise throws.
 *
 * @param guard Guard/refinement to evaluate.
 * @param value Value to assert.
 * @param message Optional error message when assertion fails.
 * @returns Nothing when assertion passes; throws an `Error` on failure.
 */
export function assert<T>(
  guard: Guard<T>,
  value: unknown,
  message?: string
): asserts value is T;
export function assert<A, B extends A>(
  refine: Refine<A, B>,
  value: A,
  message?: string
): asserts value is B;
export function assert(
  fn: (value: unknown) => boolean,
  value: unknown,
  message?: string
): asserts value is unknown {
  if (fn(value)) return;
  throw new Error(message ?? DEFAULT_ASSERT_MESSAGE);
}
