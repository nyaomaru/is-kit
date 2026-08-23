import type { Guard, GuardedOf, Predicate, Refinement } from '@/types';
import { hasOwnPropertyKey, hasOwnPropertyKeys } from '@/utils/own-properties';
import { equalsKey } from './equals';
import { define } from './define';
import { isObject } from './object';

/**
 * Checks whether a value has the specified own key.
 *
 * @param key Property key to check.
 * @returns Predicate narrowing to an object with the key present.
 */
export const hasKey = <K extends PropertyKey>(key: K) =>
  define<Record<K, unknown>>((input) =>
    isObject(input) && hasOwnPropertyKey(input, key));

/**
 * Checks whether a value has all specified own keys.
 *
 * @param keys Property keys to check.
 * @returns Predicate narrowing to an object with all keys present.
 */
export const hasKeys = <
  const KS extends readonly [PropertyKey, ...PropertyKey[]]
>(
  ...keys: KS
) => {
  // WHY: Type-level non-empty constraints can be bypassed from JavaScript or `any`.
  // Return a predicate that always fails so misuse does not crash applications.
  if (keys.length === 0) {
    return define<Record<KS[number], unknown>>(() => false);
  }

  return define<Record<KS[number], unknown>>(
    (input) => isObject(input) && hasOwnPropertyKeys(input, keys)
  );
};

/** Detects whether a type represents more than one possible value. */
type IsUnion<Value, Whole = Value> = Value extends Whole
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

/** Keeps only one literal property key so one read cannot narrow other keys. */
type SinglePropertyKey<Key extends PropertyKey> = [Key] extends [never]
  ? never
  : string extends Key
    ? never
    : number extends Key
      ? never
      : symbol extends Key
        ? never
        : true extends IsUnion<Key>
          ? never
          : Key;

/** Keeps only one non-negative integer literal that identifies an array index. */
type ArrayIndex<Index extends number> = [Index] extends [never]
  ? never
  : number extends Index
    ? never
    : true extends IsUnion<Index>
      ? never
      : `${Index}` extends `-${string}`
        ? never
        : `${Index}` extends `${bigint}`
          ? Index
          : never;

/**
 * Lifts a required-property refinement to its parent object.
 * @param key Single literal key of the required property to refine.
 * @param refinement Refinement applied to the property value.
 * @returns Refinement that preserves the parent type and narrows the property.
 * @example
 * const hasIdentifierExpression = refineKey('expression', ts.isIdentifier);
 */
export function refineKey<
  const K extends PropertyKey,
  PropertyInput,
  PropertyOutput extends PropertyInput
>(
  key: K & SinglePropertyKey<K>,
  refinement: Refinement<PropertyInput, PropertyOutput>
) {
  return <ObjectType extends Record<K, PropertyInput>>(
    value: ObjectType
  ): value is ObjectType & Record<K, PropertyOutput> => refinement(value[key]);
}

/**
 * Lifts a defined optional-property refinement to its parent object.
 * @param key Single literal key of the optional property to refine when defined.
 * @param refinement Refinement applied only to a defined property value.
 * @returns Refinement that requires and narrows the property.
 * @example
 * const hasCallInitializer = refineDefinedKey(
 *   'initializer',
 *   ts.isCallExpression
 * );
 */
export function refineDefinedKey<
  const K extends PropertyKey,
  PropertyInput,
  PropertyOutput extends PropertyInput
>(
  key: K & SinglePropertyKey<K>,
  refinement: Refinement<PropertyInput, PropertyOutput>
) {
  return <ObjectType extends Partial<Record<K, PropertyInput | undefined>>>(
    value: ObjectType
  ): value is ObjectType & Record<K, Exclude<PropertyOutput, undefined>> => {
    // WHY: Optional Compiler API properties may be absent or explicitly
    // undefined. Never pass either state to a narrow-domain refinement.
    const property = value[key];
    return property !== undefined && refinement(property);
  };
}

/**
 * Refines one defined element of a readonly array.
 * @param index Non-negative integer literal identifying the element.
 * @param refinement Refinement applied only to a defined element.
 * @returns Refinement that narrows the selected index.
 * @example
 * const hasStringFirstArgument = refineIndex(0, ts.isStringLiteral);
 */
export function refineIndex<
  const Index extends number,
  ElementInput,
  ElementOutput extends ElementInput
>(
  index: ArrayIndex<Index>,
  refinement: Refinement<ElementInput, ElementOutput>
): Refinement<
  readonly ElementInput[],
  readonly ElementInput[] & {
    readonly [K in Index]: Exclude<ElementOutput, undefined>;
  }
> {
  return (
    value
  ): value is readonly ElementInput[] & {
    readonly [K in Index]: Exclude<ElementOutput, undefined>;
  } => {
    // WHY: Array access can produce undefined through bounds, sparse holes, or
    // explicit values even when noUncheckedIndexedAccess is disabled.
    const element = value[index];
    return element !== undefined && refinement(element);
  };
}

/**
 * Builds a guard that narrows a specific key to the provided literal value.
 *
 * Given a base guard and a property key, returns a function that accepts a
 * target value and produces a guard of the base type intersected with
 * `{ [key]: target }`.
 *
 * @param guard Base guard for objects that include `key`.
 * @param key Property key to narrow.
 * @returns Builder that takes a literal `target` and returns a guard that
 * narrows `key` to that literal.
 */
export function narrowKeyTo<A, K extends keyof A>(
  guard: Guard<A>,
  key: K
): <const T extends A[K]>(target: T) => Predicate<A & Record<K, T>>;
export function narrowKeyTo<
  K extends PropertyKey,
  F extends Predicate<Record<K, unknown>>
>(
  guard: F,
  key: K
): <const T>(target: T) => Predicate<GuardedOf<F> & Record<K, T>> {
  // WHY: Provide two overloads to balance type safety and flexibility.
  // - When base type A and key K are known, enforce T extends A[K] for precise literal narrowing.
  // - For generic guards, accept F extends Predicate<Record<K, unknown>> and return GuardedOf<F> & Record<K, T>.
  //   This keeps the API usable with inferred/anonymous guards.
  // Use equalsKey for Object.is semantics and own-property presence; wrap with define to coerce the result to boolean for consistent guard behavior (as documented in define), not just to produce a typed Predicate.
  return <const T>(target: T) => {
    const keyEquals = equalsKey(key, target);
    return define<GuardedOf<F> & Record<K, T>>(
      (input: unknown) => guard(input) && keyEquals(input)
    );
  };
}
