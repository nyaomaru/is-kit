import type { GuardedOf, Predicate } from '@/types';
import { define } from '../define';
import { everyOwnEnumerableEntry } from '@/utils';
import { isPlainObject } from '../object';

/**
 * Validates a record-like object by guarding both keys and values.
 *
 * @param keyFunction Guard for string keys (e.g., specific literal keys pattern).
 * @param valueFunction Guard applied to each value in the record.
 * @returns Predicate narrowing to a readonly record with guarded key/value types.
 */
export function recordOf<
  KF extends Predicate<string>,
  VF extends Predicate<unknown>
>(
  keyFunction: KF,
  valueFunction: VF
): Predicate<Readonly<Record<GuardedOf<KF>, GuardedOf<VF>>>> {
  return define<Readonly<Record<GuardedOf<KF>, GuardedOf<VF>>>>(
    (input) =>
      isPlainObject(input) &&
      everyOwnEnumerableEntry(input, keyFunction, valueFunction)
  );
}
