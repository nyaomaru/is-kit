import type { GuardedOf, GuardedWithin, Predicate } from '@/types';

/**
 * Combines multiple guards; passes when any one guard matches.
 *
 * @param guards One or more type guards/refinements to try.
 * @returns Predicate that narrows to the union of guarded types.
 */
export function oneOf<
  Fs extends readonly ((value: unknown) => value is unknown)[],
>(...guards: Fs): Predicate<GuardedOf<Fs[number]>>;
export function oneOf<A, Fs extends readonly ((value: A) => value is A)[]>(
  ...guards: Fs
): (input: A) => input is GuardedWithin<Fs, A>;
export function oneOf(
  ...guards: readonly ((input: unknown) => input is unknown)[]
) {
  return (input: unknown) => guards.some((guard) => guard(input));
}
