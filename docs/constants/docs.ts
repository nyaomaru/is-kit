export const INSTALL_TABS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type InstallTab = (typeof INSTALL_TABS)[number];
export const INSTALL_COMMANDS: Record<InstallTab, string> = {
  pnpm: 'pnpm add is-kit',
  npm: 'npm i is-kit',
  yarn: 'yarn add is-kit',
  bun: 'bun add is-kit',
};

export const USAGE_TABS = [
  'basic',
  'logic',
  'parse',
  'combinators',
  'nullability',
  'equality',
] as const;
export type UsageTab = (typeof USAGE_TABS)[number];
export const USAGE_SNIPPETS: Record<UsageTab, string> = {
  basic: `import { define } from 'is-kit';

const isString = define<string>((x) => typeof x === 'string');

if (isString('hello')) {
  // narrowed to string
}`,
  logic: `import { and, or, not, predicateToRefine, isString, isNumber } from 'is-kit';

const isShort = predicateToRefine<string>((s) => s.length <= 3);
const isShortString = and(isString, isShort);

['ok', 'toolong', 123].map(v => isShortString(v));
or(isString, isNumber)('x'); // true
not(isString)(42); // true`,
  parse: `import { safeParse, arrayOf, isNumber } from 'is-kit';

const numbers = arrayOf(isNumber);
const result = safeParse(numbers, JSON.parse('[1,2,3]'));
// => { valid: true, value: [1,2,3] }`,
  combinators: `import { arrayOf, tupleOf, recordOf, struct, isString, isNumber } from 'is-kit';

const stringArray = arrayOf(isString);
const pair = tupleOf(isString, isNumber);
const stringRecord = recordOf(isString, isString);
const user = struct({ id: isNumber, name: isString } as const);

stringArray(['a', 'b']); // true
pair(['id', 1]); // true
stringRecord({ a: 'x' }); // true
user({ id: 1, name: 'neo' }); // true`,
  nullability: `import { optional, required, nullable, nonNull, isString } from 'is-kit';

const maybeString = optional(isString); // x?: string
maybeString(undefined); // true
maybeString('ok'); // true

const mustString = required(isString); // excludes undefined
mustString(undefined); // false

const nullableString = nullable(isString); // string | null
nullableString(null); // true

const nonNullString = nonNull(isString); // excludes null
nonNullString(null); // false`,
  equality: `import { equals, equalsBy, equalsKey, isString } from 'is-kit';

equals(1, 1); // true
equals(NaN, NaN); // true (Object.is)

const lengthIs3 = equalsBy(isString, (s) => s.length)(3 as const);
lengthIs3('foo'); // true

const hasNameA = equalsKey('name', 'a' as const);
hasNameA({ id: 1, name: 'a' }); // true`,
};
