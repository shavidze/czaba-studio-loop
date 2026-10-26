import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { appendVideoClip, createArrangement, deleteTime, trimClipStart } from '../model';
import { studioVideoStrings } from '../strings';
import {
  audioLaneDropMessage,
  classifyVideoFile,
  findVideoClipAt,
  isVideoTargetJump,
  nextVideoStart,
  resolveVideoTarget,
  VIDEO_RATE_MAX,
  VIDEO_RATE_MIN,
  videoDriftAction,
  videoRateCorrection,
} from '../video';

function baseArrangement(clips: ArrangementClip[] = []): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips,
  };
}

function videoClip(id: string, start: number, duration: number, sourceOffset = 0): ArrangementClip {
  return { id, trackId: 'video', sourceId: `src-${id}`, start, sourceOffset, duration };
}

describe('classifyVideoFile', () => {
  it('accepts video MIME types', () => {
    expect(classifyVideoFile({ name: 'a.mp4', type: 'video/mp4' })).toBe('video');
    expect(classifyVideoFile({ name: 'a.webm', type: 'video/webm' })).toBe('video');
    expect(classifyVideoFile({ name: 'a.mov', type: 'video/quicktime' })).toBe('video');
  });

  it('classifies an empty MIME by extension, case-insensitively', () => {
    expect(classifyVideoFile({ name: 'clip.mov', type: '' })).toBe('video');
    expect(classifyVideoFile({ name: 'CLIP.MKV', type: '' })).toBe('video');
    expect(classifyVideoFile({ name: 'x.m4v', type: '' })).toBe('video');
    expect(classifyVideoFile({ name: 'drop.mkv', type: 'application/octet-stream' })).toBe('video');
  });

  it('marks audio files as audio', () => {
    expect(classifyVideoFile({ name: 'song.mp3', type: 'audio/mpeg' })).toBe('audio');
    expect(classifyVideoFile({ name: 'tone.wav', type: '' })).toBe('audio');
  });

  it('marks other files as unsupported', () => {
    expect(classifyVideoFile({ name: 'doc.pdf', type: 'application/pdf' })).toBe('unsupported');
    expect(classifyVideoFile({ name: 'noext', type: '' })).toBe('unsupported');
  });
});

describe('audioLaneDropMessage', () => {
  it('points videos to the video lane and rejects audio', () => {
    expect(audioLaneDropMessage([{ name: 'a.webm', type: 'video/webm' }])).toBe(
      studioVideoStrings.dropOnVideoTrack,
    );
    expect(audioLaneDropMessage([{ name: 'tone.wav', type: 'audio/wav' }])).toContain(
      studioVideoStrings.audioFileRejected('tone.wav'),
    );
  });
});

describe('findVideoClipAt', () => {
  const arrangement = baseArrangement([videoClip('a', 0, 6), videoClip('b', 8, 4, 1.5)]);

  it('maps a position inside a clip to its media time', () => {
    expect(findVideoClipAt(arrangement, 2.5)).toEqual({
      clip: arrangement.clips[0],
      mediaTime: 2.5,
    });
  });

  it('includes the exact start and honours sourceOffset', () => {
    expect(findVideoClipAt(arrangement, 8)?.mediaTime).toBe(1.5);
    expect(findVideoClipAt(arrangement, 9.25)?.mediaTime).toBe(2.75);
  });

  it('excludes the exact end (half-open)', () => {
    expect(findVideoClipAt(arrangement, 6)).toBeNull();
    expect(findVideoClipAt(arrangement, 12)).toBeNull();
    const adjacent = baseArrangement([videoClip('a', 0, 6), videoClip('c', 6, 2)]);
    expect(findVideoClipAt(adjacent, 6)?.clip.id).toBe('c');
  });

  it('returns null in a gap', () => {
    expect(findVideoClipAt(arrangement, 7)).toBeNull();
  });

  it('ignores audio-track clips', () => {
    const withAudio = baseArrangement([
      { id: 'm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
    ]);
    expect(findVideoClipAt(withAudio, 1)).toBeNull();
  });
});

describe('nextVideoStart', () => {
  it('is 0 for an empty video lane', () => {
    expect(nextVideoStart(baseArrangement())).toBe(0);
  });

  it('is the max end of the video clips', () => {
    expect(nextVideoStart(baseArrangement([videoClip('a', 8, 4), videoClip('b', 0, 6)]))).toBe(12);
  });
});

describe('appendVideoClip placement', () => {
  it('places files sequentially and grows the project past 60 s', () => {
    let arrangement = baseArrangement();
    const starts: number[] = [];
    for (const duration of [6.008, 4, 55]) {
      const result = appendVideoClip(arrangement, {
        sourceId: `s${duration}`,
        sourceDuration: duration,
      });
      if (!result) throw new Error('append failed');
      starts.push(result.clip.start);
      arrangement = result.arrangement;
    }
    expect(starts).toEqual([0, 6.008, 10.008]);
    expect(nextVideoStart(arrangement)).toBeCloseTo(65.008, 9);
  });
});

describe('video media-time mapping after edits', () => {
  it('stays correct after trimClipStart and deleteTime', () => {
    const added = appendVideoClip(baseArrangement(), { sourceId: 'film', sourceDuration: 6.008 });
    if (!added) throw new Error('append failed');
    const trimmed = trimClipStart(added.arrangement, added.clip.id, 0.5);
    const edited = deleteTime(trimmed, 1, 2);
    expect(findVideoClipAt(edited, 0.75)?.mediaTime).toBeCloseTo(0.75, 9);
    expect(findVideoClipAt(edited, 1)?.mediaTime).toBeCloseTo(2, 9);
    expect(findVideoClipAt(edited, 3)?.mediaTime).toBeCloseTo(4, 9);
    expect(findVideoClipAt(edited, 5.008)).toBeNull();
  });
});

describe('videoDriftAction', () => {
  it('hard-seeks while playing only above 1.0 s (D-19: soft sync handles the rest)', () => {
    expect(videoDriftAction(1, 1.081, true)).toBe('none');
    expect(videoDriftAction(1, 1.299, true)).toBe('none');
    expect(videoDriftAction(1, 0.701, true)).toBe('none');
    expect(videoDriftAction(1, 1.999, true)).toBe('none');
    expect(videoDriftAction(1, 2.001, true)).toBe('seek');
    expect(videoDriftAction(2.5, 1.4, true)).toBe('seek');
  });

  it('seeks when stopped for any visible difference', () => {
    expect(videoDriftAction(1, 1.0005, false)).toBe('none');
    expect(videoDriftAction(1, 1.05, false)).toBe('seek');
  });
});

describe('resolveVideoTarget', () => {
  const gapArrangement = baseArrangement([videoClip('a', 0, 6), videoClip('b', 8, 4, 1.5)]);
  const adjacent = baseArrangement([videoClip('a', 0, 6), videoClip('c', 6, 2, 0.25)]);

  it('returns the clip under the position with its media time', () => {
    expect(resolveVideoTarget(gapArrangement, 7.8)).toBeNull();
    expect(resolveVideoTarget(gapArrangement, 9)).toMatchObject({
      clip: { id: 'b' },
      mediaTime: 2.5,
      continuous: false,
    });
  });

  it('returns null in a gap: the standby element, not the active one, prepares the next clip', () => {
    expect(resolveVideoTarget(gapArrangement, 7)).toBeNull();
    expect(resolveVideoTarget(gapArrangement, 7.99)).toBeNull();
  });

  it('marks a different-source clip at an adjacent boundary as not continuous', () => {
    expect(resolveVideoTarget(adjacent, 5.9)).toMatchObject({ clip: { id: 'a' } });
    const after = resolveVideoTarget(adjacent, 6);
    expect(after).toMatchObject({ clip: { id: 'c' }, continuous: false });
    expect(after?.mediaTime).toBeCloseTo(0.25, 9);
  });

  it('marks the right half of a continuous split of the same source as continuous', () => {
    const split = baseArrangement([
      { id: 'l', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 3 },
      { id: 'r', trackId: 'video', sourceId: 'film', start: 3, sourceOffset: 3, duration: 3 },
    ]);
    expect(resolveVideoTarget(split, 2.97)).toMatchObject({ clip: { id: 'l' } });
    expect(resolveVideoTarget(split, 3.01)).toMatchObject({
      clip: { id: 'r' },
      continuous: true,
    });
  });
});

describe('videoRateCorrection', () => {
  it('returns exactly 1 inside the 20 ms dead band', () => {
    for (const drift of [0, 0.005, -0.005, 0.02, -0.02]) {
      expect(videoRateCorrection(drift)).toBe(1);
    }
  });

  it('slows an ahead video and speeds up a late one, symmetrically while unclamped (|K·d| ≤ 0.5)', () => {
    expect(videoRateCorrection(0.03)).toBeLessThan(1);
    expect(videoRateCorrection(-0.03)).toBeGreaterThan(1);
    for (const drift of [0.025, 0.04, 0.1, 0.12]) {
      expect(1 - videoRateCorrection(drift)).toBeCloseTo(videoRateCorrection(-drift) - 1, 12);
    }
  });

  it('is monotone non-increasing in the drift', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let drift = -0.5; drift <= 0.5; drift += 0.001) {
      const rate = videoRateCorrection(drift);
      expect(rate).toBeLessThanOrEqual(previous + 1e-12);
      previous = rate;
    }
  });

  it('moves in 0.05 steps so the element is not re-rated every frame', () => {
    expect(videoRateCorrection(0.021)).toBe(0.9);
    expect(videoRateCorrection(-0.021)).toBe(1.1);
    expect(videoRateCorrection(-0.04)).toBe(1.15);
    for (let drift = -0.3; drift <= 0.3; drift += 0.0037) {
      const rate = videoRateCorrection(drift);
      expect(Math.round(rate * 100) % 5).toBe(0);
    }
  });

  it('is clamped to [0.5, 2.0] (D-19 rule 4)', () => {
    expect(VIDEO_RATE_MIN).toBe(0.5);
    expect(VIDEO_RATE_MAX).toBe(2);
    expect(videoRateCorrection(0.3)).toBe(0.5);
    expect(videoRateCorrection(-0.3)).toBe(2);
    expect(videoRateCorrection(5)).toBe(0.5);
    expect(videoRateCorrection(-5)).toBe(2);
    expect(videoRateCorrection(Number.NaN)).toBe(1);
  });
});

describe('isVideoTargetJump', () => {
  it('ignores normal advance, a hold and frame jitter', () => {
    expect(isVideoTargetJump(2, 2.016, 0.016)).toBe(false);
    expect(isVideoTargetJump(2, 2, 0.016)).toBe(false);
    expect(isVideoTargetJump(2, 2.05, 0.016)).toBe(false);
  });

  it('flags a loop wrap, a seek and an edit that moves the mapping by more than 80 ms', () => {
    expect(isVideoTargetJump(3.99, 2.006, 0.016)).toBe(true);
    expect(isVideoTargetJump(1, 5, 0.016)).toBe(true);
    expect(isVideoTargetJump(2, 2.116, 0.016)).toBe(true);
  });
});
