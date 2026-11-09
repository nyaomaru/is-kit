import { mapOf, setOf } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';

describe('mapOf (runtime)', () => {
  const isStringNumberMap = mapOf(isString, isNumber);
  const isNumberStringMap = mapOf(isNumber, isString);

  it('accepts an empty map', () => {
    expect(isStringNumberMap(new Map())).toBe(true);
  });

  it('accepts when all keys and values satisfy their guards', () => {
    expect(
      isStringNumberMap(
        new Map<string, number>([
          ['a', 1],
          ['b', 2]
        ])
      )
    ).toBe(true);

    expect(
      isNumberStringMap(
        new Map<number, string>([
          [1, 'a'],
          [2, 'b']
        ])
      )
    ).toBe(true);
  });

  it('rejects when a key fails the key guard', () => {
    expect(
      isStringNumberMap(
        new Map<unknown, number>([
          [1, 1],
          ['b', 2]
        ])
      )
    ).toBe(false);
  });

  it('rejects when a value fails the value guard', () => {
    expect(
      isStringNumberMap(
        new Map<string, unknown>([
          ['a', 1],
          ['b', '2']
        ])
      )
    ).toBe(false);
  });

  it('skips the value guard and later entries when a key fails', () => {
    const keyGuard = jest.fn(isString);
    const valueGuard = jest.fn(isNumber);
    const isValidMap = mapOf(keyGuard, valueGuard);

    expect(
      isValidMap(
        new Map<unknown, unknown>([
          [42, 1],
          ['later', 2]
        ])
      )
    ).toBe(false);

    expect(keyGuard).toHaveBeenCalledTimes(1);
    expect(keyGuard).toHaveBeenCalledWith(42);
    expect(valueGuard).not.toHaveBeenCalled();
  });

  it('stops checking later entries when a value guard fails', () => {
    const calls: string[] = [];
    const keyGuard = jest.fn((value: unknown): value is string => {
      calls.push(`key:${String(value)}`);
      return isString(value);
    });
    const valueGuard = jest.fn((value: unknown): value is number => {
      calls.push(`value:${String(value)}`);
      return isNumber(value);
    });
    const isValidMap = mapOf(keyGuard, valueGuard);

    expect(
      isValidMap(
        new Map<unknown, unknown>([
          ['first', 1],
          ['second', 'invalid'],
          ['later', 3]
        ])
      )
    ).toBe(false);

    expect(keyGuard).toHaveBeenCalledTimes(2);
    expect(valueGuard).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([
      'key:first',
      'value:1',
      'key:second',
      'value:invalid'
    ]);
  });

  it('rejects non-map inputs', () => {
    expect(isStringNumberMap({ a: 1 } as unknown)).toBe(false);
    expect(isStringNumberMap({ [Symbol.toStringTag]: 'Map' } as unknown)).toBe(
      false
    );
    expect(isStringNumberMap(new Set([['a', 1]]) as unknown)).toBe(false);
    expect(isStringNumberMap(null as unknown)).toBe(false);
    expect(isStringNumberMap(undefined as unknown)).toBe(false);
  });

  it('supports nested combinators', () => {
    const isNested = mapOf(isString, setOf(isNumber));

    expect(
      isNested(
        new Map<string, Set<number>>([
          ['a', new Set([1, 2])],
          ['b', new Set([3])]
        ])
      )
    ).toBe(true);

    expect(
      isNested(
        new Map<string, Set<unknown>>([
          ['a', new Set([1, 2])],
          ['b', new Set([3, '4'])]
        ])
      )
    ).toBe(false);

    expect(isNested('nope' as unknown)).toBe(false);
  });

  it('uses the intrinsic iterator for branded maps', () => {
    const map = new Map<string, number>([['a', 1]]);
    Object.defineProperty(map, Symbol.iterator, {
      value: () => {
        throw new Error('custom iterator should not run');
      }
    });

    expect(() => isStringNumberMap(map)).not.toThrow();
    expect(isStringNumberMap(map)).toBe(true);
  });
});
