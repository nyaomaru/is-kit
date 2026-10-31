import type { SidebarSection } from '@/components/navigation/sidebar';

/**
 * Sidebar group titles, in display order.
 * WHY: One ordered list keeps the sidebar, sitemap cards, and pager on the
 * same route sequence.
 */
const API_SECTION_ORDER = ['core', 'combinators'] as const;

const API_SECTION_TITLES = {
  core: 'Core',
  combinators: 'Combinators'
} as const;

type ApiSectionId = (typeof API_SECTION_ORDER)[number];

type ApiCatalogEntry = {
  id: string;
  href: `/${string}`;
  /** `null` marks the index route, which is omitted from cards and the sidebar. */
  section: ApiSectionId | null;
  label: string;
  /** Short card copy. The index entry keeps the field for a uniform catalog shape. */
  summary: string;
  seoTitle: string;
  seoDescription: string;
};

/**
 * Source of truth for API reference routes.
 * WHY: Paths, card copy, sidebar order, and search metadata previously lived
 * in separate lists and could drift when a page was added.
 */
const API_CATALOG = [
  {
    id: 'index',
    href: '/api-reference',
    section: null,
    label: 'API Reference',
    summary:
      'Explore the available functions, combinators, and public types. Use the sidebar to navigate.',
    seoTitle: 'TypeScript Type Guard API Reference | is-kit',
    seoDescription:
      'Browse is-kit APIs for building and composing TypeScript type guards, validating data at runtime, and narrowing unknown values.'
  },
  {
    id: 'define',
    href: '/api-reference/define',
    section: 'core',
    label: 'define',
    summary: 'Wrap a predicate as a typed guard.',
    seoTitle: 'define — Create TypeScript Type Guards | is-kit',
    seoDescription:
      'Create reusable TypeScript type guards from boolean predicates with define while preserving natural type narrowing.'
  },
  {
    id: 'lazy',
    href: '/api-reference/lazy',
    section: 'core',
    label: 'lazy',
    summary: 'Create recursive guards with lazy initialization.',
    seoTitle: 'lazy — Recursive TypeScript Type Guards | is-kit',
    seoDescription:
      'Define recursive TypeScript type guards with lazy initialization and a cached predicate factory.'
  },
  {
    id: 'equals',
    href: '/api-reference/equals',
    section: 'core',
    label: 'equals',
    summary: 'Value equality helpers: equals, equalsBy, equalsKey.',
    seoTitle: 'equals — Type-Safe Equality Guards | is-kit',
    seoDescription:
      'Create equality guards with equals, equalsBy, and equalsKey using exact Object.is semantics and TypeScript literal narrowing.'
  },
  {
    id: 'logic',
    href: '/api-reference/logic',
    section: 'core',
    label: 'logic',
    summary: 'Logical combinators: and, andAll, or, not, guardIn.',
    seoTitle: 'and, or, not — Compose TypeScript Type Guards | is-kit',
    seoDescription:
      'Compose reusable TypeScript type guards with and, andAll, or, not, and guardIn while preserving precise narrowing.'
  },
  {
    id: 'parse',
    href: '/api-reference/parse',
    section: 'core',
    label: 'parse',
    summary: 'Guard values or decode and validate JSON with tagged results.',
    seoTitle: 'safeParse and safeJsonParse — Parse Unknown Values | is-kit',
    seoDescription:
      'Validate unknown values and decoded JSON with TypeScript type guards using safeParse, safeParseWith, and safeJsonParse.'
  },
  {
    id: 'assert',
    href: '/api-reference/assert',
    section: 'core',
    label: 'assert',
    summary: 'Fail-fast assertion helper with type narrowing.',
    seoTitle: 'assert — TypeScript Assertion and Narrowing | is-kit',
    seoDescription:
      'Assert that an unknown value matches an is-kit guard, throw on failure, and narrow the value for subsequent TypeScript code.'
  },
  {
    id: 'nullish',
    href: '/api-reference/nullish',
    section: 'core',
    label: 'nullish',
    summary:
      'Nullability helpers: isNil, isNotNil, nullable, optional, required, nonNull.',
    seoTitle: 'isNil and isNotNil — Nullish Type Guards | is-kit',
    seoDescription:
      'Check and compose nullish values with isNil, isNotNil, nullable, optional, required, and nonNull TypeScript guards.'
  },
  {
    id: 'key',
    href: '/api-reference/key',
    section: 'core',
    label: 'key',
    summary:
      'Key presence, literal narrowing, and required, optional, or indexed property refinements.',
    seoTitle: 'Key and Property Refinement Helpers | is-kit',
    seoDescription:
      'Check object keys and safely narrow required, optional, and indexed child values with refineKey, refineDefinedKey, and refineIndex.'
  },
  {
    id: 'primitive',
    href: '/api-reference/primitive',
    section: 'core',
    label: 'primitive',
    summary: 'Primitive guards: string, number, boolean, nullish, etc.',
    seoTitle: 'Primitive Type Guards for TypeScript | is-kit',
    seoDescription:
      'Use isString, isNumber, isBoolean, isInteger, isNaN, isNil, and other zero-dependency primitive TypeScript guards.'
  },
  {
    id: 'object',
    href: '/api-reference/object',
    section: 'core',
    label: 'object',
    summary:
      'Object and built-in guards: array, date, map, set, isInstanceOf, …',
    seoTitle: 'Object and Built-In Type Guards for TypeScript | is-kit',
    seoDescription:
      'Check objects, arrays, dates, maps, sets, promises, typed arrays, URLs, and other JavaScript built-ins with type guards.'
  },
  {
    id: 'predicate',
    href: '/api-reference/predicate',
    section: 'core',
    label: 'predicate',
    summary: 'Convert boolean predicates to refinements.',
    seoTitle: 'predicateToRefine — TypeScript Refinements | is-kit',
    seoDescription:
      'Convert boolean predicates into reusable TypeScript refinements and compose them with type guards for precise narrowing.'
  },
  {
    id: 'types',
    href: '/api-reference/types',
    section: 'core',
    label: 'types',
    summary:
      'Public type contracts for guards, parsing, schemas, and reusable wrappers.',
    seoTitle: 'TypeScript Guard, Schema, and Parse Types | is-kit',
    seoDescription:
      'Explore the public is-kit types for predicates, guards, refinements, parsing results, schema inference, and reusable wrappers.'
  },
  {
    id: 'arrayOf',
    href: '/api-reference/combinators/array-of',
    section: 'combinators',
    label: 'arrayOf',
    summary: 'Guard arrays with an element guard.',
    seoTitle: 'arrayOf — TypeScript Array Type Guard | is-kit',
    seoDescription:
      'Build reusable TypeScript guards for homogeneous and non-empty arrays by composing an element guard with arrayOf.'
  },
  {
    id: 'tupleOf',
    href: '/api-reference/combinators/tuple-of',
    section: 'combinators',
    label: 'tupleOf',
    summary: 'Guard fixed-length tuples by position.',
    seoTitle: 'tupleOf — TypeScript Tuple Type Guard | is-kit',
    seoDescription:
      'Validate fixed-length TypeScript tuples with per-position guards while preserving precise tuple type inference.'
  },
  {
    id: 'setOf',
    href: '/api-reference/combinators/set-of',
    section: 'combinators',
    label: 'setOf',
    summary: 'Guard sets with a value guard.',
    seoTitle: 'setOf — TypeScript Set Type Guard | is-kit',
    seoDescription:
      'Build a reusable TypeScript guard that validates a Set and checks every value with a provided guard.'
  },
  {
    id: 'mapOf',
    href: '/api-reference/combinators/map-of',
    section: 'combinators',
    label: 'mapOf',
    summary: 'Guard maps with key and value guards.',
    seoTitle: 'mapOf — TypeScript Map Type Guard | is-kit',
    seoDescription:
      'Build a reusable TypeScript guard that validates a Map and checks every key and value with composed guards.'
  },
  {
    id: 'discriminatedUnion',
    href: '/api-reference/combinators/discriminated-union',
    section: 'combinators',
    label: 'discriminatedUnion',
    summary: 'Exhaustively guard a discriminated union by branch.',
    seoTitle: 'discriminatedUnion — Exhaustive Union Guard | is-kit',
    seoDescription:
      'Build an exhaustive TypeScript guard for a discriminated union, with one compatible branch guard for every discriminant value.'
  },
  {
    id: 'oneOf',
    href: '/api-reference/combinators/one-of',
    section: 'combinators',
    label: 'oneOf',
    summary: 'Passes when any guard passes (union).',
    seoTitle: 'oneOf — Compose Union Type Guards | is-kit',
    seoDescription:
      'Combine multiple TypeScript type guards into a reusable union guard that passes when any input guard matches.'
  },
  {
    id: 'recordOf',
    href: '/api-reference/combinators/record-of',
    section: 'combinators',
    label: 'recordOf',
    summary: 'Guard records with key and value guards.',
    seoTitle: 'recordOf — TypeScript Record Type Guard | is-kit',
    seoDescription:
      'Validate TypeScript records at runtime by composing guards for their enumerable keys and values with recordOf.'
  },
  {
    id: 'struct',
    href: '/api-reference/combinators/struct',
    section: 'combinators',
    label: 'struct',
    summary: 'Shape guard for objects; supports exact key checking.',
    seoTitle: 'struct — TypeScript Object Shape Guard | is-kit',
    seoDescription:
      'Build composable TypeScript object shape guards with required and optional keys, inferred types, and exact key checking.'
  },
  {
    id: 'typedStruct',
    href: '/api-reference/combinators/typed-struct',
    section: 'combinators',
    label: 'typedStruct',
    summary:
      'Typed struct wrapper that checks fields against an existing object type.',
    seoTitle: 'typedStruct — Guard Existing TypeScript Types | is-kit',
    seoDescription:
      'Keep a hand-written runtime object guard aligned with an existing string-keyed TypeScript type using typedStruct and field-level checks.'
  },
  {
    id: 'oneOfValues',
    href: '/api-reference/combinators/one-of-values',
    section: 'combinators',
    label: 'oneOfValues',
    summary: 'Guard literal value sets with exact equality.',
    seoTitle: 'oneOfValues — TypeScript Literal Value Guard | is-kit',
    seoDescription:
      'Create a TypeScript guard for a set of literal values with exact equality and inferred literal union narrowing.'
  }
] as const satisfies readonly ApiCatalogEntry[];

type ApiCatalogRecord = (typeof API_CATALOG)[number];
type ApiCatalogId = ApiCatalogRecord['id'];

type ApiPathMap = {
  [Entry in ApiCatalogRecord as Entry['id']]: Entry['href'];
};

/**
 * Rebuilds literal path keys from the catalog.
 * WHY: `Object.fromEntries` widens keys to `string`, so the mapped id-to-href
 * type is restored at this boundary.
 * @param entries Catalog rows that each carry an id and href.
 * @returns Path lookup keyed by catalog id.
 */
function toPathMap<const T extends readonly { id: string; href: string }[]>(
  entries: T
): { [Entry in T[number] as Entry['id']]: Entry['href'] } {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry.href])) as {
    [Entry in T[number] as Entry['id']]: Entry['href'];
  };
}

/** Canonical API reference paths keyed by catalog id. */
export const API_REFERENCE_PATHS: ApiPathMap = toPathMap(API_CATALOG);

export type ApiReferencePath = ApiPathMap[keyof ApiPathMap];

export type ApiItem = {
  href: string;
  title: string;
  description: string;
};

/** Card entries in sidebar order, excluding the index route. */
export const API_ITEMS: ApiItem[] = API_CATALOG.flatMap((entry) =>
  entry.section === null
    ? []
    : [
        {
          href: entry.href,
          title: entry.label,
          description: entry.summary
        }
      ]
);

const FEATURED_API_IDS = [
  'define',
  'struct',
  'logic',
  'parse',
  'primitive',
  'predicate'
] as const satisfies readonly Exclude<ApiCatalogId, 'index'>[];

/**
 * Resolves a featured catalog id to its card copy.
 * @param id Catalog id registered as a featured API.
 * @returns Card fields for that API page.
 */
function toFeaturedApiItem(id: (typeof FEATURED_API_IDS)[number]): ApiItem {
  const entry = API_CATALOG.find((item) => item.id === id);

  if (entry === undefined || entry.section === null) {
    throw new Error(`Missing featured API entry: ${id}`);
  }

  return {
    href: entry.href,
    title: entry.label,
    description: entry.summary
  };
}

/** Landing-page cards, in featured order rather than sidebar order. */
export const FEATURED_API_ITEMS: ApiItem[] =
  FEATURED_API_IDS.map(toFeaturedApiItem);

/** Sidebar groups derived from the catalog section field. */
export const apiSections: SidebarSection[] = API_SECTION_ORDER.map(
  (sectionId) => ({
    title: API_SECTION_TITLES[sectionId],
    items: API_CATALOG.flatMap((entry) =>
      entry.section === sectionId
        ? [{ href: entry.href, label: entry.label }]
        : []
    )
  })
);

type ApiSeoCopy = {
  title: string;
  description: string;
};

/**
 * Search titles keyed by canonical path.
 * WHY: `Object.fromEntries` widens the key, so the path union is restored here.
 */
const API_SEO_BY_PATH = Object.fromEntries(
  API_CATALOG.map((entry) => [
    entry.href,
    { title: entry.seoTitle, description: entry.seoDescription }
  ])
) as Record<ApiReferencePath, ApiSeoCopy>;

/**
 * Returns the search title and description registered for an API route.
 * @param path Canonical API reference path.
 * @returns Page title and description used in metadata.
 */
export function getApiSeoCopy(path: ApiReferencePath): ApiSeoCopy {
  return API_SEO_BY_PATH[path];
}
