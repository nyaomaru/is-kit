import type { GuardedOf, Predicate } from '@/types';
import { define } from '../define';
import { everySetValue } from '@/utils';
import { isSet } from '../object';

/**
 * Validates a set where every value satisfies the provided guard.
 *
 * @param valueGuard Guard applied to each set value.
 * @returns Predicate narrowing to a readonly set of the guarded value type.
 */
export function setOf<VF extends Predicate<unknown>>(
  valueGuard: VF
): Predicate<ReadonlySet<GuardedOf<VF>>> {
  return define<ReadonlySet<GuardedOf<VF>>>(
    (input) => isSet(input) && everySetValue(input, valueGuard)
  );
}
