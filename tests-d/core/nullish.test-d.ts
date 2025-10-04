import { expectType } from 'tsd';
import {
  nullable,
  nonNull,
  nullish,
  optional,
  required,
} from '../../src/core/nullish';
import { isString } from '@/core/primitive';
import type { Predicate, Refine } from '@/types';

// =============================================
// describe: nullable
// =============================================
// it: guard overload widens to T | null
const nullableString = nullable(isString);
expectType<Predicate<string | null>>(nullableString);

// it: refine overload preserves refinement and adds null
const refineLiteralA: Refine<string, 'a'> = (value): value is 'a' => value === 'a';
const nullableLiteralA = nullable(refineLiteralA);
expectType<Refine<string | null, 'a' | null>>(nullableLiteralA);

// =============================================
// describe: nonNull
// =============================================
// it: guard overload excludes null
const nonNullString = nonNull(isString);
expectType<Predicate<string>>(nonNullString);

// it: refine overload excludes null from both sides
const nonNullLiteralA = nonNull(refineLiteralA);
expectType<Refine<string, 'a'>>(nonNullLiteralA);

// =============================================
// describe: nullish
// =============================================
// it: guard overload widens to T | null | undefined
const nullishString = nullish(isString);
expectType<Predicate<string | null | undefined>>(nullishString);

// it: refine overload preserves refinement and adds null | undefined
const nullishLiteralA = nullish(refineLiteralA);
expectType<Refine<string | null | undefined, 'a' | null | undefined>>(nullishLiteralA);

// =============================================
// describe: optional
// =============================================
// it: guard overload widens to T | undefined
const optionalString = optional(isString);
expectType<Predicate<string | undefined>>(optionalString);

// it: refine overload preserves refinement and adds undefined
const refineStringStartingWithA: Refine<string, `a${string}`> = (
  value: string
): value is `a${string}` => value.startsWith('a');
const optionalStringStartingWithA = optional(refineStringStartingWithA);
expectType<Refine<string | undefined, `a${string}` | undefined>>(
  optionalStringStartingWithA
);

// =============================================
// describe: required
// =============================================
// it: removes undefined from an optional guard
const requiredString = required(optionalString);
expectType<Predicate<string>>(requiredString);
