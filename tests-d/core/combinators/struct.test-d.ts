import { expectType } from 'tsd';
import { isString, isNumber } from '@/core/primitive';
import { struct } from '@/core/combinators';
import type { Predicate } from '@/types';

// =============================================
// describe: struct
// =============================================
// it: narrows to readonly object with specified fields
const userStructGuard = struct({ id: isString, age: isNumber } as const);
expectType<Predicate<Readonly<{ id: string; age: number }>>>(userStructGuard);

declare let structCandidate: unknown;
if (userStructGuard(structCandidate)) {
  expectType<Readonly<{ id: string; age: number }>>(structCandidate);
}
