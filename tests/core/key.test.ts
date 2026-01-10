import { narrowKeyTo } from '@/core/key';
import { struct } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import { oneOfValues } from '@/core/combinators/one-of-values';

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial'),
});

describe('key: narrowKeyTo', () => {
  const byRole = narrowKeyTo(isUser, 'role');
  const isGuest = byRole('guest');
  const isTrial = byRole('trial');

  it('narrows to role=guest when base guard passes', () => {
    const ok: unknown = { id: '1', age: 20, role: 'guest' };
    expect(isGuest(ok)).toBe(true);
  });

  it('rejects when base guard fails', () => {
    const bad: unknown = { id: 1, age: '20', role: 'guest' };
    expect(isGuest(bad)).toBe(false);
  });

  it('rejects when key value differs', () => {
    const admin: unknown = { id: '2', age: 33, role: 'admin' };
    expect(isGuest(admin)).toBe(false);
    expect(isTrial(admin)).toBe(false);
  });
});
