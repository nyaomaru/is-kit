import type { Metadata } from 'next';
import { GUIDE_PATHS, type GuidePath } from '@/constants/guides';
import { SITE_OPEN_GRAPH, SITE_SOCIAL_IMAGE } from '@/constants/site';

type GuideMetadataCopy = {
  title: string;
  description: string;
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
      'Safely filter null and undefined from TypeScript arrays while preserving type narrowing and valid falsy values.'
  },
  [GUIDE_PATHS.syncTypeGuards]: {
    title: 'Keep Type Guards in Sync with TypeScript Types | is-kit',
    description:
      'Keep hand-written runtime guards aligned with existing TypeScript object types using typedStruct and field-level checks.'
  }
} as const satisfies Record<GuidePath, GuideMetadataCopy>;

/**
 * Build search and social metadata for a practical guide route.
 * @param path Canonical guide path with registered metadata copy.
 * @returns Metadata with page-specific titles, descriptions, and canonical URLs.
 */
export function createGuideMetadata(path: GuidePath): Metadata {
  const { title, description } = GUIDE_METADATA[path];

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
      url: path
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_SOCIAL_IMAGE]
    }
  };
}
