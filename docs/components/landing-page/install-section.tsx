'use client';

import { CodeTabs } from '@/components/code/code-tabs';
import { installTabs, installCode } from '@/lib/docs';

export type InstallSectionProps = {
  /**
   * Accessible name announced for the installation tablist when no external heading id is supplied.
   */
  tablistLabel?: string;
  /** Binds the tablist to a visible heading using aria-labelledby. */
  tablistLabelledBy?: string;
};

export function InstallSection({
  tablistLabel,
  tablistLabelledBy
}: InstallSectionProps = {}) {
  return (
    <CodeTabs
      items={installTabs.map((tab) => ({
        value: tab,
        code: installCode(tab),
        language: 'bash',
        copy: { ariaLabel: 'Copy command' }
      }))}
      className='mb-8'
      ariaLabel={tablistLabel}
      ariaLabelledBy={tablistLabelledBy}
    />
  );
}
