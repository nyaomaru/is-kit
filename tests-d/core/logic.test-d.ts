import { expectType } from 'tsd';
import {
  and,
  andAll,
  or,
  guardIn,
  not,
  isString,
  isNumber,
  define
} from '../../src/core';
import type { Predicate, Refine } from '../../src/types';

type AstNode =
  | { kind: 'identifier'; text: string }
  | { kind: 'literal'; value: string }
  | { kind: 'call'; expression: AstNode };
type Identifier = Extract<AstNode, { kind: 'identifier' }>;
type Literal = Extract<AstNode, { kind: 'literal' }>;
type Call = Extract<AstNode, { kind: 'call' }>;
type IdentifierCall = Call & { expression: Identifier };
type NamedIdentifierCall = IdentifierCall & {
  expression: Identifier & { text: 'run' };
};

const isIdentifier = (node: AstNode): node is Identifier =>
  node.kind === 'identifier';
const isLiteral = (node: AstNode): node is Literal => node.kind === 'literal';
const isCall = (node: AstNode): node is Call => node.kind === 'call';
const hasIdentifierExpression = (node: Call): node is IdentifierCall =>
  isIdentifier(node.expression);
const hasRunExpression = (node: IdentifierCall): node is NamedIdentifierCall =>
  node.expression.text === 'run';

// =============================================
// describe: and
// =============================================
// it: narrows to a literal
const isLiteralA = define<'a'>(
  (candidate): candidate is 'a' => candidate === 'a'
);
const stringAndLiteralAGuard = and(isString, isLiteralA);
expectType<Predicate<'a'>>(stringAndLiteralAGuard);

// it: preserves the v1 explicit generic parameters
expectType<Predicate<'a'>>(and<string, 'a'>(isString, isLiteralA));

declare let unknownCandidate: unknown;
// it: narrows unknown inside control-flow
if (stringAndLiteralAGuard(unknownCandidate)) {
  expectType<'a'>(unknownCandidate);
}

// it: preserves a known input domain
const identifierCall = and(isCall, hasIdentifierExpression);
expectType<Refine<AstNode, IdentifierCall>>(identifierCall);

declare let astNode: AstNode;
if (identifierCall(astNode)) {
  expectType<Identifier>(astNode.expression);
}

// =============================================
// describe: andAll
// =============================================
// it: preserves a known input domain across a refinement chain
const namedIdentifierCall = andAll(
  isCall,
  hasIdentifierExpression,
  hasRunExpression
);
expectType<Refine<AstNode, NamedIdentifierCall>>(namedIdentifierCall);

// it: preserves the v1 explicit generic parameters
expectType<Predicate<string>>(andAll<string>(isString));
expectType<Predicate<'a'>>(andAll<string, 'a'>(isString, isLiteralA));
expectType<Predicate<'a'>>(
  andAll<string, 'a', 'a'>(isString, isLiteralA, isLiteralA)
);
expectType<Predicate<'a'>>(
  andAll<string, [typeof isLiteralA]>(isString, isLiteralA)
);

if (namedIdentifierCall(astNode)) {
  expectType<'run'>(astNode.expression.text);
}

// =============================================
// describe: or
// =============================================
// it: union of outputs
const stringOrNumberGuard = or(isString, isNumber);
expectType<Predicate<string | number>>(stringOrNumberGuard);

// it: preserves the v1 explicit generic tuple parameter
expectType<Predicate<string | number>>(
  or<[typeof isString, typeof isNumber]>(isString, isNumber)
);

if (stringOrNumberGuard(unknownCandidate)) {
  expectType<string | number>(unknownCandidate);
}

// it: unions outputs over a shared known input domain
const identifierOrLiteral = or(isIdentifier, isLiteral);
expectType<Refine<AstNode, Identifier | Literal>>(identifierOrLiteral);

if (identifierOrLiteral(astNode)) {
  expectType<Identifier | Literal>(astNode);
}

// it: preserves the v1 empty-call return type
// Note: Runtime always returns false, but narrowing it to `never` is a v2 change.
expectType<Predicate<unknown>>(or());
expectType<Predicate<unknown>>(or<[]>());

// it: rejects refinements whose output is outside the narrowed input
// @ts-expect-error: A literal cannot refine a call after `isCall` succeeds.
and(isCall, isLiteral);

// it: rejects union refinements with unrelated input domains
const isStringWithinPrimitive = (value: string | number): value is string =>
  typeof value === 'string';
// @ts-expect-error: Every `or` branch must accept the first branch's input domain.
or(isIdentifier, isStringWithinPrimitive);

// it: rejects ordinary boolean predicates as the first refinement
const isPositiveBoolean = (value: number): boolean => value > 0;
const rejectsEveryNever = (value: never): value is never => false;
// @ts-expect-error: `and` requires a type predicate as its precondition.
and(isPositiveBoolean, rejectsEveryNever);
// @ts-expect-error: `andAll` requires a type predicate as its precondition.
andAll(isPositiveBoolean);
// @ts-expect-error: `or` requires a type predicate as its first argument.
or(isPositiveBoolean);

// =============================================
// describe: guardIn
// =============================================
// it: adapt a specific guard to a wider input
const stringWithinUnion = guardIn<string | number>()(isString);
expectType<Refine<string | number, string>>(stringWithinUnion);

declare let stringOrNumberValue: string | number;
// it: narrows within the wider input domain
if (stringWithinUnion(stringOrNumberValue)) {
  expectType<string>(stringOrNumberValue);
}

// =============================================
// describe: not
// =============================================
// it: guard overload excludes the guarded part
const excludeStringFromUnion = not<string | number, string>(isString);
expectType<Refine<string | number, number>>(excludeStringFromUnion);

// it: refine overload excludes the refined part
const isOnlyLiteralA = (value: 'a' | 'b'): value is 'a' => value === 'a';
const excludeLiteralA = not<'a' | 'b', 'a'>(isOnlyLiteralA);
expectType<Refine<'a' | 'b', 'b'>>(excludeLiteralA);
