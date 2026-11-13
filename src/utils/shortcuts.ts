export function getShortcutModifier(): string {
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    return '⌘';
  }
  return 'Ctrl+';
}

export function formatShortcut(key: string): string {
  return `${getShortcutModifier()}${key}`;
}
