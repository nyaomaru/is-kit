'use client';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { FeatureCard } from '@/components/feature-card';
import { Tabs } from '@/components/tabs';
import { Typewriter } from '@/components/typewriter';
import {
  FEATURES_DEFAULT_AUTO_ADVANCE_MS,
  FEATURES_TAB_CONTENT_MIN_H_CLASS,
  TYPEWRITER_DESC_START_DELAY_MS,
  TYPEWRITER_TITLE_SPEED_MS,
  TYPEWRITER_TITLE_START_DELAY_MS,
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

export function FeaturesSection({
  id = 'features',
  title,
  items,
  variant = 'grid',
  autoAdvanceMs = FEATURES_DEFAULT_AUTO_ADVANCE_MS,
}: FeaturesSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="mb-16">
      <Heading id={titleId} variant="h2" className="mb-6">
        {title}
      </Heading>
      {variant === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((feature) => (
            <FeatureCard
              key={feature.id}
              id={feature.id}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      ) : (
        <Tabs
          items={items.map((feature) => ({
            value: feature.id,
            label: feature.title,
          }))}
          defaultValue={items[0]?.id ?? 'feature'}
          autoAdvanceMs={autoAdvanceMs || undefined}
          contentClassName={FEATURES_TAB_CONTENT_MIN_H_CLASS}
          ariaLabelledBy={titleId}
        >
          {(active) => {
            const current =
              items.find((feature) => feature.id === active) ?? items[0];
            if (!current) return null;
            return (
              <div className="max-w-full">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-max space-y-3 md:min-w-0 md:max-w-prose">
                    <Heading variant="h3" className="text-lg">
                      <Typewriter
                        key={current.id + '-title'}
                        text={current.title}
                        speedMs={TYPEWRITER_TITLE_SPEED_MS}
                        startDelayMs={TYPEWRITER_TITLE_START_DELAY_MS}
                        cursor={false}
                        className="inline"
                      />
                    </Heading>
                    <Paragraph className="text-muted-foreground">
                      <Typewriter
                        key={current.id + '-desc'}
                        text={current.description}
                        startDelayMs={TYPEWRITER_DESC_START_DELAY_MS}
                      />
                    </Paragraph>
                  </div>
                </div>
              </div>
            );
          }}
        </Tabs>
      )}
    </section>
  );
}
