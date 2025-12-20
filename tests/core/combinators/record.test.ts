import { recordOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';

describe('recordOf (key/value guards)', () => {
  const isABKey = (k: unknown): k is 'a' | 'b' =>
    typeof k === 'string' && (k === 'a' || k === 'b');

  const isNumericStringKey = (k: unknown): k is `${number}` =>
    typeof k === 'string' && /^\d+$/.test(k);

  it('accepts an empty plain object (vacuous truth)', () => {
    const guard = recordOf(isString, isNumber);
    expect(guard({})).toBe(true);
  });

  it('validates all keys as string and all values as number', () => {
    const guard = recordOf(isString, isNumber);
    expect(guard({ a: 1, b: 2 })).toBe(true);
  });

  it('rejects when some value fails the value predicate', () => {
    const guard = recordOf(isString, isNumber);
    expect(guard({ a: 1, b: '2' })).toBe(false);
  });

  it('Object.keys treats numeric literal keys as strings', () => {
    const guard = recordOf(isString, isNumber);

    expect(guard({ 1: 1, 2: 2 })).toBe(true);
  });

  it('can reject numeric-string keys with a stricter key guard', () => {
    const isAlphaKey = (k: unknown): k is string =>
      typeof k === 'string' && /^[A-Za-z]+$/.test(k);

    const guard = recordOf(isAlphaKey, isNumber);

    expect(guard({ a: 1, b: 2 })).toBe(true);
    expect(guard({ 1: 1, 2: 2 } as any)).toBe(false);
  });

  it('can restrict keys to a specific union of string literals', () => {
    const guard = recordOf(isABKey, isNumber);

    expect(guard({ a: 1, b: 2 })).toBe(true);
    expect(guard({ a: 1, c: 3 } as Record<string, number>)).toBe(false);
    expect(guard({ c: 3 } as Record<string, number>)).toBe(false);
  });

  it('can require numeric-string keys (e.g., "0", "1", ...)', () => {
    const guard = recordOf(isNumericStringKey, isNumber);

    expect(guard({ '0': 1, '1': 2 })).toBe(true);
    expect(guard({ '0': 1, x: 2 } as Record<string, number>)).toBe(false);
  });

  it('ignores symbol keys (Object.keys does not include symbols)', () => {
    const sym = Symbol('k');
    const obj: any = { a: 1 };
    obj[sym] = 'not-checked';

    const guard = recordOf(isString, isNumber);

    expect(guard(obj)).toBe(true);
  });

  it('ignores non-enumerable properties', () => {
    const obj = { a: 1 };
    Object.defineProperty(obj, 'hidden', {
      value: 'nope',
      enumerable: false,
    });

    const guard = recordOf(isString, isNumber);

    expect(guard(obj)).toBe(true);
  });

  it('does not consider inherited properties (plain objects only)', () => {
    const base = { a: 1 };
    const derived = Object.create(base);
    Object.assign(derived, { b: 2 });

    const guard = recordOf(isString, isNumber);
    expect(guard(derived)).toBe(false);
  });

  it('rejects arrays if recordOf targets plain objects only', () => {
    const guard = recordOf(isString, isNumber);

    expect(guard([1, 2, 3] as any)).toBe(false);
  });

  it('rejects Date/Map/Set if plain objects only', () => {
    const guard = recordOf(isString, isNumber);

    expect(guard(new Date() as any)).toBe(false);
    expect(guard(new Map() as any)).toBe(false);
    expect(guard(new Set() as any)).toBe(false);
  });

  it('accepts objects with null prototype (still plain)', () => {
    const obj = Object.create(null);
    (obj as any).a = 1;
    const guard = recordOf(isString, isNumber);

    expect(guard(obj)).toBe(true);
  });

  it('narrows to Readonly<Record<"a"|"b", number>> with a literal-key guard', () => {
    const isAB = (k: unknown): k is 'a' | 'b' =>
      typeof k === 'string' && (k === 'a' || k === 'b');

    const guard = recordOf(isAB, isNumber);

    const u: unknown = { a: 1, b: 2 };
    expect(guard(u)).toBe(true);
  });
});

