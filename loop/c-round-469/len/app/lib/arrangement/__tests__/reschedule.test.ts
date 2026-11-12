import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip, ArrangementTrack } from '~/types/arrangement';
import { diffClipSchedule, planChangedClips } from '../reschedule';

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 1, mute: false, solo: false, ...patch };
}

function fixture(): Arrangement {
  return {
    tracks: [track('music'), track('sfx')],
    clips: [
      { id: 'a', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
      { id: 'b', trackId: 'music', sourceId: 'song', start: 10, sourceOffset: 1, duration: 10 },
      { id: 'c', trackId: 'sfx', sourceId: 'hit', start: 5, sourceOffset: 0, duration: 10 },
    ],
    loop: null,
    master: { gainDb: 0, mute: false },
  };
}

function withClip(id: string, patch: Partial<ArrangementClip>): Arrangement {
  const next = fixture();
  return {
    ...next,
    clips: next.clips.map((clip) => (clip.id === id ? { ...clip, ...patch } : clip)),
  };
}

describe('diffClipSchedule', () => {
  it('RS1 an unchanged deep copy has no changed clips', () => {
    expect(diffClipSchedule(fixture(), structuredClone(fixture()))).toEqual({
      changedClipIds: [],
    });
  });

  it('RS2 a clip gain change is not a schedule change', () => {
    expect(diffClipSchedule(fixture(), withClip('b', { gainDb: -6 }))).toEqual({
      changedClipIds: [],
    });
  });

  it('RS3 a fade-in change marks only that clip', () => {
    expect(diffClipSchedule(fixture(), withClip('b', { fadeIn: 1 }))).toEqual({
      changedClipIds: ['b'],
    });
  });

  it('RS4 envelope, move and trim each mark only their clip', () => {
    expect(
      diffClipSchedule(fixture(), withClip('b', { envelope: [{ time: 2, gain: 0.5 }] })),
    ).toEqual({ changedClipIds: ['b'] });
    expect(diffClipSchedule(fixture(), withClip('c', { start: 6 }))).toEqual({
      changedClipIds: ['c'],
    });
    expect(diffClipSchedule(fixture(), withClip('a', { duration: 8, sourceOffset: 2 }))).toEqual({
      changedClipIds: ['a'],
    });
  });

  it('RS5 an added or moved loop needs a full rebuild', () => {
    const looped: Arrangement = { ...fixture(), loop: { start: 0, end: 8, enabled: true } };
    expect(diffClipSchedule(fixture(), looped)).toBeNull();
    const moved: Arrangement = { ...fixture(), loop: { start: 0, end: 9, enabled: true } };
    expect(diffClipSchedule(looped, moved)).toBeNull();
  });

  it('RS6 an added or removed clip needs a full rebuild', () => {
    const base = fixture();
    const added: Arrangement = {
      ...base,
      clips: [
        ...base.clips,
        { id: 'd', trackId: 'sfx', sourceId: 'hit', start: 16, sourceOffset: 0, duration: 2 },
      ],
    };
    expect(diffClipSchedule(fixture(), added)).toBeNull();
    const removed: Arrangement = { ...base, clips: base.clips.filter((clip) => clip.id !== 'c') };
    expect(diffClipSchedule(fixture(), removed)).toBeNull();
  });

  it('RS7 an added track or a new track order needs a full rebuild', () => {
    const base = fixture();
    const extraTrack: Arrangement = { ...base, tracks: [...base.tracks, track('stems')] };
    expect(diffClipSchedule(fixture(), extraTrack)).toBeNull();
    const swapped: Arrangement = { ...base, tracks: [base.tracks[1], base.tracks[0]] };
    expect(diffClipSchedule(fixture(), swapped)).toBeNull();
  });

  it('RS8 a track mix change or a clip reorder is not a schedule change', () => {
    const base = fixture();
    const mixed: Arrangement = {
      ...base,
      tracks: base.tracks.map((entry) =>
        entry.id === 'music' ? { ...entry, mute: true, volume: 0.4 } : entry,
      ),
    };
    expect(diffClipSchedule(fixture(), mixed)).toEqual({ changedClipIds: [] });
    const reversed: Arrangement = { ...base, clips: [...base.clips].reverse() };
    expect(diffClipSchedule(fixture(), reversed)).toEqual({ changedClipIds: [] });
  });
});

describe('planChangedClips', () => {
  it('RS9 plans a changed clip from inside it', () => {
    const items = planChangedClips(fixture(), ['b'], 12);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ clipId: 'b', when: 12, sourceOffset: 3, duration: 8 });
  });

  it('RS10 drops ended clips and keeps a future clip whole', () => {
    expect(planChangedClips(fixture(), ['a', 'b'], 12).map((item) => item.clipId)).toEqual(['b']);
    const future = planChangedClips(fixture(), ['b'], 4);
    expect(future).toHaveLength(1);
    expect(future[0]).toMatchObject({ clipId: 'b', when: 10, sourceOffset: 1, duration: 10 });
  });
});
