import { useEffect } from 'react';

export type FocusSourceKind = 'pointer' | 'keyboard';

const FOCUS_SOURCE_MODIFIER_KEYS: ReadonlySet<string> = new Set([
  'Shift',
  'Control',
  'Alt',
  'AltGraph',
  'Meta',
  'CapsLock',
  'Fn',
  'OS',
]);

export function isFocusSourceModifierKey(key: string): boolean {
  return FOCUS_SOURCE_MODIFIER_KEYS.has(key);
}

export function installFocusSourceTracking(doc: Document): () => void {
  const root = doc.documentElement;
  const setFocusSource = (kind: FocusSourceKind) => {
    root.dataset.focusSource = kind;
  };
  const handlePointerDown = () => {
    setFocusSource('pointer');
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isFocusSourceModifierKey(event.key)) {
      return;
    }
    setFocusSource('keyboard');
  };
  doc.addEventListener('pointerdown', handlePointerDown, true);
  doc.addEventListener('keydown', handleKeyDown, true);
  return () => {
    doc.removeEventListener('pointerdown', handlePointerDown, true);
    doc.removeEventListener('keydown', handleKeyDown, true);

  };
}

export function useFocusSourceAttribute(): void {
  useEffect(() => installFocusSourceTracking(document), []);
}
