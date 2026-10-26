import { describe, expect, it } from 'vitest';
import type { Arrangement, TimeRange } from '~/types/arrangement';
import {
  copyRangeToClipboard,
  cutRangeFromArrangement,
  cutTimeToClipboard,
  deleteRangeKeepingGap,
} from '../clipboard';
import { createArrangement, deleteTime } from '../model';

function gapArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
    { id: 'amb', kind: 'audio', name: 'Ambience' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 6.008 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 1, duration: 10 },
      { id: 'm2', trackId: 'music', sourceId: 'song', start: 12, sourceOffset: 0, duration: 4 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
      { id: 's2', trackId: 'sfx', sourceId: 'hit', start: 9, sourceOffset: 0, duration: 1 },
    ],
    loop: { start: 6, end: 8, enabled: true },
  };
}

function roundTable(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function laneTable(arrangement: Arrangement) {
  return arrangement.clips
    .map(
      (clip) =>
        [
          clip.trackId,
          roundTable(clip.start),
          roundTable(clip.sourceOffset),
          roundTable(clip.duration),
        ] as const,
    )
    .sort((left, right) =>
      left[0] === right[0] ? left[1] - right[1] : left[0].localeCompare(right[0]),
    );
}

function clipStarts(arrangement: Arrangement): Record<string, number> {
  return Object.fromEntries(arrangement.clips.map((clip) => [clip.id, clip.start]));
}

const allLanes = (start: number, end: number, trackId = 'music'): TimeRange => ({
  start,
  end,
  trackId,
  allTracks: true,
});

describe('deleteRangeKeepingGap (SRW-24, R24-1)', () => {
  it('cuts 3–5 out of an audio clip 0–10, keeps the right part offset +5 and moves nothing else', () => {
    const before = gapArrangement();
    const next = deleteRangeKeepingGap(before, { start: 3, end: 5, trackId: 'music' });
    const music = next.clips
      .filter((clip) => clip.trackId === 'music')
      .sort((left, right) => left.start - right.start);
    expect(music.map((clip) => [clip.start, clip.duration])).toEqual([
      [0, 3],
      [5, 5],
      [12, 4],
    ]);
    expect(music[0].id).toBe('m1');
    expect(music[0].sourceOffset).toBe(1);
    expect(music[1].id).not.toBe('m1');
    expect(music[1].sourceOffset).toBeCloseTo(1 + 5, 9);
    expect(music[2]).toEqual(before.clips.find((clip) => clip.id === 'm2'));
    for (const id of ['v1', 's1', 's2']) {
      expect(next.clips.find((clip) => clip.id === id)).toBe(
        before.clips.find((clip) => clip.id === id),
      );
    }
    expect(next.loop).toEqual(before.loop);
  });

  it('cuts 2–4 out of the video clip and leaves the right part at offset 4', () => {
    const before = gapArrangement();
    const next = deleteRangeKeepingGap(before, { start: 2, end: 4, trackId: 'video' });
    const video = next.clips
      .filter((clip) => clip.trackId === 'video')
      .sort((left, right) => left.start - right.start);
    expect(video).toHaveLength(2);
    expect([video[0].start, video[0].duration, video[0].sourceOffset]).toEqual([0, 2, 0]);
    expect(video[1].start).toBe(4);
    expect(video[1].sourceOffset).toBeCloseTo(4, 9);
    expect(video[1].duration).toBeCloseTo(2.008, 9);
    expect(next.clips.filter((clip) => clip.trackId !== 'video')).toEqual(
      before.clips.filter((clip) => clip.trackId !== 'video'),
    );
  });

  it('cuts a window across two adjacent clips on one lane without joining them', () => {
    const base = createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]);
    const before: Arrangement = {
      ...base,
      clips: [
        { id: 'a', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 4 },
        { id: 'b', trackId: 'music', sourceId: 'song', start: 4, sourceOffset: 10, duration: 4 },
        { id: 'c', trackId: 'music', sourceId: 'song', start: 10, sourceOffset: 0, duration: 2 },
      ],
    };
    const next = deleteRangeKeepingGap(before, { start: 3, end: 5, trackId: 'music' });
    expect(laneTable(next)).toEqual([
      ['music', 0, 0, 3],
      ['music', 5, 11, 3],
      ['music', 10, 0, 2],
    ]);
    expect(next.clips.find((clip) => clip.id === 'b')?.start).toBe(5);
  });

  it('with allTracks leaves a 3–5 gap on every lane and keeps every later start', () => {
    const before = gapArrangement();
    const next = deleteRangeKeepingGap(before, allLanes(3, 5));
    for (const clip of next.clips) {
      const end = clip.start + clip.duration;
      expect(clip.start >= 5 - 1e-9 || end <= 3 + 1e-9).toBe(true);
    }
    expect(laneTable(next)).toEqual([
      ['music', 0, 1, 3],
      ['music', 5, 6, 5],
      ['music', 12, 0, 4],
      ['sfx', 5, 1.5, 1],
      ['sfx', 9, 0, 1],
      ['video', 0, 0, 3],
      ['video', 5, 5, 1.008],
    ]);
    const starts = clipStarts(next);
    expect(starts.m2).toBe(12);
    expect(starts.s2).toBe(9);
    expect(next.loop).toEqual(before.loop);
  });

  it('returns the same object when the window holds no material (single lane and all lanes)', () => {
    const before = gapArrangement();
    expect(deleteRangeKeepingGap(before, { start: 10.5, end: 11.5, trackId: 'music' })).toBe(
      before,
    );
    expect(deleteRangeKeepingGap(before, allLanes(10.5, 11.5))).toBe(before);
    expect(deleteRangeKeepingGap(before, { start: 3, end: 5, trackId: 'amb' })).toBe(before);
  });

  it('returns the same object for a zero-width window instead of splitting the clips it crosses', () => {
    const before = gapArrangement();
    expect(deleteRangeKeepingGap(before, { start: 4.5, end: 4.5, trackId: 'music' })).toBe(before);
    expect(deleteRangeKeepingGap(before, allLanes(4.5, 4.5))).toBe(before);
  });
});

describe('the allTracks flag on the existing range edits (SRW-24, R24-2)', () => {
  it('without the flag cutRangeFromArrangement and copyRangeToClipboard stay single-lane', () => {
    const before = gapArrangement();
    const snapshot = structuredClone(before);
    const range: TimeRange = { start: 3, end: 5, trackId: 'music' };
    const cut = cutRangeFromArrangement(before, range);
    expect(before).toEqual(snapshot);
    expect(laneTable(cut).filter(([trackId]) => trackId !== 'music')).toEqual(
      laneTable(snapshot).filter(([trackId]) => trackId !== 'music'),
    );
    expect(laneTable(deleteRangeKeepingGap(before, range))).toEqual(laneTable(cut));
    expect(copyRangeToClipboard(before, range)).toEqual({
      length: 2,
      items: [{ trackId: 'music', sourceId: 'song', offset: 0, sourceOffset: 4, duration: 2 }],
    });
  });

  it('with the flag copyRangeToClipboard holds every lane with its trackId', () => {
    const clipboard = copyRangeToClipboard(gapArrangement(), allLanes(3, 5, 'sfx'));
    expect(clipboard?.length).toBe(2);
    expect(
      [...(clipboard?.items ?? [])].sort((left, right) =>
        left.trackId.localeCompare(right.trackId),
      ),
    ).toEqual([
      { trackId: 'music', sourceId: 'song', offset: 0, sourceOffset: 4, duration: 2 },
      { trackId: 'sfx', sourceId: 'hit', offset: 1, sourceOffset: 0.5, duration: 1 },
      { trackId: 'video', sourceId: 'film', offset: 0, sourceOffset: 3, duration: 2 },
    ]);
  });

  it('with the flag cutRangeFromArrangement equals the gap-keeping delete', () => {
    const before = gapArrangement();
    expect(laneTable(cutRangeFromArrangement(before, allLanes(3, 5)))).toEqual(
      laneTable(deleteRangeKeepingGap(before, allLanes(3, 5))),
    );
    expect(laneTable(cutRangeFromArrangement(before, allLanes(3, 5)))).not.toEqual(
      laneTable(cutRangeFromArrangement(before, { start: 3, end: 5, trackId: 'music' })),
    );
  });

  it('Cut Time on an all-lane window still equals deleteTime (the flag never changes Cut Time)', () => {
    const before = gapArrangement();
    const result = cutTimeToClipboard(before, 3, 5);
    expect(laneTable(result.arrangement)).toEqual(laneTable(deleteTime(before, 3, 5)));
    expect(result.arrangement.loop).toEqual(deleteTime(before, 3, 5).loop);
    expect(clipStarts(result.arrangement).m2).toBe(10);
    expect(clipStarts(result.arrangement).s2).toBe(7);
    expect(result.clipboard.items).toEqual(copyRangeToClipboard(before, allLanes(3, 5))?.items);
  });
});
