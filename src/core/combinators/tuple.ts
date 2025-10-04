import type { Predicate, GuardedOf } from '@/types';

/**
 * Validates a fixed-length tuple by applying element-wise guards.
 *
 * @param guards Guards corresponding to each tuple position.
 * @returns Predicate that narrows to a readonly tuple of guarded element types.
 */
export function tupleOf<const Fs extends readonly Predicate<unknown>[]>(
  ...guards: Fs
): Predicate<{ readonly [K in keyof Fs]: GuardedOf<Fs[K]> }> {
  return function (
    input: unknown
  ): input is { readonly [K in keyof Fs]: GuardedOf<Fs[K]> } {
    return (
      Array.isArray(input) &&
      input.length === guards.length &&
      guards.every((guard, index) =>
        guard((input as readonly unknown[])[index])
      )
    );
  };
}
