import type { Predicate } from '@/types';

/**
 * Creates a predicate whose implementation is initialized on first use.
 *
 * The initialized predicate is cached after the factory returns successfully.
 * Circular references in the input value are not detected.
 *
 * @param factory Function that creates the predicate when it is first evaluated.
 * @returns Predicate that delegates to the lazily initialized implementation.
 */
export function lazy<T>(factory: () => Predicate<T>): Predicate<T> {
  let predicate: Predicate<T> | undefined;

  return (value: unknown): value is T => {
    // WHY: Cache only successful initialization so factory errors propagate and
    // a later evaluation can retry initialization.
    predicate ??= factory();
    return predicate(value);
  };
}
