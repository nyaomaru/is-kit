import {
  hasKey,
  hasKeys,
  narrowKeyTo,
  refineDefinedKey,
  refineIndex,
  refineKey
} from '@/core/key';
import { struct } from '@/core/combinators';
import { isString, isNumber } from '@/core/primitive';
import { oneOfValues } from '@/core/combinators/one-of-values';
import { and } from '@/core/logic';

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

  it('returns a predicate that always false when called with no keys at runtime', () => {
    const unsafeHasKeys = hasKeys as unknown as (
      ...keys: PropertyKey[]
    ) => (input: unknown) => boolean;
    const guard = unsafeHasKeys();
    expect(guard({ kind: 'user', id: 1 })).toBe(false);
    expect(guard({})).toBe(false);
    expect(guard(null)).toBe(false);
  });
});

describe('key: refineKey', () => {
  const hasStringName = refineKey('name', isString);

  it('refines a required property', () => {
    expect(hasStringName({ name: 'Ada', id: 1 })).toBe(true);
    expect(hasStringName({ name: 42, id: 1 })).toBe(false);
  });

  it('reads the property once and invokes the refinement once', () => {
    let reads = 0;
    let calls = 0;
    const value = {
      get name(): unknown {
        reads += 1;
        return 'Ada';
      }
    };
    const refinement = refineKey('name', (candidate): candidate is string => {
      calls += 1;
      return isString(candidate);
    });

    expect(refinement(value)).toBe(true);
    expect(reads).toBe(1);
    expect(calls).toBe(1);
  });

  it('uses normal property access for inherited properties', () => {
    const value = Object.create({ name: 'inherited' }) as {
      readonly name: unknown;
    };

    expect(hasStringName(value)).toBe(true);
  });

  it('supports numeric and symbol keys', () => {
    const symbolKey = Symbol('name');

    expect(refineKey(0, isString)(['first'])).toBe(true);
    expect(refineKey(symbolKey, isString)({ [symbolKey]: 'Ada' })).toBe(true);
  });

  it('composes nested property refinements', () => {
    const hasStringChildName = refineKey('child', refineKey('name', isString));

    expect(hasStringChildName({ child: { name: 'Ada' } })).toBe(true);
    expect(hasStringChildName({ child: { name: 42 } })).toBe(false);
  });

  it('does not read a property when an outer guard fails', () => {
    type Candidate =
      | { readonly kind: 'skip'; readonly name: unknown }
      | { readonly kind: 'read'; readonly name: unknown };
    const isReadable = (
      value: Candidate
    ): value is Extract<Candidate, { readonly kind: 'read' }> =>
      value.kind === 'read';
    const hasReadableStringName = and(isReadable, hasStringName);
    let reads = 0;
    const value: Candidate = {
      kind: 'skip',
      get name(): unknown {
        reads += 1;
        return 'Ada';
      }
    };

    expect(hasReadableStringName(value)).toBe(false);
    expect(reads).toBe(0);
  });
});

describe('key: refineDefinedKey', () => {
  const hasDefinedStringName = refineDefinedKey('name', isString);

  it('refines a defined optional property', () => {
    expect(hasDefinedStringName({ name: 'Ada', id: 1 })).toBe(true);
    expect(hasDefinedStringName({ name: 42, id: 1 })).toBe(false);
  });

  it.each([
    ['a missing property', { id: 1 }],
    ['an explicitly undefined property', { name: undefined, id: 1 }]
  ])('rejects %s without invoking the refinement', (_label, value) => {
    let calls = 0;
    const refinement = refineDefinedKey(
      'name',
      (candidate: unknown): candidate is string => {
        calls += 1;
        return isString(candidate);
      }
    );

    expect(refinement(value)).toBe(false);
    expect(calls).toBe(0);
  });

  it('reads a defined property once and invokes the refinement once', () => {
    let reads = 0;
    let calls = 0;
    const value = {
      get name(): unknown {
        reads += 1;
        return 'Ada';
      }
    };
    const refinement = refineDefinedKey(
      'name',
      (candidate): candidate is string => {
        calls += 1;
        return isString(candidate);
      }
    );

    expect(refinement(value)).toBe(true);
    expect(reads).toBe(1);
    expect(calls).toBe(1);
  });
});

describe('key: refineIndex', () => {
  const hasStringAtZero = refineIndex(0, isString);

  it('refines an element in a readonly array', () => {
    const matching = ['first', 2] as const;
    const failing = [1, 'second'] as const;

    expect(hasStringAtZero(matching)).toBe(true);
    expect(hasStringAtZero(failing)).toBe(false);
  });

  it.each([
    ['an out-of-bounds index', []],
    ['a sparse hole', new Array<unknown>(1)],
    ['an explicitly undefined element', [undefined]]
  ])('rejects %s without invoking the refinement', (_label, value) => {
    let calls = 0;
    const refinement = refineIndex(
      0,
      (candidate: unknown): candidate is string => {
        calls += 1;
        return isString(candidate);
      }
    );

    expect(refinement(value)).toBe(false);
    expect(calls).toBe(0);
  });

  it('reads a defined element once and invokes the refinement once', () => {
    let reads = 0;
    let calls = 0;
    const value: unknown[] = [];
    Object.defineProperty(value, 0, {
      get() {
        reads += 1;
        return 'first';
      }
    });
    const refinement = refineIndex(
      0,
      (candidate: unknown): candidate is string => {
        calls += 1;
        return isString(candidate);
      }
    );

    expect(refinement(value)).toBe(true);
    expect(reads).toBe(1);
    expect(calls).toBe(1);
  });
});
