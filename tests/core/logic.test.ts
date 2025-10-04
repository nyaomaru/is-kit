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
