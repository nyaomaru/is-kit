import type { Metadata } from 'next';
import { SITE_OPEN_GRAPH, SITE_SOCIAL_IMAGE } from '@/constants/site';

type ApiMetadataCopy = {
  title: string;
  description: string;
};

/** Canonical paths for API reference routes with registered metadata. */
export const API_REFERENCE_PATHS = {
  index: '/api-reference',
  define: '/api-reference/define',
  equals: '/api-reference/equals',
  logic: '/api-reference/logic',
  parse: '/api-reference/parse',
  assert: '/api-reference/assert',
  nullish: '/api-reference/nullish',
  key: '/api-reference/key',
  primitive: '/api-reference/primitive',
  object: '/api-reference/object',
  predicate: '/api-reference/predicate',
  types: '/api-reference/types',
  arrayOf: '/api-reference/combinators/array-of',
  tupleOf: '/api-reference/combinators/tuple-of',
  setOf: '/api-reference/combinators/set-of',
  mapOf: '/api-reference/combinators/map-of',
  oneOf: '/api-reference/combinators/one-of',
  recordOf: '/api-reference/combinators/record-of',
  struct: '/api-reference/combinators/struct',
  typedStruct: '/api-reference/combinators/typed-struct',
  oneOfValues: '/api-reference/combinators/one-of-values'
} as const;

export type ApiReferencePath =
  (typeof API_REFERENCE_PATHS)[keyof typeof API_REFERENCE_PATHS];

const API_METADATA = {
  [API_REFERENCE_PATHS.index]: {
    title: 'TypeScript Type Guard API Reference | is-kit',
    description:
      'Browse is-kit APIs for building and composing TypeScript type guards, validating data at runtime, and narrowing unknown values.'
  },
  [API_REFERENCE_PATHS.define]: {
    title: 'define — Create TypeScript Type Guards | is-kit',
    description:
      'Create reusable TypeScript type guards from boolean predicates with define while preserving natural type narrowing.'
  },
  [API_REFERENCE_PATHS.equals]: {
    title: 'equals — Type-Safe Equality Guards | is-kit',
    description:
      'Create equality guards with equals, equalsBy, and equalsKey using exact Object.is semantics and TypeScript literal narrowing.'
  },
  [API_REFERENCE_PATHS.logic]: {
    title: 'and, or, not — Compose TypeScript Type Guards | is-kit',
    description:
      'Compose reusable TypeScript type guards with and, andAll, or, not, and guardIn while preserving precise narrowing.'
  },
  [API_REFERENCE_PATHS.parse]: {
    title: 'safeParse and safeJsonParse — Parse Unknown Values | is-kit',
    description:
      'Validate unknown values and decoded JSON with TypeScript type guards using safeParse, safeParseWith, and safeJsonParse.'
  },
  [API_REFERENCE_PATHS.assert]: {
    title: 'assert — TypeScript Assertion and Narrowing | is-kit',
    description:
      'Assert that an unknown value matches an is-kit guard, throw on failure, and narrow the value for subsequent TypeScript code.'
  },
  [API_REFERENCE_PATHS.nullish]: {
    title: 'isNil and isNotNil — Nullish Type Guards | is-kit',
    description:
      'Check and compose nullish values with isNil, isNotNil, nullable, optional, required, and nonNull TypeScript guards.'
  },
  [API_REFERENCE_PATHS.key]: {
    title: 'hasKey, hasKeys, and narrowKeyTo | is-kit',
    description:
      'Check object keys and narrow property values safely in TypeScript with hasKey, hasKeys, and narrowKeyTo.'
  },
  [API_REFERENCE_PATHS.primitive]: {
    title: 'Primitive Type Guards for TypeScript | is-kit',
    description:
      'Use isString, isNumber, isBoolean, isInteger, isNaN, isNil, and other zero-dependency primitive TypeScript guards.'
  },
  [API_REFERENCE_PATHS.object]: {
    title: 'Object and Built-In Type Guards for TypeScript | is-kit',
    description:
      'Check objects, arrays, dates, maps, sets, promises, typed arrays, URLs, and other JavaScript built-ins with type guards.'
  },
  [API_REFERENCE_PATHS.predicate]: {
    title: 'predicateToRefine — TypeScript Refinements | is-kit',
    description:
      'Convert boolean predicates into reusable TypeScript refinements and compose them with type guards for precise narrowing.'
  },
  [API_REFERENCE_PATHS.types]: {
    title: 'TypeScript Guard, Schema, and Parse Types | is-kit',
    description:
      'Explore the public is-kit types for predicates, guards, refinements, parsing results, schema inference, and reusable wrappers.'
  },
  [API_REFERENCE_PATHS.arrayOf]: {
    title: 'arrayOf — TypeScript Array Type Guard | is-kit',
    description:
      'Build reusable TypeScript guards for homogeneous and non-empty arrays by composing an element guard with arrayOf.'
  },
  [API_REFERENCE_PATHS.tupleOf]: {
    title: 'tupleOf — TypeScript Tuple Type Guard | is-kit',
    description:
      'Validate fixed-length TypeScript tuples with per-position guards while preserving precise tuple type inference.'
  },
  [API_REFERENCE_PATHS.setOf]: {
    title: 'setOf — TypeScript Set Type Guard | is-kit',
    description:
      'Build a reusable TypeScript guard that validates a Set and checks every value with a provided guard.'
  },
  [API_REFERENCE_PATHS.mapOf]: {
    title: 'mapOf — TypeScript Map Type Guard | is-kit',
    description:
      'Build a reusable TypeScript guard that validates a Map and checks every key and value with composed guards.'
  },
  [API_REFERENCE_PATHS.oneOf]: {
    title: 'oneOf — Compose Union Type Guards | is-kit',
    description:
      'Combine multiple TypeScript type guards into a reusable union guard that passes when any input guard matches.'
  },
  [API_REFERENCE_PATHS.recordOf]: {
    title: 'recordOf — TypeScript Record Type Guard | is-kit',
    description:
      'Validate TypeScript records at runtime by composing guards for their enumerable keys and values with recordOf.'
  },
  [API_REFERENCE_PATHS.struct]: {
    title: 'struct — TypeScript Object Shape Guard | is-kit',
    description:
      'Build composable TypeScript object shape guards with required and optional keys, inferred types, and exact key checking.'
  },
  [API_REFERENCE_PATHS.typedStruct]: {
    title: 'typedStruct — Guard Existing TypeScript Types | is-kit',
    description:
      'Keep a hand-written runtime object guard aligned with an existing string-keyed TypeScript type using typedStruct and field-level checks.'
  },
  [API_REFERENCE_PATHS.oneOfValues]: {
    title: 'oneOfValues — TypeScript Literal Value Guard | is-kit',
    description:
      'Create a TypeScript guard for a set of literal values with exact equality and inferred literal union narrowing.'
  }
} as const satisfies Record<ApiReferencePath, ApiMetadataCopy>;

/**
 * Build search and social metadata for an API reference route.
 * @param path Canonical API reference path with registered metadata copy.
 * @returns Metadata with page-specific titles, descriptions, and canonical URLs.
 */
export function createApiMetadata(path: ApiReferencePath): Metadata {
  const { title, description } = API_METADATA[path];

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
