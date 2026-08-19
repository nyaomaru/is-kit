import { oneOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';

describe('oneOf', () => {
  it('should validate a value that matches one of the predicates', () => {
    const isStringOrNumber = oneOf(isString, isNumber);

    expect(isStringOrNumber('hello')).toBe(true);
    expect(isStringOrNumber(42)).toBe(true);
  });

  it('should reject a value that does not match any of the predicates', () => {
    const isStringOrNumber = oneOf(isString, isNumber);

    expect(isStringOrNumber(true)).toBe(false);
    expect(isStringOrNumber(null)).toBe(false);
  });

  it('should compose refinements over a shared known input domain', () => {
    type AstNode =
      | { kind: 'identifier'; text: string }
      | { kind: 'literal'; value: string }
      | { kind: 'call' };
    type Identifier = Extract<AstNode, { kind: 'identifier' }>;
    type Literal = Extract<AstNode, { kind: 'literal' }>;

    const isIdentifier = (node: AstNode): node is Identifier =>
      node.kind === 'identifier';
    const isLiteral = (node: AstNode): node is Literal =>
      node.kind === 'literal';
    const isIdentifierOrLiteral = oneOf(isIdentifier, isLiteral);

    expect(isIdentifierOrLiteral({ kind: 'identifier', text: 'name' })).toBe(
      true
    );
    expect(isIdentifierOrLiteral({ kind: 'literal', value: 'text' })).toBe(
      true
    );
    expect(isIdentifierOrLiteral({ kind: 'call' })).toBe(false);
  });

  it('should reject every value when no refinements are provided', () => {
    const never = oneOf();

    expect(never('value')).toBe(false);
  });
});
