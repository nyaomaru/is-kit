import { expectAssignable } from 'tsd';
import * as ts from 'typescript';
import { refineDefinedKey, refineIndex, refineKey } from '@/core/key';

// =============================================
// describe: strict property refinement options
// =============================================
// Note: This file is also compiled through tsconfig.property-refinement.json
// with exactOptionalPropertyTypes and noUncheckedIndexedAccess enabled.

// it: refines a required Compiler API child
const hasIdentifierExpression = refineKey('expression', ts.isIdentifier);
declare let call: ts.CallExpression;

if (hasIdentifierExpression(call)) {
  expectAssignable<ts.Identifier>(call.expression);
}

// it: requires and refines an optional Compiler API child
const hasCallInitializer = refineDefinedKey('initializer', ts.isCallExpression);
declare let declaration: ts.VariableDeclaration;

if (hasCallInitializer(declaration)) {
  expectAssignable<ts.CallExpression>(declaration.initializer);
}

// it: refines an unchecked readonly-array access
const hasStringFirstArgument = refineIndex(0, ts.isStringLiteral);

if (hasStringFirstArgument(call.arguments)) {
  expectAssignable<ts.StringLiteral>(call.arguments[0]);
}

// it: nests optional, required, and indexed refinements
const hasReturnFirstStatement = refineKey(
  'statements',
  refineIndex(0, ts.isReturnStatement)
);
const isBlockStartingWithReturn = (
  node: ts.Node
): node is ts.Block &
  Record<
    'statements',
    readonly ts.Node[] & { readonly 0: ts.ReturnStatement }
  > => ts.isBlock(node) && hasReturnFirstStatement(node);
const hasBodyStartingWithReturn = refineDefinedKey(
  'body',
  isBlockStartingWithReturn
);
declare let method: ts.MethodDeclaration;

if (hasBodyStartingWithReturn(method)) {
  expectAssignable<ts.ReturnStatement>(method.body.statements[0]);
}

// it: keeps the required-key contract distinct from optional properties
const hasRequiredCallInitializer = refineKey(
  'initializer',
  ts.isCallExpression
);
// @ts-expect-error: refineKey requires the property to be present.
hasRequiredCallInitializer(declaration);
