import type { SidebarSection } from '@/components/navigation/sidebar';

export const apiSections: SidebarSection[] = [
  {
    title: 'Core',
    items: [
      { href: '/api-reference/define', label: 'define' },
      { href: '/api-reference/equals', label: 'equals' },
      { href: '/api-reference/logic', label: 'logic' },
      { href: '/api-reference/parse', label: 'parse' },
      { href: '/api-reference/nullish', label: 'nullish' },
      { href: '/api-reference/key', label: 'key' },
      { href: '/api-reference/primitive', label: 'primitive' },
      { href: '/api-reference/object', label: 'object' },
      { href: '/api-reference/predicate', label: 'predicate' }
    ]
  },
  {
    title: 'Combinators',
    items: [
      { href: '/api-reference/combinators/array-of', label: 'arrayOf' },
      { href: '/api-reference/combinators/tuple-of', label: 'tupleOf' },
      { href: '/api-reference/combinators/one-of', label: 'oneOf' },
      { href: '/api-reference/combinators/record-of', label: 'recordOf' },
      { href: '/api-reference/combinators/struct', label: 'struct' },
      {
        href: '/api-reference/combinators/one-of-values',
        label: 'oneOfValues'
      }
    ]
  }
];
