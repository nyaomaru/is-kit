import type {
  Schema,
  InferSchema,
  OptionalSchemaField,
  Predicate
} from '@/types';
import { define } from '../define';
import { isObject, isPlainObject } from '../object';

type SchemaEntry = readonly [key: string, guard: Predicate<unknown>];

const hasOwnKey = (obj: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const isOptionalSchemaField = define<OptionalSchemaField<Predicate<unknown>>>(
  // WHY: Optional fields are represented as a small tagged object so `struct`
  // can distinguish schema metadata from plain predicate functions up front.
  (field) =>
    isObject(field) &&
    field.optional === true &&
    typeof field.guard === 'function'
);

const hasRequiredKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean =>
  // WHY: Required fields must be own properties; inherited values should not
  // satisfy a schema because `struct` models object payload shape, not prototype chains.
  entries.every(([key, guard]) => hasOwnKey(obj, key) && guard(obj[key]));

const hasValidOptionalKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean =>
  // WHY: Optional keys are validated only when present. Missing keys stay valid
  // without forcing callers to encode `undefined` into the value guard.
  entries.every(([key, guard]) => !hasOwnKey(obj, key) || guard(obj[key]));

const hasOnlyAllowedKeys = (
  obj: Record<string, unknown>,
  allowed: ReadonlySet<string>
): boolean => Object.keys(obj).every((key) => allowed.has(key));

/**
 * Marks a struct schema field as optional at the key level.
 *
 * When used inside `struct`, the property may be absent. If the property exists,
 * its value must satisfy the wrapped guard.
 *
 * @param guard Guard used to validate the property value when the key exists.
 * @returns Schema field marker understood by `struct`.
 */
export function optionalKey<G extends Predicate<unknown>>(
  guard: G
): OptionalSchemaField<G> {
  return { optional: true, guard };
}

/**
 * Validates an object against a field-to-guard schema.
 * Keys in the schema are required unless wrapped with `optionalKey`; optionally
 * rejects extra keys when `exact: true`.
 *
 * @param schema Record of property guards.
 * @param options When `{ exact: true }`, disallows properties not in `schema`.
 * @returns Predicate that narrows to the inferred struct type.
 */
export function struct<S extends Schema>(
  schema: S,
  options?: { exact?: boolean }
): Predicate<InferSchema<S>> {
  // WHY: Split required and optional fields once per builder so each
  // invocation only performs property lookups and guard calls.
  const requiredEntries: SchemaEntry[] = [];
  const optionalEntries: SchemaEntry[] = [];
  const schemaKeys: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    schemaKeys.push(key);

    if (isOptionalSchemaField(field)) {
      optionalEntries.push([key, field.guard]);
      continue;
    }

    requiredEntries.push([key, field]);
  }

  const allowed = options?.exact ? new Set(schemaKeys) : null;

  return define<InferSchema<S>>((input) => {
    if (!isPlainObject(input)) return false;
    const obj = input;

    if (!hasRequiredKeys(obj, requiredEntries)) return false;
    if (!hasValidOptionalKeys(obj, optionalEntries)) return false;
    if (!allowed) return true;
    return hasOnlyAllowedKeys(obj, allowed);
  });
}
