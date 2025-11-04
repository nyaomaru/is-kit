import { define, isString, struct } from 'is-kit';

export type ApiItem = { href: string; title: string; description: string };

export const API_ITEMS: ApiItem[] = [
  {
    href: '/api-reference/define',
    title: 'define',
    description: 'Wrap a predicate as a typed guard.',
  },
  {
    href: '/api-reference/equals',
    title: 'equals',
    description: 'Value equality helpers: equals, equalsBy, equalsKey.',
  },
  {
    href: '/api-reference/logic',
    title: 'logic',
    description: 'Logical combinators: and, andAll, or, not, guardIn.',
  },
  {
    href: '/api-reference/parse',
    title: 'parse',
    description: 'Safe parsing with tagged results.',
  },
  {
    href: '/api-reference/nullish',
    title: 'nullish',
    description: 'Nullability helpers: nullable, optional, required, nonNull.',
  },
  {
    href: '/api-reference/key',
    title: 'key',
    description: 'Key helpers for literal narrowing (narrowKeyTo).',
  },
  {
    href: '/api-reference/primitive',
    title: 'primitive',
    description: 'Primitive guards: string, number, boolean, etc.',
  },
  {
    href: '/api-reference/object',
    title: 'object',
    description: 'Object and built-in guards: array, date, map, set, …',
  },
  {
    href: '/api-reference/predicate',
    title: 'predicate',
    description: 'Convert boolean predicates to refinements.',
  },
  {
    href: '/api-reference/combinators/array-of',
    title: 'arrayOf',
    description: 'Guard arrays with an element guard.',
  },
  {
    href: '/api-reference/combinators/tuple-of',
    title: 'tupleOf',
    description: 'Guard fixed-length tuples by position.',
  },
  {
    href: '/api-reference/combinators/one-of',
    title: 'oneOf',
    description: 'Passes when any guard passes (union).',
  },
  {
    href: '/api-reference/combinators/record-of',
    title: 'recordOf',
    description: 'Guard records with key and value guards.',
  },
  {
    href: '/api-reference/combinators/struct',
    title: 'struct',
    description: 'Shape guard for objects; supports exact key checking.',
  },
  {
    href: '/api-reference/combinators/one-of-values',
    title: 'oneOfValues',
    description: 'Guard literal value sets with exact equality.',
  },
];

const isApiItemStruct = struct({
  href: isString,
  title: isString,
  description: isString,
});

const isApiItem = define<ApiItem>(isApiItemStruct);

export const FEATURED_API_HREFS: readonly string[] = [
  '/api-reference/define',
  '/api-reference/combinators/struct',
  '/api-reference/logic',
  '/api-reference/parse',
  '/api-reference/primitive',
  '/api-reference/predicate',
] as const;

export const FEATURED_API_ITEMS: ApiItem[] = FEATURED_API_HREFS.map((href) =>
  API_ITEMS.find((it) => it.href === href)
).filter(isApiItem);
