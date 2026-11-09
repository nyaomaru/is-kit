import { arrayOf, nonEmptyArrayOf, oneOf } from '@/core/combinators';
import { isString, isNumber, isUndefined } from '@/core/primitive';

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

  it('stops evaluating elements after the first guard failure', () => {
    const calls: unknown[] = [];
    const stringGuard = (value: unknown): value is string => {
      calls.push(value);
      return isString(value);
    };

    expect(arrayOf(stringGuard)(['a', 'b', 1, 'c'])).toBe(false);
    expect(calls).toEqual(['a', 'b', 1]);
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

  it('accepts sparse arrays when the element guard accepts undefined', () => {
    const isStringOrUndefinedArray = arrayOf(oneOf(isString, isUndefined));
    const values = [] as unknown[];
    values[1] = 'a';

    expect(0 in values).toBe(false);
    expect(isStringOrUndefinedArray(values)).toBe(true);
  });

  it('rejects sparse arrays when a present element fails the guard', () => {
    const isStringOrUndefinedArray = arrayOf(oneOf(isString, isUndefined));
    const values = [] as unknown[];
    values[0] = 'a';
    values[2] = 1;

    expect(isStringOrUndefinedArray(values)).toBe(false);
  });

  it('supports nested arrays (arrayOf(arrayOf(isString)))', () => {
    const is2DStringArray = arrayOf(arrayOf(isString));

    expect(is2DStringArray([['a'], ['b', 'c']])).toBe(true);
    expect(is2DStringArray([['a'], ['b', 1 as any]])).toBe(false);
    expect(is2DStringArray('nope' as unknown)).toBe(false);
  });

  it('bypasses overridden iterators on array subclasses', () => {
    class StringArray extends Array<string> {}

    const values = new StringArray('a');
    Object.defineProperty(values, Symbol.iterator, {
      value: () => {
        throw new Error('custom iterator should not run');
      }
    });

    expect(() => isStringArray(values)).not.toThrow();
    expect(isStringArray(values)).toBe(true);
  });
});

describe('nonEmptyArrayOf (runtime)', () => {
  const isNonEmptyStringArray = nonEmptyArrayOf(isString);

  it('rejects an empty array', () => {
    expect(isNonEmptyStringArray([])).toBe(false);
  });

  it('accepts when all elements satisfy the element predicate', () => {
    expect(isNonEmptyStringArray(['a'])).toBe(true);
    expect(isNonEmptyStringArray(['a', 'b'])).toBe(true);
  });

  it('rejects when at least one element fails the predicate', () => {
    expect(isNonEmptyStringArray(['a', 1 as unknown as string])).toBe(false);
  });

  it('stops evaluating elements after the first guard failure', () => {
    const calls: unknown[] = [];
    const stringGuard = (value: unknown): value is string => {
      calls.push(value);
      return isString(value);
    };

    expect(nonEmptyArrayOf(stringGuard)(['a', 'b', 1, 'c'])).toBe(false);
    expect(calls).toEqual(['a', 'b', 1]);
  });

  it('rejects sparse arrays if the hole makes predicate fail', () => {
    const values = [] as unknown[];
    values[1] = 'a';

    expect(isNonEmptyStringArray(values)).toBe(false);
  });

  it('accepts sparse arrays when the element guard accepts undefined', () => {
    const isNonEmptyStringOrUndefinedArray = nonEmptyArrayOf(
      oneOf(isString, isUndefined)
    );
    const values = [] as unknown[];
    values[1] = 'a';

    expect(0 in values).toBe(false);
    expect(isNonEmptyStringOrUndefinedArray(values)).toBe(true);
  });

  it('rejects sparse arrays when a present element fails the guard', () => {
    const isNonEmptyStringOrUndefinedArray = nonEmptyArrayOf(
      oneOf(isString, isUndefined)
    );
    const values = [] as unknown[];
    values[0] = 'a';
    values[2] = 1;

    expect(isNonEmptyStringOrUndefinedArray(values)).toBe(false);
  });

  it('rejects non-array inputs', () => {
    expect(isNonEmptyStringArray('not array' as unknown)).toBe(false);
    expect(isNonEmptyStringArray({ 0: 'a', length: 1 } as unknown)).toBe(false);
  });

  it('bypasses overridden iterators on array subclasses', () => {
    class StringArray extends Array<string> {}

    const values = new StringArray('a');
    Object.defineProperty(values, Symbol.iterator, {
      value: () => {
        throw new Error('custom iterator should not run');
      }
    });

    expect(() => isNonEmptyStringArray(values)).not.toThrow();
    expect(isNonEmptyStringArray(values)).toBe(true);
  });
});
