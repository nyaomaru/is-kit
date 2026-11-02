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

  it.each([null, undefined, {}, { 0: 'hello', length: 1 }, 'hello', 42, true])(
    'rejects non-array input %p',
    (input) => {
      expect(tupleOf(isString)(input)).toBe(false);
    }
  );

  it('rejects a sparse tuple when its hole fails the element guard', () => {
    const input = new Array<unknown>(2);
    input[1] = 42;

    expect(tupleOf(isString, isNumber)(input)).toBe(false);
  });

  it('passes a sparse tuple hole to its guard as undefined', () => {
    const input = new Array<unknown>(2);
    input[1] = 42;
    const isUndefined = jest.fn(
      (value: unknown): value is undefined => value === undefined
    );
    const numberGuard = jest.fn(isNumber);

    expect(tupleOf(isUndefined, numberGuard)(input)).toBe(true);
    expect(isUndefined).toHaveBeenCalledTimes(1);
    expect(isUndefined).toHaveBeenCalledWith(undefined);
    expect(numberGuard).toHaveBeenCalledWith(42);
  });

  it.each([
    { input: [] },
    { input: ['hello'] },
    { input: ['hello', 42, true] }
  ])(
    'does not invoke element guards for length mismatch $input',
    ({ input }) => {
      const stringGuard = jest.fn(isString);
      const numberGuard = jest.fn(isNumber);

      expect(tupleOf(stringGuard, numberGuard)(input)).toBe(false);
      expect(stringGuard).not.toHaveBeenCalled();
      expect(numberGuard).not.toHaveBeenCalled();
    }
  );

  it('evaluates element guards in index order', () => {
    const calls: unknown[] = [];
    const stringGuard = (value: unknown): value is string => {
      calls.push(value);
      return isString(value);
    };
    const numberGuard = (value: unknown): value is number => {
      calls.push(value);
      return isNumber(value);
    };
    const booleanGuard = (value: unknown): value is boolean => {
      calls.push(value);
      return isBoolean(value);
    };

    expect(
      tupleOf(stringGuard, numberGuard, booleanGuard)(['hello', 42, true])
    ).toBe(true);
    expect(calls).toEqual(['hello', 42, true]);
  });

  it('stops evaluating guards after the first failure', () => {
    const stringGuard = jest.fn(isString);
    const numberGuard = jest.fn(isNumber);
    const booleanGuard = jest.fn(isBoolean);

    expect(
      tupleOf(
        stringGuard,
        numberGuard,
        booleanGuard
      )(['hello', 'not a number', true])
    ).toBe(false);
    expect(stringGuard).toHaveBeenCalledWith('hello');
    expect(numberGuard).toHaveBeenCalledWith('not a number');
    expect(booleanGuard).not.toHaveBeenCalled();
  });
});
