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

  it('should evaluate refinements in order and stop after the first match', () => {
    const calls: string[] = [];
    const first = jest.fn((value: unknown): value is string => {
      calls.push('first');
      return value === 'match';
    });
    const second = jest.fn((value: unknown): value is number => {
      calls.push('second');
      return typeof value === 'number';
    });
    const third = jest.fn((value: unknown): value is boolean => {
      calls.push('third');
      return typeof value === 'boolean';
    });

    const isMatch = oneOf(first, second, third);

    expect(isMatch('match')).toBe(true);
    expect(calls).toEqual(['first']);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(third).not.toHaveBeenCalled();
  });

  it('should call each refinement once in order when none matches', () => {
    const calls: string[] = [];
    const first = jest.fn((value: unknown): value is string => {
      calls.push('first');
      return typeof value === 'string';
    });
    const second = jest.fn((value: unknown): value is number => {
      calls.push('second');
      return typeof value === 'number';
    });
    const third = jest.fn((value: unknown): value is boolean => {
      calls.push('third');
      return typeof value === 'boolean';
    });

    const isMatch = oneOf(first, second, third);

    expect(isMatch({ value: 'no match' })).toBe(false);
    expect(calls).toEqual(['first', 'second', 'third']);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors thrown by an invoked refinement', () => {
    const error = new Error('refinement failed');
    const throwingRefinement = jest.fn(
      (_value: unknown): _value is string => {
        throw error;
      }
    );
    const laterRefinement = jest.fn(
      (value: unknown): value is number => typeof value === 'number'
    );
    const isMatch = oneOf(throwingRefinement, laterRefinement);

    expect(() => isMatch('value')).toThrow(error);
    expect(throwingRefinement).toHaveBeenCalledTimes(1);
    expect(laterRefinement).not.toHaveBeenCalled();
  });
});
