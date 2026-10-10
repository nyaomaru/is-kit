import type {
  InferSchema,
  Predicate,
  StructOptions,
  TypedStructFields,
  TypedStructShape
} from '@/types';
import { createStruct } from './struct';

/**
 * Creates a `struct` builder checked against an existing string-keyed object
 * type. Numeric and symbol properties are excluded from the checked shape and
 * cannot be validated by the resulting guard.
 * Optional target keys must also be declared with `optionalKey` so type drift
 * stays visible when the target type changes.
 *
 * Target-compatible field guards may narrow further than the target field type;
 * the returned predicate preserves those narrower inferred types.
 *
 * @returns Builder that rejects missing, extra, or incompatible struct fields.
 */
export function typedStruct<T extends object>() {
  return <const S extends TypedStructShape<T>>(
    fields: TypedStructFields<T, S>,
    options?: StructOptions
  ): Predicate<InferSchema<TypedStructFields<T, S>>> =>
    // WHY: `TypedStructShape` only permits string keys, so it can share struct's
    // runtime implementation without widening the public `struct` schema contract.
    createStruct(fields, options);
}
