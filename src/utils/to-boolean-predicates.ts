import type { Guard } from '@/types';

/**
 * Converts an array of guards to plain boolean predicates for iteration helpers.
 *
 * @param guards Guards to be treated as simple predicates.
 * @returns Readonly array of boolean-returning functions.
 */
export const toBooleanPredicates = (guards: readonly Guard<unknown>[]) =>
  guards as ReadonlyArray<(value: unknown) => boolean>;
