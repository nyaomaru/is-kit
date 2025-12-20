import { arrayOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';

describe('arrayOf (runtime)', () => {
  const isStringArray = arrayOf(isString);
  const isNumberArray = arrayOf(isNumber);

  it('accepts an empty array', () => {
    expect(isStringArray([])).toBe(true);
  });

  it('accepts when all elements satisfy the element predicate', () => {
    expect(isStringArray(['a', 'b'])).toBe(true);
    expect(isNumberArray([1, 2, 3])).toBe(true);
  });

  it('rejects when at least one element fails the predicate', () => {
    expect(isStringArray(['a', 1 as unknown as string])).toBe(false);
    expect(isNumberArray([1, '2' as unknown as number])).toBe(false);
  });

  it('rejects non-array inputs', () => {
    expect(isStringArray('not array' as unknown)).toBe(false);
    expect(isStringArray({ 0: 'a', length: 1 } as unknown)).toBe(false);
    expect(isStringArray(null as unknown)).toBe(false);
    expect(isStringArray(undefined as unknown)).toBe(false);
  });

  it('rejects sparse arrays if the hole makes predicate fail', () => {
    const arr = [] as unknown[];
    arr[1] = 'a';

    expect(isStringArray(arr)).toBe(false);
  });

  it('supports nested arrays (arrayOf(arrayOf(isString)))', () => {
    const is2DStringArray = arrayOf(arrayOf(isString));

    expect(is2DStringArray([['a'], ['b', 'c']])).toBe(true);
    expect(is2DStringArray([['a'], ['b', 1 as any]])).toBe(false);
    expect(is2DStringArray('nope' as unknown)).toBe(false);
  });
});

