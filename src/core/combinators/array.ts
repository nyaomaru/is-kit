import type { GuardedOf, Predicate } from '@/types';

/**
 * Validates an array where every element satisfies the provided guard.
 *
 * @param elementGuard Guard applied to each array element.
 * @returns Predicate narrowing to a readonly array of the guarded element type.
 */
export function arrayOf<F extends Predicate<unknown>>(
  elementGuard: F
): Predicate<readonly GuardedOf<F>[]> {
  return function (input: unknown): input is readonly GuardedOf<F>[] {
    if (!Array.isArray(input)) return false;
    for (const element of input as readonly unknown[]) {
      if (!elementGuard(element)) return false;
    }
    return true;
  };
}
