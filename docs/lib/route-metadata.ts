import type { Metadata } from 'next';
import { SITE_OPEN_GRAPH, SITE_SOCIAL_IMAGE } from '@/constants/site';

type RouteMetadataInput = {
  path: string;
  title: string;
  description: string;
  /** Optional social image. Omitted routes keep the site-wide Open Graph image. */
  image?: string;
  imageAlt?: string;
};

/**
 * Builds canonical, Open Graph, and Twitter metadata for a docs route.
 * @param path Canonical path for the page.
 * @param title Document title.
 * @param description Search and social description.
 * @param image Optional route-specific social image.
 * @param imageAlt Alt text used when `image` is set.
 * @returns Next.js metadata for the route.
 */
export function createRouteMetadata({
  path,
  title,
  description,
  image,
  imageAlt
}: RouteMetadataInput): Metadata {
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
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1000,
                height: 420,
                type: 'image/gif',
                alt: imageAlt ?? title
              }
            ]
          }
        : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image ?? SITE_SOCIAL_IMAGE]
    }
  };
}
