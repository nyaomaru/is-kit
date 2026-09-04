import type { SidebarSection } from '@/components/navigation/sidebar';

export const GUIDE_PATHS = {
  index: '/guides',
  filterNullish: '/guides/filter-null-and-undefined',
  syncTypeGuards: '/guides/keep-type-guards-in-sync',
  heyApiTypedStruct: '/guides/validate-hey-api-generated-types',
  propertyRefinement: '/guides/refine-properties-on-existing-types',
  typescriptCompilerApi: '/guides/typescript-compiler-api',
  validateUnknown: '/guides/validate-unknown-without-schema-library'
} as const;

export type GuidePath = (typeof GUIDE_PATHS)[keyof typeof GUIDE_PATHS];

export type GuideItem = {
  href: Exclude<GuidePath, typeof GUIDE_PATHS.index>;
  title: string;
  navigationLabel: string;
  description: string;
};

export const GUIDE_ITEMS: GuideItem[] = [
  {
    href: GUIDE_PATHS.filterNullish,
    title: 'Filter null and undefined from arrays in TypeScript',
    navigationLabel: 'Filter nullish values',
    description:
      'Remove nullish array entries without losing TypeScript narrowing or valid falsy values.'
  },
  {
    href: GUIDE_PATHS.syncTypeGuards,
    title: 'Keep hand-written type guards in sync with TypeScript types',
    navigationLabel: 'Sync type guards',
    description:
      'Make missing, extra, and incompatible string-keyed guard fields visible when an existing object type changes.'
  },
  {
    href: GUIDE_PATHS.propertyRefinement,
    title: 'Refine properties on existing TypeScript types',
    navigationLabel: 'Refine existing properties',
    description:
      'Build reusable predicates that preserve required, optional, indexed, nested, and literal property refinements.'
  },
  {
    href: GUIDE_PATHS.typescriptCompilerApi,
    title: 'Advanced property refinement with the TypeScript Compiler API',
    navigationLabel: 'Compiler API (advanced)',
    description:
      'Apply reusable property refinement to broad AST nodes without treating the TypeScript 7 AST as a discriminated union.'
  },
  {
    href: GUIDE_PATHS.validateUnknown,
    title: 'Validate unknown without a schema library',
    navigationLabel: 'Validate unknown',
    description:
      'Validate untrusted TypeScript values with small composable guards and a lightweight tagged result.'
  },
  {
    href: GUIDE_PATHS.heyApiTypedStruct,
    title: 'Validate Hey API generated types with typedStruct',
    navigationLabel: 'Validate Hey API types',
    description:
      'Keep generated response types as the source of truth while validating selected runtime payloads with small hand-written guards.'
  }
];

export const guideSections: SidebarSection[] = [
  {
    title: 'Guides',
    items: GUIDE_ITEMS.map(({ href, navigationLabel }) => ({
      href,
      label: navigationLabel
    }))
  }
];
