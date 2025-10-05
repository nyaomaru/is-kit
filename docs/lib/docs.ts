import {
  INSTALL_TABS,
  INSTALL_COMMANDS,
  USAGE_TABS,
  USAGE_SNIPPETS,
} from '@/constants/docs';

/**
 * Ordered list of installers rendered in the installation code tabs.
 */
export const installTabs = INSTALL_TABS;

/**
 * Retrieve the install command snippet for the given installer.
 * @param tab Installer key drawn from {@link installTabs}.
 */
export function installCode(tab: (typeof installTabs)[number]): string {
  return INSTALL_COMMANDS[tab];
}

/**
 * Usage examples that drive the usage code tab labels.
 */
export const usageTabs = USAGE_TABS;

/**
 * Return the usage example snippet for the provided tab key.
 * @param tab Usage scenario key from {@link usageTabs}.
 */
export function usageCode(tab: (typeof usageTabs)[number]): string {
  return USAGE_SNIPPETS[tab];
}
