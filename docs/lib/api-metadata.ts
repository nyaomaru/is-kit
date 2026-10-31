import {
  API_REFERENCE_PATHS,
  getApiSeoCopy,
  type ApiReferencePath
} from '@/constants/api-catalog';
import { createRouteMetadata } from '@/lib/route-metadata';

export { API_REFERENCE_PATHS, type ApiReferencePath };

/**
 * Builds search and social metadata for an API reference route.
 * @param path Canonical API reference path with registered metadata copy.
 * @returns Metadata with page-specific titles, descriptions, and canonical URLs.
 */
export function createApiMetadata(path: ApiReferencePath) {
  const { title, description } = getApiSeoCopy(path);

  return createRouteMetadata({ path, title, description });
}
