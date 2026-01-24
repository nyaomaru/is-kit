import {
  isString,
  isNumberPrimitive,
  isNaN,
  isInfiniteNumber,
  isFiniteNumber,
  isNumber,
  isInteger,
  isSafeInteger,
  isPositive,
  isNegative,
  isZero,
  isBoolean,
  isBigInt,
  isSymbol,
  isUndefined,
  isNull,
  isPrimitive
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

  it('isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
    expect(isNaN(0)).toBe(false);
    expect(isNaN('NaN' as unknown)).toBe(false);
  });

  it('isInfiniteNumber', () => {
    expect(isInfiniteNumber(Infinity)).toBe(true);
    expect(isInfiniteNumber(-Infinity)).toBe(true);
    expect(isInfiniteNumber(0)).toBe(false);
    expect(isInfiniteNumber(NaN)).toBe(false);
    expect(isInfiniteNumber('Infinity' as unknown)).toBe(false);
  });

  it('isFiniteNumber only accepts finite numbers', () => {
    const isFiniteFromNumber = isFiniteNumber;
    expect(isFiniteFromNumber(10)).toBe(true);
    expect(isFiniteFromNumber(Infinity)).toBe(false);
    expect(isFiniteFromNumber(NaN)).toBe(false);
  });

  it('isInteger', () => {
    expect(isInteger(0)).toBe(true);
    expect(isInteger(1)).toBe(true);
    expect(isInteger(-1)).toBe(true);
    expect(isInteger(1000000)).toBe(true);

    expect(isInteger(0.5)).toBe(false);
    expect(isInteger(NaN)).toBe(false);
    expect(isInteger(Infinity)).toBe(false);
    expect(isInteger('1' as unknown)).toBe(false);
  });

  it('isSafeInteger', () => {
    expect(isSafeInteger(0)).toBe(true);
    expect(isSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isSafeInteger(-Number.MAX_SAFE_INTEGER)).toBe(true);

    expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isSafeInteger(2 ** 53)).toBe(false);
    expect(isSafeInteger(NaN)).toBe(false);
    expect(isSafeInteger(Infinity)).toBe(false);
  });

  it('isPositive', () => {
    expect(isPositive(0.0001)).toBe(true);
    expect(isPositive(1)).toBe(true);
    expect(isPositive(42)).toBe(true);

    expect(isPositive(0)).toBe(false);
    // -0 is considered 0, not positive
    expect(isPositive(-0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
    expect(isPositive(NaN)).toBe(false);
    expect(isPositive(Infinity)).toBe(false);
  });

  it('isNegative', () => {
    expect(isNegative(-0.0001)).toBe(true);
    expect(isNegative(-1)).toBe(true);

    expect(isNegative(0)).toBe(false);
    // -0 is not considered negative by `< 0`
    expect(isNegative(-0)).toBe(false);
    expect(isNegative(1)).toBe(false);
    expect(isNegative(NaN)).toBe(false);
    expect(isNegative(-Infinity)).toBe(false);
  });

  it('isZero', () => {
    expect(isZero(0)).toBe(true);
    // -0 is considered zero
    expect(isZero(-0)).toBe(true);
    expect(isZero(1)).toBe(false);
    expect(isZero(NaN)).toBe(false);
    expect(isZero('0' as unknown)).toBe(false);
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
    const values = [
      'a',
      1,
      NaN,
      Infinity,
      true,
      1n,
      Symbol('s'),
      undefined,
      null
    ];
    for (const v of values) {
      expect((isPrimitive as any)(v)).toBe(true);
    }

    // false cases (objects / functions)
    expect(isPrimitive({} as unknown)).toBe(false);
    expect(isPrimitive([] as unknown)).toBe(false);
    expect(isPrimitive(new Date() as unknown)).toBe(false);
    expect(isPrimitive(function () {} as unknown)).toBe(false);
    // wrapper objects should be false
    expect(isPrimitive(new Number(1) as unknown)).toBe(false);
    expect(isPrimitive(new String('a') as unknown)).toBe(false);
    expect(isPrimitive(new Boolean(true) as unknown)).toBe(false);
  });
});
