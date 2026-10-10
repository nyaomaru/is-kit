import { isNumber, isString, or, struct } from 'jsr:@nyaomaru/is-kit';

const isId = or(isString, isNumber);

if (!isId('user-1')) {
  throw new Error('string ID should be valid');
}

if (!isId(1)) {
  throw new Error('number ID should be valid');
}

const isUser = struct({
  id: isNumber,
  name: isString
});

if (!isUser({ id: 1, name: 'Nyaomaru' })) {
  throw new Error('user should be valid');
}
