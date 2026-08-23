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
function liftRefinementGenerically<
  K extends PropertyKey,
  A,
  B extends A,
  F extends Refinement<A, B>
>(key: K, refinement: F) {
  refineKey(key, refinement);
  refineDefinedKey(key, refinement);
  refineIndex(0, refinement);
}

// it: rejects ordinary boolean functions
const returnsBoolean = (value: unknown): boolean => Boolean(value);
// @ts-expect-error: refineKey requires a type predicate.
refineKey('name', returnsBoolean);
// @ts-expect-error: refineDefinedKey requires a type predicate.
refineDefinedKey('name', returnsBoolean);
// @ts-expect-error: refineIndex requires a type predicate.
refineIndex(0, returnsBoolean);
