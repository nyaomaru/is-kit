import type {
  InferSchema,
  OptionalSchemaField,
  Predicate,
  SchemaShape,
  StructSchemaShape,
  StructOptions
} from '@/types';
import { hasOwnPropertyKey } from '@/utils/own-properties';
import { define } from '../define';
import { isFunction, isObject, isPlainObject } from '../object';

type SchemaEntry = readonly [key: string, guard: Predicate<unknown>];

const isOptionalSchemaField = define<OptionalSchemaField<Predicate<unknown>>>(
  // WHY: Optional fields are represented as a small tagged object so `struct`
  // can distinguish schema metadata from plain predicate functions up front.
  (field) =>
    isObject(field) && field.optional === true && isFunction(field.guard)
);

const hasRequiredKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean =>
  // WHY: Required fields must be own properties; inherited values should not
  // satisfy a schema because `struct` models object payload shape, not prototype chains.
  entries.every(
    ([key, guard]) => hasOwnPropertyKey(obj, key) && guard(obj[key])
  );

const hasValidOptionalKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean =>
  // WHY: Optional keys are validated only when present. Missing keys stay valid
  // without forcing callers to encode `undefined` into the value guard.
  entries.every(
    ([key, guard]) => !hasOwnPropertyKey(obj, key) || guard(obj[key])
  );

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
 * Validates an object against a field-to-guard schema with string runtime keys.
 * Numeric schema keys are normalized to strings by JavaScript; symbol-keyed fields
 * are not supported. Keys are required unless wrapped with `optionalKey`; optionally
 * rejects extra keys when `exact: true`.
 *
 * @param schema Record of string- or numeric-keyed property guards.
 * @param options When `{ exact: true }`, disallows own enumerable string-key
 * properties not in `schema`.
 * @returns Predicate that narrows to the inferred struct type.
 * @throws {TypeError} If `schema` has own symbol-keyed fields.
 */
export function struct<const S extends SchemaShape<S>>(
  schema: StructSchemaShape<S>,
  options?: StructOptions
): Predicate<InferSchema<S>> {
  return createStruct<S>(schema, options);
}

/** @internal Shared implementation for string-keyed schema builders. */
export function createStruct<S extends SchemaShape<S>>(
  schema: S,
  options?: StructOptions
): Predicate<InferSchema<S>> {
  // WHY: A schema can be widened to `Schema` (or arrive from JavaScript), which
  // erases symbol keys from its static type while runtime enumeration still skips them.
  if (Object.getOwnPropertySymbols(schema).length > 0) {
    throw new TypeError('struct schema fields cannot use symbol keys');
  }

  // WHY: Split required and optional fields once per builder so each
  // invocation only performs property lookups and guard calls.
  const requiredEntries: SchemaEntry[] = [];
  const optionalEntries: SchemaEntry[] = [];
  const schemaKeys: string[] = [];

  for (const key in schema) {
    if (!hasOwnPropertyKey(schema, key)) continue;

    const field = schema[key];
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
