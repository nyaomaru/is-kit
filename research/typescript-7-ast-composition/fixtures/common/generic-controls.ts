import { and, equals, refineDefinedKey, refineIndex, refineKey } from 'is-kit';

export type Leaf = {
  readonly kind: 'a' | 'b';
  readonly text: string;
};

export type ALeaf = Leaf & { readonly kind: 'a' };

export type NestedContainer = {
  readonly tag: 'container';
  readonly leaf: Leaf;
};

export type NestedValue = NestedContainer | { readonly tag: 'other' };

export type Parent = {
  readonly required: Leaf;
  readonly optional?: Leaf;
  readonly items: readonly Leaf[];
  readonly nested: NestedValue;
};

declare const parents: readonly Parent[];

const isALeaf = (leaf: Leaf): leaf is ALeaf => leaf.kind === 'a';
const isNestedContainer = (value: NestedValue): value is NestedContainer =>
  value.tag === 'container';

// Generic required-property control
export const inferredRequired = (parent: Parent) => isALeaf(parent.required);
export const explicitRequired = (
  parent: Parent
): parent is Parent & { readonly required: ALeaf } => isALeaf(parent.required);
export const isKitRequired = refineKey('required', isALeaf);

export const inferredRequiredFilter = parents.filter(inferredRequired);
export const explicitRequiredFilter = parents.filter(explicitRequired);
export const isKitRequiredFilter = parents.filter(isKitRequired);

// Generic defined-optional-property control
export const inferredOptional = (parent: Parent) =>
  parent.optional !== undefined && isALeaf(parent.optional);
export const explicitOptional = (
  parent: Parent
): parent is Parent & { readonly optional: ALeaf } =>
  parent.optional !== undefined && isALeaf(parent.optional);
export const isKitOptional = refineDefinedKey('optional', isALeaf);

export const inferredOptionalFilter = parents.filter(inferredOptional);
export const explicitOptionalFilter = parents.filter(explicitOptional);
export const isKitOptionalFilter = parents.filter(isKitOptional);

// Generic indexed-property control
export const inferredIndexed = (parent: Parent) =>
  parent.items[0] !== undefined && isALeaf(parent.items[0]);
export const explicitIndexed = (
  parent: Parent
): parent is Parent & {
  readonly items: readonly Leaf[] & { readonly 0: ALeaf };
} => parent.items[0] !== undefined && isALeaf(parent.items[0]);
export const isKitIndexed = refineKey('items', refineIndex(0, isALeaf));

export const inferredIndexedFilter = parents.filter(inferredIndexed);
export const explicitIndexedFilter = parents.filter(explicitIndexed);
export const isKitIndexedFilter = parents.filter(isKitIndexed);

// Generic nested-property control
export const inferredNested = (parent: Parent) =>
  isNestedContainer(parent.nested) && isALeaf(parent.nested.leaf);
export const explicitNested = (
  parent: Parent
): parent is Parent & {
  readonly nested: NestedContainer & { readonly leaf: ALeaf };
} => isNestedContainer(parent.nested) && isALeaf(parent.nested.leaf);
export const isKitNested = refineKey(
  'nested',
  and(isNestedContainer, refineKey('leaf', isALeaf))
);

export const inferredNestedFilter = parents.filter(inferredNested);
export const explicitNestedFilter = parents.filter(explicitNested);
export const isKitNestedFilter = parents.filter(isKitNested);

// Generic structure-plus-literal-value control
export const inferredLiteral = (parent: Parent) =>
  isALeaf(parent.required) && parent.required.text === 'require';
export const explicitLiteral = (
  parent: Parent
): parent is Parent & {
  readonly required: ALeaf & { readonly text: 'require' };
} => isALeaf(parent.required) && parent.required.text === 'require';
export const isKitLiteral = refineKey(
  'required',
  and(isALeaf, refineKey('text', equals('require')))
);

export const inferredLiteralFilter = parents.filter(inferredLiteral);
export const explicitLiteralFilter = parents.filter(explicitLiteral);
export const isKitLiteralFilter = parents.filter(isKitLiteral);
