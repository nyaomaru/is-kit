import { and, andAll, or, guardIn, not } from '@/core/logic';
import { define, predicateToRefine } from '@/core';
import { isString, isNumber } from '@/core/primitive';

describe('and', () => {
  it('runs condition only when precondition passes', () => {
    const startsWithA = predicateToRefine<string>((s) => s.startsWith('a'));
    const isAString = and(isString, startsWithA);

    expect(isAString('abc')).toBe(true);
    expect(isAString('zzz')).toBe(false);
    expect(isAString(123 as unknown)).toBe(false);
  });

  it('composes refinements over a known input domain', () => {
    type AstNode =
      | { kind: 'identifier'; text: string }
      | { kind: 'literal'; value: string };
    type Identifier = Extract<AstNode, { kind: 'identifier' }>;
    type NamedIdentifier = Identifier & { text: 'name' };

    const isIdentifier = (node: AstNode): node is Identifier =>
      node.kind === 'identifier';
    const isNamed = (node: Identifier): node is NamedIdentifier =>
      node.text === 'name';
    const isNamedIdentifier = and(isIdentifier, isNamed);

    expect(isNamedIdentifier({ kind: 'identifier', text: 'name' })).toBe(true);
    expect(isNamedIdentifier({ kind: 'identifier', text: 'other' })).toBe(
      false
    );
    expect(isNamedIdentifier({ kind: 'literal', value: 'name' })).toBe(false);
  });

  it('coerces truthy and falsy predicate results to booleans', () => {
    type LoosePredicate = (input: unknown) => unknown;
    const composeLoose = and as unknown as (
      precondition: LoosePredicate,
      condition: LoosePredicate
    ) => LoosePredicate;

    expect(
      composeLoose(
        () => 'truthy',
        () => ({ matched: true })
      )('value')
    ).toBe(true);
    expect(
      composeLoose(
        () => 1,
        () => 0
      )('value')
    ).toBe(false);
    expect(
      composeLoose(
        () => undefined,
        () => 'truthy'
      )('value')
    ).toBe(false);
  });
});

describe('andAll', () => {
  it('chains multiple refinements after a precondition', () => {
    const isEven = predicateToRefine<number>((n) => n % 2 === 0);
    const isMultipleOf4 = predicateToRefine<number>((n) => n % 4 === 0);
    const guard = andAll(isNumber, isEven, isMultipleOf4);

    expect(guard(8)).toBe(true);
    expect(guard(6)).toBe(false); // even but not multiple of 4
    expect(guard('8' as unknown)).toBe(false);
  });

  it('preserves short-circuiting for a known input domain', () => {
    type AstNode =
      | { kind: 'call'; expression: string }
      | { kind: 'literal'; value: string };
    type Call = Extract<AstNode, { kind: 'call' }>;
    type NamedCall = Call & { expression: 'run' };

    const isCall = jest.fn(
      (node: AstNode): node is Call => node.kind === 'call'
    );
    const isNamedCall = jest.fn(
      (node: Call): node is NamedCall => node.expression === 'run'
    );
    const isRunnable = jest.fn(
      (node: NamedCall): node is NamedCall => node.expression.length > 0
    );
    const guard = andAll(isCall, isNamedCall, isRunnable);

    expect(guard({ kind: 'literal', value: 'run' })).toBe(false);
    expect(isNamedCall).not.toHaveBeenCalled();
    expect(isRunnable).not.toHaveBeenCalled();

    expect(guard({ kind: 'call', expression: 'other' })).toBe(false);
    expect(isRunnable).not.toHaveBeenCalled();

    expect(guard({ kind: 'call', expression: 'run' })).toBe(true);
    expect(isRunnable).toHaveBeenCalledTimes(1);
  });
});

describe('or', () => {
  it('passes when any guard passes', () => {
    const isShortString = define<string>(
      (x) => typeof x === 'string' && x.length <= 3
    );
    const isSmallNumber = define<number>(
      (x) => typeof x === 'number' && x <= 10
    );
    const smallOrShort = or(isShortString, isSmallNumber);

    expect(smallOrShort('foo')).toBe(true);
    expect(smallOrShort(7)).toBe(true);
    expect(smallOrShort('toolong')).toBe(false);
    expect(smallOrShort(100)).toBe(false);
  });

  it('composes refinements over a shared known input domain', () => {
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
    const isIdentifierOrLiteral = or(isIdentifier, isLiteral);

    expect(isIdentifierOrLiteral({ kind: 'identifier', text: 'name' })).toBe(
      true
    );
    expect(isIdentifierOrLiteral({ kind: 'literal', value: 'text' })).toBe(
      true
    );
    expect(isIdentifierOrLiteral({ kind: 'call' })).toBe(false);
  });

  it('rejects every value when no refinements are provided', () => {
    const never = or();

    expect(never('value')).toBe(false);
  });
});

describe('guardIn', () => {
  it('adapts a specific guard to a wider input type', () => {
    const inUnknown = guardIn<unknown>()(isString);
    expect(inUnknown('x')).toBe(true);
    expect(inUnknown(1)).toBe(false);

    const inUnion = guardIn<string | number>()(isString);
    expect(inUnion('x')).toBe(true);
    expect(inUnion(1 as string | number)).toBe(false);
  });
});

describe('not', () => {
  it('negates a guard', () => {
    const isNotString = not<unknown, string>(isString);
    expect(isNotString('x')).toBe(false);
    expect(isNotString(1)).toBe(true);
  });

  it('negates a refine', () => {
    const isZero = (n: number): n is 0 => n === 0;
    const isNonZero = not<number, 0>(isZero);
    expect(isNonZero(0)).toBe(false);
    expect(isNonZero(4)).toBe(true);
  });
});
