export function getShortcutModifier(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    return '⌘';
  }
  return 'Ctrl+';
}

export function formatShortcut(key: string, useAltModifier = false): string {
  const modifier = getShortcutModifier();
  if (!useAltModifier) return `${modifier}${key}`;
  return modifier === '⌘' ? `${modifier}⌥${key}` : `${modifier}Alt+${key}`;
}
