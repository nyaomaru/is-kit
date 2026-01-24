'use client';

import { Tabs } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/code/code-block';
import { CopyButton } from '@/components/code/copy-button';
import { cn } from '@/lib/utils';

type CopyButtonOptions = {
  /** Accessible label for the copy button when provided. */
  ariaLabel?: string;
  /** Extra classes merged into the copy button. */
  className?: string;
  /** Override for the copied-state reset timeout. */
  resetAfterMs?: number;
};

/**
 * Configuration for a single tabbed code example rendered by {@link CodeTabs}.
 */
export type CodeTabItem = {
  /** Stable value used for tab state and switching. */
  value: string;
  /** Optional label shown in the tab trigger; defaults to `value`. */
  label?: string;
  /** Code snippet rendered inside the tab panel. */
  code: string;
  /** Syntax highlighting language for the snippet. */
  language?: string;
  /** Additional classes for the underlying `CodeBlock`. */
  codeClassName?: string;
  /** Copy button configuration enabling clipboard support. */
  copy?: CopyButtonOptions;
};

export type CodeTabsProps = {
  /** Tab definitions including snippet content. */
  items: readonly CodeTabItem[];
  /** Value selected on initial render; defaults to the first tab. */
  defaultValue?: string;
  /** Classes applied to the surrounding `Tabs` wrapper. */
  className?: string;
  /** Classes applied to the tab panel container. */
  contentClassName?: string;
  /** Accessible name for the tablist when not labelled elsewhere. */
  ariaLabel?: string;
  /** Id of a visible label describing the tablist. */
  ariaLabelledBy?: string;
};

type CodeTabPanelProps = {
  /** Active tab item to render. */
  item: CodeTabItem;
};

const getActiveItem = (items: readonly CodeTabItem[], active?: string) =>
  items.find((item) => item.value === active) ?? items[0];

const CodeTabPanel = ({ item }: CodeTabPanelProps) => {
  const { code, language, copy, label, value } = item;

  if (!copy) {
    return (
      <div className='relative w-full overflow-x-auto text-sm'>
        <CodeBlock code={code} language={language} />
      </div>
    );
  }

  return (
    <div className='relative w-full overflow-x-auto text-sm'>
      <CodeBlock code={code} language={language} />
      <CopyButton
        text={code}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2',
          copy.className
        )}
        aria-label={copy.ariaLabel ?? `Copy ${label ?? value} code`}
        resetAfterMs={copy.resetAfterMs}
      />
    </div>
  );
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
  ariaLabelledBy
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
        const current = getActiveItem(items, active);

        return <CodeTabPanel item={current} />;
      }}
    </Tabs>
  );
}
