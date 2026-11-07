import { createStore, type StoreApi } from 'zustand/vanilla';

export interface ClipLaneGhost {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
  blocked: boolean;
  message: string | null;
}

export interface ClipLaneDragState {
  ghosts: readonly ClipLaneGhost[];
  timeLocked: boolean;
}

export interface ArrangementClipLaneDragStoreState {
  drag: ClipLaneDragState | null;
  setDrag: (next: ClipLaneDragState | null) => void;
}

export type ArrangementClipLaneDragStore = StoreApi<ArrangementClipLaneDragStoreState>;

const NO_LANE_GHOSTS: readonly ClipLaneGhost[] = [];

export function createArrangementClipLaneDragStore(): ArrangementClipLaneDragStore {
  return createStore<ArrangementClipLaneDragStoreState>()((set) => ({
    drag: null,
    setDrag: (next) => set((state) => (Object.is(state.drag, next) ? state : { drag: next })),
  }));
}

export function selectLaneDragGhosts(
  drag: ClipLaneDragState | null,
  trackId: string,
): readonly ClipLaneGhost[] {
  return drag ? drag.ghosts.filter((ghost) => ghost.trackId === trackId) : NO_LANE_GHOSTS;
}

export function selectLaneMoveSourceKey(
  drag: ClipLaneDragState | null,
  clipIds: readonly string[],
): string {
  if (!drag) {
    return '';
  }
  return clipIds
    .filter((clipId) => drag.ghosts.some((ghost) => ghost.clipId === clipId && !ghost.blocked))
    .join('\n');
}

export function selectLaneMoveRefusal(drag: ClipLaneDragState | null): string | null {
  return drag?.ghosts.find((ghost) => ghost.blocked && ghost.message)?.message ?? null;
}
