import { expectType } from 'tsd';
import { recordOf } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';
import { define } from '@/core';
import type { Predicate } from '@/types';

// =============================================
// describe: recordOf
// =============================================
// it: string keys with number values
const stringKeyNumberRecordGuard = recordOf(isString, isNumber);
expectType<Predicate<Readonly<Record<string, number>>>>(
  stringKeyNumberRecordGuard
);
declare const stringKeyNumberCandidate: unknown;

if (stringKeyNumberRecordGuard(stringKeyNumberCandidate)) {
  expectType<Readonly<Record<string, number>>>(stringKeyNumberCandidate);

  const stringKeys = Object.keys(stringKeyNumberCandidate);
  expectType<string[]>(stringKeys);
}

// it: literal keys 'a' | 'b'
const isLiteralABKey = define<'a' | 'b'>(
  (key): key is 'a' | 'b' =>
    typeof key === 'string' && (key === 'a' || key === 'b')
);

const literalKeyNumberRecordGuard = recordOf(isLiteralABKey, isNumber);
expectType<Predicate<Readonly<Record<'a' | 'b', number>>>>(
  literalKeyNumberRecordGuard
);
declare const literalKeyRecordCandidate: unknown;

if (literalKeyNumberRecordGuard(literalKeyRecordCandidate)) {
  expectType<Readonly<Record<'a' | 'b', number>>>(literalKeyRecordCandidate);

  const literalKeys = Object.keys(literalKeyRecordCandidate) as Array<
    'a' | 'b'
  >;
  expectType<Array<'a' | 'b'>>(literalKeys);
}

// it: template-literal keys `${number}`
const isNumericKey = define<`${number}`>(
  (key): key is `${number}` => typeof key === 'string' && /^\d+$/.test(key)
);

const numericKeyNumberRecordGuard = recordOf(isNumericKey, isNumber);
expectType<Predicate<Readonly<Record<`${number}`, number>>>>(
  numericKeyNumberRecordGuard
);
declare const numericKeyRecordCandidate: unknown;

if (numericKeyNumberRecordGuard(numericKeyRecordCandidate)) {
  expectType<Readonly<Record<`${number}`, number>>>(numericKeyRecordCandidate);
  const numericKeys = Object.keys(
    numericKeyRecordCandidate
  ) as Array<`${number}`>;
  expectType<Array<`${number}`>>(numericKeys);
}
