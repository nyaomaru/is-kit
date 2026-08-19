import type { GuardedOf, GuardedWithin, Predicate, Refinement } from '@/types';

// WHY: `never` lets the implementation accept functions from any input domain
// without falsely claiming that narrow-domain refinements accept `unknown`.
type BooleanRefinement = (input: never) => boolean;

type InputOf<F> =
  F extends Refinement<infer Input, infer _Output> ? Input : never;

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
export function oneOf<
  First extends BooleanRefinement,
  Rest extends readonly Refinement<InputOf<First>, InputOf<First>>[]
>(
  first: First,
  ...rest: Rest
): Refinement<
  InputOf<First>,
  Extract<GuardedOf<First> | GuardedOf<Rest[number]>, InputOf<First>>
>;
export function oneOf(
  ...refinements: readonly ((input: never) => boolean)[]
): (input: never) => boolean {
  return (input) => refinements.some((refinement) => refinement(input));
}
