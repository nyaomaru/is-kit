import {
  isString,
  isNumberPrimitive,
  isFiniteNumber,
  isNumber,
  isBoolean,
  isBigInt,
  isSymbol,
  isUndefined,
  isNull,
  isPrimitive,
} from '../../src/core/primitive';

describe('primitive guards', () => {
  it('isString', () => {
    expect(isString('abc')).toBe(true);
    expect(isString(123 as unknown)).toBe(false);
  });

  it('isNumberPrimitive vs isNumber', () => {
    expect(isNumberPrimitive(42)).toBe(true);
    expect(isNumberPrimitive(NaN)).toBe(true);

    expect(isNumber(42)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber('42' as unknown)).toBe(false);
  });

  it('isFiniteNumber only accepts finite numbers', () => {
    const isFiniteFromNumber = isFiniteNumber;
    expect(isFiniteFromNumber(10)).toBe(true);
    expect(isFiniteFromNumber(Infinity)).toBe(false);
    expect(isFiniteFromNumber(NaN)).toBe(false);
  });

  it('isBoolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean('true' as unknown)).toBe(false);
  });

  it('isBigInt', () => {
    expect(isBigInt(1n)).toBe(true);
    expect(isBigInt(1 as unknown)).toBe(false);
  });

  it('isSymbol', () => {
    expect(isSymbol(Symbol('x'))).toBe(true);
    expect(isSymbol('sym' as unknown)).toBe(false);
  });

  it('isUndefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null as unknown)).toBe(false);
  });

  it('isNull', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined as unknown)).toBe(false);
  });

  it('isPrimitive', () => {
    // true cases
    // string
    // number (including NaN / Infinity)
    // boolean
    // bigint
    // symbol
    // undefined
    // null
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    const values = [
      'a',
      1,
      NaN,
      Infinity,
      true,
      1n,
      Symbol('s'),
      undefined,
      null,
    ];
    for (const v of values) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((isPrimitive as any)(v)).toBe(true);
    }

    // false cases (objects / functions)
    expect(isPrimitive({} as unknown)).toBe(false);
    expect(isPrimitive([] as unknown)).toBe(false);
    expect(isPrimitive(new Date() as unknown)).toBe(false);
    expect(isPrimitive(function () {} as unknown)).toBe(false);
    // wrapper objects should be false
    // eslint-disable-next-line no-new-wrappers
    expect(isPrimitive(new Number(1) as unknown)).toBe(false);
    // eslint-disable-next-line no-new-wrappers
    expect(isPrimitive(new String('a') as unknown)).toBe(false);
    // eslint-disable-next-line no-new-wrappers
    expect(isPrimitive(new Boolean(true) as unknown)).toBe(false);
  });
});
