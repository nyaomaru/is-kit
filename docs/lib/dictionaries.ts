import type { Locale } from '@/constants/i18n';
import { resolveLocale } from '@/constants/i18n';

/**
 * Bundle of locale-specific copy consumed by the docs landing page sections.
 */
type Dict = {
  top: {
    title: string;
    description: string;
    button: { playground: string };
    installation: { title: string };
    usage: { title: string };
    features: {
      title: string;
      stringDivision: { title: string; description: string };
      arrayProcessing: { title: string; description: string };
      nestedArray: { title: string; description: string };
      flexibleOutput: { title: string; description: string };
      flatteningOption: { title: string; description: string };
      mixedDelimiters: { title: string; description: string };
    };
    api: { title: string; fullReferenceLinkText: string };
  };
};

const en: Dict = {
  top: {
    title: 'is-kit',
    description:
      'A lightweight, zero-dependency toolkit for building and composing reusable TypeScript type guards while preserving useful narrowing.',
    button: { playground: 'Open Playground' },
    installation: { title: 'Installation' },
    usage: { title: 'Usage' },
    features: {
      title: 'Features',
      stringDivision: {
        title: 'Type-safe predicates',
        description:
          'Author and compose predicates that refine types precisely.'
      },
      arrayProcessing: {
        title: 'Composable logic',
        description:
          'Combine guards with and/or/not while preserving inference.'
      },
      nestedArray: {
        title: 'Collection helpers',
        description:
          'Validate arrays, tuples, records with ergonomic combinators.'
      },
      flexibleOutput: {
        title: 'Strict nullability',
        description: 'Handle optional/nullable data with clear, typed helpers.'
      },
      flatteningOption: {
        title: 'Parsing helpers',
        description: 'Safely parse unknown data with typed results.'
      },
      mixedDelimiters: {
        title: 'Tiny, focused',
        description: 'Zero deps, tree-shakeable, designed for readability.'
      }
    },
    api: {
      title: 'API Reference',
      fullReferenceLinkText: 'Read full TypeDoc reference'
    }
  }
};

const nl: Dict = {
  top: {
    title: 'is-kit',
    description:
      'Een lichtgewicht toolkit zonder dependencies om herbruikbare TypeScript-typeguards te bouwen en samen te stellen, met behoud van bruikbare narrowing.',
    button: { playground: 'Playground openen' },
    installation: { title: 'Installatie' },
    usage: { title: 'Gebruik' },
    features: {
      title: 'Functies',
      stringDivision: {
        title: 'Type-veilige predicaten',
        description: 'Stel predicaten samen die types precies verfijnen.'
      },
      arrayProcessing: {
        title: 'Combineerbare logica',
        description: 'Combineer guards met and/or/not en behoud inferentie.'
      },
      nestedArray: {
        title: 'Collectiehulpen',
        description: 'Valideer arrays, tuples en records met combinators.'
      },
      flexibleOutput: {
        title: 'Strikte nullability',
        description: 'Behandel optional/nullable met duidelijke helpers.'
      },
      flatteningOption: {
        title: 'Parseerhulpen',
        description: 'Parseer onbekende data veilig met getypte resultaten.'
      },
      mixedDelimiters: {
        title: 'Klein en gericht',
        description: 'Geen deps, tree-shakeable, leesbaar.'
      }
    },
    api: {
      title: 'API Referentie',
      fullReferenceLinkText: 'Lees de volledige TypeDoc'
    }
  }
};

/**
 * Mapping of available locales to their translated messaging.
 */
export const DICTIONARIES: Record<Locale, Dict> = {
  en,
  nl
};

/**
 * Resolve the dictionary for a given locale, falling back to the default when
 * an unsupported locale is requested.
 * @param locale Locale identifier taken from the URL.
 * @returns Translated content used to render the docs homepage.
 */
export async function getDictionary(locale: string): Promise<Dict> {
  return DICTIONARIES[resolveLocale(locale)];
}
