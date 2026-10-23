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
  ArrangementTrack,
  ScheduledClip,
  WorkspaceCollection,
} from '~/types/arrangement';
import {
  createArrangement,
  formatTrackPan,
  isSameArrangement,
  setArrangementTrackPan,
  TRACK_PAN_STEPS,
  trackPanValue,
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

const PAN_LABEL = 'Pan — მუსიკა';
const MUTE_SFX_LABEL = 'Mute — SFX';
const TRACKS_PER_GRAPH = 3;

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

const audioLog: { sources: FakeSource[]; gains: FakeGain[]; panners: FakePanner[] } = {
  sources: [],
  gains: [],
  panners: [],
};

class FakeGraphContext {
  currentTime = 10;
  destination = new FakeNode('destination');
  sources: FakeSource[] = [];
  gains: FakeGain[] = [];
  panners: FakePanner[] = [];
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
    const panner = new FakePanner('panner');
    this.panners.push(panner);
    return panner;
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
    const panner = new FakePanner('panner');
    audioLog.panners.push(panner);
    return panner;
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

const panCollection: WorkspaceCollection = {
  id: 'pan',
  label: 'pan',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'pan', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'pan', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function panArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => (track.id === 'music' ? { ...track, volume: 0.6 } : track)),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 2, sourceOffset: 0.5, duration: 2 },
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
    ],
  };
}

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

function graphTrack(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const graphPlan: ScheduledClip[] = [
  { clipId: 'm1', trackId: 'music', sourceId: 'song', when: 0, sourceOffset: 0, duration: 12 },
  { clipId: 's1', trackId: 'sfx', sourceId: 'hit', when: 2, sourceOffset: 0.5, duration: 2 },
];

const graphBuffers = new Map<string, { id: string }>([
  ['song', { id: 'song' }],
  ['hit', { id: 'hit' }],
]);

function latestPanners(): { video: FakePanner; music: FakePanner; sfx: FakePanner } {
  const [video, music, sfx] = audioLog.panners.slice(-TRACKS_PER_GRAPH);
  if (!video || !music || !sfx) {
    throw new Error('no graph panners');
  }
  return { video, music, sfx };
}

interface PanApiRef {
  current: ArrangementContextValue | null;
}

interface PointerClaimHolder {
  release: (() => void) | null;
}

function PanProbe({ api }: { api: PanApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: PanApiRef): ArrangementContextValue {
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
      { collection: panCollection, initialArrangement: initial },
      children,
    );
}

async function mountPanWorkspace() {
  const api: PanApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={panCollection} initialArrangement={panArrangement()}>
      <StudioWorkspace />
      <PanProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const lane = (trackId: string) => {
    const row = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
    if (!row) {
      throw new Error(`lane ${trackId} missing`);
    }
    return row;
  };
  const slider = (trackId = 'music') => {
    const input = lane(trackId).querySelector('[data-testid="arrangement-track-pan"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('pan slider missing');
    }
    return input;
  };
  const reset = (trackId = 'music') => {
    const button = lane(trackId).querySelector('[data-testid="arrangement-track-pan-reset"]');
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('pan reset missing');
    }
    return button;
  };
  return { api, view, lane, slider, reset };
}

const press = { button: 0, buttons: 1 };

describe('Track Pan (SRW-13 stage 4a, FB-05, R13-M2)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    audioLog.sources = [];
    audioLog.gains = [];
    audioLog.panners = [];
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
    it('setArrangementTrackPan(-1) changes only that track pan and leaves volume, mute, solo, clips and master', () => {
      const before = panArrangement();
      const after = setArrangementTrackPan(before, 'music', -1);
      expect(trackOf(after, 'music').pan).toBe(-1);
      expect({ ...trackOf(after, 'music'), pan: undefined }).toEqual({
        ...trackOf(before, 'music'),
        pan: undefined,
      });
      expect(trackOf(after, 'music').volume).toBe(0.6);
      expect(trackOf(after, 'sfx')).toBe(trackOf(before, 'sfx'));
      expect(trackOf(after, 'video')).toBe(trackOf(before, 'video'));
      expect(after.clips).toBe(before.clips);
      expect(after.master).toBe(before.master);
      expect(after.loop).toBe(before.loop);
      expect(TRACK_PAN_STEPS).toBe(50);
    });

    it('setting 0 removes the key so the arrangement equals a never-changed one', () => {
      const before = panArrangement();
      const panned = setArrangementTrackPan(before, 'music', 0.5);
      const centred = setArrangementTrackPan(panned, 'music', 0);
      expect(Object.hasOwn(trackOf(centred, 'music'), 'pan')).toBe(false);
      expect(isSameArrangement(centred, before)).toBe(true);
      expect(JSON.stringify(centred)).toBe(JSON.stringify(before));
      const nearZero = setArrangementTrackPan(panned, 'music', -0.001);
      expect(Object.hasOwn(trackOf(nearZero, 'music'), 'pan')).toBe(false);
      expect(Object.is(trackPanValue(trackOf(nearZero, 'music')), -0)).toBe(false);
    });

    it('clamps to ±1 and rounds to 1/50 steps', () => {
      const before = panArrangement();
      expect(trackOf(setArrangementTrackPan(before, 'music', 2), 'music').pan).toBe(1);
      expect(trackOf(setArrangementTrackPan(before, 'music', -2), 'music').pan).toBe(-1);
      expect(trackOf(setArrangementTrackPan(before, 'music', 0.333), 'music').pan).toBe(0.34);
      expect(trackOf(setArrangementTrackPan(before, 'music', -0.5), 'music').pan).toBe(-0.5);
      expect(trackPanValue(trackOf(before, 'music'))).toBe(0);
      expect(trackPanValue(trackOf(setArrangementTrackPan(before, 'sfx', 0.2), 'sfx'))).toBe(0.2);
    });

    it('returns the same object for NaN, an unknown id, the video track and an unchanged value', () => {
      const before = setArrangementTrackPan(panArrangement(), 'music', -0.5);
      expect(setArrangementTrackPan(before, 'music', Number.NaN)).toBe(before);
      expect(setArrangementTrackPan(before, 'music', Number.POSITIVE_INFINITY)).toBe(before);
      expect(setArrangementTrackPan(before, 'missing', 0.4)).toBe(before);
      expect(setArrangementTrackPan(before, 'video', 0.4)).toBe(before);
      expect(setArrangementTrackPan(before, 'music', -0.5)).toBe(before);
      expect(setArrangementTrackPan(before, 'music', -0.501)).toBe(before);
      expect(setArrangementTrackPan(before, 'sfx', 0)).toBe(before);
    });

    it('formatTrackPan shows C, NL and NR in 1…50 units', () => {
      expect(formatTrackPan(0)).toBe('C');
      expect(formatTrackPan(-1)).toBe('50L');
      expect(formatTrackPan(1)).toBe('50R');
      expect(formatTrackPan(-0.02)).toBe('1L');
      expect(formatTrackPan(-0.5)).toBe('25L');
      expect(formatTrackPan(-0.001)).toBe('C');
    });
  });

  describe('graph', () => {
    it('tracks with pan seed that panner and leave the others at 0 without new nodes', () => {
      const ctx = new FakeGraphContext();
      applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: [
          graphTrack('video', { kind: 'video' }),
          graphTrack('music', { pan: -1, volume: 0.6 }),
          graphTrack('sfx'),
        ],
        from: 0,
        startAt: 10,
      });
      expect(ctx.panners.map((panner) => panner.pan.value)).toEqual([0, -1, 0]);
      expect(ctx.panners).toHaveLength(3);
      expect(ctx.gains).toHaveLength(1 + 3 + graphPlan.length);
      expect(ctx.panners.every((panner) => panner.pan.targets.length === 0)).toBe(true);
    });

    it('setTrackPan ramps only that track panner with τ 0.015 and ignores a repeated value', () => {
      const ctx = new FakeGraphContext();
      const handle = applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: [graphTrack('video', { kind: 'video' }), graphTrack('music'), graphTrack('sfx')],
        from: 0,
        startAt: 10,
      });
      const [video, music, sfx] = ctx.panners;
      handle.setTrackPan('music', -1);
      handle.setTrackPan('music', -1);
      handle.setTrackPan('sfx', 0);
      expect(music.pan.targets).toEqual([{ target: -1, startTime: 10, timeConstant: 0.015 }]);
      expect(video.pan.targets).toEqual([]);
      expect(sfx.pan.targets).toEqual([]);
      expect(ctx.sources.every((source) => source.starts.length === 1)).toBe(true);
    });

    it('an unknown track and a disconnected handle do nothing', () => {
      const ctx = new FakeGraphContext();
      const handle = applySchedule(ctx, graphPlan, {
        buffers: graphBuffers,
        tracks: [graphTrack('music', { pan: 0.5 }), graphTrack('sfx', { pan: Number.NaN })],
        from: 0,
        startAt: 10,
      });
      const [music, sfx] = ctx.panners;
      expect(sfx.pan.value).toBe(0);
      handle.setTrackPan('music', 0.5);
      handle.setTrackPan('missing', 1);
      expect(music.pan.targets).toEqual([]);
      handle.disconnect();
      expect(music.disconnected && sfx.disconnected).toBe(true);
      handle.setTrackPan('music', -1);
      handle.setTrackPan('sfx', 1);
      expect(music.pan.targets).toEqual([]);
      expect(sfx.pan.targets).toEqual([]);
    });

    it('renderArrangementWav keeps the same applySchedule call and never calls setTrackPan', () => {
      const source = readFileSync(resolve(__dirname, '../graph.client.ts'), 'utf8');
      const start = source.indexOf('export async function renderArrangementWav');
      const tail = source.slice(start);
      const bodyEnd = tail.search(/\r?\n\}\r?\n/);
      expect(bodyEnd).toBeGreaterThan(0);
      const render = tail.slice(0, bodyEnd);
      expect(render).toContain(
        "return { blob: new Blob([bytes], { type: 'audio/wav' }), ...report };",
      );
      expect(render).toContain('applySchedule(ctx, planSchedule(arrangement, 0)');
      expect(render).toContain('tracks: arrangement.tracks,');
      expect(render).toContain('clipGains: clipLinearGains(arrangement)');
      expect(render).not.toContain('setTrackPan');
      expect(render).not.toContain('pan');
      expect(source).toContain('const initialPan = clampPan(track.pan ?? 0);');
      expect(source).toContain('panner.pan.value = initialPan;');
    });
  });

  describe('provider', () => {
    it('setTrackPan commits one Pan entry; Undo removes the key and Redo re-applies it', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      let changed = false;
      act(() => {
        changed = result.current.setTrackPan('music', -1);
      });
      expect(changed).toBe(true);
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(-1);
      expect(result.current.undoLabel).toBe(PAN_LABEL);
      act(() => result.current.undo());
      expect(Object.hasOwn(trackOf(result.current.arrangement, 'music'), 'pan')).toBe(false);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.redoLabel).toBe(PAN_LABEL);
      act(() => result.current.redo());
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(-1);
      let unchanged = true;
      act(() => {
        unchanged = result.current.setTrackPan('music', -1);
      });
      expect(unchanged).toBe(false);
      act(() => {
        unchanged = result.current.setTrackPan('video', 0.5);
      });
      expect(unchanged).toBe(false);
      expect(result.current.undoLabel).toBe(PAN_LABEL);
      act(() => result.current.undo());
      expect(result.current.undoLabel).toBeNull();
    });

    it('a pan change while playing does not reschedule and ramps the music panner; Undo too', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      expect(result.current.isPlaying).toBe(true);
      const graphs = applyScheduleMock.mock.calls.length;
      const sourceCount = audioLog.sources.length;
      const { video, music, sfx } = latestPanners();
      act(() => {
        result.current.setTrackPan('music', -1);
      });
      expect(applyScheduleMock.mock.calls.length).toBe(graphs);
      expect(audioLog.sources.length).toBe(sourceCount);
      expect(result.current.isPlaying).toBe(true);
      expect(music.pan.targets.map((entry) => [entry.target, entry.timeConstant])).toEqual([
        [-1, 0.015],
      ]);
      expect(video.pan.targets).toEqual([]);
      expect(sfx.pan.targets).toEqual([]);
      act(() => result.current.undo());
      expect(applyScheduleMock.mock.calls.length).toBe(graphs);
      expect(audioLog.sources.length).toBe(sourceCount);
      expect(music.pan.targets.map((entry) => entry.target)).toEqual([-1, 0]);
      expect(sfx.pan.targets).toEqual([]);
      act(() => result.current.redo());
      expect(music.pan.targets.map((entry) => entry.target)).toEqual([-1, 0, -1]);
      act(() => result.current.togglePlayback());
    });

    it('starts the graph with the stored pan on that panner only', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(setArrangementTrackPan(panArrangement(), 'music', 0.5)),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      const { video, music, sfx } = latestPanners();
      expect([video.pan.value, music.pan.value, sfx.pan.value]).toEqual([0, 0.5, 0]);
      act(() => result.current.togglePlayback());
    });

    it('begin → previews leave history untouched; commit makes exactly one entry', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      act(() => result.current.toggleTrackMute('sfx'));
      act(() => result.current.togglePlayback());
      const { music } = latestPanners();
      const presentBefore = result.current.arrangement;
      let begun = false;
      act(() => {
        begun = result.current.beginTrackPanGesture('music', 5);
      });
      expect(begun).toBe(true);
      act(() => result.current.previewTrackPan('music', -0.2));
      act(() => result.current.previewTrackPan('music', -0.6));
      act(() => result.current.previewTrackPan('music', -0.333));
      expect(result.current.arrangement).toBe(presentBefore);
      expect(result.current.undoLabel).toBe(MUTE_SFX_LABEL);
      expect(music.pan.targets.map((entry) => entry.target)).toEqual([-0.2, -0.6, -0.34]);
      act(() => result.current.commitTrackPan('music'));
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(-0.34);
      expect(result.current.undoLabel).toBe(PAN_LABEL);
      expect(result.current.isPointerGestureActive()).toBe(false);
      act(() => result.current.commitTrackPan('music'));
      act(() => result.current.undo());
      expect(result.current.undoLabel).toBe(MUTE_SFX_LABEL);
      expect(Object.hasOwn(trackOf(result.current.arrangement, 'music'), 'pan')).toBe(false);
      act(() => result.current.togglePlayback());
    });

    it('cancel makes no entry and pushes the stored pan back to the live panner', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(setArrangementTrackPan(panArrangement(), 'music', 0.2)),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      const { music } = latestPanners();
      act(() => {
        result.current.beginTrackPanGesture('music', 5);
      });
      act(() => result.current.previewTrackPan('music', -1));
      act(() => result.current.cancelTrackPan('music'));
      expect(music.pan.targets.map((entry) => entry.target)).toEqual([-1, 0.2]);
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(0.2);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.isPointerGestureActive()).toBe(false);
      act(() => result.current.commitTrackPan('music'));
      expect(result.current.undoLabel).toBeNull();
      act(() => result.current.togglePlayback());
    });

    it('a window pointercancel cancels and a window pointerup commits the gesture', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      act(() => {
        result.current.beginTrackPanGesture('music', 5);
      });
      act(() => result.current.previewTrackPan('music', -1));
      act(() => {
        window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 5 }));
      });
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.isPointerGestureActive()).toBe(false);
      act(() => {
        result.current.beginTrackPanGesture('music', 6);
      });
      act(() => result.current.previewTrackPan('music', 0.5));
      act(() => {
        window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 6 }));
      });
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(0.5);
      expect(result.current.undoLabel).toBe(PAN_LABEL);
      expect(result.current.isPointerGestureActive()).toBe(false);
    });

    it('a reschedule during a preview keeps the dragged pan on the new graph panner', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      act(() => {
        result.current.beginTrackPanGesture('music', 5);
      });
      act(() => result.current.previewTrackPan('music', -0.8));
      const graphs = applyScheduleMock.mock.calls.length;
      act(() => result.current.togglePlayback());
      act(() => result.current.togglePlayback());
      expect(applyScheduleMock.mock.calls.length).toBe(graphs + 1);
      const { video, music, sfx } = latestPanners();
      expect([video.pan.value, music.pan.value, sfx.pan.value]).toEqual([0, -0.8, 0]);
      expect(Object.hasOwn(trackOf(result.current.arrangement, 'music'), 'pan')).toBe(false);
      act(() => result.current.commitTrackPan('music'));
      expect(trackOf(result.current.arrangement, 'music').pan).toBe(-0.8);
      expect(music.pan.targets).toEqual([]);
      act(() => result.current.togglePlayback());
    });

    it('refuses during another pointer gesture, and a pan gesture blocks a second claim', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(panArrangement()),
      });
      await flushLoads();
      const clipDrag: PointerClaimHolder = { release: null };
      act(() => {
        clipDrag.release = result.current.claimPointerGesture(7, () => undefined);
      });
      let changed = true;
      act(() => {
        changed = result.current.setTrackPan('music', -1);
      });
      expect(changed).toBe(false);
      expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      let begun = true;
      act(() => {
        begun = result.current.beginTrackPanGesture('music', 9);
      });
      expect(begun).toBe(false);
      act(() => result.current.previewTrackPan('music', -1));
      act(() => result.current.commitTrackPan('music'));
      expect(Object.hasOwn(trackOf(result.current.arrangement, 'music'), 'pan')).toBe(false);
      expect(result.current.undoLabel).toBeNull();
      act(() => clipDrag.release?.());
      act(() => {
        begun = result.current.beginTrackPanGesture('music', 9);
      });
      expect(begun).toBe(true);
      act(() => result.current.previewTrackPan('music', -0.4));
      act(() => {
        changed = result.current.setTrackPan('music', 0.6);
      });
      expect(changed).toBe(false);
      expect(result.current.undoLabel).toBeNull();
      const secondClaim: PointerClaimHolder = { release: () => undefined };
      act(() => {
        secondClaim.release = result.current.claimPointerGesture(11, () => undefined);
      });
      expect(secondClaim.release).toBeNull();
      act(() => result.current.cancelTrackPan('music'));
      expect(result.current.isPointerGestureActive()).toBe(false);
    });
  });

  describe('lane header UI', () => {
    it('audio lanes show Pan and its reset; the video lane and a folded lane do not', async () => {
      const { lane, slider, reset } = await mountPanWorkspace();
      expect(slider('music').getAttribute('aria-label')).toBe(PAN_LABEL);
      expect(slider('music').getAttribute('aria-valuetext')).toBe('C');
      expect(slider('sfx').getAttribute('aria-label')).toBe('Pan — SFX');
      expect(reset('music').title).toBe('Pan → C');
      expect(reset('music').disabled).toBe(true);
      expect(reset('music').textContent).toBe('C');
      expect(lane('video').querySelector('[data-testid="arrangement-track-pan"]')).toBeNull();
      expect(lane('video').querySelector('[data-testid="arrangement-track-pan-reset"]')).toBeNull();
      const fold = lane('sfx').querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
      if (!fold) {
        throw new Error('sfx fold missing');
      }
      fireEvent.click(fold);
      expect(lane('sfx').getAttribute('data-track-folded')).toBe('true');
      expect(lane('sfx').querySelector('[data-testid="arrangement-track-pan"]')).toBeNull();
      expect(lane('sfx').querySelector('[data-testid="arrangement-track-pan-reset"]')).toBeNull();
      const text = `${lane('music').textContent ?? ''} ${lane('music').innerHTML}`;
      expect(text).not.toMatch(/balance/i);
    });

    it('row 1 DOM order is fold, name, Pan, readout', async () => {
      const { lane } = await mountPanWorkspace();
      const header = lane('music').querySelector('[data-testid="arrangement-track-header"]');
      const row = header?.firstElementChild;
      if (!row) {
        throw new Error('row 1 missing');
      }
      const children = Array.from(row.children);
      expect(children).toHaveLength(4);
      expect(children[0].getAttribute('data-testid')).toBe('arrangement-track-fold');
      expect(children[1].getAttribute('aria-label')).toBe('მუსიკა — აქტიური ხაზის არჩევა');
      expect(children[2].getAttribute('data-testid')).toBe('arrangement-track-pan');
      expect(children[3].getAttribute('data-testid')).toBe('arrangement-track-pan-reset');
      expect(children[2].className).toContain('w-12');
      expect(children[3].className).toContain('w-7');
    });

    it('a pointer drag follows the draft live without history, then commits one entry showing NL', async () => {
      const { api, slider, reset } = await mountPanWorkspace();
      act(() => live(api).toggleTrackMute('sfx'));
      const presentBefore = live(api).arrangement;
      fireEvent.pointerDown(slider(), { ...press, pointerId: 5 });
      fireEvent.change(slider(), { target: { value: '-10' } });
      fireEvent.change(slider(), { target: { value: '-20' } });
      fireEvent.change(slider(), { target: { value: '-30' } });
      expect(slider().value).toBe('-30');
      expect(reset().textContent).toBe('30L');
      expect(slider().getAttribute('aria-valuetext')).toBe('30L');
      expect(live(api).arrangement).toBe(presentBefore);
      expect(live(api).undoLabel).toBe(MUTE_SFX_LABEL);
      fireEvent.pointerUp(slider(), { pointerId: 9 });
      expect(live(api).undoLabel).toBe(MUTE_SFX_LABEL);
      expect(slider().value).toBe('-30');
      fireEvent.pointerUp(slider(), { pointerId: 5 });
      fireEvent.lostPointerCapture(slider(), { pointerId: 5 });
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(-0.6);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
      expect(slider().value).toBe('-30');
      expect(reset().textContent).toBe('30L');
      expect(reset().disabled).toBe(false);
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBe(MUTE_SFX_LABEL);
      expect(slider().value).toBe('0');
      expect(reset().textContent).toBe('C');
      act(() => live(api).redo());
      expect(slider().value).toBe('-30');
    });

    it('each keyboard value change is one entry immediately', async () => {
      const { api, slider } = await mountPanWorkspace();
      fireEvent.change(slider(), { target: { value: '1' } });
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(0.02);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
      fireEvent.change(slider(), { target: { value: '50' } });
      expect(slider().value).toBe('50');
      expect(slider().getAttribute('aria-valuetext')).toBe('50R');
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(0.02);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBeNull();
    });

    it('the readout click returns to C with one entry and is disabled afterwards', async () => {
      const { api, slider, reset } = await mountPanWorkspace();
      fireEvent.change(slider(), { target: { value: '-25' } });
      expect(reset().textContent).toBe('25L');
      expect(reset().disabled).toBe(false);
      reset().focus();
      fireEvent.click(reset());
      expect(Object.hasOwn(trackOf(live(api).arrangement, 'music'), 'pan')).toBe(false);
      expect(document.activeElement).toBe(slider());
      expect(reset().textContent).toBe('C');
      expect(reset().disabled).toBe(true);
      expect(slider().value).toBe('0');
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(-0.5);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBeNull();
    });

    it('a blur during a drag makes no entry and shows the stored pan again', async () => {
      const { api, slider, reset } = await mountPanWorkspace();
      fireEvent.change(slider(), { target: { value: '10' } });
      fireEvent.pointerDown(slider(), { ...press, pointerId: 5 });
      fireEvent.change(slider(), { target: { value: '-40' } });
      expect(slider().value).toBe('-40');
      fireEvent.blur(slider());
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(0.2);
      expect(slider().value).toBe('10');
      expect(reset().textContent).toBe('10R');
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireEvent.pointerUp(slider(), { pointerId: 5 });
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(0.2);
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBeNull();
    });

    it('a window pointercancel during a drag clears the draft without an entry', async () => {
      const { api, slider } = await mountPanWorkspace();
      fireEvent.pointerDown(slider(), { ...press, pointerId: 5 });
      fireEvent.change(slider(), { target: { value: '-40' } });
      act(() => {
        window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 5 }));
      });
      expect(slider().value).toBe('0');
      expect(live(api).undoLabel).toBeNull();
      fireEvent.change(slider(), { target: { value: '5' } });
      expect(trackOf(live(api).arrangement, 'music').pan).toBe(0.1);
      expect(live(api).undoLabel).toBe(PAN_LABEL);
    });

    it('Delete and Backspace on the focused Pan slider do not delete the selected clip', async () => {
      const { api, slider } = await mountPanWorkspace();
      act(() => live(api).selectClip('m1'));
      const clipsBefore = live(api).arrangement.clips;
      slider().focus();
      fireEvent.keyDown(slider(), { key: 'Delete' });
      fireEvent.keyDown(slider(), { key: 'Backspace' });
      expect(live(api).arrangement.clips).toBe(clipsBefore);
      expect(live(api).undoLabel).toBeNull();
    });

    it('Space on the focused Pan slider toggles playback like Volume', async () => {
      const { api, slider } = await mountPanWorkspace();
      slider().focus();
      fireEvent.keyDown(slider(), { key: ' ', code: 'Space' });
      expect(live(api).isPlaying).toBe(true);
      fireEvent.keyDown(slider(), { key: ' ', code: 'Space' });
      expect(live(api).isPlaying).toBe(false);
    });
  });
});
