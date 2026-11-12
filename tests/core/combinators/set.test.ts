import { setOf, arrayOf } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';

describe('setOf (runtime)', () => {
  const isStringSet = setOf(isString);
  const isNumberSet = setOf(isNumber);

  it('accepts an empty set', () => {
    expect(isStringSet(new Set())).toBe(true);
  });

  it('accepts when all values satisfy the guard', () => {
    expect(isStringSet(new Set(['a', 'b']))).toBe(true);
    expect(isNumberSet(new Set([1, 2, 3]))).toBe(true);
  });

  it('rejects when at least one value fails the guard', () => {
    expect(isStringSet(new Set(['a', 1 as unknown as string]))).toBe(false);
    expect(isNumberSet(new Set([1, '2' as unknown as number]))).toBe(false);
  });

  it('rejects non-set inputs', () => {
    expect(isStringSet(['a', 'b'] as unknown)).toBe(false);
    expect(isStringSet({ [Symbol.toStringTag]: 'Set' } as unknown)).toBe(false);
    expect(isStringSet(new Map([['a', 'b']]) as unknown)).toBe(false);
    expect(isStringSet(null as unknown)).toBe(false);
    expect(isStringSet(undefined as unknown)).toBe(false);
  });

  it('supports nested combinators', () => {
    const isNested = setOf(arrayOf(isString));

    expect(isNested(new Set([['a'], ['b', 'c']]))).toBe(true);
    expect(isNested(new Set([['a'], ['b', 1 as any]]))).toBe(false);
    expect(isNested('nope' as unknown)).toBe(false);
  });

  it('uses the intrinsic iterator for branded sets', () => {
    const set = new Set(['a']);
    Object.defineProperty(set, Symbol.iterator, {
      value: () => {
        throw new Error('custom iterator should not run');
      }
    });

    expect(() => isStringSet(set)).not.toThrow();
    expect(isStringSet(set)).toBe(true);
  });

  it('stops validating after the first failing value', () => {
    const seen: string[] = [];
    const guard = jest.fn((value: string) => {
      seen.push(value);
      return value !== 'invalid';
    });
    const isValidSet = setOf(guard);

    expect(isValidSet(new Set(['first', 'invalid', 'never']))).toBe(false);
    expect(seen).toEqual(['first', 'invalid']);
    expect(guard).toHaveBeenCalledTimes(2);
    expect(guard).not.toHaveBeenCalledWith('never');
  });

  it('validates every value in iteration order when all pass', () => {
    const seen: number[] = [];
    const guard = jest.fn((value: number) => {
      seen.push(value);
      return value > 0;
    });
    const isPositiveSet = setOf(guard);

    expect(isPositiveSet(new Set([3, 1, 2]))).toBe(true);
    expect(seen).toEqual([3, 1, 2]);
    expect(guard).toHaveBeenCalledTimes(3);
  });
});
