import { createStore, type StoreApi } from 'zustand/vanilla';

export const NO_SELECTION: readonly string[] = [];

export interface ArrangementSelectionState {
  selectedClipIds: readonly string[];
  activeTrackId: string | null;
  setSelectedClipIds: (next: readonly string[]) => void;
  setActiveTrackId: (next: string | null) => void;
}

export type ArrangementSelectionStore = StoreApi<ArrangementSelectionState>;

export function isSameOrderedSelection(
  previous: readonly string[],
  next: readonly string[],
): boolean {
  return (
    Object.is(previous, next) ||
    (previous.length === next.length && previous.every((id, index) => id === next[index]))
  );
}

export function createArrangementSelectionStore(
  initial: readonly string[] = NO_SELECTION,
  initialActiveTrackId: string | null = null,
): ArrangementSelectionStore {
  return createStore<ArrangementSelectionState>()((set) => ({
    selectedClipIds: initial,
    activeTrackId: initialActiveTrackId,
    setSelectedClipIds: (next) =>
      set((state) =>
        isSameOrderedSelection(state.selectedClipIds, next) ? state : { selectedClipIds: next },
      ),
    setActiveTrackId: (next) =>
      set((state) => (state.activeTrackId === next ? state : { activeTrackId: next })),
  }));
}

export function selectedClipIdsKeyAmong(
  selectedClipIds: readonly string[],
  candidateClipIds: readonly string[],
): string {
  if (selectedClipIds.length === 0 || candidateClipIds.length === 0) {
    return '';
  }
  return selectedClipIds.filter((id) => candidateClipIds.includes(id)).join('\u0000');
}

export function selectedClipIdSetFromKey(key: string): ReadonlySet<string> {
  return new Set(key === '' ? [] : key.split('\u0000'));
}
