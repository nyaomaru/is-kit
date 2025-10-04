import { expectType } from 'tsd';
import { equals, equalsBy, equalsKey } from '@/core/equals';
import { isString, isNumber } from '@/core/primitive';
import type { Predicate } from '@/types';

// =============================================
// describe: equals
// =============================================
// it: narrows to a literal value
const isLiteralX = equals('x');
expectType<Predicate<'x'>>(isLiteralX);

declare let equalityCandidate: unknown;
if (isLiteralX(equalityCandidate)) {
  expectType<'x'>(equalityCandidate);
}

// =============================================
// describe: equalsBy
// =============================================
// it: returns a guard of A based on projection
const lengthEqualsThree = equalsBy(isString, (s) => s.length)(3 as const);
expectType<Predicate<string>>(lengthEqualsThree);

if (lengthEqualsThree(equalityCandidate)) {
  expectType<string>(equalityCandidate);
}

// it: works with number projections
const isOddNumber = equalsBy(isNumber, (n) => n % 2)(1 as const);
expectType<Predicate<number>>(isOddNumber);

// =============================================
// describe: equalsKey
// =============================================
// it: refines property type to the given literal
const hasKindUser = equalsKey('kind', 'user');
expectType<
  <A extends Record<'kind', unknown>>(
    input: unknown
  ) => input is A & Record<'kind', 'user'>
>(hasKindUser);

declare let keyRecordCandidate: unknown;
if (hasKindUser(keyRecordCandidate)) {
  expectType<'user'>(keyRecordCandidate.kind);
}

// oneOfValues tests moved to tests-d/core/combinators/one-of-values.test-d.ts
