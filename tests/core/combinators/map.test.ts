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
      isStringNumberMap(new Map<unknown, number>([[1, 1], ['b', 2]]))
    ).toBe(false);
  });

  it('rejects when a value fails the value guard', () => {
    expect(
      isStringNumberMap(new Map<string, unknown>([['a', 1], ['b', '2']]))
    ).toBe(false);
  });

  it('rejects non-map inputs', () => {
    expect(isStringNumberMap({ a: 1 } as unknown)).toBe(false);
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
});
