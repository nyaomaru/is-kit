import { arrayOf, typedStruct } from '@/core/combinators';
import { lazy } from '@/core/lazy';
import { isString } from '@/core/primitive';
import type { Predicate } from '@/types';

describe('core/lazy', () => {
  type Tree = {
    readonly value: string;
    readonly children: readonly Tree[];
  };

  it('validates recursive data structures', () => {
    const isTree: Predicate<Tree> = lazy(() =>
      typedStruct<Tree>()({
        value: isString,
        children: arrayOf(isTree)
      })
    );

    expect(
      isTree({
        value: 'root',
        children: [{ value: 'leaf', children: [] }]
      })
    ).toBe(true);
    expect(
      isTree({
        value: 'root',
        children: [{ value: 1, children: [] }]
      })
    ).toBe(false);
  });

  it('initializes and caches the predicate on first use', () => {
    const factory = jest.fn(() => isString);
    const isLazyString = lazy(factory);

    expect(factory).not.toHaveBeenCalled();
    expect(isLazyString('value')).toBe(true);
    expect(isLazyString(1)).toBe(false);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('propagates factory errors and retries initialization', () => {
    const error = new Error('initialization failed');
    const factory = jest
      .fn<() => Predicate<string>>()
      .mockImplementationOnce(() => {
        throw error;
      })
      .mockReturnValue(isString);
    const isLazyString = lazy(factory);

    expect(() => isLazyString('value')).toThrow(error);
    expect(isLazyString('value')).toBe(true);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
