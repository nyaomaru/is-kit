import { optionalKey, struct } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import { optional } from '@/core/nullish';

describe('struct', () => {
  const schema = { id: isString, age: isNumber } as const;

  it('accepts a matching plain object', () => {
    const guard = struct(schema);

    expect(guard({ id: 'abc', age: 20 })).toBe(true);
  });

  it('rejects when a required key is missing', () => {
    const guard = struct(schema);

    expect(guard({ id: 'abc' })).toBe(false);
  });

  it('rejects when a value type is wrong', () => {
    const guard = struct(schema);

    expect(guard({ id: 'abc', age: '20' })).toBe(false);
  });

  it('allows extra keys by default', () => {
    const guard = struct(schema);

    expect(guard({ id: 'abc', age: 20, extra: true })).toBe(true);
  });

  it('rejects extra keys when exact: true', () => {
    const guard = struct(schema, { exact: true });

    expect(guard({ id: 'abc', age: 20, extra: true })).toBe(false);
  });

  it('rejects non-plain objects (Array/Date/Map/Set) when using isPlainObject', () => {
    const guard = struct(schema);
    const mixed: Array<[string, string] | [string, number]> = [
      ['id', 'abc'],
      ['age', 20]
    ];
    const entries = mixed.map(([k, v]) => [k, v] as [string, string | number]);

    expect(guard(['abc', 20] as unknown)).toBe(false);
    expect(guard(new Date() as unknown)).toBe(false);

    expect(guard(new Map(entries) as unknown)).toBe(false);
    expect(guard(new Set(['abc', 20]) as unknown)).toBe(false);
  });

  it('rejects class instances', () => {
    class User {
      constructor(
        readonly id: string,
        readonly age: number
      ) {}
    }

    const guard = struct(schema);

    expect(guard(new User('abc', 20))).toBe(false);
  });

  it('accepts null-prototype objects as plain', () => {
    const guard = struct(schema);
    const o = Object.create(null) as Record<string, unknown>;
    o.id = 'abc';
    o.age = 20;

    expect(guard(o)).toBe(true);
  });

  it('does not use inherited properties to satisfy required keys', () => {
    const base = Object.create(null) as Record<string, unknown>;
    base.id = 'abc';
    const input = Object.create(base) as Record<string, unknown>;
    input.age = 20;

    const guard = struct(schema);

    expect(guard(input)).toBe(false);
  });

  it('ignores symbol keys in exact mode', () => {
    const extra = Symbol('extra');
    const input = { id: 'abc', age: 20, [extra]: true };
    const guard = struct(schema, { exact: true });

    expect(guard(input)).toBe(true);
  });

  it('ignores non-enumerable keys in exact mode', () => {
    const input = { id: 'abc', age: 20 };
    Object.defineProperty(input, 'extra', {
      value: true,
      enumerable: false
    });
    const guard = struct(schema, { exact: true });

    expect(guard(input)).toBe(true);
  });

  it('works with nested struct', () => {
    const address = struct({ city: isString, zip: isString } as const);
    const user = struct({ id: isString, age: isNumber, address } as const);

    expect(
      user({
        id: 'x',
        age: 10,
        address: { city: 'Tokyo', zip: '100-0001' }
      })
    ).toBe(true);

    expect(
      user({
        id: 'x',
        age: 10,
        address: { city: 'Tokyo', zip: 1000001 }
      })
    ).toBe(false);
  });

  it('allows optional keys to be absent', () => {
    const guard = struct({
      id: isString,
      nickname: optionalKey(isString)
    } as const);

    expect(guard({ id: 'abc' })).toBe(true);
  });

  it('validates optional keys when they are present', () => {
    const guard = struct({
      id: isString,
      nickname: optionalKey(isString)
    } as const);

    expect(guard({ id: 'abc', nickname: 'neo' })).toBe(true);
    expect(guard({ id: 'abc', nickname: 123 })).toBe(false);
  });

  it('treats optional keys as part of the exact schema', () => {
    const guard = struct(
      {
        id: isString,
        nickname: optionalKey(isString)
      } as const,
      { exact: true }
    );

    expect(guard({ id: 'abc' })).toBe(true);
    expect(guard({ id: 'abc', nickname: 'neo' })).toBe(true);
    expect(guard({ id: 'abc', extra: true })).toBe(false);
  });

  it('composes with value-level optional guards when undefined is allowed', () => {
    const guard = struct({
      id: isString,
      nickname: optionalKey(optional(isString))
    } as const);

    expect(guard({ id: 'abc' })).toBe(true);
    expect(guard({ id: 'abc', nickname: 'neo' })).toBe(true);
    expect(guard({ id: 'abc', nickname: undefined })).toBe(true);
    expect(guard({ id: 'abc', nickname: 123 })).toBe(false);
  });
});
