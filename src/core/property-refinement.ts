import type { Refinement } from '@/types';
import { hasOwnPropertyKey } from '@/utils/own-properties';
import type { ArrayIndex, SinglePropertyKey } from './key-internals';

/**
 * Lifts a required-property refinement to its parent object.
 * @param key Single literal key of the required property to refine.
 * @param refinement Refinement applied to the property value.
 * @returns Refinement that preserves the parent type and narrows the property.
 * @example
 * const hasStringValue = refineKey('value', isString);
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
 * const hasDefinedStringLabel = refineDefinedKey('label', isString);
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
    // WHY: Optional properties may be absent or explicitly undefined. Never
    // pass either state to a narrow-domain refinement.
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
 * const hasStringAtZero = refineIndex(0, isString);
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
