import { define } from '@/core/define';

describe('core/define', () => {
  it('wraps a boolean predicate into a guard', () => {
    const isEven = define<number>((x) => typeof x === 'number' && x % 2 === 0);
    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven('2' as unknown)).toBe(false);
  });
});

