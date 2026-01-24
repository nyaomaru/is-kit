import { expectType } from 'tsd';
import { define } from '../../src/core/define';
import type { Predicate } from '../../src/types';

// =============================================
// describe: define (types)
// =============================================
// it: returns a Predicate<T> regardless of input predicate flavor
expectType<Predicate<string>>(define<string>(() => true));
expectType<Predicate<number>>(
  define<number>((x): x is number => typeof x === 'number')
);
