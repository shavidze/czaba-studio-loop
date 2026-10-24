import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementTrack,
  ScheduledClip,
  WorkspaceCollection,
} from '~/types/arrangement';
import {
  copyClipsToClipboard,
  copyRangeToClipboard,
  cutTimeToClipboard,
  planClipboardPaste,
} from '../clipboard';
import {
  clipLinearGain,
  clipLinearGains,
  createArrangement,
  deleteTime,
  duplicateClips,
  isSameArrangement,
  moveClip,
  setClipGainDb,
  splitClipAt,
  trimClipStart,
} from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, applySchedule: vi.fn(actual.applySchedule) };
});

const applyScheduleMock = vi.mocked(applySchedule);

const PLUS_SIX = 10 ** (6 / 20);
const PLUS_THREE = 10 ** (3 / 20);
const CLIP_GAIN_LABEL = 'Clip Gain';
const NONE_REASON = 'Select a clip first';
const GROUP_REASON = 'Clip Gain works on audio clips only — remove the video from the selection';
const VIDEO_REASON = 'A video clip has no Clip Gain — for its sound use the track Volume/Mute';
const INVALID_STATUS = 'Clip Gain: enter a number in dB (−60…+24).';

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  targets: Array<{ target: number; startTime: number; timeConstant: number }> = [];
  setTargetAtTime(target: number, startTime: number, timeConstant: number) {
    this.targets.push({ target, startTime, timeConstant });
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  disconnected = false;
  constructor(readonly kind: string) {}
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.disconnected = true;
  }
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
  starts: Array<[number, number, number]> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop() {}
}

const audioLog: { sources: FakeSource[]; gains: FakeGain[] } = { sources: [], gains: [] };

class FakeGraphContext {
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

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode('destination');
  sampleRate = 48000;
  get currentTime() {
    return Date.now() / 1000 - fakeClock.base;
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    const gain = new FakeGain('gain');
    audioLog.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new FakePanner('panner');
  }
  createBufferSource() {
    const source = new FakeSource('source');
    audioLog.sources.push(source);
    return source;
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const gainCollection: WorkspaceCollection = {
  id: 'gain',
  label: 'gain',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'gain', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'gain', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 1, sampleRate: 100 }),
};

function gainArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      {
        id: 'a',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 8,
        gainDb: 3,
      },
      { id: 'b', trackId: 'music', sourceId: 'song', start: 8, sourceOffset: 8, duration: 8 },
      { id: 'c', trackId: 'sfx', sourceId: 'hit', start: 2, sourceOffset: 0.5, duration: 2 },
      { id: 'v', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
    ],
  };
}

function clipOf(arrangement: Arrangement, id: string): ArrangementClip {
  const clip = arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

function graphTrack(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const graphTracks = [
  graphTrack('video', { kind: 'video' }),
  graphTrack('music'),
  graphTrack('sfx'),
];

const graphPlan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 0, sourceOffset: 0, duration: 8 },
  { clipId: 'b', trackId: 'music', sourceId: 'song', when: 8, sourceOffset: 8, duration: 8 },
  { clipId: 'c', trackId: 'sfx', sourceId: 'hit', when: 2, sourceOffset: 0.5, duration: 2 },
];

const graphBuffers = new Map<string, { id: string }>([
  ['song', { id: 'song' }],
  ['hit', { id: 'hit' }],
]);

function clipGainNode(source: FakeSource): FakeGain {
  const node = source.outputs[0];
  if (!(node instanceof FakeGain)) {
    throw new Error('source is not connected to a clip gain node');
  }
  return node;
}

function sourceAtOffset(sources: readonly FakeSource[], offset: number): FakeSource[] {
  return sources.filter((source) => source.starts[0]?.[1] === offset);
}

interface GainApiRef {
  current: ArrangementContextValue | null;
}

function GainProbe({ api }: { api: GainApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: GainApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function providerWrapper(initial: Arrangement) {
  return ({ children }: { children: ReactNode }) =>
    createElement(
      ArrangementProvider,
      { collection: gainCollection, initialArrangement: initial },
      children,
    );
}

async function mountGainWorkspace() {
  const api: GainApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={gainCollection} initialArrangement={gainArrangement()}>
      <StudioWorkspace />
      <GainProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
  const field = () => {
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain input missing');
    }
    return input;
  };
  const reset = () => {
    const button = view.getByTestId('arrangement-detail-clip-gain-reset');
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('clip gain reset missing');
    }
    return button;
  };
  const status = () => view.getByTestId('arrangement-status').textContent;
  return { api, view, field, reset, status };
}

describe('Clip Gain (SRW-13 stage 3, FB-04, R13-M1)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    audioLog.sources = [];
    audioLog.gains = [];
    applyScheduleMock.mockClear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('model', () => {
    it('setClipGainDb changes only that clip and leaves volumes, master and other clips untouched', () => {
      const before = gainArrangement();
      const after = setClipGainDb(before, 'b', 6);
      expect(clipOf(after, 'b').gainDb).toBe(6);
      expect(clipOf(after, 'a')).toBe(clipOf(before, 'a'));
      expect(clipOf(after, 'c')).toBe(clipOf(before, 'c'));
      expect(clipOf(after, 'v')).toBe(clipOf(before, 'v'));
      expect(after.tracks).toBe(before.tracks);
      expect(after.master).toBe(before.master);
      expect(after.loop).toBe(before.loop);
      expect({ ...clipOf(after, 'b'), gainDb: undefined }).toEqual({
        ...clipOf(before, 'b'),
        gainDb: undefined,
      });
    });

    it('setting 0 removes the key so the clip equals a never-changed clip', () => {
      const before = gainArrangement();
      const after = setClipGainDb(before, 'a', 0);
      expect(Object.hasOwn(clipOf(after, 'a'), 'gainDb')).toBe(false);
      const neverChanged: Arrangement = {
        ...before,
        clips: before.clips.map((clip) =>
          clip.id === 'a'
            ? {
                id: 'a',
                trackId: 'music',
                sourceId: 'song',
                start: 0,
                sourceOffset: 0,
                duration: 8,
              }
            : clip,
        ),
      };
      expect(isSameArrangement(after, neverChanged)).toBe(true);
      const nearZero = setClipGainDb(before, 'a', -0.04);
      expect(Object.hasOwn(clipOf(nearZero, 'a'), 'gainDb')).toBe(false);
    });

    it('clamps to −60…+24, rounds to 0.1 dB and returns the same object for refused input', () => {
      const before = gainArrangement();
      expect(clipOf(setClipGainDb(before, 'b', 30), 'b').gainDb).toBe(24);
      expect(clipOf(setClipGainDb(before, 'b', -100), 'b').gainDb).toBe(-60);
      expect(clipOf(setClipGainDb(before, 'b', 6.04), 'b').gainDb).toBe(6);
      expect(clipOf(setClipGainDb(before, 'b', -6.06), 'b').gainDb).toBe(-6.1);
      expect(setClipGainDb(before, 'b', Number.NaN)).toBe(before);
      expect(setClipGainDb(before, 'b', Number.POSITIVE_INFINITY)).toBe(before);
      expect(setClipGainDb(before, 'missing', 6)).toBe(before);
      expect(setClipGainDb(before, 'v', 6)).toBe(before);
      expect(setClipGainDb(before, 'a', 3)).toBe(before);
      expect(setClipGainDb(before, 'a', 3.04)).toBe(before);
      expect(setClipGainDb(before, 'b', 0)).toBe(before);
    });

    it('split, duplicate, Delete Time, trim and move keep gainDb on every part and copy', () => {
      const withGain = setClipGainDb(gainArrangement(), 'b', 6);
      const split = splitClipAt(withGain, 'b', 12);
      expect(split).not.toBeNull();
      if (!split) {
        return;
      }
      expect(clipOf(split.arrangement, split.leftId).gainDb).toBe(6);
      expect(clipOf(split.arrangement, split.rightId).gainDb).toBe(6);
      const duplicated = duplicateClips(withGain, ['b']);
      const copyId = duplicated?.copyIds[0];
      expect(duplicated?.arrangement && copyId).toBeTruthy();
      if (duplicated?.arrangement && copyId) {
        expect(clipOf(duplicated.arrangement, copyId).gainDb).toBe(6);
      }
      const cut = deleteTime(withGain, 10, 12);
      const musicParts = cut.clips.filter((clip) => clip.trackId === 'music' && clip.start >= 8);
      expect(musicParts.length).toBeGreaterThanOrEqual(1);
      expect(musicParts.every((clip) => clip.gainDb === 6)).toBe(true);
      const shifted = deleteTime(withGain, 1, 3);
      expect(clipOf(shifted, 'b').start).toBe(6);
      expect(clipOf(shifted, 'b').gainDb).toBe(6);
      expect(clipOf(trimClipStart(withGain, 'b', 9), 'b').gainDb).toBe(6);
      const moved = moveClip(withGain, 'b', 20);
      expect(moved && clipOf(moved, 'b').gainDb).toBe(6);
    });

    it('clipLinearGain and clipLinearGains convert dB and list only clips that have the field', () => {
      const arrangement = setClipGainDb(gainArrangement(), 'b', 6);
      expect(clipLinearGain(clipOf(arrangement, 'b'))).toBeCloseTo(PLUS_SIX, 9);
      expect(clipLinearGain(clipOf(arrangement, 'c'))).toBe(1);
      const gains = clipLinearGains(arrangement);
      expect([...gains.keys()].sort()).toEqual(['a', 'b']);
      expect(gains.get('a')).toBeCloseTo(PLUS_THREE, 9);
      expect(gains.get('b')).toBeCloseTo(PLUS_SIX, 9);
    });
  });

  describe('graph', () => {
    it('clipGains sets that clip gain node value and leaves the others at 1 without new nodes', () => {
      const ctx = new FakeGraphContext();
      applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: graphTracks,
        from: 0,
        startAt: 10,
        clipGains: new Map([['b', PLUS_SIX]]),
      });
      const [a, b, c] = ctx.sources;
      expect(clipGainNode(b).gain.value).toBeCloseTo(PLUS_SIX, 9);
      expect(clipGainNode(a).gain.value).toBe(1);
      expect(clipGainNode(c).gain.value).toBe(1);
      expect(ctx.gains).toHaveLength(1 + graphTracks.length + graphPlan.length);
    });

    it('setClipGain ramps only the live sources of that clip and ignores a repeated value', () => {
      const ctx = new FakeGraphContext();
      const handle = applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: graphTracks,
        from: 0,
        startAt: 10,
      });
      handle.appendPlan([graphPlan[1]], 0, 30);
      const [a, firstB, c, secondB] = ctx.sources;
      firstB.onended?.(new Event('ended'));
      handle.setClipGain('b', 2);
      handle.setClipGain('b', 2);
      handle.setClipGain('a', 1);
      expect(clipGainNode(secondB).gain.targets).toEqual([
        { target: 2, startTime: 10, timeConstant: 0.015 },
      ]);
      expect(clipGainNode(firstB).gain.targets).toEqual([]);
      expect(clipGainNode(a).gain.targets).toEqual([]);
      expect(clipGainNode(c).gain.targets).toEqual([]);
      expect(ctx.sources.every((source) => source.starts.length === 1)).toBe(true);
    });

    it('a source appended later for that clip starts at the stored gain, and disconnect stops updates', () => {
      const ctx = new FakeGraphContext();
      const handle = applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: graphTracks,
        from: 0,
        startAt: 10,
        clipGains: new Map([['a', PLUS_THREE]]),
      });
      handle.setClipGain('b', PLUS_SIX);
      handle.appendPlan([graphPlan[0], graphPlan[1]], 0, 30);
      const appendedA = ctx.sources[3];
      const appendedB = ctx.sources[4];
      expect(clipGainNode(appendedA).gain.value).toBeCloseTo(PLUS_THREE, 9);
      expect(clipGainNode(appendedB).gain.value).toBeCloseTo(PLUS_SIX, 9);
      handle.setClipGain('b', 1);
      handle.appendPlan([graphPlan[1]], 0, 50);
      expect(clipGainNode(ctx.sources[5]).gain.value).toBe(1);
      handle.disconnect();
      handle.setClipGain('b', 4);
      expect(clipGainNode(appendedB).gain.targets.map((entry) => entry.target)).toEqual([1]);
    });

    it('renderArrangementWav passes clipGains to the same applySchedule as live playback', () => {
      const source = readFileSync(resolve(__dirname, '../graph.client.ts'), 'utf8');
      const render = source.slice(source.indexOf('export async function renderArrangementWav'));
      expect(render).toContain('applySchedule(ctx, planSchedule(arrangement, 0)');
      expect(render).toContain('clipGains: clipLinearGains(arrangement)');
      expect(render).not.toContain('setTrackGain');
      expect(render).not.toContain('setClipGain');
    });
  });

  describe('clipboard', () => {
    it('copy by clips, copy by range and Cut Time carry gainDb, and paste writes it', () => {
      const arrangement = setClipGainDb(gainArrangement(), 'b', 6);
      const byClip = copyClipsToClipboard(arrangement, ['b']);
      expect(byClip?.items.map((item) => item.gainDb)).toEqual([6]);
      const byRange = copyRangeToClipboard(arrangement, { start: 6, end: 10, trackId: 'music' });
      expect(byRange?.items.map((item) => item.gainDb)).toEqual([3, 6]);
      const cutTime = cutTimeToClipboard(arrangement, 7, 9);
      expect(
        cutTime.clipboard.items
          .filter((item) => item.trackId === 'music')
          .map((item) => item.gainDb),
      ).toEqual([3, 6]);
      const plan = planClipboardPaste(arrangement, byClip, {
        at: 30,
        activeTrackId: 'music',
        isSourceAvailable: () => true,
      });
      const pastedId = plan.clipIds[0];
      expect(plan.arrangement && pastedId).toBeTruthy();
      if (plan.arrangement && pastedId) {
        expect(clipOf(plan.arrangement, pastedId).gainDb).toBe(6);
      }
    });

    it('a clipboard from clips without gain has no own gainDb on items or pasted clips', () => {
      const arrangement = gainArrangement();
      const byClip = copyClipsToClipboard(arrangement, ['b', 'c']);
      const byRange = copyRangeToClipboard(arrangement, { start: 9, end: 11, trackId: 'music' });
      for (const item of [...(byClip?.items ?? []), ...(byRange?.items ?? [])]) {
        expect(Object.hasOwn(item, 'gainDb')).toBe(false);
      }
      const plan = planClipboardPaste(arrangement, byRange, {
        at: 30,
        activeTrackId: 'music',
        isSourceAvailable: () => true,
      });
      const pasted = plan.arrangement ? clipOf(plan.arrangement, plan.clipIds[0]) : null;
      expect(pasted).not.toBeNull();
      expect(pasted && Object.hasOwn(pasted, 'gainDb')).toBe(false);
    });
  });

  describe('provider', () => {
    it('setClipGain commits one Clip Gain entry; Undo removes the key and Redo re-applies it', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      let changed = false;
      act(() => {
        changed = result.current.setClipGain('b', 6);
      });
      expect(changed).toBe(true);
      expect(clipOf(result.current.arrangement, 'b').gainDb).toBe(6);
      expect(result.current.undoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => result.current.undo());
      expect(Object.hasOwn(clipOf(result.current.arrangement, 'b'), 'gainDb')).toBe(false);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.redoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => result.current.redo());
      expect(clipOf(result.current.arrangement, 'b').gainDb).toBe(6);
    });

    it('an unchanged value or a video clip returns false and adds no entry', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      let changed = true;
      act(() => {
        changed = result.current.setClipGain('a', 3);
      });
      expect(changed).toBe(false);
      act(() => {
        changed = result.current.setClipGain('v', 6);
      });
      expect(changed).toBe(false);
      expect(result.current.undoLabel).toBeNull();
    });

    it('starts the graph with clipGains from the arrangement', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      const options = applyScheduleMock.mock.calls.at(-1)?.[2];
      expect(options?.clipGains?.get('a')).toBeCloseTo(PLUS_THREE, 9);
      expect(options?.clipGains?.has('b')).toBe(false);
      const [aSource] = sourceAtOffset(audioLog.sources, 0);
      expect(clipGainNode(aSource).gain.value).toBeCloseTo(PLUS_THREE, 9);
      act(() => result.current.togglePlayback());
    });

    it('a gain change while playing does not reschedule and ramps the clip gain node; Undo too', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      expect(result.current.isPlaying).toBe(true);
      const graphs = applyScheduleMock.mock.calls.length;
      const sourceCount = audioLog.sources.length;
      const [bSource] = sourceAtOffset(audioLog.sources, 8);
      const [aSource] = sourceAtOffset(audioLog.sources, 0);
      expect(bSource && aSource).toBeTruthy();
      act(() => {
        result.current.setClipGain('b', 6);
      });
      expect(applyScheduleMock.mock.calls.length).toBe(graphs);
      expect(audioLog.sources.length).toBe(sourceCount);
      expect(result.current.isPlaying).toBe(true);
      const bTargets = clipGainNode(bSource).gain.targets;
      expect(bTargets).toHaveLength(1);
      expect(bTargets[0].target).toBeCloseTo(PLUS_SIX, 9);
      expect(bTargets[0].timeConstant).toBe(0.015);
      expect(clipGainNode(aSource).gain.targets).toEqual([]);
      act(() => result.current.undo());
      expect(applyScheduleMock.mock.calls.length).toBe(graphs);
      expect(audioLog.sources.length).toBe(sourceCount);
      expect(
        clipGainNode(bSource)
          .gain.targets.map((entry) => entry.target)
          .at(-1),
      ).toBe(1);
      expect(clipGainNode(aSource).gain.targets).toEqual([]);
      act(() => result.current.togglePlayback());
    });

    it('refuses during a pointer gesture with the gesture status and no entry', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      let changed = true;
      act(() => {
        changed = result.current.setClipGain('b', 6);
      });
      expect(changed).toBe(false);
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(Object.hasOwn(clipOf(result.current.arrangement, 'b'), 'gainDb')).toBe(false);
      expect(result.current.undoLabel).toBeNull();
      act(() => release());
    });

    it('a pending track Volume preview is flushed beneath the Clip Gain entry', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(gainArrangement()),
      });
      await flushLoads();
      act(() => result.current.previewTrackVolume('music', 0.5));
      act(() => {
        result.current.setClipGain('b', 6);
      });
      expect(result.current.undoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => result.current.undo());
      expect(result.current.undoLabel).toBe('Volume');
      expect(result.current.arrangement.tracks.find((track) => track.id === 'music')?.volume).toBe(
        0.5,
      );
    });
  });

  describe('detail panel UI', () => {
    it('type 6 + Enter commits one entry, shows the status and the stored text', async () => {
      const { api, field, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('b'));
      expect(field().value).toBe('0.0');
      fireEvent.change(field(), { target: { value: '6' } });
      expect(live(api).undoLabel).toBeNull();
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(clipOf(live(api).arrangement, 'b').gainDb).toBe(6);
      expect(status()).toBe('Clip Gain: Song — +6.0 dB.');
      expect(field().value).toBe('6.0');
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBeNull();
      expect(field().value).toBe('0.0');
    });

    it('Escape reverts the text and the following blur commits nothing; blur with changed text commits', async () => {
      const { api, field } = await mountGainWorkspace();
      act(() => live(api).selectClip('b'));
      fireEvent.change(field(), { target: { value: '9' } });
      fireEvent.keyDown(field(), { key: 'Escape' });
      expect(field().value).toBe('0.0');
      fireEvent.blur(field());
      expect(live(api).undoLabel).toBeNull();
      expect(Object.hasOwn(clipOf(live(api).arrangement, 'b'), 'gainDb')).toBe(false);
      fireEvent.change(field(), { target: { value: '-4.5' } });
      fireEvent.blur(field());
      expect(clipOf(live(api).arrangement, 'b').gainDb).toBe(-4.5);
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    });

    it('Enter on an unchanged value, empty text and out-of-range values give the exact statuses', async () => {
      const { api, field, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('a'));
      expect(field().value).toBe('3.0');
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe('Clip Gain unchanged: +3.0 dB.');
      fireEvent.change(field(), { target: { value: '' } });
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe(INVALID_STATUS);
      expect(field().value).toBe('3.0');
      expect(live(api).undoLabel).toBeNull();
      fireEvent.change(field(), { target: { value: '30' } });
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe('Clip Gain: Song — +24.0 dB.');
      expect(field().value).toBe('24.0');
      fireEvent.change(field(), { target: { value: '-100' } });
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe('Clip Gain: Song — −60.0 dB.');
      expect(clipOf(live(api).arrangement, 'a').gainDb).toBe(-60);
    });

    it('0 dB reset removes the key with one entry and is disabled afterwards', async () => {
      const { api, field, reset, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('a'));
      expect(reset().disabled).toBe(false);
      expect(reset().textContent).toBe('0 dB');
      fireEvent.click(reset());
      expect(Object.hasOwn(clipOf(live(api).arrangement, 'a'), 'gainDb')).toBe(false);
      expect(status()).toBe('Clip Gain: Song — 0.0 dB.');
      expect(field().value).toBe('0.0');
      expect(reset().disabled).toBe(true);
      expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
      act(() => live(api).undo());
      expect(clipOf(live(api).arrangement, 'a').gainDb).toBe(3);
      expect(live(api).undoLabel).toBeNull();
    });

    it('0 dB with dirty text keeps focus in the field, discards the text and makes one entry', async () => {
      const { api, field, reset, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('a'));
      field().focus();
      fireEvent.change(field(), { target: { value: '9' } });
      const mouseDownAllowed = fireEvent.mouseDown(reset());
      expect(mouseDownAllowed).toBe(false);
      fireEvent.click(reset());
      expect(Object.hasOwn(clipOf(live(api).arrangement, 'a'), 'gainDb')).toBe(false);
      expect(field().value).toBe('0.0');
      expect(status()).toBe('Clip Gain: Song — 0.0 dB.');
      act(() => live(api).undo());
      expect(clipOf(live(api).arrangement, 'a').gainDb).toBe(3);
      expect(live(api).undoLabel).toBeNull();
    });

    it('a blur with unchanged or normalised-equal text commits nothing and shows no status', async () => {
      const { api, field, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('a'));
      const before = status();
      fireEvent.blur(field());
      fireEvent.change(field(), { target: { value: '3.00' } });
      fireEvent.blur(field());
      expect(status()).toBe(before);
      expect(field().value).toBe('3.0');
      expect(live(api).undoLabel).toBeNull();
    });

    it('nothing, a group and a video clip disable the field and reset with the exact linked reasons', async () => {
      const { api, view, field, reset } = await mountGainWorkspace();
      const reason = () => view.getByTestId('arrangement-detail-clip-gain-reason');
      const expectDisabled = (text: string) => {
        expect(field().disabled).toBe(true);
        expect(reset().disabled).toBe(true);
        expect(reason().textContent).toBe(text);
        expect(field().title).toBe(text);
        expect(reason().id).not.toBe('');
        expect(field().getAttribute('aria-describedby')).toBe(reason().id);
      };
      expectDisabled(NONE_REASON);
      act(() => live(api).selectClips(['a', 'v']));
      expectDisabled(GROUP_REASON);
      act(() => live(api).selectClip('v'));
      expectDisabled(VIDEO_REASON);
      act(() => live(api).selectClip('b'));
      expect(field().disabled).toBe(false);
      expect(view.queryByTestId('arrangement-detail-clip-gain-reason')).toBeNull();
      expect(field().getAttribute('aria-describedby')).toBeNull();
    });

    it('Delete and Backspace inside the focused field do not delete the clip', async () => {
      const { api, field } = await mountGainWorkspace();
      act(() => live(api).selectClip('b'));
      const clipsBefore = live(api).arrangement.clips;
      field().focus();
      fireEvent.keyDown(field(), { key: 'Delete' });
      fireEvent.keyDown(field(), { key: 'Backspace' });
      expect(live(api).arrangement.clips).toBe(clipsBefore);
      expect(live(api).undoLabel).toBeNull();
    });

    it('dirty text discarded on a selection change: no entry and each clip keeps its own gain', async () => {
      const { api, field } = await mountGainWorkspace();
      act(() => live(api).selectClip('b'));
      field().focus();
      fireEvent.change(field(), { target: { value: '9' } });
      act(() => live(api).selectClip('a'));
      expect(field().value).toBe('3.0');
      expect(live(api).undoLabel).toBeNull();
      expect(Object.hasOwn(clipOf(live(api).arrangement, 'b'), 'gainDb')).toBe(false);
      expect(clipOf(live(api).arrangement, 'a').gainDb).toBe(3);
    });

    it('a commit or 0 dB reset during a pointer gesture shows the gesture status and adds no entry', async () => {
      const { api, field, reset, status } = await mountGainWorkspace();
      act(() => live(api).selectClip('a'));
      let release: () => void = () => undefined;
      act(() => {
        release = live(api).beginPointerGesture();
      });
      fireEvent.click(reset());
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      fireEvent.change(field(), { target: { value: '9' } });
      fireEvent.keyDown(field(), { key: 'Enter' });
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(field().value).toBe('3.0');
      expect(clipOf(live(api).arrangement, 'a').gainDb).toBe(3);
      expect(live(api).undoLabel).toBeNull();
      act(() => release());
    });

    it('labels the column Clip Gain, dB and never uses sensitivity or trim wording', async () => {
      const { api, view, field } = await mountGainWorkspace();
      act(() => live(api).selectClip('b'));
      const column = view.getByTestId('arrangement-detail-clip-gain');
      expect(column.querySelector('label')?.firstChild?.textContent).toBe('Clip Gain, dB');
      expect(field().getAttribute('aria-label')).toBe('Clip Gain (dB)');
      expect(
        view.getByTestId('arrangement-detail-clip-gain-reset').getAttribute('aria-label'),
      ).toBe('Reset Clip Gain (0 dB)');
      const text = view.getByTestId('arrangement-detail-panel').textContent ?? '';
      expect(text).not.toMatch(/sensitivity|input gain|მგრძნობ|trim/i);
    });
  });
});
