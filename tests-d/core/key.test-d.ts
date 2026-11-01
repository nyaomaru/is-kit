import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
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
  oneOfValues,
  andAll,
  equals
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

// it: keeps union and broad keys callable without narrowing every candidate key
type Pair = Readonly<{ left: number; right: number }>;
declare const isPair: Predicate<Pair>;
declare const selectedPairKey: 'left' | 'right';
declare const broadDictionaryKey: string;
declare const isNumberDictionary: Predicate<Readonly<Record<string, number>>>;

const hasSelectedOne = narrowKeyTo(isPair, selectedPairKey)(1);
const hasDynamicOne = narrowKeyTo(isNumberDictionary, broadDictionaryKey)(1);

expectType<Predicate<Pair>>(hasSelectedOne);
expectType<Predicate<Readonly<Record<string, number>>>>(hasDynamicOne);
expectType<Predicate<Pair>>(
  narrowKeyTo<Pair, 'left' | 'right'>(isPair, selectedPairKey)(1)
);

if (hasSelectedOne(candidate)) {
  expectType<number>(candidate.left);
  expectType<number>(candidate.right);
}

// =============================================
// describe: hasKey
// =============================================
const hasKind = hasKey('kind');

if (hasKind(candidate)) {
  expectType<Record<'kind', unknown>>(candidate);
  expectType<unknown>(candidate.kind);
}

// it: keeps dynamic key checks callable without claiming every possible key
declare const selectedKey: 'kind' | 'id';
declare const broadKey: string;
const hasSelectedKey = hasKey(selectedKey);
const hasDynamicKey = hasKey(broadKey);

expectType<Predicate<object>>(hasSelectedKey);
expectType<Predicate<object>>(hasDynamicKey);
expectType<Predicate<Record<'kind', unknown>>>(hasKey<'kind'>('kind'));
expectType<Predicate<object>>(hasKey<'kind' | 'id'>(selectedKey));

if (hasSelectedKey(candidate)) {
  expectType<object>(candidate);
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

// it: falls back when any argument may identify multiple runtime keys
const hasOneSelectedKey = hasKeys(selectedKey);
const hasKindAndDynamicKey = hasKeys('kind', broadKey);
declare const selectedKeyTuple: readonly ['kind'] | readonly ['id'];
const hasSelectedKeyTuple = hasKeys(...selectedKeyTuple);

expectType<Predicate<object>>(hasOneSelectedKey);
expectType<Predicate<object>>(hasKindAndDynamicKey);
expectType<Predicate<object>>(hasSelectedKeyTuple);
expectType<Predicate<Record<'kind' | 'id', unknown>>>(
  hasKeys<readonly ['kind', 'id']>('kind', 'id')
);
expectType<Predicate<object>>(hasKeys<readonly ['kind' | 'id']>(selectedKey));
expectType<Predicate<object>>(
  hasKeys<readonly ['kind'] | readonly ['id']>(...selectedKeyTuple)
);

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

// it: preserves unrelated parent properties across primitives, objects, arrays, and functions
declare let multiPropertyObject: {
  readonly name: string | number;
  readonly count: number;
  readonly nested: { readonly active: boolean };
  readonly tags: readonly string[];
  readonly transform: (input: string) => number;
};
if (hasStringName(multiPropertyObject)) {
  expectType<string>(multiPropertyObject.name);
  expectType<number>(multiPropertyObject.count);
  expectType<{ readonly active: boolean }>(multiPropertyObject.nested);
  expectType<readonly string[]>(multiPropertyObject.tags);
  expectType<(input: string) => number>(multiPropertyObject.transform);
  expectNotAssignable<number>(multiPropertyObject.name);
}

// it: preserves mutable property modifiers
declare let mutablePropertyObject: {
  name: string | number;
  count: number;
};
if (hasStringName(mutablePropertyObject)) {
  expectType<string>(mutablePropertyObject.name);
  expectType<number>(mutablePropertyObject.count);
  mutablePropertyObject.name = 'updated';
}

// it: rejects optional properties (refineDefinedKey is required instead)
declare let optionalTarget: {
  readonly name?: string | number;
  readonly id: number;
};
// @ts-expect-error: refineKey requires the property to be required, not optional.
hasStringName(optionalTarget);

// it: rejects objects missing the required key
declare let missingTarget: { readonly id: number };
// @ts-expect-error: Property 'name' is missing in target object.
hasStringName(missingTarget);

// it: preserves and narrows intersection types
type BaseEntity = { readonly id: number; readonly active: boolean };
type NamedEntity = { readonly name: string | number };
declare let intersectedEntity: BaseEntity & NamedEntity;
if (hasStringName(intersectedEntity)) {
  expectType<string>(intersectedEntity.name);
  expectType<number>(intersectedEntity.id);
  expectType<boolean>(intersectedEntity.active);
  expectAssignable<BaseEntity>(intersectedEntity);
}

// it: narrows property on union types while preserving branches
type VariantA = {
  readonly kind: 'a';
  readonly name: string | number;
  readonly aValue: number;
};
type VariantB = {
  readonly kind: 'b';
  readonly name: string;
  readonly bValue: boolean;
};
type VariantUnion = VariantA | VariantB;
declare let unionCandidate: VariantUnion;
if (hasStringName(unionCandidate)) {
  expectType<string>(unionCandidate.name);
  if (unionCandidate.kind === 'a') {
    expectType<number>(unionCandidate.aValue);
  } else {
    expectType<boolean>(unionCandidate.bValue);
  }
}

// it: preserves generic parent types
function refineGenericProperty<
  T extends { readonly name: string | number; readonly flag: boolean }
>(input: T) {
  if (hasStringName(input)) {
    expectType<string>(input.name);
    expectType<boolean>(input.flag);
    expectAssignable<T>(input);
  }
}

// it: rejects incompatible property refinement domains
declare const isStrictPositive: Refinement<number, number>;
const hasStrictPositive = refineKey('count', isStrictPositive);
declare let stringCountObject: { readonly count: string };
// @ts-expect-error: Argument of type string is not assignable to parameter of type number.
hasStrictPositive(stringCountObject);

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

// =============================================
// describe: practical property refinement composition
// =============================================
// it: preserves a defined optional API field through Array.filter
type Job = {
  readonly id: string;
  readonly result?: string | Uint8Array;
};

declare const jobs: readonly Job[];
const completedTextJobs = jobs.filter(refineDefinedKey('result', isString));

expectType<Array<Job & Record<'result', string>>>(completedTextJobs);

// it: lifts nested discriminant and field refinements to an envelope
type TextPayload = {
  readonly kind: 'text';
  readonly status: 'pending' | 'ready';
  readonly body: string | Uint8Array;
};
type BinaryPayload = { readonly kind: 'binary'; readonly bytes: Uint8Array };
type Envelope = { readonly payload: TextPayload | BinaryPayload };

const isTextPayload = (
  payload: TextPayload | BinaryPayload
): payload is TextPayload => payload.kind === 'text';
const hasReadyTextPayload = refineKey(
  'payload',
  andAll(
    isTextPayload,
    refineKey('status', equals('ready')),
    refineKey('body', isString)
  )
);

declare let envelope: Envelope;
if (hasReadyTextPayload(envelope)) {
  expectType<'ready'>(envelope.payload.status);
  // Note: The parent intersection prevents a generic refinement from widening
  // a more specific caller property, so assert assignability rather than an
  // identical displayed intersection type.
  expectAssignable<string>(envelope.payload.body);
  expectAssignable<typeof envelope.payload.body>('body');
}

declare const dynamicIndex: number;
declare const unionIndex: 0 | 1;
declare const mixedValidAndNegativeIndex: 0 | -1;
declare const brandedIndex: number & { readonly __brand: 'index' };
// @ts-expect-error: A dynamic index cannot soundly narrow one specific element.
refineIndex(dynamicIndex, isString);
// @ts-expect-error: A union cannot identify the one element checked at runtime.
refineIndex(unionIndex, isString);
// @ts-expect-error: A union remains invalid even when one member is a valid index.
refineIndex(mixedValidAndNegativeIndex, isString);
// @ts-expect-error: Negative numbers are not array indices.
refineIndex(-1, isString);
// @ts-expect-error: Fractional numbers are not array indices.
refineIndex(0.5, isString);
// @ts-expect-error: A branded number still represents multiple possible indices.
refineIndex(brandedIndex, isString);

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
declare const patternedStringKey: `field-${string}`;
declare const patternedNumberKey: `field-${number}`;
declare const brandedNumberKey: number & { readonly __brand: 'number-key' };
declare const brandedSymbolKey: symbol & { readonly __brand: 'symbol-key' };
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
// @ts-expect-error: A template pattern can identify multiple properties.
refineKey(patternedStringKey, isString);
// @ts-expect-error: A numeric template pattern can identify multiple properties.
refineKey(patternedNumberKey, isString);
// @ts-expect-error: A branded number can identify multiple properties.
refineKey(brandedNumberKey, isString);
// @ts-expect-error: A branded symbol can identify multiple properties.
refineKey(brandedSymbolKey, isString);
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
// @ts-expect-error: Optional refinement rejects template patterns.
refineDefinedKey(patternedStringKey, isString);
// @ts-expect-error: Optional refinement rejects branded number domains.
refineDefinedKey(brandedNumberKey, isString);
// @ts-expect-error: Optional refinement rejects branded symbol domains.
refineDefinedKey(brandedSymbolKey, isString);

// it: rejects ordinary boolean functions
const returnsBoolean = (value: unknown): boolean => Boolean(value);
// @ts-expect-error: refineKey requires a type predicate.
refineKey('name', returnsBoolean);
// @ts-expect-error: refineDefinedKey requires a type predicate.
refineDefinedKey('name', returnsBoolean);
// @ts-expect-error: refineIndex requires a type predicate.
refineIndex(0, returnsBoolean);
