import type { Locale } from '@/constants/i18n';
import { resolveLocale } from '@/constants/i18n';

/**
 * Bundle of locale-specific copy consumed by the docs landing page sections.
 */
type Dict = {
  top: {
    title: string;
    description: string;
    hero: { primary: string; secondary: string };
    button: { playground: string };
    installation: { title: string };
    usage: { title: string };
    features: {
      title: string;
      existingTypes: { title: string; description: string };
      propertyRefinement: { title: string; description: string };
      exhaustiveUnions: { title: string; description: string };
      unknownInputBoundaries: { title: string; description: string };
      zeroDependencyComposition: { title: string; description: string };
    };
    api: { title: string; fullReferenceLinkText: string };
  };
};

const en: Dict = {
  top: {
    title: 'is-kit',
    description:
      'Keep runtime checks aligned with your existing TypeScript object types. Refine values, validate exhaustive unions, and safely handle unknown input.',
    hero: {
      primary:
        'Keep runtime checks aligned with your existing TypeScript object types.',
      secondary:
        'Refine values, validate exhaustive unions, and safely handle unknown input.'
    },
    button: { playground: 'Open Playground' },
    installation: { title: 'Installation' },
    usage: { title: 'Usage' },
    features: {
      title: 'Features',
      existingTypes: {
        title: 'Existing types',
        description:
          'Build runtime guards around the TypeScript object types you already have. typedStruct<T>() helps keep runtime validation aligned when those types change.'
      },
      propertyRefinement: {
        title: 'Property refinement',
        description:
          'Refine individual properties while preserving the original parent type. Compose refinements naturally with control flow, filter, and find.'
      },
      exhaustiveUnions: {
        title: 'Exhaustive unions',
        description:
          'Validate finite discriminated unions with compile-time coverage for every known branch. Adding or removing a variant makes missing runtime handling visible to TypeScript.'
      },
      unknownInputBoundaries: {
        title: 'Unknown-input boundaries',
        description:
          'Handle evolving external input without weakening known branches. Classify undeclared discriminants explicitly, reject malformed known variants, and represent validation with tagged results.'
      },
      zeroDependencyComposition: {
        title: 'Zero-dependency composition',
        description:
          'Build larger checks from small TypeScript predicates without introducing a schema runtime or additional dependencies.'
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
      'Houd runtimecontroles afgestemd op je bestaande TypeScript-objecttypen. Verfijn waarden, valideer exhaustieve unions en verwerk onbekende input veilig.',
    hero: {
      primary:
        'Houd runtimecontroles afgestemd op je bestaande TypeScript-objecttypen.',
      secondary:
        'Verfijn waarden, valideer exhaustieve unions en verwerk onbekende input veilig.'
    },
    button: { playground: 'Playground openen' },
    installation: { title: 'Installatie' },
    usage: { title: 'Gebruik' },
    features: {
      title: 'Functies',
      existingTypes: {
        title: 'Bestaande typen',
        description:
          'Bouw runtimeguards rond de TypeScript-objecttypen die je al hebt. typedStruct<T>() helpt runtimevalidatie synchroon te houden wanneer die typen veranderen.'
      },
      propertyRefinement: {
        title: 'Eigenschapsverfijning',
        description:
          'Verfijn afzonderlijke eigenschappen met behoud van het oorspronkelijke bovenliggende type. Combineer verfijningen natuurlijk met control flow, filter en find.'
      },
      exhaustiveUnions: {
        title: 'Exhaustieve unions',
        description:
          'Valideer eindige discriminated unions met compile-time-dekking voor elke bekende variant. Het toevoegen of verwijderen van een variant maakt ontbrekende runtimeafhandeling zichtbaar voor TypeScript.'
      },
      unknownInputBoundaries: {
        title: 'Grenzen voor onbekende input',
        description:
          'Verwerk veranderende externe input zonder bekende branches te verzwakken. Classificeer niet-gedeclareerde discriminants expliciet, wijs ongeldige bekende varianten af en representeer validatie met getagde resultaten.'
      },
      zeroDependencyComposition: {
        title: 'Compositie zonder dependencies',
        description:
          'Bouw grotere controles uit kleine TypeScript-predicaten zonder een schema-runtime of aanvullende dependencies toe te voegen.'
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
