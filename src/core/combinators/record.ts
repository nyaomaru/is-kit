import type { GuardedOf, Predicate } from '@/types';
import { define } from '../define';
import { hasOwnEntries } from '@/utils/guard-collections';
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
 * Every own string-keyed property is validated, whether it is enumerable or
 * not, so the narrowed record type never permits reading a property the guards
 * did not check. Symbol-keyed properties are not validated; they sit outside
 * the string-keyed record type this predicate narrows to.
 *
 * Compatibility note: non-enumerable string-keyed properties used to be
 * ignored. An object whose non-enumerable property fails either guard is now
 * rejected instead of passing with an unvalidated property in place.
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
      isPlainObject(input) && hasOwnEntries(input, keyFunction, valueFunction)
  );
}
