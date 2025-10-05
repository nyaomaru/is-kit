import type { Locale } from '@/constants/i18n';
import { DEFAULT_LOCALE } from '@/constants/i18n';

/**
 * Bundle of locale-specific copy consumed by the docs landing page sections.
 */
type Dict = {
  top: {
    title: string;
    description: string;
    button: { playground: string };
    installation: { title: string };
    usage: { title: string; examples: string };
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
      'Type-safe utilities and combinators for building isXXX guards in TypeScript. Lightweight and zero-dependency.',
    button: { playground: 'Open Playground' },
    installation: { title: 'Installation' },
    usage: { title: 'Usage', examples: 'examples' },
    features: {
      title: 'Features',
      stringDivision: {
        title: 'Type-safe predicates',
        description: 'Author and compose predicates that refine types precisely.',
      },
      arrayProcessing: {
        title: 'Composable logic',
        description: 'Combine guards with and/or/not while preserving inference.',
      },
      nestedArray: {
        title: 'Collection helpers',
        description: 'Validate arrays, tuples, records with ergonomic combinators.',
      },
      flexibleOutput: {
        title: 'Strict nullability',
        description: 'Handle optional/nullable data with clear, typed helpers.',
      },
      flatteningOption: {
        title: 'Parsing helpers',
        description: 'Safely parse unknown data with typed results.',
      },
      mixedDelimiters: {
        title: 'Tiny, focused',
        description: 'Zero deps, tree-shakeable, designed for readability.',
      },
    },
    api: {
      title: 'API Reference',
      fullReferenceLinkText: 'Read full TypeDoc reference',
    },
  },
};

const ja: Dict = {
  top: {
    title: 'is-kit',
    description:
      'TypeScript で isXXX ガードを安全に作るためのユーティリティ。軽量・依存ゼロ。',
    button: { playground: 'プレイグラウンドを開く' },
    installation: { title: 'インストール' },
    usage: { title: '使い方', examples: '例' },
    features: {
      title: '特徴',
      stringDivision: {
        title: '型安全な述語',
        description: '型を正確に絞り込む述語を作成・合成できます。',
      },
      arrayProcessing: {
        title: '合成可能なロジック',
        description: 'and/or/not を組み合わせても推論が崩れません。',
      },
      nestedArray: {
        title: 'コレクション向け',
        description: '配列/タプル/レコードを快適に検証できます。',
      },
      flexibleOutput: {
        title: '厳密な null 取り扱い',
        description: 'optional/nullable を明確に扱うヘルパーを提供。',
      },
      flatteningOption: {
        title: 'パース補助',
        description: '未知のデータを安全にパースし、型付きで返します。',
      },
      mixedDelimiters: {
        title: '小さく焦点化',
        description: '依存ゼロ、tree-shakeable、可読性重視。',
      },
    },
    api: {
      title: 'API リファレンス',
      fullReferenceLinkText: 'TypeDoc 全文を読む',
    },
  },
};

const nl: Dict = {
  top: {
    title: 'is-kit',
    description:
      'Type-veilige hulpprogramma’s om isXXX-guards te bouwen in TypeScript. Lichtgewicht, geen dependencies.',
    button: { playground: 'Playground openen' },
    installation: { title: 'Installatie' },
    usage: { title: 'Gebruik', examples: 'voorbeelden' },
    features: {
      title: 'Functies',
      stringDivision: {
        title: 'Type-veilige predicaten',
        description: 'Stel predicaten samen die types precies verfijnen.',
      },
      arrayProcessing: {
        title: 'Composteerbare logica',
        description: 'Combineer guards met and/or/not en behoud inferentie.',
      },
      nestedArray: {
        title: 'Collectiehulpen',
        description: 'Valideer arrays, tuples en records met combinators.',
      },
      flexibleOutput: {
        title: 'Strikte nullability',
        description: 'Behandel optional/nullable met duidelijke helpers.',
      },
      flatteningOption: {
        title: 'Parseerhulpen',
        description: 'Parseer onbekende data veilig met getypte resultaten.',
      },
      mixedDelimiters: {
        title: 'Klein en gericht',
        description: 'Geen deps, tree-shakeable, leesbaar.',
      },
    },
    api: {
      title: 'API Referentie',
      fullReferenceLinkText: 'Lees de volledige TypeDoc',
    },
  },
};

/**
 * Mapping of available locales to their translated messaging.
 */
export const DICTIONARIES: Record<Locale, Dict> = {
  en,
  ja,
  nl,
};

/**
 * Resolve the dictionary for a given locale, falling back to the default when
 * an unsupported locale is requested.
 * @param locale Locale identifier taken from the URL.
 * @returns Translated content used to render the docs homepage.
 */
export async function getDictionary(locale: Locale): Promise<Dict> {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}
