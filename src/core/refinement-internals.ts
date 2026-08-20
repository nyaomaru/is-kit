// WHY: `never` lets implementation overloads accept functions from any input
// domain without falsely claiming that narrow-domain refinements accept `unknown`.
export type BooleanRefinement = (input: never) => boolean;
