import type {
  Guard,
  GuardedOf,
  Refine,
  RefineChain,
  ChainResult,
  Refinement,
  OutOfGuards,
  Predicate
} from '@/types';

// WHY: `never` lets implementation overloads accept functions from any input
// domain without falsely claiming that narrow-domain refinements accept `unknown`.
type BooleanRefinement = (input: never) => boolean;

type InputOf<F> =
  F extends Refinement<infer Input, infer _Output> ? Input : never;

/**
 * Combines a precondition refinement with an additional refinement.
 * Prefer this over hand-written `precondition(x) && condition(x)` when the
 * composed refinement should be reused.
 *
 * @param precondition Broad guard evaluated first; short-circuits on failure.
 * @param condition Refinement evaluated only when `precondition` passes.
 * @returns Refinement that preserves the precondition's input domain.
 * @example
 * const isPositiveNumber = and(
 *   isNumber,
 *   predicateToRefine<number>((value) => value > 0)
 * );
 * @see andAll
 */
export function and<A, B extends A>(
  precondition: Guard<A>,
  condition: Refine<A, B>
): Predicate<B>;
export function and<
  Precondition extends BooleanRefinement,
  B extends GuardedOf<Precondition>
>(
  precondition: Precondition,
  condition: Refine<GuardedOf<Precondition>, B>
): Refinement<InputOf<Precondition>, B>;
export function and(
  precondition: BooleanRefinement,
  condition: BooleanRefinement
): BooleanRefinement {
  return (input) => !!(precondition(input) && condition(input));
}

/**
 * Chains refinements while preserving the precondition's input domain.
 * Use this instead of nested `&&` checks when each step should keep narrowing
 * the next refinement.
 *
 * @param precondition Initial guard applied first.
 * @param steps Subsequent refinements applied in order.
 * @returns Refinement reflecting the final result of the chain.
 * @example
 * const isPublicTitle = andAll(isString, minLength(4), startsWithPublic);
 * @see and
 */
export function andAll<A>(precondition: Guard<A>): Guard<A>;
export function andAll<A, B extends A>(
  precondition: Guard<A>,
  step1: Refine<A, B>
): Guard<B>;
export function andAll<A, B extends A, C extends B>(
  precondition: Guard<A>,
  step1: Refine<A, B>,
  step2: Refine<B, C>
): Guard<C>;
export function andAll<A, Chain extends readonly Refine<unknown, unknown>[]>(
  precondition: Guard<A>,
  ...steps: Chain & RefineChain<A, Chain>
): Guard<ChainResult<A, Chain>>;
export function andAll<Precondition extends BooleanRefinement>(
  precondition: Precondition
): Refinement<InputOf<Precondition>, GuardedOf<Precondition>>;
export function andAll<
  Precondition extends BooleanRefinement,
  B extends GuardedOf<Precondition>
>(
  precondition: Precondition,
  step1: Refine<GuardedOf<Precondition>, B>
): Refinement<InputOf<Precondition>, B>;
export function andAll<
  Precondition extends BooleanRefinement,
  B extends GuardedOf<Precondition>,
  C extends B
>(
  precondition: Precondition,
  step1: Refine<GuardedOf<Precondition>, B>,
  step2: Refine<B, C>
): Refinement<InputOf<Precondition>, C>;
export function andAll<
  Precondition extends BooleanRefinement,
  Chain extends readonly unknown[]
>(
  precondition: Precondition,
  ...steps: Chain & RefineChain<GuardedOf<Precondition>, Chain>
): Refinement<
  InputOf<Precondition>,
  ChainResult<GuardedOf<Precondition>, Chain>
>;
export function andAll(
  precondition: (input: never) => boolean,
  ...steps: readonly ((input: never) => boolean)[]
): (input: never) => boolean {
  return (input) => {
    if (!precondition(input)) return false;
    return steps.every((step) => step(input));
  };
}

/**
 * Logical OR over refinements sharing an input domain.
 * Prefer this over hand-written `refineA(x) || refineB(x)` when the composed
 * refinement should be reused.
 *
 * @param refinements Refinements to evaluate; passes if any refinement passes.
 * @returns Refinement for the union of all narrowed types.
 * @example
 * const isId = or(isString, isNumber);
 * @see oneOf
 */
export function or<P extends readonly Guard<unknown>[]>(
  ...guards: P
): Guard<OutOfGuards<P>>;
export function or<
  First extends BooleanRefinement,
  Rest extends readonly Refinement<InputOf<First>, InputOf<First>>[]
>(
  first: First,
  ...rest: Rest
): Refinement<
  InputOf<First>,
  Extract<GuardedOf<First> | GuardedOf<Rest[number]>, InputOf<First>>
>;
export function or(
  ...refinements: readonly ((input: never) => boolean)[]
): (input: never) => boolean {
  return (input) => refinements.some((refinement) => refinement(input));
}

/**
 * Adapts a guard so it can be used as a refinement within a known supertype.
 *
 * @returns Function that converts a `Guard<T>` into a `Refine<A, T>` when `T extends A`.
 * @see and
 */
export function guardIn<A>(): <T extends A>(guard: Guard<T>) => Refine<A, T>;
export function guardIn<A>(): <T extends A>(guard: Guard<T>) => Refine<A, T> {
  return <T extends A>(guard: Guard<T>): Refine<A, T> =>
    (input: A): input is T =>
      guard(input);
}

/**
 * Logical negation of a guard/refinement.
 * Use this when a negated predicate should be named and reused.
 *
 * @param guard Guard or refinement to negate.
 * @returns Refinement excluding the guarded subtype from the input type.
 * @example
 * const isPresent = not(isNil);
 */
export function not<A, T>(
  guard: Guard<T>
): Refine<A, Exclude<A, Extract<A, T>>>;
export function not<A, B extends A>(
  refine: Refine<A, B>
): Refine<A, Exclude<A, B>>;
export function not(fn: (input: unknown) => boolean) {
  return (input: unknown) => !fn(input);
}
