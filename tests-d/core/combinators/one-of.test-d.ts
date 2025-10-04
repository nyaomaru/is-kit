import { expectType } from 'tsd';
import { oneOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import type { Predicate } from '@/types';

// =============================================
// describe: oneOf
// =============================================
// it: unions outputs from multiple guards
const isStringOrNumber = oneOf(isString, isNumber);
expectType<Predicate<string | number>>(isStringOrNumber);

declare const unionCandidate: unknown;
if (isStringOrNumber(unionCandidate)) {
  expectType<string | number>(unionCandidate);
}
