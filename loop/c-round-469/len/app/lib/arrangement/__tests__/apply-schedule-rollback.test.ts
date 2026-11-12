import { describe, expect, it } from 'vitest';
import type { ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import {
  applySchedule,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
} from '../graph.client';

class RecordingParam implements ScheduleAudioParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class RecordingNode implements ScheduleAudioNode {
  readonly label: string;
  disconnects = 0;
  constructor(label: string) {
    this.label = label;
  }
  connect(destination: ScheduleAudioNode) {
    return destination;
  }
  disconnect() {
    this.disconnects += 1;
  }
}

class RecordingGain extends RecordingNode {
  gain = new RecordingParam();
}

class RecordingPanner extends RecordingNode {
  pan = new RecordingParam();
}

class RecordingSource extends RecordingNode {
  buffer: string | null = null;
  onended: ((event: Event) => unknown) | null = null;
  started = false;
  stops = 0;
  private readonly owner: RecordingContext;
  constructor(owner: RecordingContext) {
    super('source');
    this.owner = owner;
  }
  start() {
    this.owner.startCalls += 1;
    if (this.owner.startCalls === this.owner.throwOnStart) {
      throw this.owner.startError;
    }
    this.started = true;
  }
  stop() {
    this.stops += 1;
    if (this.owner.stopThrows) {
      throw new Error('stop failed');
    }
  }
}

class RecordingContext implements ScheduleAudioContext<string> {
  readonly currentTime = 0;
  readonly destination = new RecordingNode('destination');
  readonly nodes: RecordingNode[] = [];
  readonly sources: RecordingSource[] = [];
  startCalls = 0;
  throwOnStart = 0;
  stopThrows = false;
  readonly startError = new Error('start failed');
  createBufferSource() {
    const source = new RecordingSource(this);
    this.nodes.push(source);
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new RecordingGain('gain');
    this.nodes.push(gain);
    return gain;
  }
  createStereoPanner() {
    const panner = new RecordingPanner('panner');
    this.nodes.push(panner);
    return panner;
  }
}

const tracks: ArrangementTrack[] = [
  { id: 'a', kind: 'audio', name: 'A', volume: 1, mute: false, solo: false },
  { id: 'b', kind: 'audio', name: 'B', volume: 1, mute: false, solo: false },
];

const plan: ScheduledClip[] = [
  { clipId: 'c1', trackId: 'a', sourceId: 's1', when: 0, sourceOffset: 0, duration: 4 },
  { clipId: 'c2', trackId: 'b', sourceId: 's2', when: 0, sourceOffset: 0, duration: 4 },
  { clipId: 'c3', trackId: 'a', sourceId: 's1', when: 4, sourceOffset: 0, duration: 4 },
];

const buffers = new Map([
  ['s1', 'buffer-1'],
  ['s2', 'buffer-2'],
]);

function scheduleOn(ctx: RecordingContext, tap?: RecordingNode, metronome = false) {
  return applySchedule(ctx, plan, {
    buffers,
    tracks,
    from: 0,
    startAt: 0.05,
    tap,
    trackTaps: tap ? new Map([['a', tap]]) : undefined,
    clipFades: new Map([['c1', { start: 0, duration: 4, fadeIn: 0.5, fadeOut: 0.5 }]]),
    metronome: metronome
      ? {
          accent: 'accent',
          beat: 'beat',
          clicks: [
            { when: 0, offset: 0, duration: 0.05, accent: true },
            { when: 0.5, offset: 0, duration: 0.05, accent: false },
          ],
        }
      : undefined,
  });
}

describe('applySchedule all-or-nothing (GATE-B385-M2)', () => {
  it('AR1: a start that throws mid-plan stops every started source, disconnects every node and rethrows the same error', () => {
    const ctx = new RecordingContext();
    const tap = new RecordingNode('tap');
    ctx.throwOnStart = 2;
    let caught: unknown = null;
    try {
      scheduleOn(ctx, tap);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBe(ctx.startError);
    const started = ctx.sources.filter((source) => source.started);
    expect(started).toHaveLength(1);
    expect(started.map((source) => source.stops)).toEqual([1]);
    expect(ctx.sources.filter((source) => !source.started).map((source) => source.stops)).toEqual([
      0,
    ]);
    expect(ctx.nodes.map((node) => node.disconnects)).toEqual(ctx.nodes.map(() => 1));
    expect(tap.disconnects).toBe(0);
    expect(ctx.destination.disconnects).toBe(0);
  });

  it('AR2: a metronome click that throws stops the started clip sources and clicks, disconnects the click gain and rethrows', () => {
    const ctx = new RecordingContext();
    ctx.throwOnStart = 5;
    expect(() => scheduleOn(ctx, undefined, true)).toThrow(ctx.startError);
    const started = ctx.sources.filter((source) => source.started);
    expect(started).toHaveLength(4);
    expect(started.every((source) => source.stops === 1)).toBe(true);
    expect(ctx.nodes.map((node) => node.disconnects)).toEqual(ctx.nodes.map(() => 1));
  });

  it('AR3: a stop that throws during the rollback does not replace the original error', () => {
    const ctx = new RecordingContext();
    ctx.throwOnStart = 3;
    ctx.stopThrows = true;
    expect(() => scheduleOn(ctx)).toThrow(ctx.startError);
    expect(ctx.sources.filter((source) => source.started).map((source) => source.stops)).toEqual([
      1, 1,
    ]);
    expect(ctx.nodes.map((node) => node.disconnects)).toEqual(ctx.nodes.map(() => 1));
  });

  it('AR4: a schedule that builds normally stops and disconnects nothing until its handle does', () => {
    const ctx = new RecordingContext();
    const tap = new RecordingNode('tap');
    const handle = scheduleOn(ctx, tap, true);
    expect(ctx.sources.every((source) => source.started)).toBe(true);
    expect(ctx.sources.map((source) => source.stops).every((stops) => stops === 0)).toBe(true);
    expect(ctx.nodes.every((node) => node.disconnects === 0)).toBe(true);
    expect(handle.activeSourceCount()).toBe(3);
    handle.disconnect();
    expect(ctx.nodes.every((node) => node.disconnects === 1)).toBe(true);
    expect(tap.disconnects).toBe(0);
  });

  it('AR5: an appended plan whose start throws keeps the earlier sources stoppable and detaches only the failed clip', () => {
    const ctx = new RecordingContext();
    const handle = scheduleOn(ctx);
    const firstBuild = ctx.nodes.length;
    ctx.throwOnStart = ctx.startCalls + 2;
    expect(() => handle.appendPlan(plan, 8, 8.05)).toThrow(ctx.startError);
    const appended = ctx.nodes.slice(firstBuild);
    expect(appended.filter((node) => node.disconnects === 1)).toHaveLength(2);
    expect(appended.filter((node) => node.disconnects === 0)).toHaveLength(3);
    expect(handle.activeSourceCount()).toBe(4);
    handle.stop();
    expect(
      ctx.sources.filter((source) => source.started).every((source) => source.stops === 1),
    ).toBe(true);
    expect(handle.activeSourceCount()).toBe(0);
  });
});
