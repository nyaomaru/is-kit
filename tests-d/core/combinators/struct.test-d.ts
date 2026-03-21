import { expectType } from 'tsd';
import { isString, isNumber } from '@/core/primitive';
import { optionalKey, struct } from '@/core/combinators';
import { optional } from '@/core/nullish';
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

// it: marks optionalKey fields as optional properties
const userWithOptionalNickname = struct({
  id: isString,
  nickname: optionalKey(isString)
} as const);
expectType<Predicate<Readonly<{ id: string; nickname?: string }>>>(
  userWithOptionalNickname
);

declare let optionalCandidate: unknown;
if (userWithOptionalNickname(optionalCandidate)) {
  expectType<Readonly<{ id: string; nickname?: string }>>(optionalCandidate);
  expectType<string | undefined>(optionalCandidate.nickname);
}

// it: composes key-level and value-level optional semantics
const userWithOptionalUndefinedNickname = struct({
  id: isString,
  nickname: optionalKey(optional(isString))
} as const);
expectType<Predicate<Readonly<{ id: string; nickname?: string | undefined }>>>(
  userWithOptionalUndefinedNickname
);

declare let optionalUndefinedCandidate: unknown;
if (userWithOptionalUndefinedNickname(optionalUndefinedCandidate)) {
  expectType<Readonly<{ id: string; nickname?: string | undefined }>>(
    optionalUndefinedCandidate
  );
  expectType<string | undefined>(optionalUndefinedCandidate.nickname);
}
