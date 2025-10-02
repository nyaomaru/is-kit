import type { Schema, InferSchema, Predicate } from '@/types';
import { isPlainObject } from '../object';

/**
 * Validates an object against a field-to-guard schema.
 * Keys in the schema are required; optionally rejects extra keys when `exact: true`.
 *
 * @param schema Record of property guards.
 * @param options When `{ exact: true }`, disallows properties not in `schema`.
 * @returns Predicate that narrows to the inferred struct type.
 */
export function struct<S extends Schema>(
  schema: S,
  options?: { exact?: boolean }
): Predicate<InferSchema<S>> {
  return (input: unknown): input is InferSchema<S> => {
    if (!isPlainObject(input)) return false;
    const obj = input as Record<string, unknown>;

    for (const key of Object.keys(schema)) {
      const guard = schema[key]!;
      if (!(key in obj)) return false;
      if (!guard(obj[key])) return false;
    }

    if (options?.exact) {
      const allowed = new Set(Object.keys(schema));
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) return false;
      }
    }
    return true;
  };
}
