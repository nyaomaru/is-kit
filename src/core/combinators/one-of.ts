import type { GuardedOf, GuardedWithin, Predicate, Refinement } from '@/types';

/**
 * Combines refinements sharing an input domain.
 *
 * @param refinements One or more refinements to try.
 * @returns Refinement that narrows to the union of matching types.
 */
export function oneOf<Fs extends readonly Predicate<unknown>[]>(
  ...guards: Fs
): Predicate<GuardedOf<Fs[number]>>;
export function oneOf<A, Fs extends readonly Predicate<A>[]>(
  ...guards: Fs
): (input: A) => input is GuardedWithin<Fs, A>;
export function oneOf<A, B extends A, Rest extends readonly Refinement<A, A>[]>(
  first: Refinement<A, B>,
  ...rest: Rest
): Refinement<A, B | GuardedOf<Rest[number]>>;
export function oneOf(
  ...refinements: readonly ((input: never) => boolean)[]
): (input: never) => boolean {
  return (input) => refinements.some((refinement) => refinement(input));
}
