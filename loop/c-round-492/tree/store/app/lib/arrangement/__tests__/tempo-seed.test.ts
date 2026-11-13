import { describe, expect, it } from 'vitest';
import type { ArrangementClip, ArrangementTrack, WorkspaceSource } from '~/types/arrangement';
import { findAssetTempoSeed, hasAssetTempoSource } from '../tempo-seed';

const TRACKS: ArrangementTrack[] = [
  { id: 'video', kind: 'video', name: 'Video', volume: 1, mute: false, solo: false },
  { id: 'music', kind: 'audio', name: 'Music', volume: 1, mute: false, solo: false },
  { id: 'sfx', kind: 'audio', name: 'SFX', volume: 1, mute: false, solo: false },
];

function seedSource(id: string, kind: WorkspaceSource['kind'], bpm?: number): WorkspaceSource {
  const base: WorkspaceSource = { id, title: id, collectionLabel: 'seed', kind, origin: 'demo' };
  return bpm === undefined ? base : { ...base, bpm };
}

function seedClip(id: string, sourceId: string, start: number, trackId = 'music'): ArrangementClip {
  return { id, trackId, sourceId, start, sourceOffset: 0, duration: 4 };
}

describe('SABA-B-11a findAssetTempoSeed', () => {
  it('TS1 no clips gives no seed', () => {
    expect(findAssetTempoSeed([], TRACKS, [seedSource('stem', 'stem', 90)])).toBeNull();
  });

  it('TS2 one stem clip with bpm 90 seeds 90 with its source', () => {
    const stem = seedSource('stem', 'stem', 90);
    expect(findAssetTempoSeed([seedClip('c1', 'stem', 0)], TRACKS, [stem])).toEqual({
      bpm: 90,
      source: stem,
    });
  });

  it('TS3 an sfx source with a bpm and a music source without one are ignored', () => {
    const sources = [seedSource('hit', 'sfx', 140), seedSource('song', 'music')];
    const clips = [seedClip('c1', 'hit', 0, 'sfx'), seedClip('c2', 'song', 1)];
    expect(findAssetTempoSeed(clips, TRACKS, sources)).toBeNull();
    const music = seedSource('score', 'music', 100);
    expect(
      findAssetTempoSeed([...clips, seedClip('c3', 'score', 8)], TRACKS, [...sources, music]),
    ).toEqual({ bpm: 100, source: music });
  });

  it('TS4 the qualifying clip with the earliest start wins; equal starts keep array order', () => {
    const slow = seedSource('slow', 'stem', 90);
    const fast = seedSource('fast', 'music', 140);
    const clips = [seedClip('c1', 'slow', 4), seedClip('c2', 'fast', 1)];
    expect(findAssetTempoSeed(clips, TRACKS, [slow, fast])).toEqual({ bpm: 140, source: fast });
    const tied = [seedClip('c1', 'slow', 2), seedClip('c2', 'fast', 2)];
    expect(findAssetTempoSeed(tied, TRACKS, [slow, fast])).toEqual({ bpm: 90, source: slow });
    const tiedReversed = [seedClip('c2', 'fast', 2), seedClip('c1', 'slow', 2)];
    expect(findAssetTempoSeed(tiedReversed, TRACKS, [slow, fast])).toEqual({
      bpm: 140,
      source: fast,
    });
  });

  it('TS5 invalid catalogue values count as no BPM; valid ones round to 2 decimals', () => {
    for (const bpm of [Number.NaN, Number.POSITIVE_INFINITY, 0, 19.99, 1000]) {
      const source = seedSource('stem', 'stem', bpm);
      expect(findAssetTempoSeed([seedClip('c1', 'stem', 0)], TRACKS, [source]), String(bpm)).toBe(
        null,
      );
    }
    const precise = seedSource('stem', 'stem', 92.456);
    expect(findAssetTempoSeed([seedClip('c1', 'stem', 0)], TRACKS, [precise])?.bpm).toBe(92.46);
  });

  it('TS6 a clip on a video track is ignored even when its source has a bpm', () => {
    const stem = seedSource('stem', 'stem', 90);
    expect(findAssetTempoSeed([seedClip('c1', 'stem', 0, 'video')], TRACKS, [stem])).toBeNull();
    expect(findAssetTempoSeed([seedClip('c1', 'stem', 0, 'missing')], TRACKS, [stem])).toBeNull();
  });
});

describe('SABA-B-11a-FIX-2 hasAssetTempoSource', () => {
  it('TS7 true only when a music or stem source has a valid catalogue BPM', () => {
    expect(hasAssetTempoSource([])).toBe(false);
    expect(hasAssetTempoSource([seedSource('hit', 'sfx', 120), seedSource('song', 'music')])).toBe(
      false,
    );
    expect(hasAssetTempoSource([seedSource('bad', 'stem', 5000)])).toBe(false);
    expect(hasAssetTempoSource([seedSource('hit', 'sfx'), seedSource('stem', 'stem', 90)])).toBe(
      true,
    );
    expect(hasAssetTempoSource([seedSource('song', 'music', 128.004)])).toBe(true);
  });
});
