import { expectType } from 'tsd';
import { oneOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import type { Predicate, Refine } from '@/types';

type AstNode =
  | { kind: 'identifier'; text: string }
  | { kind: 'literal'; value: string }
  | { kind: 'call' };
type Identifier = Extract<AstNode, { kind: 'identifier' }>;
type Literal = Extract<AstNode, { kind: 'literal' }>;

const isIdentifier = (node: AstNode): node is Identifier =>
  node.kind === 'identifier';
const isLiteral = (node: AstNode): node is Literal => node.kind === 'literal';

// =============================================
// describe: oneOf
// =============================================
// it: unions outputs from multiple guards
const isStringOrNumber = oneOf(isString, isNumber);
expectType<Predicate<string | number>>(isStringOrNumber);

// it: preserves the v1 explicit generic tuple parameter
expectType<Predicate<string | number>>(
  oneOf<[typeof isString, typeof isNumber]>(isString, isNumber)
);

// it: preserves the v1 explicit input and tuple parameters
expectType<Refine<string | number, string | number>>(
  oneOf<string | number, [typeof isString, typeof isNumber]>(isString, isNumber)
);

declare const unionCandidate: unknown;
if (isStringOrNumber(unionCandidate)) {
  expectType<string | number>(unionCandidate);
}

// it: unions outputs over a shared known input domain
const isIdentifierOrLiteral = oneOf(isIdentifier, isLiteral);
expectType<Refine<AstNode, Identifier | Literal>>(isIdentifierOrLiteral);

declare const astNode: AstNode;
if (isIdentifierOrLiteral(astNode)) {
  expectType<Identifier | Literal>(astNode);
}

// it: preserves the empty-call behavior
expectType<Predicate<never>>(oneOf());
expectType<Predicate<never>>(oneOf<[]>());
