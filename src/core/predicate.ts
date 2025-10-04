import type { Refine } from '@/types';

/**
 * Converts a boolean predicate into a refinement preserving the input type.
 *
 * @param fn Boolean-returning function over a value of type A.
 * @returns Refinement equivalent to the provided predicate.
 */
export const predicateToRefine =
  <A>(fn: (value: A) => boolean): Refine<A, A> =>
  (value: A): value is A =>
    fn(value);
