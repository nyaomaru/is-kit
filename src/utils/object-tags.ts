// WHY: Centralizing internal object tag literals avoids repeating fragile
// string constants and keeps cross-realm built-in checks consistent.
const objectToString = Object.prototype.toString;

export const OBJECT_TAG_DATE = '[object Date]';
export const OBJECT_TAG_REGEXP = '[object RegExp]';
export const OBJECT_TAG_MAP = '[object Map]';
export const OBJECT_TAG_SET = '[object Set]';
export const OBJECT_TAG_WEAK_MAP = '[object WeakMap]';
export const OBJECT_TAG_WEAK_SET = '[object WeakSet]';
export const OBJECT_TAG_ARRAY_BUFFER = '[object ArrayBuffer]';
export const OBJECT_TAG_DATA_VIEW = '[object DataView]';
export const OBJECT_TAG_ERROR = '[object Error]';

/**
 * Returns the internal object tag for a value.
 * @param value Value to inspect with `Object.prototype.toString`.
 * @returns Stable built-in tag such as `[object Date]`.
 */
export const getTag = (value: unknown) => objectToString.call(value);
