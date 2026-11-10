export interface ImeCompositionKeyEvent {
  keyCode: number;
  nativeEvent: Pick<KeyboardEvent, 'isComposing'>;
}

export function isImeCompositionKeyDown(event: ImeCompositionKeyEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}
