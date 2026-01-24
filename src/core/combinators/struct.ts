import type { Schema, InferSchema, Predicate } from '@/types';
import { isPlainObject } from '../object';

const hasRequiredKeys = (
  obj: Record<string, unknown>,
  schema: Schema,
  keys: readonly string[],
): boolean => keys.every((key) => key in obj && schema[key]!(obj[key]));

const hasOnlyAllowedKeys = (
  obj: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): boolean => Object.keys(obj).every((key) => allowed.has(key));

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
  options?: { exact?: boolean },
): Predicate<InferSchema<S>> {
  // WHY: Precompute schema keys and the allowed set (when exact) once per
  // builder to avoid repeated Object.keys/Set allocations on every call.
  const schemaKeys = Object.keys(schema);
  const allowed = options?.exact ? new Set(schemaKeys) : null;

  return (input: unknown): input is InferSchema<S> => {
    if (!isPlainObject(input)) return false;
    const obj = input;

    if (!hasRequiredKeys(obj, schema, schemaKeys)) return false;
    if (!allowed) return true;
    return hasOnlyAllowedKeys(obj, allowed);
  };
}
