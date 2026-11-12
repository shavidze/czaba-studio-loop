import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { copyClipsToClipboard, planClipboardPaste } from '../clipboard';
import { clipFadeShapes, setClipFade } from '../fades';
import {
  applySchedule,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';
import { createArrangement, duplicateClips, moveClip, splitClipAt, trimClipStart } from '../model';
import { planSchedule } from '../schedule';
import { arrangementHasVideoFades, setVideoClipFade, videoFadeOpacityAt } from '../video-fades';

function videoFadeArrangement(clips: ArrangementClip[]) {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, clips };
}

function videoClip(overrides: Partial<ArrangementClip> = {}): ArrangementClip {
  return {
    id: 'v',
    trackId: 'video',
    sourceId: 'film',
    start: 2,
    sourceOffset: 0,
    duration: 6,
    ...overrides,
  };
}

function musicClip(overrides: Partial<ArrangementClip> = {}): ArrangementClip {
  return {
    id: 'm',
    trackId: 'music',
    sourceId: 'song',
    start: 0,
    sourceOffset: 0,
    duration: 10,
    ...overrides,
  };
}

function clipById(arrangement: Arrangement, id: string): ArrangementClip {
  const clip = arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

describe('SRW-19 setVideoClipFade (VF1)', () => {
  it('VF1 sets, clamps against the other edge, rounds to ms and omits zero', () => {
    const base = videoFadeArrangement([videoClip({ fadeOut: 2 })]);
    expect(clipById(setVideoClipFade(base, 'v', 'in', 9), 'v')).toStrictEqual(
      videoClip({ fadeIn: 4, fadeOut: 2 }),
    );
    expect(clipById(setVideoClipFade(base, 'v', 'in', 1.23456), 'v').fadeIn).toBe(1.235);
    expect(setVideoClipFade(base, 'v', 'in', -3)).toBe(base);
    const removed = setVideoClipFade(base, 'v', 'out', 0);
    expect(clipById(removed, 'v')).toStrictEqual(videoClip());
    expect(Object.hasOwn(clipById(removed, 'v'), 'fadeOut')).toBe(false);
    const grown = setVideoClipFade(setVideoClipFade(base, 'v', 'in', 1), 'v', 'out', 20);
    expect(clipById(grown, 'v')).toStrictEqual(videoClip({ fadeIn: 1, fadeOut: 5 }));
  });

  it('VF1 returns the same reference for an audio clip, a missing clip, NaN or no change', () => {
    const base = videoFadeArrangement([videoClip({ fadeIn: 1 }), musicClip()]);
    expect(setVideoClipFade(base, 'm', 'in', 1)).toBe(base);
    expect(setVideoClipFade(base, 'missing', 'in', 1)).toBe(base);
    expect(setVideoClipFade(base, 'v', 'out', Number.NaN)).toBe(base);
    expect(setVideoClipFade(base, 'v', 'in', 1)).toBe(base);
    expect(setVideoClipFade(base, 'v', 'in', 1.0004)).toBe(base);
    expect(setClipFade(base, 'v', 'in', 2)).toBe(base);
  });

  it('VF1 matches setClipFade exactly when only the track kind differs', () => {
    const cases: [Partial<ArrangementClip>, 'in' | 'out', number][] = [
      [{}, 'in', 1],
      [{ fadeOut: 2 }, 'in', 9],
      [{ fadeIn: 1.5 }, 'out', 4.4999],
      [{ duration: 0.3333, fadeOut: 0.1111 }, 'in', 5],
      [{ fadeIn: 2, fadeOut: 3 }, 'in', 0],
      [{ duration: 4, fadeIn: 3, fadeOut: 3 }, 'out', 1.2345],
    ];
    for (const [overrides, edge, seconds] of cases) {
      const asVideo = setVideoClipFade(
        videoFadeArrangement([videoClip(overrides)]),
        'v',
        edge,
        seconds,
      );
      const asAudio = setClipFade(
        videoFadeArrangement([videoClip({ ...overrides, trackId: 'music' })]),
        'v',
        edge,
        seconds,
      );
      expect(clipById(asVideo, 'v')).toStrictEqual({ ...clipById(asAudio, 'v'), trackId: 'video' });
      expect(asVideo).not.toBe(asAudio);
    }
  });
});

describe('SRW-19 videoFadeOpacityAt (VF2)', () => {
  const faded = videoFadeArrangement([videoClip({ fadeIn: 1, fadeOut: 2 })]);

  it('VF2 follows the fade-in and fade-out ramps of the video clip under the position', () => {
    expect(videoFadeOpacityAt(faded, 2.25)).toBe(0.25);
    expect(videoFadeOpacityAt(faded, 2.5)).toBe(0.5);
    expect(videoFadeOpacityAt(faded, 3.5)).toBe(1);
    expect(videoFadeOpacityAt(faded, 6.5)).toBe(0.75);
    expect(videoFadeOpacityAt(faded, 7.5)).toBe(0.25);
    expect(videoFadeOpacityAt(faded, 2)).toBe(0);
  });

  it('VF2 is 1 before the clip, at or after its end, in a gap and without video', () => {
    expect(videoFadeOpacityAt(faded, 1.999)).toBe(1);
    expect(videoFadeOpacityAt(faded, 8)).toBe(1);
    expect(videoFadeOpacityAt(faded, 9)).toBe(1);
    expect(videoFadeOpacityAt(faded, 7.999)).toBeCloseTo(0.0005, 6);
    const gapped = videoFadeArrangement([
      videoClip({ fadeOut: 1 }),
      videoClip({ id: 'w', start: 10, duration: 2, fadeIn: 1 }),
    ]);
    expect(videoFadeOpacityAt(gapped, 9)).toBe(1);
    expect(videoFadeOpacityAt(videoFadeArrangement([musicClip({ fadeIn: 5 })]), 1)).toBe(1);
  });

  it('VF2 two adjacent clips dip to 0 at their boundary', () => {
    const adjacent = videoFadeArrangement([
      videoClip({ start: 0, duration: 4, fadeOut: 1 }),
      videoClip({ id: 'w', start: 4, duration: 4, fadeIn: 1 }),
    ]);
    expect(videoFadeOpacityAt(adjacent, 3)).toBe(1);
    expect(videoFadeOpacityAt(adjacent, 3.5)).toBe(0.5);
    expect(videoFadeOpacityAt(adjacent, 4)).toBe(0);
    expect(videoFadeOpacityAt(adjacent, 4.5)).toBe(0.5);
    expect(videoFadeOpacityAt(adjacent, 5)).toBe(1);
  });

  it('VF2 arrangementHasVideoFades sees only effective video-track fades', () => {
    expect(arrangementHasVideoFades(faded)).toBe(true);
    expect(arrangementHasVideoFades(videoFadeArrangement([videoClip()]))).toBe(false);
    expect(
      arrangementHasVideoFades(videoFadeArrangement([videoClip(), musicClip({ fadeIn: 2 })])),
    ).toBe(false);
    expect(arrangementHasVideoFades(videoFadeArrangement([videoClip({ fadeOut: 0 })]))).toBe(false);
  });
});

describe('SRW-19 video fades under clip edits (VF3)', () => {
  const faded = () => videoFadeArrangement([videoClip({ fadeIn: 1, fadeOut: 2 })]);

  it('VF3 move and duplicate keep both fades', () => {
    const moved = moveClip(faded(), 'v', 3);
    expect(moved && clipById(moved, 'v')).toStrictEqual(
      videoClip({ start: 3, fadeIn: 1, fadeOut: 2 }),
    );
    const duplicated = duplicateClips(faded(), ['v']);
    const copyId = duplicated?.copyIds[0] ?? '';
    expect(duplicated?.arrangement && clipById(duplicated.arrangement, copyId)).toStrictEqual(
      videoClip({ id: copyId, start: 8, fadeIn: 1, fadeOut: 2 }),
    );
  });

  it('VF3 a start trim clamps the fade-in first', () => {
    const trimmed = trimClipStart(faded(), 'v', 6);
    expect(clipById(trimmed, 'v')).toStrictEqual(
      videoClip({ start: 6, sourceOffset: 4, duration: 2, fadeOut: 2 }),
    );
    const roomy = trimClipStart(faded(), 'v', 4.5);
    expect(clipById(roomy, 'v')).toStrictEqual(
      videoClip({ start: 4.5, sourceOffset: 2.5, duration: 3.5, fadeIn: 1, fadeOut: 2 }),
    );
    expect(videoFadeOpacityAt(trimmed, 6)).toBe(1);
  });

  it('VF3 a split drops the fade at the cut and keeps the outer ones', () => {
    const result = splitClipAt(faded(), 'v', 5);
    if (!result) {
      throw new Error('split refused');
    }
    expect(clipById(result.arrangement, result.leftId)).toStrictEqual(
      videoClip({ duration: 3, fadeIn: 1 }),
    );
    expect(clipById(result.arrangement, result.rightId)).toStrictEqual(
      videoClip({ id: result.rightId, start: 5, sourceOffset: 3, duration: 3, fadeOut: 2 }),
    );
    expect(videoFadeOpacityAt(result.arrangement, 4.999)).toBe(1);
    expect(videoFadeOpacityAt(result.arrangement, 5)).toBe(1);
  });

  it('VF3 copy and paste keep both fades', () => {
    const arrangement = faded();
    const clipboard = copyClipsToClipboard(arrangement, ['v']);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 20,
      activeTrackId: 'video',
      isSourceAvailable: () => true,
    });
    const pastedId = plan.clipIds[0] ?? '';
    expect(plan.arrangement && clipById(plan.arrangement, pastedId)).toStrictEqual(
      videoClip({ id: pastedId, start: 20, fadeIn: 1, fadeOut: 2 }),
    );
  });
});

type VideoFadeParamCall = [method: 'set' | 'ramp' | 'target', value: number, time: number];

class VideoFadeRecordingParam implements ScheduleAudioParam {
  value = 0;
  calls: VideoFadeParamCall[] = [];
  setTargetAtTime(target: number, startTime: number) {
    this.calls.push(['target', target, startTime]);
  }
  setValueAtTime(value: number, startTime: number) {
    this.calls.push(['set', value, startTime]);
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    this.calls.push(['ramp', value, endTime]);
  }
}

class VideoFadeRecordingNode implements ScheduleAudioNode {
  target: ScheduleAudioNode | null = null;
  connect(destination: ScheduleAudioNode) {
    this.target = destination;
    return destination;
  }
  disconnect() {}
}

class VideoFadeRecordingGain extends VideoFadeRecordingNode implements ScheduleGainNode {
  gain = new VideoFadeRecordingParam();
}

class VideoFadeRecordingPanner extends VideoFadeRecordingNode implements SchedulePannerNode {
  pan = new VideoFadeRecordingParam();
}

class VideoFadeRecordingSource
  extends VideoFadeRecordingNode
  implements ScheduleSourceNode<string>
{
  buffer: string | null = null;
  onended: ((event: Event) => unknown) | null = null;
  starts: [number, number, number][] = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop() {}
}

class VideoFadeRecordingContext implements ScheduleAudioContext<string> {
  currentTime = 0;
  destination = new VideoFadeRecordingNode();
  gains: VideoFadeRecordingGain[] = [];
  sources: VideoFadeRecordingSource[] = [];
  createBufferSource() {
    const source = new VideoFadeRecordingSource();
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new VideoFadeRecordingGain();
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new VideoFadeRecordingPanner();
  }
}

function recordVideoFadeSchedule(arrangement: Arrangement) {
  const ctx = new VideoFadeRecordingContext();
  applySchedule(ctx, planSchedule(arrangement, 0), {
    buffers: new Map([
      ['film', 'film'],
      ['song', 'song'],
    ]),
    tracks: arrangement.tracks,
    from: 0,
    startAt: 0,
    clipFades: clipFadeShapes(arrangement),
  });
  return {
    gainCount: ctx.gains.length,
    starts: ctx.sources.map((source) => [source.buffer, ...source.starts]),
    calls: ctx.gains.map((gain) => gain.gain.calls),
  };
}

describe('SRW-19 video fades leave the audio untouched (VF4)', () => {
  it('VF4 clipFadeShapes and the scheduled graph ignore a faded video clip', () => {
    const plain = videoFadeArrangement([videoClip(), musicClip({ start: 9, fadeIn: 0.5 })]);
    const faded = videoFadeArrangement([
      videoClip({ fadeIn: 1, fadeOut: 2 }),
      musicClip({ start: 9, fadeIn: 0.5 }),
    ]);
    expect(clipFadeShapes(faded)).toStrictEqual(clipFadeShapes(plain));
    expect([...clipFadeShapes(faded).keys()]).toStrictEqual(['m']);
    const withFade = recordVideoFadeSchedule(faded);
    const without = recordVideoFadeSchedule(plain);
    expect(withFade.starts).toContainEqual(['film', [2, 0, 6]]);
    expect(withFade).toStrictEqual(without);
  });
});
