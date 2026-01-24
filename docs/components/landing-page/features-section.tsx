'use client';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { FeatureCard } from '@/components/landing-page/feature-card';
import { Tabs } from '@/components/ui/tabs';
import { Typewriter } from '@/components/landing-page/typewriter';
import {
  FEATURES_DEFAULT_AUTO_ADVANCE_MS,
  FEATURES_TAB_CONTENT_MIN_H_CLASS,
  TYPEWRITER_DESC_START_DELAY_MS,
  TYPEWRITER_TITLE_SPEED_MS,
  TYPEWRITER_TITLE_START_DELAY_MS
} from '@/constants/features';

type FeatureItem = {
  /** Unique identifier used for keys and tab values. */
  id: string;
  /** Title displayed for the feature. */
  title: string;
  /** Supporting copy describing the feature. */
  description: string;
};

export type FeaturesSectionProps = {
  /** Section id for deep-linking; defaults to `features`. */
  id?: string;
  /** Heading rendered above the section content. */
  title: string;
  /** Collection of feature entries to display. */
  items: FeatureItem[];
  /** Presentation mode for the features grid or tabbed layout. */
  variant?: 'grid' | 'tabs';
  /** Auto-advance interval when variant="tabs". Set to 0 to disable. */
  autoAdvanceMs?: number;
};

type FeatureGridProps = {
  /** Feature entries rendered in the grid. */
  items: FeatureItem[];
};

type FeatureTabsProps = {
  /** Feature entries rendered in the tabbed layout. */
  items: FeatureItem[];
  /** Auto-advance interval for the tabbed layout. */
  autoAdvanceMs?: number;
  /** Id of a visible label describing the tablist. */
  ariaLabelledBy: string;
};

type FeatureTabPanelProps = {
  /** Active feature item to render. */
  item: FeatureItem;
};

/**
 * Resolves the active feature item, defaulting to the first item when missing.
 * @param items List of feature items to search.
 * @param active Active feature id.
 * @returns The matching feature or the first item as fallback.
 */
const getActiveFeature = (items: readonly FeatureItem[], active?: string) =>
  items.find((feature) => feature.id === active) ?? items[0];

const FeatureGrid = ({ items }: FeatureGridProps) => (
  <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
    {items.map((feature) => (
      <FeatureCard
        key={feature.id}
        id={feature.id}
        title={feature.title}
        description={feature.description}
      />
    ))}
  </div>
);

const FeatureTabPanel = ({ item }: FeatureTabPanelProps) => (
  <div className='max-w-full'>
    <div className='max-w-full overflow-x-auto'>
      <div className='min-w-max space-y-3 md:min-w-0 md:max-w-prose'>
        <Heading variant='h3' className='text-lg'>
          <Typewriter
            key={item.id + '-title'}
            text={item.title}
            speedMs={TYPEWRITER_TITLE_SPEED_MS}
            startDelayMs={TYPEWRITER_TITLE_START_DELAY_MS}
            cursor={false}
            className='inline'
          />
        </Heading>
        <Paragraph className='text-muted-foreground' spacing='flat'>
          <Typewriter
            key={item.id + '-desc'}
            text={item.description}
            startDelayMs={TYPEWRITER_DESC_START_DELAY_MS}
          />
        </Paragraph>
      </div>
    </div>
  </div>
);

const FeatureTabs = ({
  items,
  autoAdvanceMs,
  ariaLabelledBy
}: FeatureTabsProps) => {
  if (items.length === 0) return null;

  return (
    <Tabs
      items={items.map((feature) => ({
        value: feature.id,
        label: feature.title
      }))}
      defaultValue={items[0]?.id ?? 'feature'}
      autoAdvanceMs={autoAdvanceMs || undefined}
      contentClassName={FEATURES_TAB_CONTENT_MIN_H_CLASS}
      ariaLabelledBy={ariaLabelledBy}
    >
      {(active) => {
        const current = getActiveFeature(items, active);
        if (!current) return null;
        return <FeatureTabPanel item={current} />;
      }}
    </Tabs>
  );
};

export function FeaturesSection({
  id = 'features',
  title,
  items,
  variant = 'grid',
  autoAdvanceMs = FEATURES_DEFAULT_AUTO_ADVANCE_MS
}: FeaturesSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className='mb-16'>
      <Heading id={titleId} variant='h2' className='mb-6'>
        {title}
      </Heading>
      {variant === 'grid' ? (
        <FeatureGrid items={items} />
      ) : (
        <FeatureTabs
          items={items}
          autoAdvanceMs={autoAdvanceMs}
          ariaLabelledBy={titleId}
        />
      )}
    </section>
  );
}
