/**
 * Converts guards/refinements to plain boolean predicates for iteration helpers.
 *
 * @param predicates Guards/refinements to be treated as simple predicates.
 * @returns Readonly array of boolean-returning functions.
 */
type BooleanPredicate = {
  bivarianceHack(value: unknown): boolean;
}['bivarianceHack'];

export const toBooleanPredicates = (
  predicates: readonly BooleanPredicate[]
): ReadonlyArray<BooleanPredicate> => predicates;
