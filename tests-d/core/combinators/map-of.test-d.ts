import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import { mapOf, setOf } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';
import { define } from '@/core';
import type { Predicate } from '@/types';

// =============================================
// describe: mapOf
// =============================================
// it: narrows to ReadonlyMap<string, number>
const isStringNumberMap = mapOf(isString, isNumber);
expectType<Predicate<ReadonlyMap<string, number>>>(isStringNumberMap);

// it: supports non-string keys
const isNumberStringMap = mapOf(isNumber, isString);
expectType<Predicate<ReadonlyMap<number, string>>>(isNumberStringMap);

// it: keeps readonly view while keys and values remain typed
declare const mapCandidate: unknown;
if (isStringNumberMap(mapCandidate)) {
  expectType<ReadonlyMap<string, number>>(mapCandidate);

  for (const [key, value] of mapCandidate) {
    expectType<string>(key);
    expectType<number>(value);
  }
}

// it: mismatched expectation is not assignable
expectNotAssignable<(input: unknown) => input is ReadonlyMap<string, string>>(
  isStringNumberMap
);

// it: literal unions are preserved for keys and values
const isLiteralAB = define<'a' | 'b'>(
  (value): value is 'a' | 'b' => value === 'a' || value === 'b'
);
const isLiteral12 = define<1 | 2>(
  (value): value is 1 | 2 => value === 1 || value === 2
);
const literalMapGuard = mapOf(isLiteralAB, isLiteral12);
expectType<Predicate<ReadonlyMap<'a' | 'b', 1 | 2>>>(
  literalMapGuard
);

// it: nested mapOf keeps nested readonly sets
const isNestedMap = mapOf(isString, setOf(isNumber));
expectType<Predicate<ReadonlyMap<string, ReadonlySet<number>>>>(isNestedMap);

// it: assignability to ReadonlyMap<string, number>
const acceptReadonlyMap = (_: ReadonlyMap<string, number>) => {};
declare const unknownValue: unknown;
if (isStringNumberMap(unknownValue)) {
  expectAssignable<ReadonlyMap<string, number>>(unknownValue);
  acceptReadonlyMap(unknownValue);
}
