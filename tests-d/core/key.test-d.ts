import { expectNotAssignable, expectType } from 'tsd';
import {
  hasKey,
  hasKeys,
  narrowKeyTo,
  refineDefinedKey,
  refineIndex,
  refineKey,
  struct,
  isString,
  isNumber,
  oneOfValues
} from 'is-kit';
import type { Predicate, Refinement } from 'is-kit';

// =============================================
// describe: narrowKeyTo
// =============================================
type User = {
  id: string;
  age: number;
  role: 'admin' | 'guest' | 'trial';
};

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial')
});

const byRole = narrowKeyTo(isUser, 'role');
const isGuest = byRole('guest');
const isTrial = byRole('trial');

expectType<Predicate<Readonly<User> & { role: 'guest' }>>(isGuest);
expectType<Predicate<Readonly<User> & { role: 'trial' }>>(isTrial);

declare let candidate: unknown;
if (isGuest(candidate)) {
  expectType<'guest'>(candidate.role);
}

// =============================================
// describe: hasKey
// =============================================
const hasKind = hasKey('kind');

if (hasKind(candidate)) {
  expectType<Record<'kind', unknown>>(candidate);
  expectType<unknown>(candidate.kind);
}

// =============================================
// describe: hasKeys
// =============================================
const hasKindAndId = hasKeys('kind', 'id');

if (hasKindAndId(candidate)) {
  expectType<Record<'kind' | 'id', unknown>>(candidate);
  expectType<unknown>(candidate.kind);
  expectType<unknown>(candidate.id);
}

// it: rejects empty keys at compile time
expectNotAssignable<Parameters<typeof hasKeys>>([]);

// =============================================
// describe: refineKey
// =============================================
const hasStringName = refineKey('name', isString);

declare let requiredProperty: {
  readonly name: string | number;
  readonly id: number;
};

if (hasStringName(requiredProperty)) {
  expectType<string>(requiredProperty.name);
  expectType<number>(requiredProperty.id);
}

declare const symbolKey: unique symbol;
const hasSymbolValue = refineKey(symbolKey, isNumber);
declare let symbolProperty: { readonly [symbolKey]: string | number };
if (hasSymbolValue(symbolProperty)) {
  expectType<number>(symbolProperty[symbolKey]);
}

const hasNumericValue = refineKey(0, isString);
declare let numericProperty: { readonly 0: string | number };
if (hasNumericValue(numericProperty)) {
  expectType<string>(numericProperty[0]);
}

// =============================================
// describe: refineDefinedKey
// =============================================
const hasDefinedStringName = refineDefinedKey('name', isString);

declare let optionalProperty: {
  readonly name?: string | number | undefined;
  readonly id: number;
};

if (hasDefinedStringName(optionalProperty)) {
  expectType<string>(optionalProperty.name);
  expectType<number>(optionalProperty.id);
}

declare let requiredPossiblyUndefinedProperty: {
  readonly name: string | undefined;
};

if (hasDefinedStringName(requiredPossiblyUndefinedProperty)) {
  expectType<string>(requiredPossiblyUndefinedProperty.name);
}

// =============================================
// describe: refineIndex
// =============================================
const hasStringAtZero = refineIndex(0, isString);

declare let readonlyArray: readonly (string | number)[];
if (hasStringAtZero(readonlyArray)) {
  expectType<string>(readonlyArray[0]);
}

declare let tuple: readonly [string | number, boolean];
if (hasStringAtZero(tuple)) {
  expectType<string>(tuple[0]);
  expectType<boolean>(tuple[1]);
}

declare const dynamicIndex: number;
// @ts-expect-error: A dynamic index cannot soundly narrow one specific element.
refineIndex(dynamicIndex, isString);
// @ts-expect-error: Negative numbers are not array indices.
refineIndex(-1, isString);
// @ts-expect-error: Fractional numbers are not array indices.
refineIndex(0.5, isString);

// =============================================
// describe: refinement constraints
// =============================================
// it: accepts generically constrained refinements
function liftRefinementGenerically<A, B extends A, F extends Refinement<A, B>>(
  refinement: F
) {
  refineKey('value', refinement);
  refineDefinedKey('value', refinement);
  refineIndex(0, refinement);
}

// it: rejects keys that can select more than one property
declare const unionStringKey: 'name' | 'id';
declare const broadStringKey: string;
declare const unionNumberKey: 0 | 1;
declare const broadNumberKey: number;
declare const firstSymbolKey: unique symbol;
declare const secondSymbolKey: unique symbol;
declare const unionSymbolKey: typeof firstSymbolKey | typeof secondSymbolKey;
declare const broadSymbolKey: symbol;

// @ts-expect-error: A union key does not identify one checked property.
refineKey(unionStringKey, isString);
// @ts-expect-error: A broad key does not identify one checked property.
refineKey(broadStringKey, isString);
// @ts-expect-error: A numeric union does not identify one checked property.
refineKey(unionNumberKey, isString);
// @ts-expect-error: A broad number does not identify one checked property.
refineKey(broadNumberKey, isString);
// @ts-expect-error: A symbol union does not identify one checked property.
refineKey(unionSymbolKey, isString);
// @ts-expect-error: A broad symbol does not identify one checked property.
refineKey(broadSymbolKey, isString);

// @ts-expect-error: Optional refinement has the same singleton-key contract.
refineDefinedKey(unionStringKey, isString);
// @ts-expect-error: Optional refinement rejects broad property keys.
refineDefinedKey(broadStringKey, isString);

// it: rejects ordinary boolean functions
const returnsBoolean = (value: unknown): boolean => Boolean(value);
// @ts-expect-error: refineKey requires a type predicate.
refineKey('name', returnsBoolean);
// @ts-expect-error: refineDefinedKey requires a type predicate.
refineDefinedKey('name', returnsBoolean);
// @ts-expect-error: refineIndex requires a type predicate.
refineIndex(0, returnsBoolean);
