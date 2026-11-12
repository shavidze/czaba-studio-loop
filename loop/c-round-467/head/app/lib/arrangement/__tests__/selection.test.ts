import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { createArrangement, duplicateClips, splitClipsAtTime } from '../model';
import {
  clipsInMarquee,
  deleteClips,
  groupMoveBounds,
  moveClips,
  planClipLaneMove,
  toggleInSelection,
  unionSelection,
} from '../selection';

const trackOrder = ['video', 'music', 'sfx'];

function clip(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  sourceOffset = 0,
): ArrangementClip {
  return { id, trackId, sourceId: `src-${id}`, start, sourceOffset, duration };
}

function arrangementWith(clips: ArrangementClip[]): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
  };
}

const arrangement = arrangementWith([
  clip('v', 'video', 0, 6, 0.5),
  clip('m1', 'music', 0, 4),
  clip('m2', 'music', 8, 4),
  clip('s1', 'sfx', 3, 1),
  clip('s2', 'sfx', 5, 2),
]);

describe('toggleInSelection', () => {
  it('toggle adds a clip as the primary (last) and removes it again', () => {
    const added = toggleInSelection(['a'], 'b', 'toggle');
    expect(added).toEqual(['a', 'b']);
    expect(toggleInSelection(added, 'a', 'toggle')).toEqual(['b']);
  });

  it('Shift-add never removes, it only makes the clip primary', () => {
    expect(toggleInSelection(['a', 'b'], 'a', 'add')).toEqual(['b', 'a']);
    expect(toggleInSelection(['a'], 'c', 'add')).toEqual(['a', 'c']);
  });
});

describe('clipsInMarquee', () => {
  it('selects a partial time overlap across lanes', () => {
    expect(
      clipsInMarquee(arrangement, trackOrder, { t0: 3.5, t1: 5.5, firstTrack: 0, lastTrack: 2 }),
    ).toEqual(['v', 'm1', 's1', 's2']);
  });

  it('does not select a clip that only touches an edge', () => {
    expect(
      clipsInMarquee(arrangement, trackOrder, { t0: 4, t1: 5, firstTrack: 1, lastTrack: 2 }),
    ).toEqual([]);
    expect(
      clipsInMarquee(arrangement, trackOrder, { t0: 4, t1: 5.01, firstTrack: 1, lastTrack: 2 }),
    ).toEqual(['s2']);
  });

  it('excludes lanes outside the vertical extent', () => {
    expect(
      clipsInMarquee(arrangement, trackOrder, { t0: 0, t1: 20, firstTrack: 1, lastTrack: 1 }),
    ).toEqual(['m1', 'm2']);
  });

  it('accepts a rectangle drawn right-to-left and bottom-to-top', () => {
    expect(
      clipsInMarquee(arrangement, trackOrder, { t0: 5.5, t1: 3.5, firstTrack: 2, lastTrack: 0 }),
    ).toEqual(['v', 'm1', 's1', 's2']);
  });

  it('union mode keeps the selection from gesture start', () => {
    const base = ['m2'];
    const found = clipsInMarquee(arrangement, trackOrder, {
      t0: 2.5,
      t1: 3.5,
      firstTrack: 2,
      lastTrack: 2,
    });
    expect(unionSelection(base, found)).toEqual(['m2', 's1']);
    expect(unionSelection(['s1', 'm2'], ['m1', 's1'])).toEqual(['s1', 'm2', 'm1']);
  });
});

describe('groupMoveBounds', () => {
  it('is limited by neighbours on two lanes', () => {
    expect(groupMoveBounds(arrangement, ['m2', 's1'])).toEqual({ minDelta: -3, maxDelta: 1 });
    expect(groupMoveBounds(arrangement, ['m2', 's2'])).toEqual({
      minDelta: -1,
      maxDelta: Number.POSITIVE_INFINITY,
    });
  });

  it('is limited by time 0', () => {
    expect(groupMoveBounds(arrangement, ['m1', 's1'])).toEqual({ minDelta: 0, maxDelta: 1 });
    expect(groupMoveBounds(arrangement, ['v'])).toEqual({
      minDelta: 0,
      maxDelta: Number.POSITIVE_INFINITY,
    });
  });
});

describe('moveClips', () => {
  it('preserves relative starts, durations and source offsets', () => {
    const moved = moveClips(arrangement, ['v', 'm2', 's2'], 1);
    if (!moved) throw new Error('blocked');
    const byId = new Map(moved.clips.map((entry) => [entry.id, entry]));
    expect(byId.get('v')).toEqual({ ...clip('v', 'video', 1, 6, 0.5) });
    expect(byId.get('m2')).toEqual(clip('m2', 'music', 9, 4));
    expect(byId.get('s2')).toEqual(clip('s2', 'sfx', 6, 2));
    expect(byId.get('m1')).toEqual(clip('m1', 'music', 0, 4));
  });

  it('returns null when blocked by a neighbour or by time 0', () => {
    expect(moveClips(arrangement, ['m2', 's1'], 1.5)).toBeNull();
    expect(moveClips(arrangement, ['m2', 's1'], -3.5)).toBeNull();
    expect(moveClips(arrangement, ['m1', 's1'], -0.1)).toBeNull();
    expect(moveClips(arrangement, ['m2', 's1'], 1)).not.toBeNull();
  });

  it('returns the same reference for a zero delta', () => {
    expect(moveClips(arrangement, ['m1'], 0)).toBe(arrangement);
  });
});

describe('deleteClips', () => {
  it('removes only the selected clips and leaves the others untouched', () => {
    const next = deleteClips(arrangement, ['m1', 's2']);
    expect(next.clips.map((entry) => entry.id)).toEqual(['v', 'm2', 's1']);
    for (const entry of next.clips) {
      expect(entry).toBe(arrangement.clips.find((original) => original.id === entry.id));
    }
  });
});

function fourLaneArrangement(clips: ArrangementClip[]): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
  };
}

describe('duplicateClips (SRW-07, R7-U)', () => {
  it('places a single copy right after the clip on the same lane with a new id', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 0, 8, 1.5)]);
    const result = duplicateClips(base, ['m1']);
    expect(result?.conflict).toBeNull();
    expect(result?.span).toBe(8);
    const copy = result?.arrangement?.clips.find((entry) => entry.id === result.copyIds[0]);
    expect(copy).toMatchObject({ trackId: 'music', start: 8, sourceOffset: 1.5, duration: 8 });
    expect(copy?.id).not.toBe('m1');
  });

  it('shifts a group (including the video lane) by the group span and keeps offsets', () => {
    const base = fourLaneArrangement([
      clip('v', 'video', 0, 6.008),
      clip('m1', 'music', 0, 8),
      clip('s1', 'sfx', 2, 1),
    ]);
    const result = duplicateClips(base, ['s1', 'm1', 'v']);
    expect(result?.copyIds).toHaveLength(3);
    const copies = (result?.arrangement?.clips ?? []).filter((entry) =>
      result?.copyIds.includes(entry.id),
    );
    expect(copies.map((entry) => `${entry.trackId}@${entry.start}`).sort()).toEqual([
      'music@8',
      'sfx@10',
      'video@8',
    ]);
    expect(new Set(copies.map((entry) => entry.id)).size).toBe(3);
  });

  it('refuses all-or-nothing when one copy would overlap and names lane and time', () => {
    const base = fourLaneArrangement([
      clip('m1', 'music', 0, 8),
      clip('s1', 'sfx', 2, 1),
      clip('s2', 'sfx', 10.5, 1),
    ]);
    const result = duplicateClips(base, ['m1', 's1']);
    expect(result?.arrangement).toBeNull();
    expect(result?.conflict).toEqual({ trackId: 'sfx', start: 10, end: 11, occupantId: 's2' });
    expect(duplicateClips(base, [])).toBeNull();
  });
});

describe('splitClipsAtTime (SRW-07 group split, R7-U)', () => {
  it('splits only selected clips that strictly contain the playhead', () => {
    const base = fourLaneArrangement([
      clip('m1', 'music', 0, 8, 1),
      clip('s1', 'stems', 2, 4),
      clip('x1', 'sfx', 5, 1),
    ]);
    const result = splitClipsAtTime(base, ['m1', 's1', 'x1'], 3);
    expect(result?.rightIds).toHaveLength(2);
    const rights = (result?.arrangement.clips ?? []).filter((entry) =>
      result?.rightIds.includes(entry.id),
    );
    expect(rights.map((entry) => [entry.trackId, entry.start, entry.sourceOffset])).toEqual([
      ['music', 3, 4],
      ['stems', 3, 1],
    ]);
    expect(result?.arrangement.clips.find((entry) => entry.id === 'x1')).toEqual(base.clips[2]);
  });

  it('returns null when the playhead is within MIN_CLIP_DURATION of an edge or outside', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 0, 8)]);
    expect(splitClipsAtTime(base, ['m1'], 0.04)).toBeNull();
    expect(splitClipsAtTime(base, ['m1'], 7.97)).toBeNull();
    expect(splitClipsAtTime(base, ['m1'], 9)).toBeNull();
    expect(splitClipsAtTime(base, ['m1'], 0.06)?.rightIds).toHaveLength(1);
  });
});

describe('planClipLaneMove (SRW-08, R8-U)', () => {
  it('moves a single clip to a free place on another audio lane', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 2, 4)]);
    const plan = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 1,
    });
    expect(plan.refusal).toBeNull();
    expect(plan.arrangement?.clips).toEqual([{ ...base.clips[0], trackId: 'stems', start: 3 }]);
  });

  it('keeps the start exactly with a zero time delta (Shift lock)', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 2.123, 4)]);
    const plan = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'sfx',
      timeDelta: 0,
    });
    expect(plan.arrangement?.clips[0]).toMatchObject({ trackId: 'sfx', start: 2.123 });
  });

  it('refuses an occupied place and the video lane', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 2, 4), clip('t1', 'stems', 4, 2)]);
    const occupied = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 0,
    });
    expect(occupied.refusal).toBe('overlap');
    expect(occupied.arrangement).toBeNull();
    expect(occupied.conflict?.occupantId).toBe('t1');
    const video = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'video',
      timeDelta: 0,
    });
    expect(video.refusal).toBe('video-lane');
    expect(video.placements[0]).toMatchObject({ trackId: 'video', start: 2 });
  });

  it('applies the lane delta to every group member all-or-nothing', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 0, 2), clip('t1', 'stems', 3, 2)]);
    const down = planClipLaneMove(base, {
      clipIds: ['m1', 't1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 0.5,
    });
    expect(down.refusal).toBeNull();
    expect(down.arrangement?.clips.map((entry) => [entry.trackId, entry.start])).toEqual([
      ['stems', 0.5],
      ['sfx', 3.5],
    ]);
    const bottom = fourLaneArrangement([clip('m1', 'music', 0, 2), clip('x1', 'sfx', 3, 2)]);
    const outOfRange = planClipLaneMove(bottom, {
      clipIds: ['m1', 'x1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 0,
    });
    expect(outOfRange.refusal).toBe('out-of-range');
  });

  it('refuses the lane part for a group with a video member or an overlapping member', () => {
    const withVideo = fourLaneArrangement([clip('v', 'video', 0, 6), clip('m1', 'music', 0, 2)]);
    expect(
      planClipLaneMove(withVideo, {
        clipIds: ['v', 'm1'],
        anchorClipId: 'm1',
        targetTrackId: 'stems',
        timeDelta: 0,
      }).refusal,
    ).toBe('video-clip');
    const blocked = fourLaneArrangement([
      clip('m1', 'music', 0, 2),
      clip('t1', 'stems', 3, 2),
      clip('x1', 'sfx', 4, 1),
    ]);
    const plan = planClipLaneMove(blocked, {
      clipIds: ['m1', 't1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 0,
    });
    expect(plan.refusal).toBe('overlap');
    expect(plan.conflict).toMatchObject({ trackId: 'sfx', occupantId: 'x1' });
  });
});

describe('planClipLaneMove exact time delta (C-R53-01, D-29z19)', () => {
  it('SL1 locks a cross-lane move onto a sub-millisecond clip end and still refuses a real overlap', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 2, 2), clip('t0', 'stems', 0, 6.000437)]);
    const exact = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 6.000437 - 2,
    });
    expect(exact.refusal).toBeNull();
    expect(exact.conflict).toBeNull();
    const moved = exact.arrangement?.clips.find((entry) => entry.id === 'm1');
    expect(moved?.trackId).toBe('stems');
    expect(moved?.start).toBeCloseTo(6.000437, 9);
    const overlapping = planClipLaneMove(base, {
      clipIds: ['m1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 4,
    });
    expect(overlapping.refusal).toBe('overlap');
    expect(overlapping.conflict?.occupantId).toBe('t0');
  });

  it('SL2 keeps grid-snapped group starts free of float noise', () => {
    const base = fourLaneArrangement([clip('m1', 'music', 0, 2), clip('t1', 'stems', 3, 2)]);
    const plan = planClipLaneMove(base, {
      clipIds: ['m1', 't1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: 0.1 * 3,
    });
    expect(plan.refusal).toBeNull();
    expect(plan.arrangement?.clips.map((entry) => [entry.trackId, entry.start])).toEqual([
      ['stems', 0.3],
      ['sfx', 3.3],
    ]);
  });
});
