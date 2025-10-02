import { expectType } from 'tsd';
import {
  and,
  or,
  guardIn,
  not,
  isString,
  isNumber,
  define,
} from '../../src/core';
import type { Predicate, Refine } from '../../src/types';

// =============================================
// describe: and
// =============================================
// it: narrows to a literal
const isLiteralA = define<'a'>((candidate): candidate is 'a' => candidate === 'a');
const stringAndLiteralAGuard = and(isString, isLiteralA);
expectType<Predicate<'a'>>(stringAndLiteralAGuard);

declare let unknownCandidate: unknown;
// it: narrows unknown inside control-flow
if (stringAndLiteralAGuard(unknownCandidate)) {
  expectType<'a'>(unknownCandidate);
}

// Note: andAll covered in runtime tests (varargs inference is brittle)

// =============================================
// describe: or
// =============================================
// it: union of outputs
const stringOrNumberGuard = or(isString, isNumber);
expectType<Predicate<string | number>>(stringOrNumberGuard);

if (stringOrNumberGuard(unknownCandidate)) {
  expectType<string | number>(unknownCandidate);
}

// =============================================
// describe: guardIn
// =============================================
// it: adapt a specific guard to a wider input
const stringWithinUnion = guardIn<string | number>()(isString);
expectType<Refine<string | number, string>>(stringWithinUnion);

declare let stringOrNumberValue: string | number;
// it: narrows within the wider input domain
if (stringWithinUnion(stringOrNumberValue)) {
  expectType<string>(stringOrNumberValue);
}

// =============================================
// describe: not
// =============================================
// it: guard overload excludes the guarded part
const excludeStringFromUnion = not<string | number, string>(isString);
expectType<Refine<string | number, number>>(excludeStringFromUnion);

// it: refine overload excludes the refined part
const isOnlyLiteralA = (value: 'a' | 'b'): value is 'a' => value === 'a';
const excludeLiteralA = not<'a' | 'b', 'a'>(isOnlyLiteralA);
expectType<Refine<'a' | 'b', 'b'>>(excludeLiteralA);
