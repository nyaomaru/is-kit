'use client';

import { Tabs } from '@/components/tabs';
import { CodeBlock } from '@/components/code-block';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';

type CopyButtonOptions = {
  ariaLabel?: string;
  className?: string;
  resetAfterMs?: number;
};

/**
 * Configuration for a single tabbed code example rendered by {@link CodeTabs}.
 */
export type CodeTabItem = {
  value: string;
  label?: string;
  code: string;
  language?: string;
  codeClassName?: string;
  copy?: CopyButtonOptions;
};

export type CodeTabsProps = {
  items: readonly CodeTabItem[];
  defaultValue?: string;
  className?: string;
  contentClassName?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

/**
 * Renders syntax highlighted code snippets within a tab interface, optionally including copy buttons per tab.
 * @param items Code samples to display.
 * @param defaultValue Initial tab selection. Defaults to the first item.
 * @param className Additional classes for the tab container.
 * @param contentClassName Extra classes for the surrounding tab panel container.
 */
export function CodeTabs({
  items,
  defaultValue,
  className,
  contentClassName,
  ariaLabel,
  ariaLabelledBy,
}: CodeTabsProps) {
  if (items.length === 0) return null;

  const initialValue = defaultValue ?? items[0]?.value;

  return (
    <Tabs
      items={items.map(({ value, label }) => ({ value, label }))}
      defaultValue={initialValue}
      className={className}
      contentClassName={contentClassName}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
    >
      {(active) => {
        const current = items.find((item) => item.value === active) ?? items[0];

        const { code, language, codeClassName, copy } = current;
        const showCopyButton = !!copy;

        return (
          <div className="relative w-full overflow-x-auto text-sm">
            <CodeBlock
              code={code}
              language={language}
              className={cn('w-full max-w-full', codeClassName, showCopyButton && 'pr-16')}
            />
            {showCopyButton ? (
              <CopyButton
                text={code}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2',
                  copy?.className
                )}
                aria-label={
                  copy?.ariaLabel ??
                  `Copy ${current.label ?? current.value} code`
                }
                resetAfterMs={copy?.resetAfterMs}
              />
            ) : null}
          </div>
        );
      }}
    </Tabs>
  );
}
