import { expectAssignable, expectType } from 'tsd';
import * as ts from 'typescript';
import { oneOf } from '@/core/combinators';
import { refineDefinedKey, refineIndex, refineKey } from '@/core/key';
import { and, andAll, or } from '@/core/logic';
import type { GuardedOf, Refine } from '@/types';

type IdentifierCall = ts.CallExpression & {
  expression: ts.Identifier;
};

type RequireCall = IdentifierCall & {
  expression: ts.Identifier & { text: 'require' };
};

const hasIdentifierCallee = (node: ts.CallExpression): node is IdentifierCall =>
  ts.isIdentifier(node.expression);

const hasRequireCallee = (node: IdentifierCall): node is RequireCall =>
  node.expression.text === 'require';

// =============================================
// describe: TypeScript Compiler API compatibility
// =============================================
// it: extracts outputs from known-domain refinements
declare const identifier: GuardedOf<typeof ts.isIdentifier>;
expectType<ts.Identifier>(identifier);

// it: composes a Compiler API guard with a child refinement
const isIdentifierCall = and(ts.isCallExpression, hasIdentifierCallee);
expectType<Refine<ts.Node, IdentifierCall>>(isIdentifierCall);

// it: preserves the Compiler API input across a refinement chain
const isRequireCall = andAll(
  ts.isCallExpression,
  hasIdentifierCallee,
  hasRequireCallee
);
expectType<Refine<ts.Node, RequireCall>>(isRequireCall);

// it: unions Compiler API guard outputs with or
const isStringLike = or(ts.isStringLiteral, ts.isNoSubstitutionTemplateLiteral);
expectType<
  Refine<ts.Node, ts.StringLiteral | ts.NoSubstitutionTemplateLiteral>
>(isStringLike);

// it: unions Compiler API guard outputs with oneOf
const isNamedDeclaration = oneOf(
  ts.isClassDeclaration,
  ts.isFunctionDeclaration,
  ts.isVariableDeclaration
);
expectType<
  Refine<
    ts.Node,
    ts.ClassDeclaration | ts.FunctionDeclaration | ts.VariableDeclaration
  >
>(isNamedDeclaration);

declare let node: ts.Node;

if (isRequireCall(node)) {
  expectType<'require'>(node.expression.text);
}

if (isStringLike(node)) {
  expectType<ts.StringLiteral | ts.NoSubstitutionTemplateLiteral>(node);
}

// =============================================
// describe: TypeScript Compiler API property refinements
// =============================================
// it: refines a required child node while preserving its parent
const hasIdentifierExpression = refineKey('expression', ts.isIdentifier);
const isCallWithIdentifierExpression = and(
  ts.isCallExpression,
  hasIdentifierExpression
);

if (isCallWithIdentifierExpression(node)) {
  expectAssignable<ts.CallExpression>(node);
  expectAssignable<ts.Identifier>(node.expression);
}

// it: requires and refines an optional child node
const hasCallInitializer = refineDefinedKey('initializer', ts.isCallExpression);
declare let declaration: ts.VariableDeclaration;

if (hasCallInitializer(declaration)) {
  expectAssignable<ts.CallExpression>(declaration.initializer);
}

// it: refines a readonly NodeArray index
const hasStringFirstArgument = refineKey(
  'arguments',
  refineIndex(0, ts.isStringLiteral)
);
const isCallWithStringFirstArgument = and(
  ts.isCallExpression,
  hasStringFirstArgument
);

if (isCallWithStringFirstArgument(node)) {
  expectType<ts.StringLiteral>(node.arguments[0]);
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
declare let method: ts.MethodDeclaration;

if (hasBodyStartingWithReturn(method)) {
  expectAssignable<ts.Block>(method.body);
  expectType<ts.ReturnStatement>(method.body.statements[0]);
}
