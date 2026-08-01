/**
 * Converts predicates to plain boolean predicates for iteration helpers.
 *
 * @deprecated Use the original predicate array directly. This identity helper
 * will no longer be exported from the package root in is-kit v2.
 * @param predicates Predicates to be treated as simple boolean functions.
 * @returns Readonly array of boolean-returning functions.
 */
export const toBooleanPredicates = <A>(
  predicates: readonly ((value: A) => boolean)[]
): ReadonlyArray<(value: A) => boolean> => predicates;
