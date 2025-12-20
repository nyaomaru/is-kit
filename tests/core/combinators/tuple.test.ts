import { tupleOf } from '@/core/combinators';
import { isString, isNumber, isBoolean } from '@/core/primitive';

describe('tupleOf', () => {
  it('should validate a tuple with correct types', () => {
    const isStringNumberBooleanTuple = tupleOf(isString, isNumber, isBoolean);

    expect(isStringNumberBooleanTuple(['hello', 42, true])).toBe(true);
    expect(isStringNumberBooleanTuple(['world', 0, false])).toBe(true);
  });

  it('should reject a tuple with incorrect types', () => {
    const isStringNumberBooleanTuple = tupleOf(isString, isNumber, isBoolean);

    expect(isStringNumberBooleanTuple(['hello', 42, 'not boolean'])).toBe(
      false
    );
    expect(isStringNumberBooleanTuple([42, 'not number', true])).toBe(false);
    expect(isStringNumberBooleanTuple(['hello', 42])).toBe(false);
    expect(isStringNumberBooleanTuple(['hello', 42, true, 'extra'])).toBe(
      false
    );
  });

  it('should work with empty tuples', () => {
    const isEmptyTuple = tupleOf();

    expect(isEmptyTuple([])).toBe(true);
    expect(isEmptyTuple([1])).toBe(false);
  });
});

