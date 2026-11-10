import type { Arrangement, ArrangementClip, ScheduledClip } from '~/types/arrangement';
import { planSchedule } from './schedule';

export interface ClipScheduleDiff {
  changedClipIds: string[];
}

function clipScheduleJson(clip: ArrangementClip): string {
  return JSON.stringify(clip, (key, value) => (key === 'gainDb' ? undefined : value));
}

function trackIdsInOrder(arrangement: Arrangement): string {
  return JSON.stringify(arrangement.tracks.map((track) => track.id));
}

export function diffClipSchedule(
  previous: Arrangement,
  next: Arrangement,
): ClipScheduleDiff | null {
  if (JSON.stringify(previous.loop) !== JSON.stringify(next.loop)) {
    return null;
  }
  if (trackIdsInOrder(previous) !== trackIdsInOrder(next)) {
    return null;
  }
  const previousClips = new Map(previous.clips.map((clip) => [clip.id, clip]));
  const nextIds = new Set(next.clips.map((clip) => clip.id));
  if (
    previousClips.size !== nextIds.size ||
    previous.clips.length !== previousClips.size ||
    next.clips.length !== nextIds.size
  ) {
    return null;
  }
  const changedClipIds: string[] = [];
  for (const clip of next.clips) {
    const before = previousClips.get(clip.id);
    if (!before) {
      return null;
    }
    if (clipScheduleJson(before) !== clipScheduleJson(clip)) {
      changedClipIds.push(clip.id);
    }
  }
  return { changedClipIds };
}

export function planChangedClips(
  next: Arrangement,
  changedClipIds: readonly string[],
  from: number,
): ScheduledClip[] {
  const ids = new Set(changedClipIds);
  return planSchedule(next, from).filter((item) => ids.has(item.clipId));
}
