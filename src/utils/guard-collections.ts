type BooleanPredicate<T> = (value: T) => boolean;

const everyIterableValue = <T>(
  values: Iterable<T>,
  predicate: BooleanPredicate<T>
): boolean => {
  for (const value of values) {
    if (!predicate(value)) return false;
  }
  return true;
};

const everyKeyValueEntry = <K, V>(
  entries: Iterable<readonly [K, V]>,
  predicate: (key: K, value: V) => boolean
): boolean => {
  for (const [key, value] of entries) {
    if (!predicate(key, value)) return false;
  }
  return true;
};

/**
 * Checks whether every array element satisfies the provided predicate.
 *
 * @param values Array values to validate.
 * @param predicate Predicate applied to each element.
 * @returns Whether all elements satisfy `predicate`.
 */
export const everyArrayValue = (
  values: readonly unknown[],
  predicate: BooleanPredicate<unknown>
): boolean => everyIterableValue(values, predicate);

/**
 * Checks whether a tuple matches the provided element predicates in order.
 *
 * @param values Tuple candidate values.
 * @param predicates Predicates aligned to each tuple index.
 * @returns Whether lengths match and each index passes.
 */
export const everyTupleValue = (
  values: readonly unknown[],
  predicates: readonly BooleanPredicate<unknown>[]
): boolean => {
  if (values.length !== predicates.length) return false;

  for (let index = 0; index < predicates.length; index += 1) {
    const predicate = predicates[index];
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
  predicate: BooleanPredicate<unknown>
): boolean => everyIterableValue(values, predicate);

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
  keyPredicate: BooleanPredicate<unknown>,
  valuePredicate: BooleanPredicate<unknown>
): boolean =>
  everyKeyValueEntry(
    values,
    (key, value) => keyPredicate(key) && valuePredicate(value)
  );

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
  keyPredicate: BooleanPredicate<string>,
  valuePredicate: BooleanPredicate<unknown>
): boolean =>
  everyIterableValue(
    Object.keys(values),
    (key) => keyPredicate(key) && valuePredicate(values[key])
  );
