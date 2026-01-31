/**
 * Converts predicates to plain boolean predicates for iteration helpers.
 *
 * @param predicates Predicates to be treated as simple boolean functions.
 * @returns Readonly array of boolean-returning functions.
 */
export const toBooleanPredicates = <A>(
  predicates: readonly ((value: A) => boolean)[]
): ReadonlyArray<(value: A) => boolean> => predicates;
