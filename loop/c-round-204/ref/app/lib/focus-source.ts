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

const FOCUS_SOURCE_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'text',
  'search',
  'email',
  'password',
  'url',
  'tel',
  'number',
]);

const FOCUS_SOURCE_FIELD_EDITING_KEYS: ReadonlySet<string> = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Process',
  'Dead',
]);

const FOCUS_SOURCE_MULTILINE_EDITING_KEYS: ReadonlySet<string> = new Set([
  'Enter',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
]);

export function isFocusSourceFieldEditingKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey || typeof event.key !== 'string') {
    return false;
  }
  const target = event.target;
  const isMultiLine =
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable === true);
  const isSingleLine =
    target instanceof HTMLInputElement && FOCUS_SOURCE_TEXT_INPUT_TYPES.has(target.type);
  if (!isMultiLine && !isSingleLine) {
    return false;
  }
  if (event.key.length === 1 || FOCUS_SOURCE_FIELD_EDITING_KEYS.has(event.key)) {
    return true;
  }
  return isMultiLine && FOCUS_SOURCE_MULTILINE_EDITING_KEYS.has(event.key);
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
    if (isFocusSourceModifierKey(event.key) || isFocusSourceFieldEditingKey(event)) {
      return;
    }
    setFocusSource('keyboard');
  };
  doc.addEventListener('pointerdown', handlePointerDown, true);
  doc.addEventListener('keydown', handleKeyDown, true);
  return () => {
    doc.removeEventListener('pointerdown', handlePointerDown, true);
    doc.removeEventListener('keydown', handleKeyDown, true);
    delete root.dataset.focusSource;
  };
}

export function useFocusSourceAttribute(): void {
  useEffect(() => installFocusSourceTracking(document), []);
}
