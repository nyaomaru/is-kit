import { expectType } from 'tsd';
import { safeParse, safeParseWith } from '@/core/parse';
import type { ParseResult, Refine } from '@/types';
import { isString } from '@/core/primitive';

// =============================================
// describe: safeParse
// =============================================
// it: with Guard<T> returns ParseResult<T>
declare const unknownInput: unknown;
const stringParseResult = safeParse(isString, unknownInput);
expectType<ParseResult<string>>(stringParseResult);

// it: with Refine<A,B> returns ParseResult<B>
type User = { id: string; active: boolean };
type ActiveUser = User & { active: true };
const isActive: Refine<User, ActiveUser> = (
  candidate
): candidate is ActiveUser => candidate.active === true;
declare const user: User;
const activeUserParseResult = safeParse(isActive, user);
expectType<ParseResult<ActiveUser>>(activeUserParseResult);

// it: with plain predicate returns ParseResult<boolean>
const isBooleanPredicate = (candidate: unknown) =>
  typeof candidate === 'boolean';
const booleanParseResult = safeParse(isBooleanPredicate, unknownInput);
expectType<ParseResult<boolean>>(booleanParseResult);

// =============================================
// describe: safeParseWith
// =============================================
// it: with Guard<T> returns (unknown) => ParseResult<T>
const parseString = safeParseWith(isString);
expectType<(x: unknown) => ParseResult<string>>(parseString);
const parsedString = parseString(unknownInput);
expectType<ParseResult<string>>(parsedString);

// it: with Refine<A,B> returns (A) => ParseResult<B>
const parseActive = safeParseWith(isActive);
expectType<(x: User) => ParseResult<ActiveUser>>(parseActive);
const parsedActiveUser = parseActive(user);
expectType<ParseResult<ActiveUser>>(parsedActiveUser);

// it: with plain predicate returns (unknown) => ParseResult<boolean>
const parseBoolean = safeParseWith(isBooleanPredicate);
expectType<(x: unknown) => ParseResult<boolean>>(parseBoolean);
const parsedBoolean = parseBoolean(unknownInput);
expectType<ParseResult<boolean>>(parsedBoolean);
