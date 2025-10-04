import { expectType } from 'tsd';
import { oneOfValues } from '@/core/combinators';
import type { Predicate } from '@/types';

// =============================================
// describe: oneOfValues
// =============================================
// it: narrows to union of provided string values
const isLiteralAB = oneOfValues('a', 'b');
expectType<Predicate<'a' | 'b'>>(isLiteralAB);

declare let unionCandidate: unknown;
if (isLiteralAB(unionCandidate)) {
  expectType<'a' | 'b'>(unionCandidate);
}

// it: narrows to union of provided numeric values
const is012 = oneOfValues(0, 1, 2);
expectType<Predicate<0 | 1 | 2>>(is012);
