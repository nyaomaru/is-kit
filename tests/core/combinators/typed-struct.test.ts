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
});
