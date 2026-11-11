import { createStore, type StoreApi } from 'zustand/vanilla';
import type { ArrangementClip, TimeRange } from '~/types/arrangement';

export interface ArrangementRangeState {
  range: TimeRange | null;
  setRange: (next: TimeRange | null) => void;
}

export type ArrangementRangeStore = StoreApi<ArrangementRangeState>;

export function createArrangementRangeStore(
  initial: TimeRange | null = null,
): ArrangementRangeStore {
  return createStore<ArrangementRangeState>()((set) => ({
    range: initial,
    setRange: (next) => set((state) => (Object.is(state.range, next) ? state : { range: next })),
  }));
}

export function isArrangementRangeInClip(
  range: TimeRange | null,
  clip: Pick<ArrangementClip, 'trackId' | 'start' | 'duration'>,
): boolean {
  return (
    range !== null &&
    !range.allTracks &&
    range.trackId === clip.trackId &&
    range.start >= clip.start - 1e-4 &&
    range.end <= clip.start + clip.duration + 1e-4
  );
}

export function selectArrangementClipRange(
  range: TimeRange | null,
  clip: Pick<ArrangementClip, 'trackId' | 'start' | 'duration'>,
): TimeRange | null {
  return isArrangementRangeInClip(range, clip) ? range : null;
}

export function selectArrangementLaneRange(
  range: TimeRange | null,
  trackId: string,
  clips: readonly Pick<ArrangementClip, 'trackId' | 'start' | 'duration'>[],
): TimeRange | null {
  if (range === null) {
    return null;
  }
  if (range.allTracks === true) {
    return range;
  }
  return range.trackId === trackId && !clips.some((clip) => isArrangementRangeInClip(range, clip))
    ? range
    : null;
}
