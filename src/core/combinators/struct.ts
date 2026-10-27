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

const OBJECT_CONSTRUCTOR_SOURCE = Function.prototype.toString.call(Object);

const isObjectPrototype = (prototype: object): boolean => {
  const constructor = Object.getOwnPropertyDescriptor(
    prototype,
    'constructor'
  )?.value;

  // WHY: Object.prototype differs across realms, so identity cannot identify
  // it. Its native Object constructor always points back to that prototype.
  return (
    typeof constructor === 'function' &&
    constructor.prototype === prototype &&
    Function.prototype.toString.call(constructor) === OBJECT_CONSTRUCTOR_SOURCE
  );
};

const hasOnlyEnumerableOwnStringKeys = (schema: object): boolean =>
  Object.getOwnPropertyNames(schema).every((key) =>
    Object.prototype.propertyIsEnumerable.call(schema, key)
  );

const hasInheritedStringKeys = (schema: object): boolean => {
  let prototype = Object.getPrototypeOf(schema);

  // WHY: Object.prototype supplies standard object behavior, not schema fields.
  // A class prototype's own constructor also is not an instance field in `keyof`.
  // Every other prototype key is checked because TypeScript includes inherited
  // members in `keyof`, while struct validates only own enumerable fields.
  while (prototype !== null && !isObjectPrototype(prototype)) {
    const hasSchemaKey = Object.getOwnPropertyNames(prototype).some((key) => {
      if (key !== 'constructor') return true;

      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
      // WHY: A real class or function constructor points back to its prototype.
      // Other `constructor` properties can be inferred schema fields and must fail.
      return !(
        typeof descriptor?.value === 'function' &&
        descriptor.value.prototype === prototype
      );
    });
    if (hasSchemaKey) return true;
    prototype = Object.getPrototypeOf(prototype);
  }

  return false;
};

const hasInheritedSymbolKeys = (schema: object): boolean => {
  let prototype = Object.getPrototypeOf(schema);

  while (prototype !== null && !isObjectPrototype(prototype)) {
    if (Object.getOwnPropertySymbols(prototype).length > 0) return true;
    prototype = Object.getPrototypeOf(prototype);
  }

  return false;
};

const assertValidSchemaKeys = (schema: object): void => {
  if (
    Object.getOwnPropertySymbols(schema).length > 0 ||
    hasInheritedSymbolKeys(schema)
  ) {
    throw new TypeError('struct schema fields cannot use symbol keys');
  }

  if (
    !hasOnlyEnumerableOwnStringKeys(schema) ||
    hasInheritedStringKeys(schema)
  ) {
    throw new TypeError(
      'struct schema fields must be own enumerable string keys'
    );
  }
};

const isOptionalSchemaField = define<OptionalSchemaField<Predicate<unknown>>>(
  // WHY: Optional fields are represented as a small tagged object so `struct`
  // can distinguish schema metadata from plain predicate functions up front.
  (field) =>
    isObject(field) && field.optional === true && isFunction(field.guard)
);

const hasRequiredKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean => {
  // WHY: Required fields must be own properties; inherited values should not
  // satisfy a schema because `struct` models object payload shape, not prototype chains.
  // Direct entry access avoids callbacks and tuple destructuring on this hot path.
  for (const entry of entries) {
    const key = entry[0];
    const guard = entry[1];
    if (!hasOwnPropertyKey(obj, key) || !guard(obj[key])) return false;
  }

  return true;
};

const hasValidOptionalKeys = (
  obj: Record<string, unknown>,
  entries: readonly SchemaEntry[]
): boolean => {
  // WHY: Optional keys are validated only when present. Missing keys stay valid
  // without forcing callers to encode `undefined` into the value guard.
  for (const entry of entries) {
    const key = entry[0];
    const guard = entry[1];
    if (hasOwnPropertyKey(obj, key) && !guard(obj[key])) return false;
  }

  return true;
};

const hasOnlyAllowedKeys = (
  obj: Record<string, unknown>,
  allowed: ReadonlySet<string>
): boolean => Object.keys(obj).every((key) => allowed.has(key));

const hasOnlyRequiredKeys = (
  obj: Record<string, unknown>,
  schemaKeys: readonly string[],
  allowed: ReadonlySet<string>
): boolean => {
  const keys = Object.keys(obj);
  // WHY: Own required fields may be non-enumerable, so equal key counts alone
  // cannot prove exactness. Matching schema order avoids Set lookups; other
  // orders and non-enumerable required fields retain the membership check.
  return (
    keys.length <= schemaKeys.length &&
    keys.every((key, index) => key === schemaKeys[index] || allowed.has(key))
  );
};

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
 * Validates an object against a field-to-guard schema with own enumerable string
 * keys. Numeric schema keys are normalized to strings by JavaScript; symbol,
 * non-enumerable, and inherited fields are not supported. Keys are required unless
 * wrapped with `optionalKey`; optionally rejects extra keys when `exact: true`.
 *
 * @param schema Record of string- or numeric-keyed property guards.
 * @param options When `{ exact: true }`, disallows own enumerable string-key
 * properties not in `schema`.
 * @returns Predicate that narrows to the inferred struct type.
 * @throws {TypeError} If `schema` has symbol-keyed, non-enumerable, or inherited
 * string-keyed fields.
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
  // WHY: Property ownership and enumerability are not expressible in TypeScript
  // object types. Reject fields runtime enumeration would skip before deriving an
  // inferred predicate that could otherwise claim to have validated them.
  assertValidSchemaKeys(schema);

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
  const requiredOnly = optionalEntries.length === 0;

  return define<InferSchema<S>>((input) => {
    if (!isPlainObject(input)) return false;
    const obj = input;

    if (!hasRequiredKeys(obj, requiredEntries)) return false;
    if (allowed && requiredOnly) {
      return hasOnlyRequiredKeys(obj, schemaKeys, allowed);
    }
    if (!hasValidOptionalKeys(obj, optionalEntries)) return false;
    if (!allowed) return true;
    return hasOnlyAllowedKeys(obj, allowed);
  });
}
