'use client';
import { useCallback, useEffect, useMemo, useState, useId } from 'react';
import type { KeyboardEvent } from 'react';

import { cn } from '@/lib/utils';

type TabItem = {
  /** Stable identifier that maps tab to its panel. */
  value: string;
  /** Optional human readable label shown in the tab button. */
  label?: string;
};

export type TabsProps = {
  /** Tabs rendered across the top of the control. */
  items: readonly TabItem[];
  /** Value selected when the component mounts. */
  defaultValue: string;
  /** Optional classes applied to the outer tab container. */
  className?: string;
  /** Interval in milliseconds between automatic tab advances; disabled when undefined or 0. */
  autoAdvanceMs?: number;
  /** Whether navigation wraps around when moving past the first/last tab via keyboard. */
  loop?: boolean;
  /** Extra classes for the tabpanel container (e.g., min-h-32). */
  contentClassName?: string;
  /** Callback fired after the active tab changes. */
  onChange?: (value: string) => void;
  /** Accessible name for the tablist when aria-labelledby is unavailable. */
  ariaLabel?: string;
  /** Element id that labels the tablist; preferred over ariaLabel. */
  ariaLabelledBy?: string;
  /** Render prop that receives the currently active tab value. */
  children?: (active: string) => React.ReactNode;
};

/**
 * Accessible tab controller with keyboard support and optional auto-advancing behaviour.
 */
export function Tabs({
  items,
  defaultValue,
  className,
  autoAdvanceMs,
  loop = true,
  contentClassName,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  children,
}: TabsProps) {
  const baseId = useId();
  const values = useMemo(() => items.map((item) => item.value), [items]);

  function getFallbackTabValue(values: string[], defaultValue: string): string | undefined {
    if (values.length === 0) return undefined;
    if (defaultValue && values.includes(defaultValue)) return defaultValue;
    return values[0];
  }

  const fallbackValue = useMemo(
    () => getFallbackTabValue(values, defaultValue),
    [defaultValue, values]
  );
  const [active, setActive] = useState<string | undefined>(fallbackValue);
  const gridCols = useMemo(() => {
    switch (items.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      default:
        return 'auto-cols-fr grid-flow-col';
    }
  }, [items.length]);

  const descriptors = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        tabId: `${baseId}-tab-${index}`,
        panelId: `${baseId}-panel-${index}`,
      })),
    [items, baseId]
  );

  const focusTab = useCallback(
    (value: string) => {
      if (typeof document === 'undefined') return;
      const descriptor = descriptors.find(({ item }) => item.value === value);
      if (!descriptor) return;
      const node = document.getElementById(descriptor.tabId);
      if (node instanceof HTMLButtonElement) {
        node.focus();
      }
    },
    [descriptors]
  );

  const activate = useCallback(
    (value: string) => {
      setActive((current) => {
        if (current === value) return current;
        onChange?.(value);
        return value;
      });
    },
    [onChange]
  );

  useEffect(() => {
    if (values.length === 0 || fallbackValue === undefined) return;
    const isActiveValid = active ? values.includes(active) : false;
    if (!isActiveValid) {
      activate(fallbackValue);
    }
  }, [values, fallbackValue, active, activate]);

  // Auto-advance between tabs when configured (readable, step-by-step)
  useEffect(() => {
    const enableAutoAdvance = !!autoAdvanceMs && items.length > 1;
    if (!enableAutoAdvance) return;

    const findNextIndex = (current?: string): number | null => {
      const currentIndex = current ? values.indexOf(current) : -1;
      if (currentIndex < 0) return 0; // not found: start from first
      const next = currentIndex + 1;
      if (next < values.length) return next; // middle case
      return loop ? 0 : null; // end reached
    };

    const advanceToNextTab = () => {
      const nextIndex = findNextIndex(active);
      if (nextIndex === null) return;
      activate(values[nextIndex]);
    };

    const intervalId = window.setInterval(advanceToNextTab, autoAdvanceMs);
    return () => window.clearInterval(intervalId);
  }, [autoAdvanceMs, active, loop, activate, values]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (values.length === 0 || !active) return;

      const currentIndex = values.indexOf(active);
      if (currentIndex === -1) return;

      const key = event.key;
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        event.preventDefault();
        const delta = key === 'ArrowRight' ? 1 : -1;
        let nextIndex = currentIndex + delta;
        if (nextIndex < 0) {
          nextIndex = loop ? values.length - 1 : 0;
        } else if (nextIndex >= values.length) {
          nextIndex = loop ? 0 : values.length - 1;
        }
        const nextValue = values[nextIndex];
        if (nextValue !== undefined && nextValue !== active) {
          activate(nextValue);
          focusTab(nextValue);
        }
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        const nextValue =
          key === 'Home' ? values[0] : values[values.length - 1];
        if (nextValue && nextValue !== active) {
          activate(nextValue);
          focusTab(nextValue);
        }
      }
    },
    [values, active, activate, loop, focusTab]
  );

  const activeDescriptor = useMemo(() => {
    if (!descriptors.length) return undefined;
    if (!active) return descriptors[0];
    return descriptors.find(({ item }) => item.value === active) ?? descriptors[0];
  }, [descriptors, active]);

  const activeValue = activeDescriptor?.item.value ?? active ?? '';
  const activePanelId = activeDescriptor?.panelId;
  const activeTabId = activeDescriptor?.tabId;

  if (!descriptors.length || !activeDescriptor) {
    return null;
  }

  return (
    <div className={cn('w-full max-w-full rounded-md border overflow-hidden', className)}>
      <div
        className={`grid ${gridCols} w-full divide-x divide-primary/30 border-b border-primary/40`}
        role='tablist'
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-orientation='horizontal'
        onKeyDown={handleKeyDown}
      >
        {descriptors.map(({ item, tabId, panelId }) => (
          <button
            key={item.value}
            type='button'
            className={cn(
              'w-full px-3 py-2 text-sm text-center transition-colors',
              active === item.value
                ? 'bg-primary/20 text-primary font-medium border-l-2 border-primary'
                : 'hover:bg-primary/10'
            )}
            id={tabId}
            role='tab'
            aria-controls={panelId}
            aria-selected={active === item.value}
            tabIndex={active === item.value ? 0 : -1}
            onClick={() => activate(item.value)}
          >
            {item.label ?? item.value}
          </button>
        ))}
      </div>
      <div
        id={activePanelId}
        className={cn('w-full p-4', contentClassName)}
        role='tabpanel'
        aria-labelledby={activeTabId}
        tabIndex={0}
      >
        {children?.(activeValue)}
      </div>
    </div>
  );
}
