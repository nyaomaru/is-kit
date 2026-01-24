import { expectType, expectAssignable, expectNotAssignable } from 'tsd';
import { arrayOf } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import { define } from '@/core';
import type { Predicate } from '@/types';

// =============================================
// describe: arrayOf
// =============================================
// it: narrows to readonly string[]
const isStringArray = arrayOf(isString);
expectType<Predicate<readonly string[]>>(isStringArray);

// it: narrows to readonly number[]
const isNumberArray = arrayOf(isNumber);
expectType<Predicate<readonly number[]>>(isNumberArray);

// it: keeps readonly, mutable copy remains string[]
declare const collectionCandidate: unknown;
if (isStringArray(collectionCandidate)) {
  expectType<readonly string[]>(collectionCandidate);

  const mutable = Array.from(collectionCandidate);
  expectType<string[]>(mutable);

  const first = collectionCandidate[0];
  if (first !== undefined) {
    expectType<string>(first);
  }
}

// it: mismatched expectation is not assignable
expectNotAssignable<(input: unknown) => input is readonly number[]>(
  isStringArray
);

// it: unions are preserved element-wise
const isLiteralAB = define<'a' | 'b'>(
  (value): value is 'a' | 'b' => value === 'a' || value === 'b'
);
const literalABArrayGuard = arrayOf(isLiteralAB);
expectType<Predicate<readonly ('a' | 'b')[]>>(literalABArrayGuard);

// it: nested arrayOf yields 2D arrays
const is2DStringArray = arrayOf(arrayOf(isString));
expectType<Predicate<readonly (readonly string[])[]>>(is2DStringArray);

// it: assignability to ReadonlyArray<string>
type ReadonlyStrings = readonly string[];
const acceptReadonlyStrings = (_: ReadonlyStrings) => {};
declare const unknownValue: unknown;
if (isStringArray(unknownValue)) {
  expectAssignable<ReadonlyArray<string>>(unknownValue);
  acceptReadonlyStrings(unknownValue);
}
