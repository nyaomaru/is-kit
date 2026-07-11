import type {
  InferSchema,
  Predicate,
  TypedStructFields,
  TypedStructShape
} from '@/types';
import { struct } from './struct';

/**
 * Creates a `struct` builder checked against an existing object type.
 * Optional target keys must also be declared with `optionalKey` so type drift
 * stays visible when the target type changes.
 *
 * @returns Builder that rejects missing, extra, or incompatible struct fields.
 */
export function typedStruct<T extends object>() {
  return <const S extends TypedStructShape<T>>(
    fields: TypedStructFields<T, S>,
    options?: { exact?: boolean }
  ): Predicate<InferSchema<TypedStructFields<T, S>>> =>
    // WHY: `typedStruct` keeps `struct` runtime behavior while using the target
    // type only to check that hand-written guard fields stay in sync.
    struct(fields, options);
}
