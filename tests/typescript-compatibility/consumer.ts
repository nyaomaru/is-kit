import * as ts from 'typescript-api';
import {
  and,
  equalsKey,
  hasKey,
  hasKeys,
  narrowKeyTo,
  oneOf,
  refineDefinedKey,
  refineIndex,
  refineKey
} from 'is-kit';

// =============================================
// describe: published declaration compatibility
// =============================================
// Note: This fixture compiles against the packed package and the selected
// TypeScript version, not against source aliases or the workspace compiler.

// it: composes Compiler API refinements over a known input domain
const isCallWithIdentifierExpression = and(
  ts.isCallExpression,
  refineKey('expression', ts.isIdentifier)
);
declare const node: ts.Node;

if (isCallWithIdentifierExpression(node)) {
  const expression: ts.Identifier = node.expression;
  void expression;
}

// it: preserves a union produced by same-domain refinements
const isStringLike = oneOf(
  ts.isStringLiteral,
  ts.isNoSubstitutionTemplateLiteral
);
declare const nodes: readonly ts.Node[];
const strings = nodes.filter(isStringLike);
const stringLikeNodes: Array<
  ts.StringLiteral | ts.NoSubstitutionTemplateLiteral
> = strings;
void stringLikeNodes;

// it: reuses a child refinement in find and a visitor branch
const isIdentifierNamedJsxAttribute = and(
  ts.isJsxAttribute,
  refineKey('name', ts.isIdentifier)
);
declare const attributes: readonly ts.JsxAttributeLike[];
const attribute = attributes.find(isIdentifierNamedJsxAttribute);

if (attribute) {
  const name: ts.Identifier = attribute.name;
  void name;
}

function visit(current: ts.Node): void {
  if (isIdentifierNamedJsxAttribute(current)) {
    const name: ts.Identifier = current.name;
    void name;
  }

  ts.forEachChild(current, visit);
}

void visit;

// it: requires and refines an optional Compiler API child
const hasCallInitializer = refineDefinedKey('initializer', ts.isCallExpression);
declare const declaration: ts.VariableDeclaration;

if (hasCallInitializer(declaration)) {
  const initializer: ts.CallExpression = declaration.initializer;
  void initializer;
}

// it: composes optional, required, and indexed child refinements
const isBlockStartingWithReturn = and(
  ts.isBlock,
  refineKey('statements', refineIndex(0, ts.isReturnStatement))
);
const hasBodyStartingWithReturn = refineDefinedKey(
  'body',
  isBlockStartingWithReturn
);
declare const method: ts.MethodDeclaration;

if (hasBodyStartingWithReturn(method)) {
  const statement: ts.ReturnStatement = method.body.statements[0];
  void statement;
}

// it: rejects keys that may identify multiple runtime locations
declare const broadKey: string;
declare const unionKey: 'expression' | 'arguments';
declare const patternedKey: `child-${string}`;
declare const brandedNumberKey: number & { readonly brand: 'property-key' };

// it: keeps multi-value key helpers callable without over-narrowing
type Pair = { readonly left: number; readonly right: number };
declare const isPair: (value: unknown) => value is Pair;
declare const selectedPairKey: 'left' | 'right';
const hasSelectedKey = hasKey(selectedPairKey);
const hasSelectedKeys = hasKeys(selectedPairKey);
const selectedKeyEqualsValue = equalsKey(selectedPairKey, 1);
const selectedValueEqualsOne = narrowKeyTo(isPair, selectedPairKey)(1);

declare let unknownValue: unknown;
if (hasSelectedKey(unknownValue)) {
  const objectValue: object = unknownValue;
  void objectValue;
  // @ts-expect-error: A union key does not prove that left exists.
  const left = unknownValue.left;
  void left;
}

if (hasSelectedKeys(unknownValue)) {
  // @ts-expect-error: A union argument checks one runtime key, not both.
  const right = unknownValue.right;
  void right;
}

if (selectedKeyEqualsValue(unknownValue)) {
  // @ts-expect-error: Equality at one selected key does not narrow left.
  const left = unknownValue.left;
  void left;
}

if (selectedValueEqualsOne(unknownValue)) {
  const pair: Pair = unknownValue;
  void pair;
  // @ts-expect-error: Neither property is known to equal the target literal.
  const left: 1 = unknownValue.left;
  void left;
}

// @ts-expect-error: A broad string does not identify one property.
refineKey(broadKey, ts.isIdentifier);
// @ts-expect-error: A key union does not identify one property.
refineKey(unionKey, ts.isIdentifier);
// @ts-expect-error: A template-literal pattern does not identify one property.
refineDefinedKey(patternedKey, ts.isIdentifier);
// @ts-expect-error: A branded number may identify multiple properties.
refineKey(brandedNumberKey, ts.isIdentifier);

// it: rejects indices that do not identify one array element
declare const dynamicIndex: number;
declare const unionIndex: 0 | 1;

// @ts-expect-error: A dynamic number does not identify one array element.
refineIndex(dynamicIndex, ts.isIdentifier);
// @ts-expect-error: An index union does not identify one array element.
refineIndex(unionIndex, ts.isIdentifier);
// @ts-expect-error: Negative numbers are not array indices.
refineIndex(-1, ts.isIdentifier);
// @ts-expect-error: Fractional numbers are not array indices.
refineIndex(0.5, ts.isIdentifier);
