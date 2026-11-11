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
