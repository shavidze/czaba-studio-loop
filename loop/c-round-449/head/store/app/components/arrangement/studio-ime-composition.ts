export interface ImeCompositionKeyEvent {
  keyCode: number;
  nativeEvent: Pick<KeyboardEvent, 'isComposing'>;
}

export type NativeImeCompositionKeyEvent = Pick<KeyboardEvent, 'isComposing' | 'keyCode'>;

export function isNativeImeCompositionKeyDown(event: NativeImeCompositionKeyEvent): boolean {
  return event.isComposing || event.keyCode === 229;
}

export function isImeCompositionKeyDown(event: ImeCompositionKeyEvent): boolean {
  return isNativeImeCompositionKeyDown({
    isComposing: event.nativeEvent.isComposing,
    keyCode: event.keyCode,
  });
}

export interface InlineEditorKeyEvent extends ImeCompositionKeyEvent {
  key: string;
  repeat: boolean;
}

export type InlineEditorKeyIntent = 'other' | 'composing' | 'held' | 'settle';

export type InlineEditorSettleKey = 'Enter' | 'Escape';

export const INLINE_EDITOR_SETTLE_KEYS: readonly InlineEditorSettleKey[] = ['Enter', 'Escape'];

export const INLINE_EDITOR_ENTER_ONLY_KEYS: readonly InlineEditorSettleKey[] = ['Enter'];

export function inlineEditorKeyIntent(
  event: InlineEditorKeyEvent,
  settleKeys: readonly InlineEditorSettleKey[],
): InlineEditorKeyIntent {
  if (!settleKeys.some((settleKey) => settleKey === event.key)) {
    return 'other';
  }
  if (isImeCompositionKeyDown(event)) {
    return 'composing';
  }
  return event.repeat ? 'held' : 'settle';
}
