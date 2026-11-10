import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { planChangedClips } from '~/lib/arrangement/reschedule';
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

describe('replaceClips', () => {
  type RescheduleArrangement = Parameters<typeof planChangedClips>[0];
  type RescheduleClip = RescheduleArrangement['clips'][number];
  type ReplaceShapes = Parameters<ReturnType<typeof startFixture>['replaceClips']>[4];

  class AutomationParam extends FakeParam {
    events: Array<[string, number, number]> = [];
    setValueAtTime(value: number, startTime: number) {
      this.events.push(['set', value, startTime]);
      this.value = value;
    }
    linearRampToValueAtTime(value: number, endTime: number) {
      this.events.push(['ramp', value, endTime]);
      this.value = value;
    }
  }

  class AutomationGain extends FakeGain {
    override gain = new AutomationParam();
  }

  class AutomationContext extends FakeContext {
    override createGain() {
      const gain = new AutomationGain('gain');
      this.gains.push(gain);
      return gain;
    }
  }

  const rescheduleTracks = [track('music'), track('sfx')];
  const rescheduleBuffers = new Map<string, FakeBuffer>([
    ['src-a', { id: 'src-a' }],
    ['src-b', { id: 'src-b' }],
    ['src-c', { id: 'src-c' }],
  ]);
  const allClipIds = ['a', 'b', 'c'];
  const bFadeIn = { start: 10, duration: 10, fadeIn: 1, fadeOut: 0 };
  const noShapes: ReplaceShapes = { clipFades: new Map(), clipEnvelopes: new Map() };

  function rescheduleFixture(): RescheduleArrangement {
    return {
      tracks: rescheduleTracks,
      clips: [
        { id: 'a', trackId: 'music', sourceId: 'src-a', start: 0, sourceOffset: 0, duration: 10 },
        { id: 'b', trackId: 'music', sourceId: 'src-b', start: 10, sourceOffset: 1, duration: 10 },
        { id: 'c', trackId: 'sfx', sourceId: 'src-c', start: 5, sourceOffset: 0, duration: 10 },
      ],
      loop: null,
      master: { gainDb: 0, mute: false },
    };
  }

  function fixtureWith(id: string, patch: Partial<RescheduleClip>): RescheduleArrangement {
    const base = rescheduleFixture();
    return {
      ...base,
      clips: base.clips.map((clip) => (clip.id === id ? { ...clip, ...patch } : clip)),
    };
  }

  function startFixture(ctx: FakeContext) {
    ctx.currentTime = 0;
    const handle = applySchedule(ctx, planChangedClips(rescheduleFixture(), allClipIds, 0), {
      buffers: rescheduleBuffers,
      tracks: rescheduleTracks,
      from: 0,
      startAt: 1,
    });
    ctx.currentTime = 2.9;
    return handle;
  }

  function sourcesOf(ctx: FakeContext, sourceId: string): FakeSource[] {
    return ctx.sources.filter((source) => source.buffer?.id === sourceId);
  }

  function automationOf(node: FakeNode) {
    if (!(node instanceof AutomationGain)) {
      throw new Error('not an automation gain');
    }
    return { value: node.gain.value, events: node.gain.events };
  }

  it('RC1 stops only the replaced clip at startAt and starts one new source', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    const [oldB, newB] = sourcesOf(ctx, 'src-b');
    expect(oldB.stops).toEqual([3]);
    for (const id of ['src-a', 'src-c']) {
      const [source] = sourcesOf(ctx, id);
      expect(sourcesOf(ctx, id)).toHaveLength(1);
      expect(source.stops).toEqual([]);
      expect(source.starts).toHaveLength(1);
    }
    expect(ctx.sources).toHaveLength(4);
    expect(newB.starts).toEqual([[3 + (10 - 2), 1, 9]]);
  });

  it('RC2 a sounding clip resumes at the same source offset', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('a', { fadeOut: 2 });
    handle.replaceClips(['a'], planChangedClips(next, ['a'], 2), 2, 3, noShapes);
    const [oldA, newA] = sourcesOf(ctx, 'src-a');
    expect(oldA.starts).toEqual([[1, 0, 10]]);
    expect(oldA.stops).toEqual([3]);
    expect(newA.starts).toHaveLength(1);
    expect(newA.starts[0][0]).toBe(3);
    expect(
      Math.abs(newA.starts[0][1] - (oldA.starts[0][1] + (3 - oldA.starts[0][0]))),
    ).toBeLessThan(1e-9);
    expect(newA.starts[0][1]).toBeCloseTo(2, 9);
  });

  it('RC3 a clip that has not started yet is stopped and rescheduled', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { sourceOffset: 1.5 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    const [oldB, newB] = sourcesOf(ctx, 'src-b');
    expect(oldB.starts).toEqual([[11, 1, 10]]);
    expect(oldB.stops).toEqual([3]);
    expect(newB.starts).toEqual([[3 + (10 - 2), 1.5, 10]]);
  });

  it('RC4 new fade shapes replace the old ones and an absent shape removes the fade', () => {
    const ctx = new AutomationContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { fadeIn: 1 });
    const items = planChangedClips(next, ['b'], 2);
    handle.replaceClips(['b'], items, 2, 3, {
      clipFades: new Map([['b', bFadeIn]]),
      clipEnvelopes: new Map(),
    });
    const faded = sourcesOf(ctx, 'src-b')[1];
    expect(chain(faded)).toEqual([
      'source',
      'gain',
      'gain',
      'gain',
      'panner',
      'gain',
      'destination',
    ]);
    const fresh = new AutomationContext();
    fresh.currentTime = 2.9;
    applySchedule(fresh, items, {
      buffers: rescheduleBuffers,
      tracks: rescheduleTracks,
      from: 2,
      startAt: 3,
      clipFades: new Map([['b', bFadeIn]]),
    });
    const expected = automationOf(fresh.sources[0].outputs[0]);
    expect(expected.events.length).toBeGreaterThan(0);
    expect(automationOf(faded.outputs[0])).toEqual(expected);
    ctx.currentTime = 3.5;
    handle.replaceClips(['b'], planChangedClips(rescheduleFixture(), ['b'], 3), 3, 3.6, noShapes);
    const plain = sourcesOf(ctx, 'src-b')[2];
    expect(chain(plain)).toEqual(['source', 'gain', 'gain', 'panner', 'gain', 'destination']);
  });

  it('RC5 only items whose clip id is replaced are started', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b', 'c'], 2), 2, 3, noShapes);
    expect(ctx.sources).toHaveLength(4);
    expect(sourcesOf(ctx, 'src-b')).toHaveLength(2);
    const [c] = sourcesOf(ctx, 'src-c');
    expect(sourcesOf(ctx, 'src-c')).toHaveLength(1);
    expect(c.stops).toEqual([]);
  });

  it('RC6 counts the replaced source until its stop and prunes ended states', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('a', { fadeOut: 2 });
    handle.replaceClips(['a'], planChangedClips(next, ['a'], 2), 2, 3, noShapes);
    expect(handle.activeSourceCount()).toBe(4);
    ctx.currentTime = 3.1;
    expect(handle.activeSourceCount()).toBe(3);
    const [oldA] = sourcesOf(ctx, 'src-a');
    const oldClipGain = oldA.outputs[0];
    oldA.onended?.(new Event('ended'));
    ctx.currentTime = 3.15;
    handle.replaceClips(['a'], planChangedClips(next, ['a'], 2.2), 2.2, 3.2, noShapes);
    expect(handle.activeSourceCount()).toBe(4);
    expect(oldA.disconnected).toBe(true);
    expect(oldClipGain.disconnected).toBe(true);
    ctx.currentTime = 3.3;
    expect(handle.activeSourceCount()).toBe(3);
  });

  it('RC7 a replaced clip gain is the new target for later gain changes', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, {
      clipGains: new Map([['b', 0.5]]),
      clipFades: new Map(),
      clipEnvelopes: new Map(),
    });
    const newB = sourcesOf(ctx, 'src-b')[1];
    const clipGain = newB.outputs[0];
    if (!(clipGain instanceof FakeGain)) {
      throw new Error('no clip gain');
    }
    expect(clipGain.gain.value).toBe(0.5);
    const targetsBefore = ctx.gains.map((gain) => gain.gain.targets.length);
    handle.setClipGain('b', 0.5);
    expect(ctx.gains.map((gain) => gain.gain.targets.length)).toEqual(targetsBefore);
  });

  it('RC8 a disconnected handle ignores a replace', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    handle.disconnect();
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    expect(ctx.sources).toHaveLength(3);
    for (const source of ctx.sources) {
      expect(source.stops).toEqual([]);
    }
  });

  it('RC9 a later appendPlan uses the replaced fade shape', () => {
    const ctx = new AutomationContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { fadeIn: 1 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, {
      clipFades: new Map([['b', bFadeIn]]),
      clipEnvelopes: new Map(),
    });
    const appendItems = planChangedClips(next, ['b'], 0);
    handle.appendPlan(appendItems, 0, 21);
    const appended = sourcesOf(ctx, 'src-b')[2];
    expect(appended.starts).toEqual([[31, 1, 10]]);
    expect(chain(appended)).toEqual([
      'source',
      'gain',
      'gain',
      'gain',
      'panner',
      'gain',
      'destination',
    ]);
    const fresh = new AutomationContext();
    applySchedule(fresh, appendItems, {
      buffers: rescheduleBuffers,
      tracks: rescheduleTracks,
      from: 0,
      startAt: 21,
      clipFades: new Map([['b', bFadeIn]]),
    });
    expect(automationOf(appended.outputs[0])).toEqual(automationOf(fresh.sources[0].outputs[0]));
  });

  it('RC10 a repeated replace pulls a later stop forward and keeps an earlier one', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    ctx.currentTime = 3.4;
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2.5), 2.5, 3.5, noShapes);
    const [oldB, middleB, lastB] = sourcesOf(ctx, 'src-b');
    expect(oldB.stops).toEqual([3]);
    expect(middleB.stops).toEqual([3.5]);
    expect(lastB.stops).toEqual([]);
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2.5), 2.5, 3.5, noShapes);
    expect(middleB.stops).toEqual([3.5]);
    expect(lastB.stops).toEqual([3.5]);

    const reverse = new FakeContext();
    const reverseHandle = startFixture(reverse);
    reverseHandle.replaceClips(['b'], planChangedClips(next, ['b'], 2.5), 2.5, 3.5, noShapes);
    reverse.currentTime = 2.95;
    reverseHandle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    const [firstB, secondB] = sourcesOf(reverse, 'src-b');
    expect(firstB.stops).toEqual([3.5, 3]);
    expect(secondB.stops).toEqual([3]);
  });

  it('RC11 new envelope shapes replace the old ones and an absent shape removes the envelope', () => {
    const ctx = new AutomationContext();
    const handle = startFixture(ctx);
    const points = [
      { time: 1, gain: 1 },
      { time: 6, gain: 0.25 },
    ];
    const next = fixtureWith('b', { envelope: points });
    const items = planChangedClips(next, ['b'], 2);
    const clipEnvelopes = new Map([['b', { points }]]);
    handle.replaceClips(['b'], items, 2, 3, { clipFades: new Map(), clipEnvelopes });
    const shaped = sourcesOf(ctx, 'src-b')[1];
    expect(chain(shaped)).toEqual([
      'source',
      'gain',
      'gain',
      'gain',
      'panner',
      'gain',
      'destination',
    ]);
    const fresh = new AutomationContext();
    applySchedule(fresh, items, {
      buffers: rescheduleBuffers,
      tracks: rescheduleTracks,
      from: 2,
      startAt: 3,
      clipEnvelopes,
    });
    const expected = automationOf(fresh.sources[0].outputs[0]);
    expect(expected.events.length).toBeGreaterThan(1);
    expect(automationOf(shaped.outputs[0])).toEqual(expected);
    ctx.currentTime = 3.5;
    handle.replaceClips(['b'], planChangedClips(rescheduleFixture(), ['b'], 3), 3, 3.6, noShapes);
    const plain = sourcesOf(ctx, 'src-b')[2];
    expect(chain(plain)).toEqual(['source', 'gain', 'gain', 'panner', 'gain', 'destination']);
  });

  it('RC12 a later stop(when) never moves a stop set by a replace', () => {
    const ctx = new FakeContext();
    const handle = startFixture(ctx);
    const next = fixtureWith('b', { duration: 9 });
    handle.replaceClips(['b'], planChangedClips(next, ['b'], 2), 2, 3, noShapes);
    handle.stop(3.5);
    const [oldB, newB] = sourcesOf(ctx, 'src-b');
    expect(oldB.stops).toEqual([3]);
    expect(newB.stops).toEqual([3.5]);
    for (const id of ['src-a', 'src-c']) {
      const [source] = sourcesOf(ctx, id);
      expect(source.stops).toEqual([3.5]);
    }
  });

  it('RC13 stop(when) moves clip and click stops earlier only', () => {
    const ctx = new FakeContext();
    ctx.currentTime = 0;
    const handle = applySchedule(ctx, planChangedClips(rescheduleFixture(), allClipIds, 0), {
      buffers: rescheduleBuffers,
      tracks: rescheduleTracks,
      from: 0,
      startAt: 1,
      metronome: {
        accent: { id: 'accent' },
        beat: { id: 'beat' },
        clicks: [
          { when: 4, offset: 0, duration: 0.03, accent: true },
          { when: 4.5, offset: 0, duration: 0.03, accent: false },
        ],
      },
    });
    const clicks = ctx.sources.filter(
      (source) => source.buffer?.id === 'accent' || source.buffer?.id === 'beat',
    );
    expect(clicks.length).toBeGreaterThanOrEqual(1);
    expect(ctx.sources).toHaveLength(allClipIds.length + clicks.length);
    ctx.currentTime = 2.9;
    handle.stop(3);
    handle.stop(3.5);
    for (const source of ctx.sources) {
      expect(source.stops).toEqual([3]);
    }
    ctx.currentTime = 2.95;
    handle.stop();
    for (const source of ctx.sources) {
      expect(source.stops).toEqual([3, undefined]);
    }
  });
});
