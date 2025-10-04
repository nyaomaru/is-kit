import {
  INSTALL_TABS,
  INSTALL_COMMANDS,
  USAGE_TABS,
  USAGE_SNIPPETS,
} from '@/constants/docs';

export const installTabs = INSTALL_TABS;
export function installCode(tab: (typeof installTabs)[number]): string {
  return INSTALL_COMMANDS[tab];
}

export const usageTabs = USAGE_TABS;
export function usageCode(tab: (typeof usageTabs)[number]): string {
  return USAGE_SNIPPETS[tab];
}
