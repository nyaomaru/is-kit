import type { Guard, Predicate, Refinement } from '@/types';
import { hasOwnPropertyKey, hasOwnPropertyKeys } from '@/utils/own-properties';
import { equalsKey } from './equals';
import { define } from './define';
import type {
  ArrayIndex,
  KeyPresence,
  KeyPresences,
  SinglePropertyKey
} from './key-internals';
import { isObject } from './object';

type NarrowKeyPredicate<A, K extends PropertyKey, T> = [
  SinglePropertyKey<K>
] extends [never]
  ? Predicate<A>
  : Predicate<A & Record<K, T>>;

/**
 * Checks whether a value has the specified own key.
 *
 * @param key Property key to check.
 * @returns Predicate with key-specific narrowing for a singleton literal key,
 * or object-only narrowing for a multi-value key domain.
 */
export function hasKey<const K extends PropertyKey>(
  key: K
): Predicate<KeyPresence<K>>;
export function hasKey(key: PropertyKey): Predicate<object> {
  return define<object>(
    (input) => isObject(input) && hasOwnPropertyKey(input, key)
  );
}

/**
 * Checks whether a value has all specified own keys.
 *
 * @param keys Property keys to check.
 * @returns Predicate with key-specific narrowing when every argument is a
 * singleton literal key, or object-only narrowing otherwise.
 */
export function hasKeys<
  const KS extends readonly [PropertyKey, ...PropertyKey[]]
>(...keys: KS): Predicate<KeyPresences<KS>>;
export function hasKeys(...keys: readonly PropertyKey[]): Predicate<object> {
  // WHY: Type-level non-empty constraints can be bypassed from JavaScript or `any`.
  // Return a predicate that always fails so misuse does not crash applications.
  if (keys.length === 0) {
    return define<object>(() => false);
  }

  return define<object>(
    (input) => isObject(input) && hasOwnPropertyKeys(input, keys)
  );
}

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
 * Refines one defined own element of a readonly array.
 * @param index Non-negative integer literal identifying the own element.
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
    // WHY: An own-key check distinguishes actual elements from out-of-bounds
    // access and sparse holes, including holes shadowed by inherited values.
    if (!hasOwnPropertyKey(value, index)) return false;

    // WHY: Explicit undefined values remain invalid even when
    // noUncheckedIndexedAccess is disabled.
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
 * @param key Property key to compare; singleton literals narrow that property.
 * @returns Builder that takes a literal `target` and returns a guard that
 * narrows a singleton `key` to that literal. Multi-value key domains preserve
 * only the base guard's type.
 */
export function narrowKeyTo<A, const K extends keyof A & PropertyKey>(
  guard: Guard<A>,
  key: K
): <const T extends A[K]>(target: T) => NarrowKeyPredicate<A, K, T>;
export function narrowKeyTo(
  guard: Guard<unknown>,
  key: PropertyKey
): (target: unknown) => Predicate<unknown> {
  // WHY: A broad or union key remains useful as a runtime check, but only a
  // singleton key overload may claim that one specific property was narrowed.
  return (target) => {
    const keyEquals = equalsKey(key, target);
    return define<unknown>(
      (input: unknown) => guard(input) && keyEquals(input)
    );
  };
}
