import type { GuardedOf, Predicate } from '@/types';
import { define } from '../define';
import { everyOwnEnumerableEntry } from '@/utils/guard-collections';
import { isPlainObject } from '../object';

type RecordOfResult<K extends string, V> = string extends K
  ? Readonly<Record<string, V>>
  : Readonly<Partial<Record<K, V>>>;

/**
 * Validates a record-like object by guarding both keys and values.
 *
 * The key guard restricts which string keys may be present; it does not require
 * every key represented by the guarded key type.
 *
 * @param keyFunction Guard for string keys (for example, a literal-key pattern).
 * @param valueFunction Guard applied to each value in the record.
 * @returns Predicate narrowing to a readonly record with guarded key/value types.
 */
export function recordOf<
  KF extends Predicate<string>,
  VF extends Predicate<unknown>
>(
  keyFunction: KF,
  valueFunction: VF
): Predicate<RecordOfResult<GuardedOf<KF>, GuardedOf<VF>>> {
  return define<RecordOfResult<GuardedOf<KF>, GuardedOf<VF>>>(
    (input) =>
      isPlainObject(input) &&
      everyOwnEnumerableEntry(input, keyFunction, valueFunction)
  );
}
