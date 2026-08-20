import type { GuardedOf, GuardedWithin, Predicate, Refinement } from '@/types';
import type {
  BooleanRefinement,
  InputOf,
  RefinementFunction
} from '../refinement-internals';

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
  first: First & RefinementFunction<First>,
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
