import { expectType } from 'tsd';
import { assert } from '@/core/assert';
import { struct, oneOfValues } from '@/core/combinators';
import { isNumber, isString } from '@/core/primitive';
import type { Refine } from '@/types';

// =============================================
// describe: assert
// =============================================
// it: narrows unknown with Guard<T>
declare let unknownInput: unknown;
assert(isString, unknownInput);
expectType<string>(unknownInput);

// it: narrows A to B with Refine<A, B>
type User = { id: string; active: boolean };
type ActiveUser = User & { active: true };
const isActive: Refine<User, ActiveUser> = (
  candidate
): candidate is ActiveUser => candidate.active === true;
declare let user: User;
assert(isActive, user);
expectType<ActiveUser>(user);

// it: works well with object guards
const isCircle = struct({
  kind: oneOfValues('circle'),
  radius: isNumber
});
declare let shape: unknown;
assert(isCircle, shape);
expectType<Readonly<{ kind: 'circle'; radius: number }>>(shape);
