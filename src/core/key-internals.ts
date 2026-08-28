/** Detects whether a type represents more than one possible value. */
type IsUnion<Value, Whole = Value> = Value extends Whole
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

/** Keeps only one literal property key so one lookup cannot narrow other keys. */
export type SinglePropertyKey<Key extends PropertyKey> = [Key] extends [never]
  ? never
  : true extends IsUnion<Key>
    ? never
    : // WHY: Broad, patterned, and opaque key domains produce index
      // signatures, which an object with no declared properties satisfies.
      {} extends Record<Key, never>
      ? never
      : Key;

/** Applies the singleton-key constraint to every member of a key tuple. */
export type SinglePropertyKeys<Keys extends readonly PropertyKey[]> = {
  [Index in keyof Keys]: Keys[Index] & SinglePropertyKey<Keys[Index]>;
};

/** Narrows one concrete key, or only object-ness for a multi-value key domain. */
export type KeyPresence<Key extends PropertyKey> = [
  SinglePropertyKey<Key>
] extends [never]
  ? object
  : Record<Key, unknown>;

/** Narrows concrete key arguments, or only object-ness when any may vary. */
export type KeyPresences<Keys extends readonly PropertyKey[]> = [Keys] extends [
  SinglePropertyKeys<Keys>
]
  ? Record<Keys[number], unknown>
  : object;

/** Keeps only one non-negative integer literal that identifies an array index. */
export type ArrayIndex<Index extends number> =
  SinglePropertyKey<Index> extends never
    ? never
    : `${Index}` extends `-${string}`
      ? never
      : `${Index}` extends `${bigint}`
        ? Index
        : never;
