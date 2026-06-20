import { safeJsonParse, safeParse, safeParseWith } from '@/core/parse';
import type { Refine } from '@/types';
import { isString } from '@/core/primitive';
import { typedStruct } from '@/core/combinators/typed-struct';

describe('safeParse (with Guard)', () => {
  it('returns valid=true and value when guard passes', () => {
    const r = safeParse(isString, 'hello');
    expect(r).toEqual({ valid: true, value: 'hello' });
  });

  it('returns valid=false when guard fails', () => {
    const r = safeParse(isString, 123 as unknown);
    expect(r).toEqual({ valid: false });
  });
});

describe('safeParse (with Refine)', () => {
  type User = { id: string; active: boolean };
  type ActiveUser = User & { active: true };

  const isActive: Refine<User, ActiveUser> = (u): u is ActiveUser =>
    u.active === true;

  it('returns valid=true and value when refine passes', () => {
    const user: User = { id: '1', active: true };
    const r = safeParse(isActive, user);
    expect(r).toEqual({ valid: true, value: user });
  });

  it('returns valid=false when refine fails', () => {
    const user: User = { id: '1', active: false };
    const r = safeParse(isActive, user);
    expect(r).toEqual({ valid: false });
  });
});

describe('safeParse (with plain predicate overload)', () => {
  it('accepts a boolean predicate and parses', () => {
    const isBool = (x: unknown) => typeof x === 'boolean';
    const r1 = safeParse(isBool, true);
    const r2 = safeParse(isBool, 'nope');
    expect(r1).toEqual({ valid: true, value: true });
    expect(r2).toEqual({ valid: false });
  });
});

describe('safeParseWith', () => {
  it('wraps a Guard and returns a parser', () => {
    const parseString = safeParseWith(isString);
    expect(parseString('x')).toEqual({ valid: true, value: 'x' });
    expect(parseString(1)).toEqual({ valid: false });
  });

  it('wraps a Refine and returns a typed parser', () => {
    type User = { id: string; active: boolean };
    type ActiveUser = User & { active: true };
    const refineActive: Refine<User, ActiveUser> = (u): u is ActiveUser =>
      u.active === true;

    const parseActive = safeParseWith(refineActive);
    const u1: User = { id: '1', active: true };
    const u2: User = { id: '2', active: false };

    expect(parseActive(u1)).toEqual({ valid: true, value: u1 });
    expect(parseActive(u2)).toEqual({ valid: false });
  });
});

describe('safeJsonParse', () => {
  type User = { id: string; name: string };
  const isUser = typedStruct<User>()({
    id: isString,
    name: isString
  });

  it('returns the decoded value when the guard passes', () => {
    const result = safeJsonParse('{"id":"1","name":"Ada"}', isUser);

    expect(result).toEqual({
      valid: true,
      value: { id: '1', name: 'Ada' }
    });
  });

  it('returns valid=false for invalid JSON syntax', () => {
    expect(safeJsonParse('{"id":', isUser)).toEqual({ valid: false });
  });

  it('returns valid=false when the decoded value fails the guard', () => {
    expect(safeJsonParse('{"id":1,"name":"Ada"}', isUser)).toEqual({
      valid: false
    });
  });

  it('does not coerce decoded values', () => {
    expect(safeJsonParse('1', isString)).toEqual({ valid: false });
  });

  it('does not catch errors thrown by the guard', () => {
    const throwingGuard = (_value: unknown): _value is string => {
      throw new Error('guard failed');
    };

    expect(() => safeJsonParse('"value"', throwingGuard)).toThrow(
      'guard failed'
    );
  });
});
