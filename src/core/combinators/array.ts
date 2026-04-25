import { define } from '../define';
import type { GuardedOf, Predicate } from '@/types';
import { everyArrayValue } from '@/utils';

/**
 * Validates an array where every element satisfies the provided guard.
 *
 * @param elementGuard Guard applied to each array element.
 * @returns Predicate narrowing to a readonly array of the guarded element type.
 */
export function arrayOf<F extends Predicate<unknown>>(
  elementGuard: F
): Predicate<readonly GuardedOf<F>[]> {
  return define<readonly GuardedOf<F>[]>(
    (input) => Array.isArray(input) && everyArrayValue(input, elementGuard)
  );
}
