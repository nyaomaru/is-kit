import { predicateToRefine } from '@/core/predicate';

describe('core/predicate', () => {
  it('converts a boolean predicate into a refine', () => {
    const isPositive = (n: number) => n > 0;
    const refine = predicateToRefine<number>(isPositive);
    expect(refine(1)).toBe(true);
    expect(refine(0)).toBe(false);
  });
});

