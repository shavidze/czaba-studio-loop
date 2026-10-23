export interface ArrangementStatusEntry {
  readonly text: string;
  readonly sequence: number;
}

export type ArrangementStatusUpdate = string | ((current: string) => string);

export function createArrangementStatusEntry(text: string): ArrangementStatusEntry {
  return { text, sequence: 0 };
}

export function reduceArrangementStatus(
  previous: ArrangementStatusEntry,
  next: ArrangementStatusUpdate,
): ArrangementStatusEntry {
  if (typeof next === 'string') {
    return { text: next, sequence: previous.sequence + 1 };
  }
  const text = next(previous.text);
  if (text === previous.text) {
    return previous;
  }
  return { text, sequence: previous.sequence + 1 };
}
