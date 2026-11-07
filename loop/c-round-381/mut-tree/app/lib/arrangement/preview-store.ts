import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { projectEnd } from './model';

export interface ArrangementPreviewState {
  preview: Arrangement | null;
  setPreview: (next: Arrangement) => void;
  clearPreview: () => void;
}

export type ArrangementPreviewStore = StoreApi<ArrangementPreviewState>;

export function createArrangementPreviewStore(): ArrangementPreviewStore {
  return createStore<ArrangementPreviewState>()((set) => ({
    preview: null,
    setPreview: (next) =>
      set((state) => (Object.is(state.preview, next) ? state : { preview: next })),
    clearPreview: () => set((state) => (state.preview === null ? state : { preview: null })),
  }));
}

export function selectPreviewOrCommittedArrangement(
  preview: Arrangement | null,
  committed: Arrangement,
): Arrangement {
  return preview ?? committed;
}

export function selectPreviewLaneClips(
  preview: Arrangement | null,
  committed: Arrangement,
  trackId: string,
): ArrangementClip[] {
  return (preview ?? committed).clips.filter((clip) => clip.trackId === trackId);
}

export function selectPreviewProjectEnd(
  preview: Arrangement | null,
  committedProjectEnd: number,
): number {
  return preview ? projectEnd(preview) : committedProjectEnd;
}

export function selectPreviewClip(
  preview: Arrangement | null,
  committed: Arrangement,
  clipId: string | null,
): ArrangementClip | undefined {
  return clipId === null
    ? undefined
    : (preview ?? committed).clips.find((clip) => clip.id === clipId);
}

export function selectPreviewClipsAmong(
  preview: Arrangement | null,
  committed: Arrangement,
  clipIds: readonly string[],
): ArrangementClip[] {
  return (preview ?? committed).clips.filter((clip) => clipIds.includes(clip.id));
}

export type PreviewClipFieldRole = 'shown' | 'ignored';

export const SELECTED_CLIP_FIELD_ROLES: Record<keyof ArrangementClip, PreviewClipFieldRole> = {
  id: 'shown',
  trackId: 'shown',
  sourceId: 'shown',
  start: 'shown',
  sourceOffset: 'shown',
  duration: 'shown',
  gainDb: 'shown',
  fadeIn: 'ignored',
  fadeOut: 'ignored',
  envelope: 'ignored',
};

export function sameSelectedClipShownFields(
  a: ArrangementClip | undefined,
  b: ArrangementClip | undefined,
): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.id === b.id &&
    a.trackId === b.trackId &&
    a.sourceId === b.sourceId &&
    a.start === b.start &&
    a.sourceOffset === b.sourceOffset &&
    a.duration === b.duration &&
    a.gainDb === b.gainDb
  );
}

export function sameSelectedClipsShownFields(
  a: readonly ArrangementClip[],
  b: readonly ArrangementClip[],
): boolean {
  return (
    a === b ||
    (a.length === b.length && a.every((clip, index) => sameSelectedClipShownFields(clip, b[index])))
  );
}

export const OVERVIEW_CLIP_FIELD_ROLES: Record<keyof ArrangementClip, PreviewClipFieldRole> = {
  id: 'shown',
  trackId: 'shown',
  sourceId: 'ignored',
  start: 'shown',
  sourceOffset: 'ignored',
  duration: 'shown',
  gainDb: 'ignored',
  fadeIn: 'ignored',
  fadeOut: 'ignored',
  envelope: 'ignored',
};

export function sameOverviewClipShownFields(a: ArrangementClip, b: ArrangementClip): boolean {
  return (
    a === b ||
    (a.id === b.id && a.trackId === b.trackId && a.start === b.start && a.duration === b.duration)
  );
}

export function sameOverviewArrangementShownFields(a: Arrangement, b: Arrangement): boolean {
  return (
    a === b ||
    (a.tracks === b.tracks &&
      a.clips.length === b.clips.length &&
      a.clips.every((clip, index) => sameOverviewClipShownFields(clip, b.clips[index])))
  );
}
