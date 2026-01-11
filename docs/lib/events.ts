/**
 * Custom event name dispatched when the docs sidebar should toggle its open state.
 */
export const DOCS_TOGGLE_SIDEBAR_EVENT = 'docs:toggle-sidebar' as const;

/**
 * Type-safe event payload associated with {@link DOCS_TOGGLE_SIDEBAR_EVENT}.
 */
export type ToggleSidebarEvent =
  WindowEventMap[typeof DOCS_TOGGLE_SIDEBAR_EVENT];
