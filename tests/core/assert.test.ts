import { assert } from '@/core/assert';
import type { Refine } from '@/types';
import { isString } from '@/core/primitive';

describe('assert', () => {
  it('does not throw when guard passes', () => {
    expect(() => assert(isString, 'ok')).not.toThrow();
  });

  it('throws default message when guard fails', () => {
    expect(() => assert(isString, 123 as unknown)).toThrow('Assertion failed');
  });

  it('throws custom message when provided', () => {
    expect(() => assert(isString, 123 as unknown, 'must be string')).toThrow(
      'must be string'
    );
  });

  it('accepts refine overload', () => {
    type User = { id: string; active: boolean };
    type ActiveUser = User & { active: true };
    const isActive: Refine<User, ActiveUser> = (u): u is ActiveUser =>
      u.active === true;

    const user: User = { id: '1', active: true };
    expect(() => assert(isActive, user)).not.toThrow();
  });
});
