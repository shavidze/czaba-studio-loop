import { createStore, type StoreApi } from 'zustand/vanilla';

export interface ArrangementPlaybackState {
  isPlaying: boolean;
  setPlaying: (next: boolean) => void;
}

export type ArrangementPlaybackStore = StoreApi<ArrangementPlaybackState>;

export function createArrangementPlaybackStore(): ArrangementPlaybackStore {
  return createStore<ArrangementPlaybackState>()((set) => ({
    isPlaying: false,
    setPlaying: (next) => set((state) => (state.isPlaying === next ? state : { isPlaying: next })),
  }));
}
