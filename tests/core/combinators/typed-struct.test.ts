import { optionalKey, typedStruct } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';

describe('typedStruct', () => {
  type User = {
    id: string;
    name: string;
    age?: number;
  };

  it('builds a guard through struct semantics', () => {
    const isUser = typedStruct<User>()({
      id: isString,
      name: isString,
      age: optionalKey(isNumber)
    });

    expect(isUser({ id: 'u1', name: 'Ada' })).toBe(true);
    expect(isUser({ id: 'u1', name: 'Ada', age: 36 })).toBe(true);
    expect(isUser({ id: 'u1', name: 'Ada', age: '36' })).toBe(false);
  });

  it('uses exact option from struct', () => {
    const isUser = typedStruct<User>()(
      {
        id: isString,
        name: isString,
        age: optionalKey(isNumber)
      },
      { exact: true }
    );

    expect(isUser({ id: 'u1', name: 'Ada', extra: true })).toBe(false);
  });

  it('preserves required-only exact semantics through the shared builder', () => {
    const guard = typedStruct<{ id: string; name: string }>()(
      { id: isString, name: isString },
      { exact: true }
    );
    const hiddenId = Object.defineProperty({ name: 'Ada' }, 'id', {
      value: 'u1'
    });

    expect(guard({ name: 'Ada', id: 'u1' })).toBe(true);
    expect(guard(hiddenId)).toBe(true);
    expect(guard(Object.assign(hiddenId, { extra: true }))).toBe(false);
  });
});
