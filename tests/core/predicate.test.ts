import { and } from '@/core/logic';
import { predicateToRefine } from '@/core/predicate';
import { isNumber } from '@/core/primitive';

describe('core/predicate', () => {
  it('converts a boolean predicate into a refine', () => {
    const isPositive = (n: number) => n > 0;
    const refine = predicateToRefine<number>(isPositive);

    expect(refine(1)).toBe(true);
    expect(refine(0)).toBe(false);
    expect(refine(-1)).toBe(false);
  });

  it('passes the original input through and evaluates the predicate once per call', () => {
    const input = { tag: 'same' };
    const fn = jest.fn((value: typeof input) => value.tag === 'same');
    const refine = predicateToRefine(fn);

    expect(refine(input)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(input);

    expect(refine(input)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe(input);
    expect(fn.mock.calls[1][0]).toBe(input);
  });

  it('evaluates the refinement only after an and precondition passes', () => {
    const isPositive = jest.fn((n: number) => n > 0);
    const isPositiveNumber = and(isNumber, predicateToRefine(isPositive));

    expect(isPositiveNumber('1')).toBe(false);
    expect(isPositive).not.toHaveBeenCalled();

    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositive).toHaveBeenCalledTimes(1);
    expect(isPositive).toHaveBeenCalledWith(0);

    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositive).toHaveBeenCalledTimes(2);
    expect(isPositive).toHaveBeenLastCalledWith(1);
  });
});
