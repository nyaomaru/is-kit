import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing-page/hero-section';
import { FeaturesSection } from '@/components/landing-page/features-section';
import { APIReferencePreview } from '@/components/api-reference/preview';
import { InstallSection } from '@/components/landing-page/install-section';
import { UsageSection } from '@/components/landing-page/usage-section';
import { Heading } from '@/components/ui/heading';
import { getDictionary } from '@/lib/dictionaries';
import {
  SUPPORTED_LOCALES,
  type Locale,
  DEFAULT_LOCALE,
  LOCALE_PATHS
} from '@/constants/i18n';
import { SITE_OPEN_GRAPH, SITE_TITLE } from '@/constants/site';

type DocsPageProps = {
  params: Promise<{ lang: Locale }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params
}: DocsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: SITE_TITLE,
    description: dict.top.description,
    alternates: {
      canonical: LOCALE_PATHS[lang],
      languages: {
        ...LOCALE_PATHS,
        'x-default': LOCALE_PATHS[DEFAULT_LOCALE]
      }
    },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      title: SITE_TITLE,
      description: dict.top.description,
      url: LOCALE_PATHS[lang]
    }
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className='container mx-auto px-4 py-12'>
      <HeroSection description={dict.top.description} />

      <section
        id='installation'
        aria-labelledby='installation-title'
        className='mb-16'
      >
        <Heading id='installation-title' variant='h2' className='mb-6'>
          {dict.top.installation.title}
        </Heading>

        <InstallSection tablistLabelledBy='installation-title' />
      </section>

      <section id='usage' aria-labelledby='usage-title' className='mb-16'>
        <Heading id='usage-title' variant='h2' className='mb-6'>
          {dict.top.usage.title}
        </Heading>
        <UsageSection tablistLabelledBy='usage-title' />
      </section>

      <FeaturesSection
        title={dict.top.features.title}
        items={[
          {
            id: 'feature-type-safe',
            title: dict.top.features.stringDivision.title,
            description: dict.top.features.stringDivision.description
          },
          {
            id: 'feature-logic',
            title: dict.top.features.arrayProcessing.title,
            description: dict.top.features.arrayProcessing.description
          },
          {
            id: 'feature-collections',
            title: dict.top.features.nestedArray.title,
            description: dict.top.features.nestedArray.description
          },
          {
            id: 'feature-nullable',
            title: dict.top.features.flexibleOutput.title,
            description: dict.top.features.flexibleOutput.description
          },
          {
            id: 'feature-parse',
            title: dict.top.features.flatteningOption.title,
            description: dict.top.features.flatteningOption.description
          },
          {
            id: 'feature-tiny',
            title: dict.top.features.mixedDelimiters.title,
            description: dict.top.features.mixedDelimiters.description
          }
        ]}
        variant='tabs'
      />

      <APIReferencePreview
        title={dict.top.api.title}
        fullReferenceLinkText={dict.top.api.fullReferenceLinkText}
      />
    </div>
  );
}
