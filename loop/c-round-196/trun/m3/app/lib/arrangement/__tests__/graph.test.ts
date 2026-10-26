import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import {
  applySchedule,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';

interface FakeBuffer {
  id: string;
}

class FakeParam implements ScheduleAudioParam {
  value = 0;
  targets: Array<{ target: number; startTime: number; timeConstant: number }> = [];
  setTargetAtTime(target: number, startTime: number, timeConstant: number) {
    this.targets.push({ target, startTime, timeConstant });
    this.value = target;
  }
}

class FakeNode implements ScheduleAudioNode {
  outputs: FakeNode[] = [];
  disconnected = false;
  constructor(readonly kind: string) {}
  connect(destination: ScheduleAudioNode): ScheduleAudioNode {
    if (destination instanceof FakeNode) {
      this.outputs.push(destination);
    }
    return destination;
  }
  disconnect() {
    this.disconnected = true;
  }
}

class FakeGain extends FakeNode implements ScheduleGainNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode implements SchedulePannerNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode implements ScheduleSourceNode<FakeBuffer> {
  buffer: FakeBuffer | null = null;
  onended: ((event: Event) => unknown) | null = null;
  starts: Array<[number, number, number]> = [];
  stops: Array<number | undefined> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop(when?: number) {
    this.stops.push(when);
  }
}

class FakeContext implements ScheduleAudioContext<FakeBuffer> {
  currentTime = 10;
  destination = new FakeNode('destination');
  sources: FakeSource[] = [];
  gains: FakeGain[] = [];
  createBufferSource() {
    const source = new FakeSource('source');
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new FakeGain('gain');
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new FakePanner('panner');
  }
}

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const tracks = [
  track('video', { kind: 'video' }),
  track('music'),
  track('sfx', { mute: true }),
  track('stems'),
];

const plan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 5, sourceOffset: 4, duration: 7 },
  { clipId: 'b', trackId: 'sfx', sourceId: 'hit', when: 8, sourceOffset: 0.25, duration: 1.5 },
];

const buffers = new Map<string, FakeBuffer>([
  ['song', { id: 'song' }],
  ['hit', { id: 'hit' }],
]);

function chain(node: FakeNode): string[] {
  const path = [node.kind];
  let current = node;
  while (current.outputs.length > 0) {
    current = current.outputs[0];
    path.push(current.kind);
  }
  return path;
}

function gainOfTrack(ctx: FakeContext, bufferId: string): FakeGain {
  const source = ctx.sources.find((entry) => entry.buffer?.id === bufferId);
  const gain = source?.outputs[0].outputs[0];
  if (!(gain instanceof FakeGain)) {
    throw new Error(`no track gain for ${bufferId}`);
  }
  return gain;
}

describe('applySchedule', () => {
  it('starts each source at startAt + (when - from) with offset and duration', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10.05 });
    expect(ctx.sources.map((source) => source.starts[0])).toEqual([
      [10.05, 4, 7],
      [13.05, 0.25, 1.5],
    ]);
    expect(ctx.sources.map((source) => source.buffer?.id)).toEqual(['song', 'hit']);
  });

  it('wires clip -> clipGain -> trackGain -> pan -> master -> destination', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    for (const source of ctx.sources) {
      expect(chain(source)).toEqual(['source', 'gain', 'gain', 'panner', 'gain', 'destination']);
    }
    const master = ctx.gains[0];
    expect(master.outputs).toEqual([ctx.destination]);
    expect(master.gain.value).toBe(1);
  });

  it('gives muted and non-soloed tracks gain 0 and still creates their sources', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    const musicGain = ctx.sources[0].outputs[0].outputs[0];
    const sfxGain = ctx.sources[1].outputs[0].outputs[0];
    expect(musicGain instanceof FakeGain && musicGain.gain.value).toBe(0.8);
    expect(sfxGain instanceof FakeGain && sfxGain.gain.value).toBe(0);

    const soloCtx = new FakeContext();
    const soloTracks = tracks.map((entry) =>
      entry.id === 'stems' ? { ...entry, solo: true } : entry,
    );
    applySchedule(soloCtx, plan, { buffers, tracks: soloTracks, from: 5, startAt: 10 });
    const soloMusic = soloCtx.sources[0].outputs[0].outputs[0];
    expect(soloMusic instanceof FakeGain && soloMusic.gain.value).toBe(0);
    expect(soloCtx.sources).toHaveLength(2);
  });

  it('setTrackGain ramps the track gain without restarting sources', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    handle.setTrackGain('music', 0.5);
    const musicGain = ctx.sources[0].outputs[0].outputs[0];
    expect(musicGain instanceof FakeGain && musicGain.gain.targets).toEqual([
      { target: 0.5, startTime: 10, timeConstant: 0.015 },
    ]);
    expect(ctx.sources.every((source) => source.starts.length === 1)).toBe(true);
  });

  it('setTrackGain uses the short de-click constant for mute and unmute', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    const musicGain = gainOfTrack(ctx, 'song');
    handle.setTrackGain('music', 0);
    musicGain.gain.value = 0.0001;
    handle.setTrackGain('music', 0.8);
    expect(musicGain.gain.targets).toEqual([
      { target: 0, startTime: 10, timeConstant: 0.003 },
      { target: 0.8, startTime: 10, timeConstant: 0.003 },
    ]);
    expect(ctx.sources.every((source) => source.starts.length === 1)).toBe(true);
  });

  it('seeds the last target from construction: muted track unmutes with the short constant', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    handle.setTrackGain('sfx', 0.8);
    expect(gainOfTrack(ctx, 'hit').gain.targets).toEqual([
      { target: 0.8, startTime: 10, timeConstant: 0.003 },
    ]);
  });

  it('seeds the last target from construction: audible track volume change keeps smoothing', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    handle.setTrackGain('music', 0.6);
    expect(gainOfTrack(ctx, 'song').gain.targets).toEqual([
      { target: 0.6, startTime: 10, timeConstant: 0.015 },
    ]);
  });

  it('seeds a track silenced by another track solo so unsolo uses the short constant', () => {
    const ctx = new FakeContext();
    const soloTracks = tracks.map((entry) =>
      entry.id === 'stems' ? { ...entry, solo: true } : entry,
    );
    const handle = applySchedule(ctx, plan, {
      buffers,
      tracks: soloTracks,
      from: 5,
      startAt: 10,
    });
    const musicGain = gainOfTrack(ctx, 'song');
    expect(musicGain.gain.value).toBe(0);
    handle.setTrackGain('music', 0.8);
    expect(musicGain.gain.targets).toEqual([{ target: 0.8, startTime: 10, timeConstant: 0.003 }]);
  });

  it('keeps the last target per track: muting sfx does not change music smoothing', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    handle.setTrackGain('sfx', 0.8);
    handle.setTrackGain('sfx', 0);
    handle.setTrackGain('music', 0.6);
    expect(gainOfTrack(ctx, 'hit').gain.targets.map((entry) => entry.timeConstant)).toEqual([
      0.003, 0.003,
    ]);
    expect(gainOfTrack(ctx, 'song').gain.targets).toEqual([
      { target: 0.6, startTime: 10, timeConstant: 0.015 },
    ]);
  });

  it('same-target re-sends keep their class and never restart sources', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    expect(() => {
      handle.setTrackGain('music', 0.8);
      handle.setTrackGain('sfx', 0);
      handle.setTrackGain('missing-track', 0);
    }).not.toThrow();
    expect(gainOfTrack(ctx, 'song').gain.targets).toEqual([
      { target: 0.8, startTime: 10, timeConstant: 0.015 },
    ]);
    expect(gainOfTrack(ctx, 'hit').gain.targets).toEqual([
      { target: 0, startTime: 10, timeConstant: 0.003 },
    ]);
    expect(ctx.sources.every((source) => source.starts.length === 1)).toBe(true);
    expect(ctx.sources.every((source) => source.stops.length === 0)).toBe(true);
  });

  it('stop() stops every source and activeSourceCount returns to 0', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    expect(handle.activeSourceCount()).toBe(2);
    handle.stop();
    expect(ctx.sources.every((source) => source.stops.length === 1)).toBe(true);
    expect(handle.activeSourceCount()).toBe(0);
  });

  it('a scheduled stop keeps sources active until the handoff time', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    handle.stop(10.03);
    expect(ctx.sources.map((source) => source.stops[0])).toEqual([10.03, 10.03]);
    expect(handle.activeSourceCount()).toBe(2);
    ctx.currentTime = 10.04;
    expect(handle.activeSourceCount()).toBe(0);
  });

  it('counts sources that ended naturally as inactive', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    ctx.sources[0].onended?.(new Event('ended'));
    expect(handle.activeSourceCount()).toBe(1);
  });

  it('creates a video trackGain and plays video-track clips through it', () => {
    const ctx = new FakeContext();
    const videoPlan: ScheduledClip[] = [
      { clipId: 'v', trackId: 'video', sourceId: 'film', when: 5, sourceOffset: 0.5, duration: 3 },
      ...plan,
    ];
    const withFilm = new Map(buffers).set('film', { id: 'film' });
    applySchedule(ctx, videoPlan, { buffers: withFilm, tracks, from: 5, startAt: 10 });
    expect(ctx.gains).toHaveLength(1 + tracks.length + 3);
    const videoSource = ctx.sources.find((source) => source.buffer?.id === 'film');
    expect(videoSource?.starts[0]).toEqual([10, 0.5, 3]);
    expect(videoSource && chain(videoSource)).toEqual([
      'source',
      'gain',
      'gain',
      'panner',
      'gain',
      'destination',
    ]);
    const videoGain = videoSource?.outputs[0].outputs[0];
    expect(videoGain instanceof FakeGain && videoGain.gain.value).toBe(0.8);
  });

  it('keeps a muted video clip scheduled with track gain 0', () => {
    const ctx = new FakeContext();
    const mutedTracks = tracks.map((entry) =>
      entry.id === 'video' ? { ...entry, mute: true } : entry,
    );
    const videoPlan: ScheduledClip[] = [
      { clipId: 'v', trackId: 'video', sourceId: 'film', when: 5, sourceOffset: 0, duration: 3 },
    ];
    const handle = applySchedule(ctx, videoPlan, {
      buffers: new Map([['film', { id: 'film' }]]),
      tracks: mutedTracks,
      from: 5,
      startAt: 10,
    });
    expect(ctx.sources).toHaveLength(1);
    const videoGain = ctx.sources[0].outputs[0].outputs[0];
    expect(videoGain instanceof FakeGain && videoGain.gain.value).toBe(0);
    handle.setTrackGain('video', 0.8);
    expect(videoGain instanceof FakeGain && videoGain.gain.value).toBe(0.8);
    expect(ctx.sources[0].starts).toHaveLength(1);
  });

  it('solo on the video lane silences audio lanes and vice versa', () => {
    const videoPlan: ScheduledClip[] = [
      { clipId: 'v', trackId: 'video', sourceId: 'film', when: 5, sourceOffset: 0, duration: 3 },
      ...plan,
    ];
    const withFilm = new Map(buffers).set('film', { id: 'film' });
    const gainOf = (ctx: FakeContext, id: string) => {
      const source = ctx.sources.find((entry) => entry.buffer?.id === id);
      const gain = source?.outputs[0].outputs[0];
      return gain instanceof FakeGain ? gain.gain.value : null;
    };
    const videoSolo = new FakeContext();
    applySchedule(videoSolo, videoPlan, {
      buffers: withFilm,
      tracks: tracks.map((entry) => (entry.id === 'video' ? { ...entry, solo: true } : entry)),
      from: 5,
      startAt: 10,
    });
    expect(gainOf(videoSolo, 'film')).toBe(0.8);
    expect(gainOf(videoSolo, 'song')).toBe(0);
    const musicSolo = new FakeContext();
    applySchedule(musicSolo, videoPlan, {
      buffers: withFilm,
      tracks: tracks.map((entry) => (entry.id === 'music' ? { ...entry, solo: true } : entry)),
      from: 5,
      startAt: 10,
    });
    expect(gainOf(musicSolo, 'film')).toBe(0);
    expect(gainOf(musicSolo, 'song')).toBe(0.8);
  });

  it('appendPlan schedules a loop iteration on the same track gains and releases ended sources', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    const firstTrackGain = ctx.sources[0].outputs[0].outputs[0];
    ctx.sources[1].onended?.(new Event('ended'));
    handle.appendPlan(
      [{ clipId: 'a', trackId: 'music', sourceId: 'song', when: 2, sourceOffset: 2, duration: 2 }],
      2,
      17,
    );
    expect(ctx.sources).toHaveLength(3);
    expect(ctx.sources[2].starts[0]).toEqual([17, 2, 2]);
    expect(ctx.sources[2].outputs[0].outputs[0]).toBe(firstTrackGain);
    expect(ctx.sources[1].disconnected).toBe(true);
    expect(ctx.sources[0].disconnected).toBe(false);
    expect(ctx.gains).toHaveLength(1 + tracks.length + 3);
    handle.stop(12);
    expect(ctx.sources[2].stops).toEqual([12]);
  });

  it('skips clips without a loaded buffer', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, { buffers: new Map(), tracks, from: 5, startAt: 10 });
    expect(ctx.sources).toHaveLength(0);
  });

  it('renderArrangementWav uses the same applySchedule as live playback', () => {
    const source = readFileSync(resolve(__dirname, '../graph.client.ts'), 'utf8');
    const render = source.slice(source.indexOf('export async function renderArrangementWav'));
    expect(render).toContain('new OfflineAudioContext');
    expect(render).toContain('applySchedule(ctx, planSchedule(arrangement, 0)');
    expect(render).toContain(
      'applySchedule(ctx, planSchedule(arrangement, renderWindow.start, renderWindow.end)',
    );
    expect(render).not.toContain('setTrackGain');
  });
});
