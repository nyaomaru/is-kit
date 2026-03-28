import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import { arrayOf, setOf } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';
import { define } from '@/core';
import type { Predicate } from '@/types';

// =============================================
// describe: setOf
// =============================================
// it: narrows to ReadonlySet<string>
const isStringSet = setOf(isString);
expectType<Predicate<ReadonlySet<string>>>(isStringSet);

// it: narrows to ReadonlySet<number>
const isNumberSet = setOf(isNumber);
expectType<Predicate<ReadonlySet<number>>>(isNumberSet);

// it: keeps readonly view while values remain typed
declare const setCandidate: unknown;
if (isStringSet(setCandidate)) {
  expectType<ReadonlySet<string>>(setCandidate);

  for (const value of setCandidate) {
    expectType<string>(value);
  }
}

// it: mismatched expectation is not assignable
expectNotAssignable<(input: unknown) => input is ReadonlySet<number>>(
  isStringSet
);

// it: unions are preserved element-wise
const isLiteralAB = define<'a' | 'b'>(
  (value): value is 'a' | 'b' => value === 'a' || value === 'b'
);
const literalABSetGuard = setOf(isLiteralAB);
expectType<Predicate<ReadonlySet<'a' | 'b'>>>(literalABSetGuard);

// it: nested setOf keeps nested readonly arrays
const isNestedStringCollection = setOf(arrayOf(isString));
expectType<Predicate<ReadonlySet<readonly string[]>>>(
  isNestedStringCollection
);

// it: assignability to ReadonlySet<string>
const acceptReadonlyStrings = (_: ReadonlySet<string>) => {};
declare const unknownValue: unknown;
if (isStringSet(unknownValue)) {
  expectAssignable<ReadonlySet<string>>(unknownValue);
  acceptReadonlyStrings(unknownValue);
}
