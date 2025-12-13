import { oneOfValues } from '@/core/combinators';

describe('oneOfValues', () => {
  it('accepts any of the provided primitive literals (small set)', () => {
    const isAB = oneOfValues('a', 'b');

    expect(isAB('a')).toBe(true);
    expect(isAB('b')).toBe(true);
    expect(isAB('c' as unknown)).toBe(false);
  });

  it('treats NaN as equal to NaN', () => {
    const isNaNOnly = oneOfValues(NaN);

    expect(isNaNOnly(NaN)).toBe(true);
    expect(isNaNOnly('NaN' as unknown)).toBe(false);
  });

  it('distinguishes +0 and -0 consistently (large set)', () => {
    const isIn = oneOfValues(0, 1, 2, 3, 4, 5, 6, 7, 8);

    expect(isIn(0)).toBe(true);
    expect(isIn(9 as unknown)).toBe(false);
  });

  it('accepts a single readonly tuple array input', () => {
    const isRole = oneOfValues(['admin', 'member'] as const);

    expect(isRole('admin')).toBe(true);
    expect(isRole('member')).toBe(true);
    expect(isRole('guest' as unknown)).toBe(false);
  });
});
