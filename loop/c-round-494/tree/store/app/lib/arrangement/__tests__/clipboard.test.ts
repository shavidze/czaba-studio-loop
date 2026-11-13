import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import {
  copyClipsToClipboard,
  copyRangeToClipboard,
  cutClipsFromArrangement,
  cutRangeFromArrangement,
  cutTimeToClipboard,
  planClipboardPaste,
} from '../clipboard';
import { createArrangement, deleteTime } from '../model';

function clipAt(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  sourceOffset = 0,
  sourceId = `${id}-src`,
): ArrangementClip {
  return { id, trackId, sourceId, start, sourceOffset, duration };
}

function clipboardArrangement(clips: ArrangementClip[]): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
    loop: null,
  };
}

const anySource = () => true;

function laneShape(arrangement: Arrangement) {
  return arrangement.clips
    .map((clip) => ({
      trackId: clip.trackId,
      start: clip.start,
      sourceOffset: clip.sourceOffset,
      duration: clip.duration,
    }))
    .sort((a, b) => a.trackId.localeCompare(b.trackId) || a.start - b.start);
}

describe('copyRangeToClipboard (R9-U)', () => {
  it('copies only the range lane, clips straddling parts and keeps a leading gap', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 0, 3, 1),
      clipAt('m2', 'music', 5, 4, 2),
      clipAt('s1', 'sfx', 2, 1),
    ]);
    const clipboard = copyRangeToClipboard(arrangement, { start: 2, end: 6, trackId: 'music' });
    expect(clipboard).toEqual({
      length: 4,
      items: [
        { trackId: 'music', sourceId: 'm1-src', offset: 0, sourceOffset: 3, duration: 1 },
        { trackId: 'music', sourceId: 'm2-src', offset: 3, sourceOffset: 2, duration: 1 },
      ],
    });
    const gap = copyRangeToClipboard(arrangement, { start: 4, end: 6, trackId: 'music' });
    expect(gap?.items[0].offset).toBe(1);
    expect(gap?.length).toBe(2);
  });

  it('returns null when the range holds no material', () => {
    const arrangement = clipboardArrangement([clipAt('m1', 'music', 0, 3)]);
    expect(copyRangeToClipboard(arrangement, { start: 4, end: 6, trackId: 'music' })).toBeNull();
  });
});

describe('copyClipsToClipboard (R9-U)', () => {
  it('stores clips relative to the earliest start with the group length', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 2, 4, 1),
      clipAt('s1', 'sfx', 5, 2),
      clipAt('m9', 'music', 20, 1),
    ]);
    expect(copyClipsToClipboard(arrangement, ['s1', 'm1'])).toEqual({
      length: 5,
      items: [
        { trackId: 'music', sourceId: 'm1-src', offset: 0, sourceOffset: 1, duration: 4 },
        { trackId: 'sfx', sourceId: 's1-src', offset: 3, sourceOffset: 0, duration: 2 },
      ],
    });
    expect(copyClipsToClipboard(arrangement, ['missing'])).toBeNull();
  });
});

describe('cut (R9-U)', () => {
  it('cut with a range keeps the gap and shifts nothing on any lane (R9-C2)', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 0, 10),
      clipAt('s1', 'sfx', 7, 1),
    ]);
    const next = cutRangeFromArrangement(arrangement, { start: 4, end: 6, trackId: 'music' });
    expect(laneShape(next)).toEqual([
      { trackId: 'music', start: 0, sourceOffset: 0, duration: 4 },
      { trackId: 'music', start: 6, sourceOffset: 6, duration: 4 },
      { trackId: 'sfx', start: 7, sourceOffset: 0, duration: 1 },
    ]);
    const ids = next.clips.map((clip) => clip.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('m1');
  });

  it('cut of clips removes them and leaves the gap', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 0, 2),
      clipAt('m2', 'music', 4, 2),
    ]);
    expect(laneShape(cutClipsFromArrangement(arrangement, ['m1']))).toEqual([
      { trackId: 'music', start: 4, sourceOffset: 0, duration: 2 },
    ]);
  });

  it('cut time equals deleteTime and holds the material of every lane (R9-C3)', () => {
    const arrangement: Arrangement = {
      ...clipboardArrangement([
        clipAt('v1', 'video', 0, 6.008),
        clipAt('m1', 'music', 0, 10),
        clipAt('s1', 'sfx', 7, 1),
      ]),
      loop: { start: 5, end: 9, enabled: true },
    };
    const result = cutTimeToClipboard(arrangement, 4, 6);
    expect(laneShape(result.arrangement)).toEqual(laneShape(deleteTime(arrangement, 4, 6)));
    expect(result.arrangement.loop).toEqual(deleteTime(arrangement, 4, 6).loop);
    expect(result.arrangement.clips.find((clip) => clip.id === 's1')?.start).toBe(5);
    expect(result.clipboard).toEqual({
      length: 2,
      items: [
        { trackId: 'video', sourceId: 'v1-src', offset: 0, sourceOffset: 4, duration: 2 },
        { trackId: 'music', sourceId: 'm1-src', offset: 0, sourceOffset: 4, duration: 2 },
      ],
    });
  });
});

describe('cutTimeToClipboard over silence (review finding #2)', () => {
  it('returns an empty clipboard while still deleting the time', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 0, 2),
      clipAt('m2', 'music', 6, 2),
    ]);
    const result = cutTimeToClipboard(arrangement, 3, 5);
    expect(result.clipboard.items).toEqual([]);
    expect(result.arrangement.clips.find((clip) => clip.id === 'm2')?.start).toBe(4);
  });
});

describe('planClipboardPaste (R9-U)', () => {
  it('pastes single-lane audio onto the active audio track at the playhead', () => {
    const arrangement = clipboardArrangement([clipAt('m1', 'music', 0, 8)]);
    const clipboard = copyClipsToClipboard(arrangement, ['m1']);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 20,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(plan.refusal).toBeNull();
    const pasted = plan.arrangement?.clips.find((clip) => plan.clipIds.includes(clip.id));
    expect(pasted).toMatchObject({ trackId: 'sfx', start: 20, sourceOffset: 0, duration: 8 });
    expect(plan.clipIds).toHaveLength(1);
    expect(plan.clipIds[0]).not.toBe('m1');
  });

  it('keeps original lanes and relative offsets for multi-lane material', () => {
    const arrangement = clipboardArrangement([
      clipAt('v1', 'video', 0, 6),
      clipAt('m1', 'music', 0, 10),
    ]);
    const { arrangement: cut, clipboard } = cutTimeToClipboard(arrangement, 4, 6);
    const plan = planClipboardPaste(cut, clipboard, {
      at: 30,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(plan.refusal).toBeNull();
    const pasted = (plan.arrangement?.clips ?? []).filter((clip) => plan.clipIds.includes(clip.id));
    expect(laneShape({ ...cut, clips: pasted })).toEqual([
      { trackId: 'music', start: 30, sourceOffset: 4, duration: 2 },
      { trackId: 'video', start: 30, sourceOffset: 4, duration: 2 },
    ]);
  });

  it('refuses all-or-nothing on overlap and names the lane and time', () => {
    const arrangement = clipboardArrangement([
      clipAt('m1', 'music', 0, 4),
      clipAt('m2', 'music', 21, 2),
    ]);
    const clipboard = copyClipsToClipboard(arrangement, ['m1']);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 20,
      activeTrackId: 'music',
      isSourceAvailable: anySource,
    });
    expect(plan.arrangement).toBeNull();
    expect(plan.refusal).toBe('overlap');
    expect(plan.conflict).toMatchObject({ trackId: 'music', start: 20, end: 24, occupantId: 'm2' });
  });

  it('refuses audio onto the video lane, a missing source and an empty clipboard', () => {
    const arrangement = clipboardArrangement([clipAt('m1', 'music', 0, 4)]);
    const clipboard = copyClipsToClipboard(arrangement, ['m1']);
    expect(
      planClipboardPaste(arrangement, clipboard, {
        at: 10,
        activeTrackId: 'video',
        isSourceAvailable: anySource,
      }).refusal,
    ).toBe('lane-kind');
    expect(
      planClipboardPaste(arrangement, clipboard, {
        at: 10,
        activeTrackId: 'music',
        isSourceAvailable: () => false,
      }).refusal,
    ).toBe('missing');
    expect(
      planClipboardPaste(arrangement, null, {
        at: 10,
        activeTrackId: 'music',
        isSourceAvailable: anySource,
      }).refusal,
    ).toBe('empty');
  });
});
