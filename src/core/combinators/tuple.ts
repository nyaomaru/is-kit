import { define } from '../define';
import type { Predicate, GuardedOf } from '@/types';
import { everyTupleValue } from '@/utils';

/**
 * Validates a fixed-length tuple by applying element-wise guards.
 *
 * @param guards Guards corresponding to each tuple position.
 * @returns Predicate that narrows to a readonly tuple of guarded element types.
 */
export function tupleOf<const Fs extends readonly Predicate<unknown>[]>(
  ...guards: Fs
): Predicate<{ readonly [K in keyof Fs]: GuardedOf<Fs[K]> }> {
  return define<{ readonly [K in keyof Fs]: GuardedOf<Fs[K]> }>(
    (input) => Array.isArray(input) && everyTupleValue(input, guards)
  );
}
