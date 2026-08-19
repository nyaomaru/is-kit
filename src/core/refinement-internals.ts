import type { Refinement } from '@/types';

// WHY: `never` lets implementation overloads accept functions from any input
// domain without falsely claiming that narrow-domain refinements accept `unknown`.
export type BooleanRefinement = (input: never) => boolean;

/** Extracts the accepted input domain from a refinement. */
export type InputOf<F> =
  F extends Refinement<infer Input, infer _Output> ? Input : never;
