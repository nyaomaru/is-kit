const version = Deno.env.get('IS_KIT_VERSION')?.replace(/^v/, '');

if (!version) {
  throw new Error('IS_KIT_VERSION must identify the published JSR package');
}

const { isNumber, isString, or, struct } = await import(
  `jsr:@nyaomaru/is-kit@${version}`
);

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
