import { expectType } from 'tsd';
import { tupleOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import type { Predicate } from '@/types';

// =============================================
// describe: tupleOf
// =============================================
// it: narrows to readonly tuple and preserves element types
const stringNumberTupleGuard = tupleOf(isString, isNumber);
expectType<Predicate<readonly [string, number]>>(stringNumberTupleGuard);

declare const tupleCandidate: unknown;
if (stringNumberTupleGuard(tupleCandidate)) {
  expectType<readonly [string, number]>(tupleCandidate);
  const [stringElement, numberElement] = tupleCandidate;
  expectType<string>(stringElement);
  expectType<number>(numberElement);
}
