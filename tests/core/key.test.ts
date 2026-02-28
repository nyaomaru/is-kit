import { hasKey, hasKeys, narrowKeyTo } from '@/core/key';
import { struct } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import { oneOfValues } from '@/core/combinators/one-of-values';

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial')
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

describe('key: hasKey', () => {
  const hasKind = hasKey('kind');

  it('accepts objects with the own key present', () => {
    const ok: unknown = { kind: 'user' };
    expect(hasKind(ok)).toBe(true);
  });

  it('rejects when the key is missing', () => {
    const bad: unknown = { id: 1 };
    expect(hasKind(bad)).toBe(false);
  });

  it('rejects inherited keys', () => {
    const proto = { kind: 'user' };
    const value = Object.create(proto) as unknown;
    expect(hasKind(value)).toBe(false);
  });

  it('accepts keys on null-prototype objects', () => {
    const value = Object.create(null) as Record<'kind', unknown>;
    value.kind = 'guest';
    expect(hasKind(value)).toBe(true);
  });
});

describe('key: hasKeys', () => {
  const hasKindAndId = hasKeys('kind', 'id');

  it('accepts objects with all own keys present', () => {
    const ok: unknown = { kind: 'user', id: 1 };
    expect(hasKindAndId(ok)).toBe(true);
  });

  it('rejects when at least one key is missing', () => {
    const bad: unknown = { kind: 'user' };
    expect(hasKindAndId(bad)).toBe(false);
  });

  it('rejects inherited keys', () => {
    const proto = { kind: 'user', id: 1 };
    const value = Object.create(proto) as unknown;
    expect(hasKindAndId(value)).toBe(false);
  });

  it('accepts all keys on null-prototype objects', () => {
    const value = Object.create(null) as Record<'kind' | 'id', unknown>;
    value.kind = 'guest';
    value.id = 1;
    expect(hasKindAndId(value)).toBe(true);
  });
});
