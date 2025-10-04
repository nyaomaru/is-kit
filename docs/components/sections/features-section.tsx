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
  id: string;
  title: string;
  description: string;
};

export type FeaturesSectionProps = {
  id?: string;
  title: string;
  items: FeatureItem[];
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
              <div className="max-w-prose">
                <Heading variant="h3" className="mb-2 text-lg">
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
            );
          }}
        </Tabs>
      )}
    </section>
  );
}
