import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import {
  addClip,
  appendVideoClip,
  commitHistory,
  createArrangement,
  createHistory,
  deleteClip,
  deleteTime,
  findFreeStart,
  moveClip,
  projectEnd,
  redoHistory,
  remapTime,
  setTrackMix,
  splitClipAt,
  splitClipsByRange,
  toggleSolo,
  trimClipEnd,
  trimClipStart,
  undoHistory,
} from '../model';

function baseArrangement(clips: ArrangementClip[] = []): Arrangement {
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

function clip(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  sourceOffset = 0,
  sourceId = 'src',
): ArrangementClip {
  return { id, trackId, sourceId, start, sourceOffset, duration };
}

function find(arrangement: Arrangement, id: string): ArrangementClip {
  const found = arrangement.clips.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing clip ${id}`);
  return found;
}

const durations = new Map([['src', 20]]);

describe('createArrangement', () => {
  it('requires exactly one video track', () => {
    expect(() => createArrangement([{ id: 'a', kind: 'audio', name: 'A' }])).toThrow();
    expect(baseArrangement().tracks.filter((track) => track.kind === 'video')).toHaveLength(1);
  });
});

describe('addClip', () => {
  it('places a clip at the requested free spot', () => {
    const result = addClip(baseArrangement(), {
      trackId: 'sfx',
      sourceId: 'impact',
      desiredStart: 3,
      sourceDuration: 2,
    });
    expect(result?.clip).toMatchObject({ trackId: 'sfx', start: 3, sourceOffset: 0, duration: 2 });
  });

  it('falls back to the nearest free start when the spot is taken', () => {
    const arrangement = baseArrangement([clip('a', 'sfx', 2, 4)]);
    const result = addClip(arrangement, {
      trackId: 'sfx',
      sourceId: 'impact',
      desiredStart: 5,
      sourceDuration: 2,
    });
    expect(result?.clip.start).toBe(6);
    const before = addClip(arrangement, {
      trackId: 'sfx',
      sourceId: 'impact',
      desiredStart: 2.5,
      sourceDuration: 2,
    });
    expect(before?.clip.start).toBe(0);
  });

  it('refuses the video track', () => {
    expect(
      addClip(baseArrangement(), {
        trackId: 'video',
        sourceId: 'x',
        desiredStart: 0,
        sourceDuration: 2,
      }),
    ).toBeNull();
  });

  it('findFreeStart never caps at 60 seconds', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 70)]);
    expect(findFreeStart(arrangement, 'music', 10, 30)).toBe(70);
  });
});

describe('moveClip', () => {
  it('moves the start and keeps sourceOffset', () => {
    const moved = moveClip(baseArrangement([clip('a', 'music', 0, 4, 1.5)]), 'a', 2);
    expect(moved && find(moved, 'a')).toMatchObject({ start: 2, sourceOffset: 1.5, duration: 4 });
  });

  it('is blocked by a neighbour on the same track', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 4), clip('b', 'music', 6, 4)]);
    expect(moveClip(arrangement, 'a', 3)).toBeNull();
    expect(moveClip(arrangement, 'a', 2)).not.toBeNull();
    expect(moveClip(arrangement, 'a', -1)).toBeNull();
  });

  it('ignores clips on other tracks', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 4), clip('b', 'sfx', 6, 4)]);
    expect(moveClip(arrangement, 'a', 6)).not.toBeNull();
  });
});

describe('trimClipStart', () => {
  it('adjusts sourceOffset and keeps the end fixed', () => {
    const trimmed = trimClipStart(baseArrangement([clip('a', 'music', 5, 10, 0)]), 'a', 8);
    expect(find(trimmed, 'a')).toMatchObject({ start: 8, sourceOffset: 3, duration: 7 });
  });

  it('stops at the source start', () => {
    const trimmed = trimClipStart(baseArrangement([clip('a', 'music', 5, 10, 2)]), 'a', 0);
    expect(find(trimmed, 'a')).toMatchObject({ start: 3, sourceOffset: 0, duration: 12 });
  });

  it('stops at the previous neighbour and keeps the minimum length', () => {
    const arrangement = baseArrangement([clip('n', 'music', 0, 4), clip('a', 'music', 5, 4, 3)]);
    expect(find(trimClipStart(arrangement, 'a', 1), 'a').start).toBe(4);
    expect(find(trimClipStart(arrangement, 'a', 100), 'a').duration).toBeCloseTo(0.05, 9);
  });
});

describe('trimClipEnd', () => {
  it('stops at the source end', () => {
    const trimmed = trimClipEnd(
      baseArrangement([clip('a', 'music', 2, 5, 10)]),
      'a',
      40,
      durations,
    );
    expect(find(trimmed, 'a').duration).toBe(10);
  });

  it('stops at the next neighbour', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 4), clip('b', 'music', 6, 4)]);
    expect(find(trimClipEnd(arrangement, 'a', 9, durations), 'a').duration).toBe(6);
  });

  it('returns the same arrangement when nothing can change', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 20)]);
    expect(trimClipEnd(arrangement, 'a', 30, durations)).toBe(arrangement);
  });
});

describe('splitClipAt', () => {
  it('splits with the right part offset into the source', () => {
    const result = splitClipAt(baseArrangement([clip('a', 'music', 2, 10, 1)]), 'a', 6);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(find(result.arrangement, result.leftId)).toMatchObject({
      start: 2,
      sourceOffset: 1,
      duration: 4,
    });
    expect(find(result.arrangement, result.rightId)).toMatchObject({
      start: 6,
      sourceOffset: 5,
      duration: 6,
    });
    expect(result.rightId).not.toBe(result.leftId);
  });

  it('refuses a split outside the clip', () => {
    expect(splitClipAt(baseArrangement([clip('a', 'music', 2, 10)]), 'a', 2)).toBeNull();
    expect(splitClipAt(baseArrangement([clip('a', 'music', 2, 10)]), 'a', 13)).toBeNull();
  });
});

describe('splitClipsByRange', () => {
  it('produces three parts with the middle one returned', () => {
    const result = splitClipsByRange(baseArrangement([clip('a', 'music', 0, 10)]), {
      start: 4,
      end: 6,
      trackId: 'music',
    });
    expect(result?.arrangement.clips).toHaveLength(3);
    if (!result) return;
    expect(find(result.arrangement, result.middleId)).toMatchObject({
      start: 4,
      sourceOffset: 4,
      duration: 2,
    });
  });
});

describe('deleteClip', () => {
  it('removes only the clip and leaves the gap', () => {
    const arrangement = baseArrangement([clip('a', 'music', 0, 4), clip('b', 'music', 6, 4)]);
    const next = deleteClip(arrangement, 'a');
    expect(next.clips).toEqual([clip('b', 'music', 6, 4)]);
  });
});

describe('deleteTime', () => {
  const arrangement = baseArrangement([
    clip('before', 'music', 0, 3),
    clip('after', 'music', 8, 2),
    clip('left', 'stems', 2, 4, 1),
    clip('right', 'stems', 5, 4, 2),
    clip('inside', 'sfx', 4.5, 1),
    clip('span', 'video', 1, 10, 0.5),
  ]);
  const next = deleteTime(arrangement, 4, 6);

  it('keeps clips that end before a', () => {
    expect(find(next, 'before')).toEqual(clip('before', 'music', 0, 3));
  });

  it('shifts clips after b by -(b - a)', () => {
    expect(find(next, 'after')).toEqual(clip('after', 'music', 6, 2));
  });

  it('trims a clip straddling the left edge', () => {
    expect(find(next, 'left')).toEqual(clip('left', 'stems', 2, 2, 1));
  });

  it('moves the right part of a clip straddling the right edge to a', () => {
    expect(find(next, 'right')).toEqual(clip('right', 'stems', 4, 3, 3));
  });

  it('removes clips fully inside the range', () => {
    expect(next.clips.some((entry) => entry.id === 'inside')).toBe(false);
  });

  it('splits a clip spanning both edges, including the video track', () => {
    const parts = next.clips.filter((entry) => entry.trackId === 'video');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual(clip('span', 'video', 1, 3, 0.5));
    expect(parts[1]).toMatchObject({ start: 4, sourceOffset: 5.5, duration: 5 });
    expect(parts[1].id).not.toBe('span');
  });

  it('drops parts shorter than a millisecond', () => {
    const tiny = deleteTime(baseArrangement([clip('a', 'music', 0, 4.0005)]), 4, 6);
    expect(find(tiny, 'a').duration).toBe(4);
    const gone = deleteTime(baseArrangement([clip('a', 'music', 3.9995, 1)]), 4, 6);
    expect(gone.clips).toHaveLength(0);
  });
});

describe('remapTime', () => {
  it('maps positions around a deleted range', () => {
    expect(remapTime(3, 4, 6)).toBe(3);
    expect(remapTime(5, 4, 6)).toBe(4);
    expect(remapTime(8, 4, 6)).toBe(6);
  });
});

describe('projectEnd', () => {
  it('is 0 when empty and grows beyond 60 seconds', () => {
    expect(projectEnd(baseArrangement())).toBe(0);
    expect(projectEnd(baseArrangement([clip('a', 'music', 70, 5)]))).toBe(75);
  });
});

describe('track mix', () => {
  it('toggleSolo is exclusive on a plain click and additive with modifier', () => {
    let arrangement = toggleSolo(baseArrangement(), 'music', false);
    arrangement = toggleSolo(arrangement, 'stems', false);
    expect(arrangement.tracks.filter((track) => track.solo).map((track) => track.id)).toEqual([
      'stems',
    ]);
    arrangement = toggleSolo(arrangement, 'sfx', true);
    expect(arrangement.tracks.filter((track) => track.solo).map((track) => track.id)).toEqual([
      'stems',
      'sfx',
    ]);
    arrangement = toggleSolo(arrangement, 'sfx', false);
    expect(arrangement.tracks.filter((track) => track.solo).map((track) => track.id)).toEqual([
      'sfx',
    ]);
    arrangement = toggleSolo(arrangement, 'sfx', false);
    expect(arrangement.tracks.some((track) => track.solo)).toBe(false);
  });

  it('setTrackMix clamps volume and keeps mute', () => {
    const muted = setTrackMix(baseArrangement(), 'music', { mute: true });
    const loud = setTrackMix(muted, 'music', { volume: 3 });
    expect(loud.tracks.find((track) => track.id === 'music')).toMatchObject({
      mute: true,
      volume: 1,
    });
  });
});

describe('history', () => {
  const start = baseArrangement([clip('a', 'music', 0, 4)]);

  it('undo and redo restore exact snapshots', () => {
    const moved = moveClip(start, 'a', 2);
    if (!moved) throw new Error('move failed');
    let history = commitHistory(createHistory(start), moved, 'გადატანა');
    history = undoHistory(history);
    expect(history.present).toEqual(start);
    expect(history.future[0].label).toBe('გადატანა');
    history = redoHistory(history);
    expect(history.present).toEqual(moved);
    expect(history.past[0].label).toBe('გადატანა');
  });

  it('ignores a commit equal to the current snapshot', () => {
    const history = createHistory(start);
    const same = commitHistory(history, structuredClone(start), 'noop');
    expect(same).toBe(history);
    expect(same.past).toHaveLength(0);
  });

  it('records one entry for a drag preview with an explicit before snapshot', () => {
    const moved = moveClip(start, 'a', 3);
    if (!moved) throw new Error('move failed');
    const preview = { ...createHistory(start), present: moved };
    const committed = commitHistory(preview, moved, 'drag', start);
    expect(committed.past).toEqual([{ label: 'drag', snapshot: start }]);
    const reverted = commitHistory(preview, start, 'drag', start);
    expect(reverted.past).toHaveLength(0);
    expect(reverted.present).toEqual(start);
  });

  it('createArrangement starts without a loop', () => {
    expect(baseArrangement().loop).toBeNull();
  });

  it('undo and redo restore the loop exactly (create, replace, toggle)', () => {
    const created = { ...start, loop: { start: 2, end: 4, enabled: true } };
    const replaced = { ...start, loop: { start: 6, end: 8, enabled: true } };
    const toggled = { ...start, loop: { start: 6, end: 8, enabled: false } };
    let history = commitHistory(createHistory(start), created, 'Loop შეიქმნა');
    history = commitHistory(history, replaced, 'Loop ჩანაცვლდა');
    history = commitHistory(history, toggled, 'Loop გამორთვა');
    expect(history.past.map((entry) => entry.label)).toEqual([
      'Loop შეიქმნა',
      'Loop ჩანაცვლდა',
      'Loop გამორთვა',
    ]);
    history = undoHistory(history);
    expect(history.present.loop).toEqual({ start: 6, end: 8, enabled: true });
    history = undoHistory(history);
    expect(history.present.loop).toEqual({ start: 2, end: 4, enabled: true });
    history = undoHistory(history);
    expect(history.present.loop).toBeNull();
    history = redoHistory(redoHistory(history));
    expect(history.present.loop).toEqual({ start: 6, end: 8, enabled: true });
    expect(history.present.clips).toEqual(start.clips);
  });

  it('clears redo after a new commit', () => {
    const moved = moveClip(start, 'a', 2);
    const other = moveClip(start, 'a', 5);
    if (!moved || !other) throw new Error('move failed');
    let history = commitHistory(createHistory(start), moved, 'one');
    history = undoHistory(history);
    expect(history.future).toHaveLength(1);
    history = commitHistory(history, other, 'two');
    expect(history.future).toHaveLength(0);
    expect(redoHistory(history)).toBe(history);
  });
});

describe('appendVideoClip', () => {
  it('appends sequentially on the single video track with offset 0', () => {
    const first = appendVideoClip(baseArrangement([clip('m', 'music', 0, 3)]), {
      sourceId: 'a',
      sourceDuration: 6.008,
    });
    const second =
      first && appendVideoClip(first.arrangement, { sourceId: 'b', sourceDuration: 4 });
    expect(first?.clip).toMatchObject({
      trackId: 'video',
      start: 0,
      sourceOffset: 0,
      duration: 6.008,
    });
    expect(second?.clip).toMatchObject({ trackId: 'video', start: 6.008, duration: 4 });
    expect(second?.arrangement.clips).toHaveLength(3);
  });

  it('rejects a non-finite or empty duration', () => {
    expect(appendVideoClip(baseArrangement(), { sourceId: 'a', sourceDuration: 0 })).toBeNull();
    expect(
      appendVideoClip(baseArrangement(), { sourceId: 'a', sourceDuration: Number.NaN }),
    ).toBeNull();
  });

  it('trimClipEnd on a video clip stops at the probed duration', () => {
    const added = appendVideoClip(baseArrangement(), { sourceId: 'film', sourceDuration: 6.008 });
    if (!added) throw new Error('append failed');
    const trimmedStart = trimClipStart(added.arrangement, added.clip.id, 1);
    const extended = trimClipEnd(trimmedStart, added.clip.id, 30, new Map([['film', 6.008]]));
    const result = find(extended, added.clip.id);
    expect(result.sourceOffset).toBe(1);
    expect(result.start + result.duration).toBeCloseTo(6.008, 9);
  });
});
