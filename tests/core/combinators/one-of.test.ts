import { oneOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';

describe('oneOf', () => {
  it('should validate a value that matches one of the predicates', () => {
    const isStringOrNumber = oneOf(isString, isNumber);

    expect(isStringOrNumber('hello')).toBe(true);
    expect(isStringOrNumber(42)).toBe(true);
  });

  it('should reject a value that does not match any of the predicates', () => {
    const isStringOrNumber = oneOf(isString, isNumber);

    expect(isStringOrNumber(true)).toBe(false);
    expect(isStringOrNumber(null)).toBe(false);
  });
});
