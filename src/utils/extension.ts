
export const GREEN_ICON = 'icon-128-green.png';
export const RED_ICON = 'icon-128-red.png';
export const DEFAULT_ICON = 'icon-128-default.png';

export function setExtensionIcon(icon: string): void {
  chrome.action.setIcon({ path: icon }, () => {});
}
