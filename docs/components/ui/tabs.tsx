'use client';
import { useCallback, useEffect, useMemo, useState, useId } from 'react';
import type { KeyboardEvent } from 'react';

import { cn } from '@/lib/utils';

const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_HOME = 'Home';
const KEY_END = 'End';
const GRID_CLASSES_BY_COUNT: Record<number, string[]> = {
  1: ['md:grid-cols-1'],
  2: ['md:grid-cols-2'],
  3: ['md:grid-cols-3'],
  4: ['md:grid-cols-4']
};
const GRID_CLASSES_DEFAULT = ['md:auto-cols-fr', 'md:grid-flow-col'];

type TabItem = {
  /** Stable identifier that maps tab to its panel. */
  value: string;
  /** Optional human readable label shown in the tab button. */
  label?: string;
};

type TabDescriptor = {
  /** Source tab item metadata. */
  item: TabItem;
  /** Element id for the tab trigger. */
  tabId: string;
  /** Element id for the tab panel. */
  panelId: string;
};

type TabListProps = {
  /** Descriptor set for the tablist. */
  descriptors: readonly TabDescriptor[];
  /** Active tab value. */
  activeValue: string;
  /** Grid classes derived from the item count. */
  gridClasses: readonly string[];
  /** Accessible name for the tablist when aria-labelledby is unavailable. */
  ariaLabel?: string;
  /** Element id that labels the tablist; preferred over ariaLabel. */
  ariaLabelledBy?: string;
  /** Keyboard handler for the tablist. */
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Activates a tab by value. */
  onActivate: (value: string) => void;
};

type TabPanelProps = {
  /** Element id for the active panel. */
  id: string;
  /** Element id that labels the panel. */
  ariaLabelledBy: string;
  /** Extra classes for the panel container. */
  className?: string;
  /** Active tab value passed to the render prop. */
  activeValue: string;
  /** Render prop that receives the active tab value. */
  children?: (active: string) => React.ReactNode;
};

/**
 * Calculates the next index for arrow-key navigation.
 * @param key Keyboard key pressed.
 * @param currentIndex Current active index.
 * @param length Total number of tabs.
 * @param loop Whether navigation wraps at the ends.
 * @returns Next index, or null when the key is not an arrow key.
 */
const getNextIndexForArrowKey = (
  key: string,
  currentIndex: number,
  length: number,
  loop: boolean
): number | null => {
  if (key !== KEY_ARROW_RIGHT && key !== KEY_ARROW_LEFT) return null;

  const delta = key === KEY_ARROW_RIGHT ? 1 : -1;
  const nextIndex = currentIndex + delta;

  if (loop) {
    return ((nextIndex % length) + length) % length;
  }

  return Math.max(0, Math.min(length - 1, nextIndex));
};

/**
 * Resolves the index for Home/End keyboard navigation.
 * @param key Keyboard key pressed.
 * @param length Total number of tabs.
 * @returns Target index, or null when the key is not Home/End.
 */
const getIndexForHomeEndKey = (key: string, length: number): number | null => {
  if (key === KEY_HOME) return 0;
  if (key === KEY_END) return length - 1;
  return null;
};

/**
 * Determines the next active tab value for keyboard navigation.
 * @param key Keyboard key pressed.
 * @param active Current active tab value.
 * @param values List of tab values.
 * @param loop Whether navigation wraps at the ends.
 * @returns Next tab value or null when no navigation applies.
 */
const resolveNextValue = (
  key: string,
  active: string | undefined,
  values: readonly string[],
  loop: boolean
): string | null => {
  const currentIndex = getCurrentIndex(active, values);
  if (currentIndex === null) return null;

  const arrowIndex = getNextIndexForArrowKey(
    key,
    currentIndex,
    values.length,
    loop
  );
  if (arrowIndex !== null) return values[arrowIndex] ?? null;

  const homeEndIndex = getIndexForHomeEndKey(key, values.length);
  return homeEndIndex !== null ? (values[homeEndIndex] ?? null) : null;
};

/**
 * Resolves the current index for the active tab value.
 * @param active Current active tab value.
 * @param values List of tab values.
 * @returns Active index or null when inactive.
 */
const getCurrentIndex = (
  active: string | undefined,
  values: readonly string[]
): number | null => {
  if (!active) return null;
  if (values.length === 0) return null;

  const currentIndex = values.indexOf(active);
  return currentIndex === -1 ? null : currentIndex;
};

/**
 * Resolves the initial tab value when the requested default is unavailable.
 * @param values List of tab values.
 * @param defaultValue Value requested by the caller.
 * @returns Fallback tab value or undefined when no items exist.
 */
const getFallbackTabValue = (
  values: readonly string[],
  defaultValue: string
): string | undefined => {
  if (values.length === 0) return undefined;
  if (defaultValue && values.includes(defaultValue)) return defaultValue;
  return values[0];
};

/**
 * Maps item counts to tab grid classes.
 * @param length Number of tab items.
 * @returns Class names used for the tablist grid layout.
 */
const getGridClasses = (length: number): string[] =>
  GRID_CLASSES_BY_COUNT[length] ?? GRID_CLASSES_DEFAULT;

/**
 * Builds tab descriptors with stable ids for tabs and panels.
 * @param items Tab items used to build descriptors.
 * @param baseId Base id derived from React's useId.
 * @returns Tab descriptors with ids for each tab and panel.
 */
const createTabDescriptors = (
  items: readonly TabItem[],
  baseId: string
): TabDescriptor[] =>
  items.map((item, index) => ({
    item,
    tabId: `${baseId}-tab-${index}`,
    panelId: `${baseId}-panel-${index}`
  }));

/**
 * Resolves the active descriptor, defaulting to the first when missing.
 * @param descriptors Tab descriptors to search.
 * @param active Active tab value.
 * @returns Active descriptor or undefined when there are no tabs.
 */
const getActiveDescriptor = (
  descriptors: readonly TabDescriptor[],
  active?: string
): TabDescriptor | undefined => {
  if (descriptors.length === 0) return undefined;
  if (!active) return descriptors[0];
  return (
    descriptors.find(({ item }) => item.value === active) ?? descriptors[0]
  );
};

/**
 * Determines whether auto-advancing should be enabled.
 * @param autoAdvanceMs Interval in milliseconds between advances.
 * @param itemCount Total number of tab items.
 * @returns True when auto-advance should run.
 */
const shouldAutoAdvance = (autoAdvanceMs: number, itemCount: number) =>
  Boolean(autoAdvanceMs) && itemCount > 1;

/**
 * Resolves the next index for auto-advance behavior.
 * @param active Current active tab value.
 * @param values List of tab values.
 * @param loop Whether to wrap at the end.
 * @returns Next index or null when no advance is possible.
 */
const getNextAutoAdvanceIndex = (
  active: string | undefined,
  values: readonly string[],
  loop: boolean
): number | null => {
  if (values.length === 0) return null;

  const currentIndex = active ? values.indexOf(active) : -1;
  if (currentIndex < 0) return 0;

  const next = currentIndex + 1;
  if (next < values.length) return next;

  return loop ? 0 : null;
};

/**
 * Manages active tab state and activation callback.
 * @param initialValue Initial active tab value.
 * @param onChange Optional change handler invoked on activation.
 * @returns Active value and activation handler.
 */
const useTabActivation = (
  initialValue: string | undefined,
  onChange?: (value: string) => void
) => {
  const [active, setActive] = useState<string | undefined>(initialValue);
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

  return { active, activate };
};

/**
 * Returns a focus helper for the tab elements.
 * @param descriptors Tab descriptors used to resolve element ids.
 * @returns Callback that focuses the tab with the matching value.
 */
const useTabFocus = (descriptors: readonly TabDescriptor[]) =>
  useCallback(
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

/**
 * Ensures the active tab remains valid when items change.
 * @param values List of tab values.
 * @param fallbackValue Fallback value for activation.
 * @param active Current active value.
 * @param activate Callback that updates the active tab.
 */
const useEnsureActiveTab = (
  values: readonly string[],
  fallbackValue: string | undefined,
  active: string | undefined,
  activate: (value: string) => void
) => {
  useEffect(() => {
    if (values.length === 0) return;
    if (fallbackValue === undefined) return;
    if (active && values.includes(active)) return;
    activate(fallbackValue);
  }, [values, fallbackValue, active, activate]);
};

type AutoAdvanceConfig = {
  /** Auto-advance interval in milliseconds. */
  autoAdvanceMs?: number;
  /** Tab values in order. */
  values: readonly string[];
  /** Current active tab value. */
  active: string | undefined;
  /** Whether auto-advance wraps at the end. */
  loop: boolean;
  /** Total number of tab items. */
  itemCount: number;
  /** Callback used to activate the next tab. */
  activate: (value: string) => void;
};

/**
 * Auto-advances tab selection on a timer when enabled.
 * @param config Auto-advance configuration.
 */
const useAutoAdvanceTabs = ({
  autoAdvanceMs,
  values,
  active,
  loop,
  itemCount,
  activate
}: AutoAdvanceConfig) => {
  useEffect(() => {
    const intervalMs = autoAdvanceMs ?? 0;
    if (!shouldAutoAdvance(intervalMs, itemCount)) return;

    const intervalId = window.setInterval(() => {
      const nextIndex = getNextAutoAdvanceIndex(active, values, loop);
      if (nextIndex === null) return;
      activate(values[nextIndex]);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [autoAdvanceMs, itemCount, active, loop, activate, values]);
};

type KeyDownConfig = {
  /** Current active tab value. */
  active: string | undefined;
  /** Tab values in order. */
  values: readonly string[];
  /** Whether navigation wraps at the ends. */
  loop: boolean;
  /** Callback to activate a tab. */
  activate: (value: string) => void;
  /** Callback to focus a tab by value. */
  focusTab: (value: string) => void;
};

/**
 * Creates a keyboard handler for tab navigation.
 * @param config Keyboard navigation configuration.
 * @returns Keydown handler for the tablist.
 */
const useTabKeyDownHandler = ({
  active,
  values,
  loop,
  activate,
  focusTab
}: KeyDownConfig) =>
  useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const nextValue = resolveNextValue(event.key, active, values, loop);
      if (!nextValue) return;

      event.preventDefault();
      if (nextValue === active) return;

      activate(nextValue);
      focusTab(nextValue);
    },
    [values, active, activate, loop, focusTab]
  );

const TabList = ({
  descriptors,
  activeValue,
  gridClasses,
  ariaLabel,
  ariaLabelledBy,
  onKeyDown,
  onActivate
}: TabListProps) => (
  <div className='overflow-x-auto md:overflow-x-visible'>
    <div
      className={cn(
        'flex w-full min-w-max divide-x divide-primary/30 border-b border-primary/40 md:grid md:min-w-0',
        gridClasses
      )}
      role='tablist'
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-orientation='horizontal'
      onKeyDown={onKeyDown}
    >
      {descriptors.map(({ item, tabId, panelId }) => {
        const isActive = activeValue === item.value;
        return (
          <button
            key={item.value}
            type='button'
            className={cn(
              'flex-none whitespace-nowrap px-3 py-2 text-sm text-center transition-colors md:flex-1 md:whitespace-normal',
              isActive
                ? 'bg-primary/20 text-primary font-medium border-primary'
                : 'hover:bg-primary/10'
            )}
            id={tabId}
            role='tab'
            aria-controls={panelId}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onActivate(item.value)}
          >
            {item.label ?? item.value}
          </button>
        );
      })}
    </div>
  </div>
);

const TabPanel = ({
  id,
  ariaLabelledBy,
  className,
  activeValue,
  children
}: TabPanelProps) => (
  <div
    id={id}
    className={cn('w-full p-6', className)}
    role='tabpanel'
    aria-labelledby={ariaLabelledBy}
    tabIndex={0}
  >
    {children?.(activeValue)}
  </div>
);

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
  children
}: TabsProps) {
  const baseId = useId();
  const values = useMemo(() => items.map((item) => item.value), [items]);
  const fallbackValue = useMemo(
    () => getFallbackTabValue(values, defaultValue),
    [defaultValue, values]
  );
  const { active, activate } = useTabActivation(fallbackValue, onChange);
  const gridClasses = useMemo(
    () => getGridClasses(items.length),
    [items.length]
  );
  const descriptors = useMemo(
    () => createTabDescriptors(items, baseId),
    [items, baseId]
  );
  const focusTab = useTabFocus(descriptors);

  useEnsureActiveTab(values, fallbackValue, active, activate);
  useAutoAdvanceTabs({
    autoAdvanceMs,
    values,
    active,
    loop,
    itemCount: items.length,
    activate
  });

  const handleKeyDown = useTabKeyDownHandler({
    active,
    values,
    loop,
    activate,
    focusTab
  });

  const activeDescriptor = useMemo(
    () => getActiveDescriptor(descriptors, active),
    [descriptors, active]
  );

  if (!activeDescriptor) {
    return null;
  }

  const activeValue = activeDescriptor.item.value;

  return (
    <div className={cn('w-full max-w-full rounded-md border', className)}>
      <TabList
        descriptors={descriptors}
        activeValue={activeValue}
        gridClasses={gridClasses}
        ariaLabel={ariaLabel}
        ariaLabelledBy={ariaLabelledBy}
        onKeyDown={handleKeyDown}
        onActivate={activate}
      />
      <TabPanel
        id={activeDescriptor.panelId}
        ariaLabelledBy={activeDescriptor.tabId}
        className={contentClassName}
        activeValue={activeValue}
      >
        {children}
      </TabPanel>
    </div>
  );
}
