import type {
  Guard,
  Refine,
  RefineChain,
  ChainResult,
  OutOfGuards,
  Predicate
} from '@/types';
import { toBooleanPredicates } from '@/utils';

/**
 * Combines a precondition guard with an additional refinement to narrow the type.
 *
 * @param precondition Broad guard evaluated first; short-circuits on failure.
 * @param condition Refinement evaluated only when `precondition` passes.
 * @returns Predicate that narrows the input to a subtype.
 */
export function and<A, B extends A>(
  precondition: Guard<A>,
  condition: Refine<A, B>
): Predicate<B> {
  return function (input: unknown): input is B {
    if (precondition(input)) {
      return condition(input);
    }
    return false;
  };
}

/**
 * Chains a sequence of refinements after a precondition, returning the final guard type.
 *
 * @param precondition Initial guard applied first.
 * @param steps Subsequent refinements applied in order.
 * @returns Guard reflecting the result of the refinement chain.
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
): Guard<ChainResult<A, Chain>> {
  return function (input: unknown): input is ChainResult<A, Chain> {
    if (!precondition(input)) return false;
    return applyRefinements(input, steps);
  };
}

/**
 * Logical OR over multiple guards.
 *
 * @param guards Guards to evaluate; passes if any guard passes.
 * @returns Guard for the union of all guarded types.
 */
export function or<P extends readonly Guard<unknown>[]>(
  ...guards: P
): Guard<OutOfGuards<P>> {
  const predicates = toBooleanPredicates(guards);
  return function (input: unknown): input is OutOfGuards<P> {
    return predicates.some((guard) => guard(input));
  };
}

/**
 * Adapts a guard so it can be used as a refinement within a known supertype.
 *
 * @returns Function that converts a `Guard<T>` into a `Refine<A, T>` when `T extends A`.
 */
export function guardIn<A>(): <T extends A>(guard: Guard<T>) => Refine<A, T>;
export function guardIn<A>(): <T extends A>(guard: Guard<T>) => Refine<A, T> {
  return function <T extends A>(guard: Guard<T>): Refine<A, T> {
    return function (input: A): input is T {
      return guard(input);
    };
  };
}

/**
 * Logical negation of a guard/refinement.
 *
 * @param guard Guard or refinement to negate.
 * @returns Refinement excluding the guarded subtype from the input type.
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

// WHY: Overloads model refinement chains without casting; the runtime simply
// applies each refinement in order while preserving short-circuit behavior.
function applyRefinements<In>(value: In): value is In;
function applyRefinements<
  In,
  Steps extends readonly Refine<unknown, unknown>[]
>(
  value: In,
  steps: Steps & RefineChain<In, Steps>
): value is ChainResult<In, Steps>;
function applyRefinements(
  value: unknown,
  steps?: readonly ((value: unknown) => boolean)[]
): boolean {
  if (!steps || steps.length === 0) return true;
  for (const step of steps) {
    if (!step(value)) return false;
  }
  return true;
}
