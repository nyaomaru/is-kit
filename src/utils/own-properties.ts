// WHY: Keep this as a low-level binary helper instead of wrapping it with
// `define`. `define` builds unary public guards, while core modules call this
// after they already narrowed the value and still need to pass a dynamic key.
// Importing `define` here would also make utils depend on core.

/**
 * Checks whether an object has an own property key.
 *
 * @param value Object-like value already narrowed by callers.
 * @param key Property key to check.
 * @returns Whether `key` is present directly on `value`.
 */
export const hasOwnPropertyKey = <K extends PropertyKey>(
  value: Record<PropertyKey, unknown>,
  key: K
): value is Record<K, unknown> => Object.hasOwn(value, key);

/**
 * Checks whether an object has every requested own property key.
 *
 * @param value Object-like value already narrowed by callers.
 * @param keys Property keys to check.
 * @returns Whether all keys are present directly on `value`.
 */
export const hasOwnPropertyKeys = (
  value: Record<PropertyKey, unknown>,
  keys: readonly PropertyKey[]
): boolean => keys.every((key) => hasOwnPropertyKey(value, key));
