'use client';

import { CodeTabs } from '@/components/code-tabs';
import { usageTabs, usageCode } from '@/lib/docs';

export type UsageSectionProps = {
  examplesLabel: string;
  tablistLabel?: string;
  tablistLabelledBy?: string;
};
export function UsageSection({
  examplesLabel,
  tablistLabel,
  tablistLabelledBy,
}: UsageSectionProps) {
  return (
    <CodeTabs
      items={usageTabs.map((tab) => ({
        value: tab,
        label: `${tab} ${examplesLabel}`,
        code: usageCode(tab),
        language: 'ts',
      }))}
      className="mb-8"
      ariaLabel={tablistLabel}
      ariaLabelledBy={tablistLabelledBy}
    />
  );
}
