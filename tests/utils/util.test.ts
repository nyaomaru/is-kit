import { toBooleanPredicates } from '@/utils';
import { isString, isNumber } from '@/core/primitive';

describe('utils/toBooleanPredicates', () => {
  it('converts type guards to plain boolean predicates', () => {
    const bools = toBooleanPredicates([isString, isNumber]);

    expect(bools.every((fn) => typeof fn === 'function')).toBe(true);

    expect(bools.some((fn) => fn('a'))).toBe(true); // string matches
    expect(bools.some((fn) => fn(123))).toBe(true); // number matches
    expect(bools.some((fn) => fn(null))).toBe(false);
  });
});
