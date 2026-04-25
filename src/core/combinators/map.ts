import type { GuardedOf, Predicate } from '@/types';
import { define } from '../define';
import { everyMapEntry } from '@/utils';
import { isMap } from '../object';

/**
 * Validates a map where every key and value satisfies the provided guards.
 *
 * @param keyGuard Guard applied to each map key.
 * @param valueGuard Guard applied to each map value.
 * @returns Predicate narrowing to a readonly map with guarded key/value types.
 */
export function mapOf<
  KF extends Predicate<unknown>,
  VF extends Predicate<unknown>
>(
  keyGuard: KF,
  valueGuard: VF
): Predicate<ReadonlyMap<GuardedOf<KF>, GuardedOf<VF>>> {
  return define<ReadonlyMap<GuardedOf<KF>, GuardedOf<VF>>>(
    (input) => isMap(input) && everyMapEntry(input, keyGuard, valueGuard)
  );
}
