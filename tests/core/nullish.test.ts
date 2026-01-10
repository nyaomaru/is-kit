import {
  nullable,
  nonNull,
  nullish,
  optional,
  required,
} from '../../src/core/nullish';
import { isString } from '@/core/primitive';
import { predicateToRefine } from '@/core';

describe('nullable', () => {
  it('accepts null or values passing the inner guard', () => {
    const isNullableString = nullable(isString);
    expect(isNullableString(null)).toBe(true);
    expect(isNullableString('hello')).toBe(true);
    expect(isNullableString(undefined)).toBe(false);
    expect(isNullableString(123)).toBe(false);
  });

  it('works with refine predicates', () => {
    const startsWithA = predicateToRefine<string>(
      (s) => typeof s === 'string' && s.startsWith('a')
    );
    const isAOrNull = nullable(startsWithA);
    expect(isAOrNull(null)).toBe(true);
    expect(isAOrNull('abc')).toBe(true);
    expect(isAOrNull('xbc')).toBe(false);
    // Call through a widened signature to satisfy TS while checking runtime
    expect((isAOrNull as unknown as (x: unknown) => boolean)(undefined)).toBe(
      false
    );
  });
});

describe('nonNull', () => {
  it('rejects null and requires the inner guard to pass', () => {
    const isNonNullString = nonNull(isString);
    expect(isNonNullString(null)).toBe(false);
    expect(isNonNullString('hello')).toBe(true);
    expect(isNonNullString(undefined)).toBe(false);
    expect(isNonNullString(0)).toBe(false);
  });

  it('works with refine predicates', () => {
    const positive = predicateToRefine<number>((n) => n > 0);
    const isPositiveNonNull = nonNull(positive);
    expect(
      (isPositiveNonNull as unknown as (x: unknown) => boolean)(null)
    ).toBe(false);
    expect(isPositiveNonNull(1)).toBe(true);
    expect(isPositiveNonNull(0)).toBe(false);
  });
});

describe('nullish', () => {
  it('accepts null, undefined, or values passing the inner guard', () => {
    const isNullishString = nullish(isString);
    expect(isNullishString(null)).toBe(true);
    expect(isNullishString(undefined)).toBe(true);
    expect(isNullishString('hello')).toBe(true);
    expect(isNullishString(123)).toBe(false);
  });

  it('works with refine predicates', () => {
    const startsWithA = predicateToRefine<string>(
      (s) => typeof s === 'string' && s.startsWith('a')
    );
    const isAOrNullish = nullish(startsWithA);
    expect(isAOrNullish(null)).toBe(true);
    expect(isAOrNullish(undefined)).toBe(true);
    expect(isAOrNullish('abc')).toBe(true);
    expect(isAOrNullish('xbc')).toBe(false);
  });
});

describe('optional', () => {
  it('accepts undefined or values passing the inner guard (but not null)', () => {
    const isOptionalString = optional(isString);
    expect(isOptionalString(undefined)).toBe(true);
    expect(isOptionalString('hello')).toBe(true);
    expect(isOptionalString(null)).toBe(false);
    expect(isOptionalString(123)).toBe(false);
  });

  it('works with refine predicates', () => {
    const even = predicateToRefine<number>(
      (n) => typeof n === 'number' && n % 2 === 0
    );
    const isEvenOrUndefined = optional(even);
    expect(isEvenOrUndefined(undefined)).toBe(true);
    expect(isEvenOrUndefined(2)).toBe(true);
    expect(isEvenOrUndefined(3)).toBe(false);
    expect(
      (isEvenOrUndefined as unknown as (x: unknown) => boolean)(null)
    ).toBe(false);
  });
});

describe('required', () => {
  it('removes undefined from an optional guard', () => {
    const isOptionalString = optional(isString);
    const isRequiredString = required(isOptionalString);
    expect(isRequiredString('hello')).toBe(true);
    expect(isRequiredString(undefined)).toBe(false);
    expect(isRequiredString(null)).toBe(false);
    expect(isRequiredString(123)).toBe(false);
  });

  it('only removes undefined; null is still accepted if inner allows it', () => {
    const allowNullButNotUndefined = required(nullish(isString));
    expect(allowNullButNotUndefined(null)).toBe(true);
    expect(allowNullButNotUndefined('hello')).toBe(true);
    expect(allowNullButNotUndefined(undefined)).toBe(false);
    expect(allowNullButNotUndefined(0)).toBe(false);
  });
});
