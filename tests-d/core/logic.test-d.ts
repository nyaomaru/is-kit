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

// it: accepts a generically constrained refinement
function composeAndGenerically<
  A,
  B extends A,
  C extends B,
  F extends Refine<A, B>
>(precondition: F, condition: Refine<B, C>) {
  expectType<Refine<A, C>>(and(precondition, condition));
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

// it: prefers tuple narrowing when every step accepts the original domain
type PipelineDomain = { level: 1 | 2 | 3 | 4 };
type PipelineFirst = { level: 1 | 2 | 3 };
type PipelineSecond = { level: 1 | 2 };
type PipelineFinal = { level: 1 };
type PipelineInput = PipelineDomain | string;
declare const isPipelineDomain: Refine<PipelineInput, PipelineDomain>;
declare const narrowsPipelineFirst: Refine<PipelineDomain, PipelineFirst>;
declare const narrowsPipelineSecond: Refine<PipelineDomain, PipelineSecond>;
declare const narrowsPipelineFinal: Refine<PipelineDomain, PipelineFinal>;
const pipelineSteps = [
  narrowsPipelineFirst,
  narrowsPipelineSecond,
  narrowsPipelineFinal
] as const;
expectType<Refine<PipelineInput, PipelineFinal>>(
  andAll(isPipelineDomain, ...pipelineSteps)
);

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

// it: accepts a generically constrained refinement
function composeAndAllGenerically<
  A,
  B extends A,
  C extends B,
  F extends Refine<A, B>
>(precondition: F, step: Refine<B, C>) {
  expectType<Refine<A, B>>(andAll(precondition));
  expectType<Refine<A, C>>(andAll(precondition, step));
}

// it: accepts a generic homogeneous refinement tuple
function composeAndAllTupleGenerically<
  A,
  B extends A,
  F extends Refine<A, B>,
  Steps extends readonly Refine<B, B>[]
>(precondition: F, steps: Steps) {
  expectType<Refine<A, B>>(andAll(precondition, ...steps));
}

// it: accepts a homogeneous refinement array
function composeAndAllArrayGenerically<A, B extends A, F extends Refine<A, B>>(
  precondition: F,
  steps: Refine<B, B>[]
) {
  expectType<Refine<A, B>>(andAll(precondition, ...steps));
}

// it: accepts a generic heterogeneous refinement chain
function composeAndAllChainGenerically<
  A,
  B extends A,
  C extends B,
  D extends C,
  E extends D,
  F extends Refine<A, B>,
  Steps extends [Refine<B, C>, Refine<C, D>, Refine<D, E>]
>(precondition: F, steps: Steps) {
  expectType<Refine<A, E>>(andAll(precondition, ...steps));
}

// it: accepts longer generic heterogeneous refinement chains
function composeLongerAndAllChainGenerically<
  A,
  B extends A,
  C extends B,
  D extends C,
  E extends D,
  G extends E,
  F extends Refine<A, B>,
  Steps extends [Refine<B, C>, Refine<C, D>, Refine<D, E>, Refine<E, G>]
>(precondition: F, steps: Steps) {
  expectType<Refine<A, G>>(andAll(precondition, ...steps));
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

// it: accepts a generically constrained refinement
function composeOrGenerically<
  A,
  B extends A,
  C extends A,
  F extends Refine<A, B>
>(refinement: F, alternative: Refine<A, C>) {
  expectType<Refine<A, B | C>>(or(refinement, alternative));
}

// it: preserves the v1 empty-call return type
// Note: Runtime always returns false, but narrowing it to `never` is a v2 change.
expectType<Predicate<unknown>>(or());
expectType<Predicate<unknown>>(or<[]>());

// it: rejects refinements whose output is outside the narrowed input
// @ts-expect-error: A literal cannot refine a call after `isCall` succeeds.
and(isCall, isLiteral);
// @ts-expect-error: Every `andAll` step must refine the preceding output.
andAll(isCall, hasIdentifierExpression, isLiteral, hasRunExpression);

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
