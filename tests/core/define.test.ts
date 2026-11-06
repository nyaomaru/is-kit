
import { define } from '@/core/define';

describe('core/define', () => {
  it('wraps a boolean predicate into a guard', () => {
    const isEven = define<number>(
      (x) => typeof x === 'number' && x % 2 === 0
    );

    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven('2' as unknown)).toBe(false);
  });

  it('coerces truthy predicate results to true', () => {
    const isValid = define<unknown>(() => 'yes' as unknown as boolean);

    expect(isValid('anything')).toBe(true);
  });

  it('coerces falsy predicate results to false', () => {
    const isValid = define<unknown>(() => 0 as unknown as boolean);

    expect(isValid('anything')).toBe(false);
  });

  it('passes the original value to the predicate', () => {
    const predicate = jest.fn(() => true);
    const isValid = define<unknown>(predicate);
    const input = { name: 'Prasoon' };

    isValid(input);

    expect(predicate).toHaveBeenCalledWith(input);
  });

  it('executes the predicate only once', () => {
    const predicate = jest.fn(() => true);
    const isValid = define<unknown>(predicate);

    isValid('test');

    expect(predicate).toHaveBeenCalledTimes(1);
  });
});
