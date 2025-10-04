import { equals, equalsBy, equalsKey } from '@/core/equals';
import { isString } from '@/core/primitive';

describe('equals', () => {
  it('matches primitives using Object.is semantics', () => {
    const isOne = equals(1);
    const isA = equals('a');
    const isNaN = equals(NaN);

    expect(isOne(1)).toBe(true);
    expect(isOne(2)).toBe(false);
    expect(isA('a')).toBe(true);
    expect(isA('b')).toBe(false);
    expect(isNaN(NaN)).toBe(true);
    expect(isNaN('NaN' as unknown)).toBe(false);
  });

  it('distinguishes +0 and -0 like Object.is', () => {
    const isPosZero = equals(0);
    const isNegZero = equals(-0);

    expect(isPosZero(0)).toBe(true);
    expect(isPosZero(-0)).toBe(false);
    expect(isNegZero(-0)).toBe(true);
    expect(isNegZero(0)).toBe(false);
  });
});

describe('equalsBy', () => {
  it('compares by selected key when base guard passes', () => {
    const lengthIs3 = equalsBy(isString, (s) => s.length)(3 as const);

    expect(lengthIs3('foo')).toBe(true);
    expect(lengthIs3('toolong')).toBe(false);
    expect(lengthIs3(123 as unknown)).toBe(false);
  });
});

describe('equalsKey', () => {
  it('matches when own property strictly equals target', () => {
    const isUser = equalsKey('kind', 'user');

    expect(isUser({ kind: 'user' })).toBe(true);
    expect(isUser({ kind: 'admin' })).toBe(false);
    expect(isUser({})).toBe(false);

    const base = { kind: 'user' };
    const derived = Object.create(base);
    derived.x = 1;

    expect(isUser(derived)).toBe(false);

    const nil = Object.create(null) as Record<string, unknown>;
    nil.kind = 'user';

    expect(isUser(nil)).toBe(true);
  });
});

// oneOfValues tests moved to tests/core/combinators/one-of-values.test.ts
