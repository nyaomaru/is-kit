import type { Metadata } from 'next';

export const SITE_URL = 'https://is-kit.dev';

export const SITE_TITLE = 'is-kit Docs — TypeScript Type Guard Toolkit';

export const SITE_DESCRIPTION =
  'Documentation for is-kit, a lightweight, zero-dependency toolkit for building composable TypeScript type guards.';

export const SITE_SOCIAL_IMAGE = '/iskit_ogp_1200_630.png';

export const SITE_OPEN_GRAPH = {
  type: 'website',
  siteName: 'is-kit Docs',
  images: [
    {
      url: SITE_SOCIAL_IMAGE,
      width: 1200,
      height: 630,
      type: 'image/png',
      alt: 'is-kit documentation'
    }
  ]
} satisfies NonNullable<Metadata['openGraph']>;
