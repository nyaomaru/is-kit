import { struct } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';

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

  it('rejects non-plain objects (Array/Date/Map) when using isPlainObject', () => {
    const guard = struct(schema);
    const mixed: Array<[string, string] | [string, number]> = [
      ['id', 'abc'],
      ['age', 20]
    ];
    const entries = mixed.map(([k, v]) => [k, v] as [string, string | number]);

    expect(guard(['abc', 20] as unknown)).toBe(false);
    expect(guard(new Date() as unknown)).toBe(false);

    expect(guard(new Map(entries) as unknown)).toBe(false);
  });

  it('accepts null-prototype objects as plain', () => {
    const guard = struct(schema);
    const o = Object.create(null) as Record<string, unknown>;
    o.id = 'abc';
    o.age = 20;

    expect(guard(o)).toBe(true);
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
});
