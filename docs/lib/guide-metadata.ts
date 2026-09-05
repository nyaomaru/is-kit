import type { Metadata } from 'next';
import { GUIDE_PATHS, type GuidePath } from '@/constants/guides';
import { SITE_OPEN_GRAPH, SITE_SOCIAL_IMAGE } from '@/constants/site';

type GuideMetadataCopy = {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

const GUIDE_METADATA = {
  [GUIDE_PATHS.index]: {
    title: 'Practical TypeScript Type Guard Guides | is-kit',
    description:
      'Practical guides for filtering, narrowing, and validating TypeScript values with small reusable type guards.'
  },
  [GUIDE_PATHS.filterNullish]: {
    title: 'Filter null and undefined from Arrays in TypeScript | is-kit',
    description:
      'Safely filter null and undefined from TypeScript arrays while preserving type narrowing and valid falsy values.',
    image: '/iskit_guide1.png',
    imageAlt: 'Filter null and undefined from arrays in TypeScript'
  },
  [GUIDE_PATHS.syncTypeGuards]: {
    title: 'Keep Type Guards in Sync with TypeScript Types | is-kit',
    description:
      'Keep hand-written runtime guards aligned with existing string-keyed TypeScript object types using typedStruct and field-level checks.',
    image: '/iskit_guide2.png',
    imageAlt: 'Keep hand-written type guards in sync with TypeScript types'
  },
  [GUIDE_PATHS.heyApiTypedStruct]: {
    title: 'Validate Hey API Generated Types with typedStruct | is-kit',
    description:
      'Validate selected Hey API generated response types at runtime with typedStruct while keeping generated TypeScript types as the source of truth.'
  },
  [GUIDE_PATHS.propertyRefinement]: {
    title: 'Refine Properties on Existing TypeScript Types | is-kit',
    description:
      'Build reusable predicates that preserve required, optional, indexed, nested, and literal property refinements on existing TypeScript types.'
  },
  [GUIDE_PATHS.typescriptCompilerApi]: {
    title:
      'Advanced Property Refinement with the TypeScript Compiler API | is-kit',
    description:
      'Use TypeScript Compiler API guards as an advanced example of reusable property refinement across broad AST node types.',
    image: '/iskit_guide3.png',
    imageAlt: 'Using is-kit with the TypeScript Compiler API'
  },
  [GUIDE_PATHS.validateUnknown]: {
    title: 'Validate unknown in TypeScript Without a Schema Library | is-kit',
    description:
      'Validate unknown TypeScript values with small composable type guards and safeParse, without adopting a schema-first validation workflow.',
    image: '/iskit_guide4.png',
    imageAlt: 'Validate unknown in TypeScript without a schema library'
  }
} as const satisfies Record<GuidePath, GuideMetadataCopy>;

/**
 * Build search and social metadata for a practical guide route.
 * @param path Canonical guide path with registered metadata copy.
 * @returns Metadata with page-specific titles, descriptions, and canonical URLs.
 */
export function createGuideMetadata(path: GuidePath): Metadata {
  const { title, description, image, imageAlt }: GuideMetadataCopy =
    GUIDE_METADATA[path];

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      title,
      description,
      url: path,
      ...(image && {
        images: [
          {
            url: image,
            width: 1000,
            height: 420,
            type: 'image/png',
            alt: imageAlt ?? title
          }
        ]
      })
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image ?? SITE_SOCIAL_IMAGE]
    }
  };
}
