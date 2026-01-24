import type { GuardedOf, Predicate } from '@/types';
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
  VF extends Predicate<unknown>,
>(
  keyFunction: KF,
  valueFunction: VF,
): Predicate<Readonly<Record<GuardedOf<KF>, GuardedOf<VF>>>> {
  return (
    input: unknown,
  ): input is Readonly<Record<GuardedOf<KF>, GuardedOf<VF>>> => {
    if (!isPlainObject(input)) return false;

    const obj = input;

    for (const key of Object.keys(obj)) {
      if (!keyFunction(key)) return false;
      const value = obj[key];
      if (!valueFunction(value)) return false;
    }
    return true;
  };
}
