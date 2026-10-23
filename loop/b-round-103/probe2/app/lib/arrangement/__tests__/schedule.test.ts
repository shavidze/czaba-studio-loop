import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementTrack } from '~/types/arrangement';
import { isTrackAudible, planSchedule } from '../schedule';

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 1, mute: false, solo: false, ...patch };
}

const arrangement: Arrangement = {
  tracks: [track('video', { kind: 'video' }), track('music', { mute: true }), track('sfx')],
  clips: [
    { id: 'm', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 10 },
    { id: 'early', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 1 },
    { id: 'late', trackId: 'sfx', sourceId: 'hit', start: 20, sourceOffset: 0.5, duration: 2 },
    { id: 'v', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 30 },
  ],
  loop: null,
  master: { gainDb: 0, mute: false },
};

describe('planSchedule', () => {
  it('starts a clip mid-way when from is inside it', () => {
    const plan = planSchedule(arrangement, 5);
    expect(plan.find((item) => item.clipId === 'm')).toEqual({
      clipId: 'm',
      trackId: 'music',
      sourceId: 'song',
      when: 5,
      sourceOffset: 4,
      duration: 7,
    });
  });

  it('keeps the full clip when from is before it', () => {
    const plan = planSchedule(arrangement, 5);
    expect(plan.find((item) => item.clipId === 'late')).toMatchObject({
      when: 20,
      sourceOffset: 0.5,
      duration: 2,
    });
  });

  it('excludes clips that ended before from', () => {
    expect(planSchedule(arrangement, 5).some((item) => item.clipId === 'early')).toBe(false);
    expect(planSchedule(arrangement, 1).some((item) => item.clipId === 'early')).toBe(false);
  });

  it('honours the until bound', () => {
    expect(planSchedule(arrangement, 0, 20).map((item) => item.clipId)).toEqual([
      'early',
      'v',
      'm',
    ]);
  });

  it('plans clips on muted tracks so unmute works live', () => {
    expect(planSchedule(arrangement, 0).some((item) => item.clipId === 'm')).toBe(true);
  });

  it('plans video-track clips so the original video sound plays', () => {
    expect(planSchedule(arrangement, 3).find((item) => item.clipId === 'v')).toEqual({
      clipId: 'v',
      trackId: 'video',
      sourceId: 'film',
      when: 3,
      sourceOffset: 3,
      duration: 27,
    });
  });

  it('plans a muted video clip too, so unmute works live', () => {
    const muted: Arrangement = {
      ...arrangement,
      tracks: arrangement.tracks.map((entry) =>
        entry.id === 'video' ? { ...entry, mute: true } : entry,
      ),
    };
    expect(planSchedule(muted, 0).some((item) => item.clipId === 'v')).toBe(true);
  });
});

describe('isTrackAudible', () => {
  it('makes solo exclusive and lets mute override solo', () => {
    const tracks = [track('a', { solo: true }), track('b'), track('c', { solo: true, mute: true })];
    expect(isTrackAudible(tracks[0], tracks)).toBe(true);
    expect(isTrackAudible(tracks[1], tracks)).toBe(false);
    expect(isTrackAudible(tracks[2], tracks)).toBe(false);
  });

  it('treats the video track like any other track', () => {
    const video = track('video', { kind: 'video' });
    expect(isTrackAudible(video, [video, track('a')])).toBe(true);
    expect(isTrackAudible({ ...video, mute: true }, [video, track('a')])).toBe(false);
  });

  it('solo on an audio track silences the video lane', () => {
    const video = track('video', { kind: 'video' });
    const tracks = [video, track('a', { solo: true }), track('b')];
    expect(isTrackAudible(video, tracks)).toBe(false);
    expect(isTrackAudible(tracks[1], tracks)).toBe(true);
  });

  it('solo on the video lane silences the audio lanes', () => {
    const tracks = [track('video', { kind: 'video', solo: true }), track('a'), track('b')];
    expect(isTrackAudible(tracks[0], tracks)).toBe(true);
    expect(isTrackAudible(tracks[1], tracks)).toBe(false);
    expect(isTrackAudible(tracks[2], tracks)).toBe(false);
  });

  it('treats every unmuted track as audible without solo', () => {
    const tracks = [track('a'), track('b', { mute: true })];
    expect(isTrackAudible(tracks[0], tracks)).toBe(true);
    expect(isTrackAudible(tracks[1], tracks)).toBe(false);
  });
});
