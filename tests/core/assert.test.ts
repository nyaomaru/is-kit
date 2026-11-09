import { assert } from '@/core/assert';
import type { Refine } from '@/types';
import { isString } from '@/core/primitive';

describe('assert', () => {
  type User = { id: string; active: boolean };
  type ActiveUser = User & { active: true };
  const isActive: Refine<User, ActiveUser> = (u): u is ActiveUser =>
    u.active === true;

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
    const user: User = { id: '1', active: true };

    expect(() => assert(isActive, user)).not.toThrow();
  });

  it('throws default message when refine fails', () => {
    const user: User = { id: '2', active: false };

    expect(() => assert(isActive, user)).toThrow('Assertion failed');
  });

  it('throws custom message when refine fails', () => {
    const user: User = { id: '3', active: false };

    expect(() => assert(isActive, user, 'user must be active')).toThrow(
      'user must be active'
    );
  });

  it('forwards the original value to the guard unchanged', () => {
    const input = { id: 'user-1' };
    const guard = jest.fn((_value: unknown): _value is typeof input => true);

    assert(guard, input);

    expect(guard).toHaveBeenCalledWith(input);
    expect(guard.mock.calls[0]?.[0]).toBe(input);
  });

  it('invokes the guard exactly once per assertion', () => {
    const guard = jest.fn((_value: unknown): _value is string => true);

    assert(guard, 'ok');

    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('propagates an error thrown by the guard unchanged', () => {
    const guardError = new Error('guard exploded');
    const guard = jest.fn((_value: unknown): _value is string => {
      throw guardError;
    });

    expect(() => assert(guard, 'ok')).toThrow(guardError);
  });
});
