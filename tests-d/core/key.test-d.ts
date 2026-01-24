import { expectType } from 'tsd';
import { narrowKeyTo, struct, isString, isNumber, oneOfValues } from 'is-kit';
import type { Predicate } from 'is-kit';

// =============================================
// describe: narrowKeyTo
// =============================================
type User = {
  id: string;
  age: number;
  role: 'admin' | 'guest' | 'trial';
};

const isUser = struct({
  id: isString,
  age: isNumber,
  role: oneOfValues('admin', 'guest', 'trial')
});

const byRole = narrowKeyTo(isUser, 'role');
const isGuest = byRole('guest');
const isTrial = byRole('trial');

expectType<Predicate<Readonly<User> & { role: 'guest' }>>(isGuest);
expectType<Predicate<Readonly<User> & { role: 'trial' }>>(isTrial);

declare let candidate: unknown;
if (isGuest(candidate)) {
  expectType<'guest'>(candidate.role);
}
