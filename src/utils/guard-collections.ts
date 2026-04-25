/**
 * Checks whether every array element satisfies the provided predicate.
 *
 * @param values Array values to validate.
 * @param predicate Predicate applied to each element.
 * @returns Whether all elements satisfy `predicate`.
 */
export const everyArrayValue = (
  values: readonly unknown[],
  predicate: (value: unknown) => boolean
): boolean => {
  for (const value of values) {
    if (!predicate(value)) return false;
  }
  return true;
};

/**
 * Checks whether a tuple matches the provided element predicates in order.
 *
 * @param values Tuple candidate values.
 * @param predicates Predicates aligned to each tuple index.
 * @returns Whether lengths match and each index passes.
 */
export const everyTupleValue = (
  values: readonly unknown[],
  predicates: readonly ((value: unknown) => boolean)[]
): boolean => {
  if (values.length !== predicates.length) return false;

  for (const [index, predicate] of predicates.entries()) {
    if (!predicate(values[index])) return false;
  }

  return true;
};

/**
 * Checks whether every set value satisfies the provided predicate.
 *
 * @param values Set values to validate.
 * @param predicate Predicate applied to each value.
 * @returns Whether all set values satisfy `predicate`.
 */
export const everySetValue = (
  values: ReadonlySet<unknown>,
  predicate: (value: unknown) => boolean
): boolean => {
  for (const value of values) {
    if (!predicate(value)) return false;
  }
  return true;
};

/**
 * Checks whether every map entry satisfies the provided key and value predicates.
 *
 * @param values Map values to validate.
 * @param keyPredicate Predicate applied to each key.
 * @param valuePredicate Predicate applied to each value.
 * @returns Whether all keys and values satisfy their predicates.
 */
export const everyMapEntry = (
  values: ReadonlyMap<unknown, unknown>,
  keyPredicate: (value: unknown) => boolean,
  valuePredicate: (value: unknown) => boolean
): boolean => {
  for (const [key, value] of values) {
    if (!keyPredicate(key) || !valuePredicate(value)) return false;
  }
  return true;
};

/**
 * Checks whether every own enumerable string key/value pair satisfies the provided predicates.
 *
 * @param values Plain object values to validate.
 * @param keyPredicate Predicate applied to each enumerable own string key.
 * @param valuePredicate Predicate applied to each corresponding value.
 * @returns Whether all enumerable entries satisfy their predicates.
 */
export const everyOwnEnumerableEntry = (
  values: Record<string, unknown>,
  keyPredicate: (key: string) => boolean,
  valuePredicate: (value: unknown) => boolean
): boolean => {
  for (const key of Object.keys(values)) {
    if (!keyPredicate(key) || !valuePredicate(values[key])) return false;
  }
  return true;
};
