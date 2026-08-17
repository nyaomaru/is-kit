import type { SidebarSection } from '@/components/navigation/sidebar';

export const GUIDE_PATHS = {
  index: '/guides',
  filterNullish: '/guides/filter-null-and-undefined',
  syncTypeGuards: '/guides/keep-type-guards-in-sync',
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
    href: GUIDE_PATHS.validateUnknown,
    title: 'Validate unknown without a schema library',
    navigationLabel: 'Validate unknown',
    description:
      'Validate untrusted TypeScript values with small composable guards and a lightweight tagged result.'
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
