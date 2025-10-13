'use client';

import { CodeTabs } from '@/components/code/code-tabs';
import { usageTabs, usageCode } from '@/lib/docs';

export type UsageSectionProps = {
  /** Accessible name for the usage tablist when no visible label exists. */
  tablistLabel?: string;
  /** Id referencing a heading that labels the tablist. */
  tablistLabelledBy?: string;
};
export function UsageSection({
  tablistLabel,
  tablistLabelledBy,
}: UsageSectionProps) {
  return (
    <CodeTabs
      items={usageTabs.map((tab) => ({
        value: tab,
        label: `${tab}`,
        code: usageCode(tab),
        language: 'ts',
      }))}
      className='mb-8'
      ariaLabel={tablistLabel}
      ariaLabelledBy={tablistLabelledBy}
    />
  );
}
