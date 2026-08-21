import type { Refinement } from '@/types';

// WHY: `never` lets implementation overloads accept functions from any input
// domain without falsely claiming that narrow-domain refinements accept `unknown`.
export type BooleanRefinement = (input: never) => boolean;

type RefinementInputs<In, Outputs extends readonly unknown[]> = readonly [
  In,
  ...Outputs
];

/** Builds an ordered refinement tuple from its initial input and output tuple. */
export type RefinementsFromOutputs<In, Outputs extends readonly unknown[]> = {
  [K in keyof Outputs]: Refinement<
    RefinementInputs<In, Outputs>[K & keyof RefinementInputs<In, Outputs>],
    Outputs[K] &
      RefinementInputs<In, Outputs>[K & keyof RefinementInputs<In, Outputs>]
  >;
};

/** Returns the last tuple member, or a fallback for an empty tuple. */
export type LastOr<Default, T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer Tail
]
  ? Tail
  : Default;
