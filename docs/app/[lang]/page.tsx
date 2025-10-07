import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { APIReferencePreview } from '@/components/sections/api-reference-preview';
import { InstallSection } from '@/components/sections/install-section';
import { UsageSection } from '@/components/sections/usage-section';
import { Heading } from '@/components/ui/heading';
import { getDictionary } from '@/lib/dictionaries';
import {
  SUPPORTED_LOCALES,
  type Locale,
  DEFAULT_LOCALE,
} from '@/constants/i18n';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function DocsPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const dict = await getDictionary(lang ?? DEFAULT_LOCALE);

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
            description: dict.top.features.stringDivision.description,
          },
          {
            id: 'feature-logic',
            title: dict.top.features.arrayProcessing.title,
            description: dict.top.features.arrayProcessing.description,
          },
          {
            id: 'feature-collections',
            title: dict.top.features.nestedArray.title,
            description: dict.top.features.nestedArray.description,
          },
          {
            id: 'feature-nullable',
            title: dict.top.features.flexibleOutput.title,
            description: dict.top.features.flexibleOutput.description,
          },
          {
            id: 'feature-parse',
            title: dict.top.features.flatteningOption.title,
            description: dict.top.features.flatteningOption.description,
          },
          {
            id: 'feature-tiny',
            title: dict.top.features.mixedDelimiters.title,
            description: dict.top.features.mixedDelimiters.description,
          },
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
