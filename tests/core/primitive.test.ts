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
});
