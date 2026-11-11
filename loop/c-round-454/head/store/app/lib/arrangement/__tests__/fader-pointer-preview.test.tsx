import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider, useArrangementMixDraftStore } from '~/contexts/ArrangementContext';
import { applySchedule, type ScheduleHandle } from '~/lib/arrangement/graph.client';
import {
  type ArrangementMixDraftStore,
  groupVolumeDraftKey,
  trackPanDraftKey,
} from '~/lib/arrangement/mix-draft-store';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { FADER_SHIFT_FINE_DIVISOR, relativeFaderValue } from '../fader';
import { setTrackGroupMix } from '../groups';
import {
  createArrangement,
  formatTrackPan,
  MASTER_GAIN_MAX_DB,
  MASTER_GAIN_MIN_DB,
  TRACK_PAN_STEPS,
  trackPanValue,
} from '../model';
import { trackEffectiveGains } from '../schedule';
import {
  formatTrackVolumeDb,
  TRACK_VOLUME_DB_DEFAULT,
  TRACK_VOLUME_DB_MAX,
  TRACK_VOLUME_DB_MIN,
  TRACK_VOLUME_DB_STEP,
  trackVolumeFromDb,
  trackVolumeSliderDb,
} from '../track-volume-db';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

interface ProbeFiber {
  type: unknown;
  memoizedProps: unknown;
  memoizedState: unknown;
  alternate: ProbeFiber | null;
  child: ProbeFiber | null;
  sibling: ProbeFiber | null;
}

const renderLog = vi.hoisted(() => {
  const counts = new Map<string, number>();
  const seen = new WeakMap<object, { props: unknown; state: unknown }>();
  const componentName = (type: unknown): string | null => {
    if (typeof type === 'function' && 'name' in type && typeof type.name === 'string') {
      return type.name;
    }
    if (
      typeof type === 'object' &&
      type !== null &&
      'displayName' in type &&
      typeof type.displayName === 'string'
    ) {
      return type.displayName;
    }
    return null;
  };
  const recordCommit = (root: ProbeFiber) => {
    const stack: ProbeFiber[] = [root];
    while (stack.length > 0) {
      const fiber = stack.pop();
      if (!fiber) {
        continue;
      }
      const name = componentName(fiber.type);
      if (name) {
        const previous =
          seen.get(fiber) ?? (fiber.alternate ? seen.get(fiber.alternate) : undefined);
        if (
          !previous ||
          previous.props !== fiber.memoizedProps ||
          previous.state !== fiber.memoizedState
        ) {
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        seen.set(fiber, { props: fiber.memoizedProps, state: fiber.memoizedState });
        if (fiber.alternate) {
          seen.delete(fiber.alternate);
        }
      }
      if (fiber.sibling) {
        stack.push(fiber.sibling);
      }
      if (fiber.child) {
        stack.push(fiber.child);
      }
    }
  };
  Object.defineProperty(globalThis, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: {
      isDisabled: false,
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => undefined,
      onCommitFiberRoot: (_rendererId: number, root: { current: ProbeFiber }) =>
        recordCommit(root.current),
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
    },
  });
  return { counts };
});

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

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
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
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
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
  copyToChannel() {}
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

type PanCancelTrigger = 'cancel' | 'blur' | 'steal';

const PAN_CANCEL_TRIGGERS: Array<[string, PanCancelTrigger]> = [
  ['FP14a pointercancel', 'cancel'],
  ['FP14b fader blur mid-drag', 'blur'],
  ['FP14c stolen claim', 'steal'],
];

const GROUP_ID = 'g1';
const GROUP_NAME = 'Group 1';
const MASTER_STEP_DB = 0.5;
const PAN_LABEL = 'Pan — მუსიკა';
const SEEDED_PAN_STEPS = 10;
const PARENT_NAMES = [
  'StudioWorkspace',
  'ArrangementLane',
  'ArrangementGroupHeader',
  'ArrangementMasterViewInner',
  'PreviewProbe',
];

const previewCollection: WorkspaceCollection = {
  id: 'fader-preview',
  label: 'fader-preview',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader-preview', kind: 'music', origin: 'demo' },
    { id: 'stem', title: 'Stem', collectionLabel: 'fader-preview', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader-preview', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

const PREVIEW_CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 20 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 0, sourceOffset: 0, duration: 20 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 20 },
];

function previewArrangement(loop = false): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => {
      if (track.id === 'music') {
        return { ...track, volume: 0.6 };
      }
      if (track.id === 'stems') {
        return { ...track, volume: 0.5, groupId: GROUP_ID };
      }
      if (track.id === 'sfx') {
        return { ...track, volume: 0.8, groupId: GROUP_ID };
      }
      return track;
    }),
    clips: PREVIEW_CLIPS,
    groups: [{ id: GROUP_ID, name: GROUP_NAME, parentId: null, volume: 0.7 }],
    master: { gainDb: -3, mute: false },
    loop: loop ? { start: 0, end: 1, enabled: true } : null,
  };
}

interface PreviewApiRef {
  current: WorkspaceProbeValue | null;
  drafts: ArrangementMixDraftStore | null;
}

function PreviewProbe({ api }: { api: PreviewApiRef }) {
  api.current = useWorkspaceProbe();
  api.drafts = useArrangementMixDraftStore();
  return null;
}

function live(api: PreviewApiRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function drafts(api: PreviewApiRef): ArrangementMixDraftStore {
  if (!api.drafts) {
    throw new Error('provider not mounted');
  }
  return api.drafts;
}

const frames: FrameRequestCallback[] = [];

function runFrames() {
  const pending = frames.splice(0, frames.length);
  act(() => {
    for (const frame of pending) {
      frame(performance.now());
    }
  });
}

async function mountPreviewWorkspace(loop = false) {
  const api: PreviewApiRef = { current: null, drafts: null };
  const view = render(
    <ArrangementProvider
      collection={previewCollection}
      initialArrangement={previewArrangement(loop)}
    >
      <StudioWorkspace />
      <PreviewProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 && ['song', 'stem', 'hit'].some((id) => !live(api).sourceDurations.has(id));
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  const slider = (name: string): HTMLInputElement => {
    const element = view.getByRole('slider', { name });
    if (!(element instanceof HTMLInputElement)) {
      throw new Error(`slider ${name} missing`);
    }
    return element;
  };
  const controls = {
    music: () => slider('Volume — მუსიკა'),
    group: () => slider(`Volume — ${GROUP_NAME} (group)`),
    master: () => slider('Master Volume'),
    pan: () => slider(PAN_LABEL),
    masterReadout: () => view.getByTestId('arrangement-master-readout'),
    panReset: () => view.getByRole('button', { name: 'Reset Pan to centre — მუსიკა' }),
  };
  return { api, view, controls };
}

function latestHandle(): ScheduleHandle {
  const result = applyScheduleMock.mock.results.at(-1);
  if (!result || result.type !== 'return') {
    throw new Error('no graph was created');
  }
  return result.value;
}

function latestGraphOptions() {
  const call = applyScheduleMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('no graph was created');
  }
  return call[2];
}

function stubFaderWidth(input: HTMLInputElement, width: number) {
  const rect: DOMRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width,
    height: 4,
    right: width,
    bottom: 4,
    toJSON: () => ({}),
  };
  Object.defineProperty(input, 'getBoundingClientRect', { configurable: true, value: () => rect });
}

function pressFader(input: HTMLInputElement, pointerId: number, shiftKey = false) {
  stubFaderWidth(input, 100);
  fireEvent.pointerDown(input, { button: 0, buttons: 1, pointerId, clientX: 50, shiftKey });
}

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  clientX = 50,
  shiftKey = false,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX, shiftKey }));
  });
}

function volumeSliderDbAfter(startDb: number, deltaPx: number, fine = false): number {
  return relativeFaderValue({
    startValue: startDb,
    deltaPx,
    widthPx: fine ? 100 * FADER_SHIFT_FINE_DIVISOR : 100,
    min: TRACK_VOLUME_DB_MIN,
    max: TRACK_VOLUME_DB_MAX,
    step: TRACK_VOLUME_DB_STEP,
  });
}

function masterDbAfter(startDb: number, deltaPx: number): number {
  return relativeFaderValue({
    startValue: startDb,
    deltaPx,
    widthPx: 100,
    min: MASTER_GAIN_MIN_DB,
    max: MASTER_GAIN_MAX_DB,
    step: MASTER_STEP_DB,
  });
}

function undoDepth(api: PreviewApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  for (let index = 0; index < labels.length; index++) {
    act(() => live(api).redo());
  }
  return labels;
}

function clipHeaderOf(container: HTMLElement, clipId: string): HTMLElement {
  const header = container.querySelector(`[data-clip-id="${clipId}"]`)?.firstElementChild;
  if (!(header instanceof HTMLElement)) {
    throw new Error(`clip ${clipId} header missing`);
  }
  return header;
}

function parentRenders(): number {
  return PARENT_NAMES.reduce((sum, name) => sum + (renderLog.counts.get(name) ?? 0), 0);
}

function trackParamCalls(spy: { mock: { calls: unknown[][] } }, trackId: string): unknown[] {
  return spy.mock.calls.filter((call) => call[0] === trackId).map((call) => call[1]);
}

describe('PERF-FADER-a pointer fader preview (D-29z179)', { timeout: 20_000 }, () => {
  beforeEach(() => {
    frames.length = 0;
    fakeClock.base = Date.now() / 1000;
    applyScheduleMock.mockClear();
    renderLog.counts.clear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('FP0: every PARENT_NAMES entry is a live fiber name that renders on mount (B-R374-MASTER-VACUOUS-NAME-COUNTS)', async () => {
    await mountPreviewWorkspace();
    for (const name of PARENT_NAMES) {
      expect(renderLog.counts.get(name) ?? 0, name).toBeGreaterThan(0);
    }
  });

  it('FP1: a track pointer drag writes no history and re-renders no parent per move; the model stays put while the live gain follows', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setTrackGain = vi.spyOn(handle, 'setTrackGain');
    const stored = live(api).getArrangement();
    const startDb = trackVolumeSliderDb(0.6);
    pressFader(controls.music(), 21);
    renderLog.counts.clear();
    for (const deltaPx of [-5, -10, -15, -20]) {
      const sliderDb = volumeSliderDbAfter(startDb, deltaPx);
      windowPointer('pointermove', 21, 50 + deltaPx);
      expect(controls.music().value).toBe(String(sliderDb));
      expect(controls.music().getAttribute('aria-valuetext')).toBe(
        formatTrackVolumeDb(trackVolumeFromDb(sliderDb)),
      );
      expect(live(api).getArrangement()).toBe(stored);
      expect(live(api).undoLabel).toBeNull();
      expect(trackParamCalls(setTrackGain, 'music').at(-1)).toBe(trackVolumeFromDb(sliderDb));
    }
    expect(parentRenders()).toBe(0);
    expect(renderLog.counts.get('ArrangementMixFader') ?? 0).toBeGreaterThanOrEqual(4);
    expect(applyScheduleMock.mock.calls.length).toBe(1);
    windowPointer('pointerup', 21, 30);
    act(() => live(api).togglePlayback());
  });

  it('FP2: pointerup writes exactly one Volume entry with the last previewed volume; Undo restores the model and the live gain', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const setTrackGain = vi.spyOn(latestHandle(), 'setTrackGain');
    const startDb = trackVolumeSliderDb(0.6);
    pressFader(controls.music(), 22);
    windowPointer('pointermove', 22, 40);
    windowPointer('pointermove', 22, 25);
    const lastDb = volumeSliderDbAfter(startDb, -25);
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(0.6);
    windowPointer('pointerup', 22, 25);
    const committed = live(api)
      .getArrangement()
      .tracks.find((track) => track.id === 'music');
    expect(committed?.volume).toBe(trackVolumeFromDb(lastDb));
    expect(undoDepth(api)).toEqual(['Volume']);
    expect(controls.music().value).toBe(String(lastDb));
    act(() => live(api).undo());
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(0.6);
    expect(trackParamCalls(setTrackGain, 'music').at(-1)).toBe(0.6);
    expect(controls.music().value).toBe(String(startDb));
    act(() => live(api).togglePlayback());
  });

  it('FP3: a group drag drives every member live gain; pointercancel restores every member gain and display with no entry', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const setTrackGain = vi.spyOn(latestHandle(), 'setTrackGain');
    const stored = live(api).getArrangement();
    const storedGains = trackEffectiveGains(stored);
    const startDb = trackVolumeSliderDb(0.7);
    pressFader(controls.group(), 23);
    for (const deltaPx of [-10, -20]) {
      const sliderDb = volumeSliderDbAfter(startDb, deltaPx);
      windowPointer('pointermove', 23, 50 + deltaPx);
      const expected = trackEffectiveGains(
        setTrackGroupMix(stored, GROUP_ID, { volume: trackVolumeFromDb(sliderDb) }),
      );
      expect(trackParamCalls(setTrackGain, 'stems').at(-1)).toBe(expected.get('stems'));
      expect(trackParamCalls(setTrackGain, 'sfx').at(-1)).toBe(expected.get('sfx'));
      expect(trackParamCalls(setTrackGain, 'music').at(-1)).toBe(storedGains.get('music'));
      expect(controls.group().value).toBe(String(sliderDb));
      expect(live(api).getArrangement()).toBe(stored);
    }
    windowPointer('pointercancel', 23, 30);
    expect(trackParamCalls(setTrackGain, 'stems').at(-1)).toBe(storedGains.get('stems'));
    expect(trackParamCalls(setTrackGain, 'sfx').at(-1)).toBe(storedGains.get('sfx'));
    expect(controls.group().value).toBe(String(startDb));
    expect(controls.group().getAttribute('aria-valuetext')).toBe(formatTrackVolumeDb(0.7));
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
    act(() => live(api).togglePlayback());
  });

  it('FP4: a stolen claim mid-drag reverts every group member gain and the display with no entry', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const setTrackGain = vi.spyOn(latestHandle(), 'setTrackGain');
    const stored = live(api).getArrangement();
    const storedGains = trackEffectiveGains(stored);
    pressFader(controls.group(), 24);
    windowPointer('pointermove', 24, 20);
    expect(trackParamCalls(setTrackGain, 'stems').at(-1)).not.toBe(storedGains.get('stems'));
    expect(live(api).getArrangement()).toBe(stored);
    let releaseClaim: (() => void) | null = null;
    act(() => {
      releaseClaim = live(api).claimPointerGesture(24, () => undefined);
    });
    expect(trackParamCalls(setTrackGain, 'stems').at(-1)).toBe(storedGains.get('stems'));
    expect(trackParamCalls(setTrackGain, 'sfx').at(-1)).toBe(storedGains.get('sfx'));
    expect(controls.group().value).toBe(String(trackVolumeSliderDb(0.7)));
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBeNull();
    act(() => releaseClaim?.());
    windowPointer('pointerup', 24, 20);
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).togglePlayback());
  });

  it('FP5: a fader blur during the gesture cancels with no entry and restores the display', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    const stored = live(api).getArrangement();
    pressFader(controls.music(), 25);
    windowPointer('pointermove', 25, 30);
    expect(controls.music().value).not.toBe(String(trackVolumeSliderDb(0.6)));
    expect(live(api).getArrangement()).toBe(stored);
    fireEvent.blur(controls.music());
    expect(controls.music().value).toBe(String(trackVolumeSliderDb(0.6)));
    expect(live(api).getArrangement()).toBe(stored);
    windowPointer('pointerup', 25, 30);
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBeNull();
  });

  it('FP6: a Master drag previews on the readout and the live master gain, then commits one Master Volume entry', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const setMasterGain = vi.spyOn(latestHandle(), 'setMasterGain');
    const stored = live(api).getArrangement();
    pressFader(controls.master(), 26);
    renderLog.counts.clear();
    for (const deltaPx of [-4, -8, -12]) {
      const gainDb = masterDbAfter(-3, deltaPx);
      windowPointer('pointermove', 26, 50 + deltaPx);
      expect(controls.master().value).toBe(String(gainDb));
      expect(controls.masterReadout().textContent).toBe(
        controls.master().getAttribute('aria-valuetext'),
      );
      expect(setMasterGain.mock.calls.at(-1)?.[0]).toBeCloseTo(10 ** (gainDb / 20), 12);
      expect(live(api).getArrangement()).toBe(stored);
    }
    expect(parentRenders()).toBe(0);
    windowPointer('pointerup', 26, 38);
    expect(live(api).getArrangement().master.gainDb).toBe(masterDbAfter(-3, -12));
    expect(undoDepth(api)).toEqual(['Master Volume']);
    act(() => live(api).undo());
    expect(live(api).getArrangement().master.gainDb).toBe(-3);
    expect(setMasterGain.mock.calls.at(-1)?.[0]).toBeCloseTo(10 ** (-3 / 20), 12);
    act(() => live(api).togglePlayback());
  });

  it('FP7: playing, a stop and start or a forced resync mid-drag builds the new graph with the dragged value', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const stored = live(api).getArrangement();
    pressFader(controls.music(), 27);
    windowPointer('pointermove', 27, 30);
    const dragged = trackVolumeFromDb(volumeSliderDbAfter(trackVolumeSliderDb(0.6), -20));
    expect(live(api).getArrangement()).toBe(stored);
    act(() => live(api).togglePlayback());
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(latestGraphOptions().trackGains?.get('music')).toBe(dragged);
    const graphs = applyScheduleMock.mock.calls.length;
    act(() => live(api).setMetronomeBpm(120));
    expect(applyScheduleMock.mock.calls.length).toBe(graphs + 1);
    expect(latestGraphOptions().trackGains?.get('music')).toBe(dragged);
    windowPointer('pointerup', 27, 30);
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(dragged);
    act(() => live(api).togglePlayback());
  });

  it('FP8: playing a short loop, a late loop wrap mid-drag rebuilds the graph with the dragged value', async () => {
    const { api, controls } = await mountPreviewWorkspace(true);
    act(() => live(api).togglePlayback());
    pressFader(controls.music(), 28);
    windowPointer('pointermove', 28, 30);
    const dragged = trackVolumeFromDb(volumeSliderDbAfter(trackVolumeSliderDb(0.6), -20));
    const graphs = applyScheduleMock.mock.calls.length;
    fakeClock.base -= 5;
    runFrames();
    expect(applyScheduleMock.mock.calls.length).toBeGreaterThan(graphs);
    expect(latestGraphOptions().trackGains?.get('music')).toBe(dragged);
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(0.6);
    windowPointer('pointerup', 28, 30);
    act(() => live(api).togglePlayback());
  });

  it('FP9: keyboard steps, Shift fine drag and double-click reset keep their values, labels and pending behaviour', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    const music = controls.music();
    music.focus();
    fireEvent.change(music, { target: { value: '-8' } });
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(trackVolumeFromDb(-8));
    expect(live(api).undoLabel).toBeNull();
    fireEvent.keyUp(music, { key: 'ArrowLeft' });
    expect(live(api).undoLabel).toBe('Volume');
    pressFader(controls.music(), 29, true);
    windowPointer('pointermove', 29, 30, true);
    const fineDb = volumeSliderDbAfter(-8, -20, true);
    expect(controls.music().value).toBe(String(fineDb));
    windowPointer('pointerup', 29, 30, true);
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(trackVolumeFromDb(fineDb));
    fireEvent.doubleClick(controls.music());
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.volume,
    ).toBe(1);
    expect(undoDepth(api)).toEqual(['Volume', 'Volume', 'Volume']);
    const master = controls.master();
    master.focus();
    fireEvent.change(master, { target: { value: '-12' } });
    expect(live(api).getArrangement().master.gainDb).toBe(-12);
    fireEvent.keyUp(master, { key: 'ArrowLeft' });
    expect(live(api).undoLabel).toBe('Master Volume');
    act(() => live(api).togglePlayback());
    const graphsBeforeGroup = applyScheduleMock.mock.calls.length;
    const groupGain = vi.spyOn(latestHandle(), 'setTrackGain');
    const group = controls.group();
    group.focus();
    for (const sliderDb of [-6, -6.5]) {
      const syncsBefore = groupGain.mock.calls.length;
      fireEvent.change(group, { target: { value: String(sliderDb) } });
      const model = live(api).getArrangement();
      expect(model.groups?.find((entry) => entry.id === GROUP_ID)?.volume).toBe(
        trackVolumeFromDb(sliderDb),
      );
      expect(live(api).undoLabel).toBe('Master Volume');
      expect(drafts(api).get(groupVolumeDraftKey(GROUP_ID))).toBeUndefined();
      expect(group.value).toBe(String(sliderDb));
      const gains = trackEffectiveGains(model);
      expect(groupGain.mock.calls.length).toBe(syncsBefore + model.tracks.length);
      expect(trackParamCalls(groupGain, 'stems').at(-1)).toBe(gains.get('stems'));
      expect(trackParamCalls(groupGain, 'sfx').at(-1)).toBe(gains.get('sfx'));
    }
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBeforeGroup);
    fireEvent.keyUp(group, { key: 'ArrowLeft' });
    expect(live(api).undoLabel).toBe('Volume');
    fireEvent.doubleClick(controls.group());
    expect(
      live(api)
        .getArrangement()
        .groups?.find((entry) => entry.id === GROUP_ID)?.volume,
    ).toBeUndefined();
    expect(controls.group().value).toBe(String(TRACK_VOLUME_DB_DEFAULT));
    expect(undoDepth(api).slice(0, 3)).toEqual(['Volume', 'Volume', 'Master Volume']);
    act(() => live(api).togglePlayback());
  });

  it('FP10: a Pan drag shows the draft in the leaf without re-rendering the lane, then commits one Pan entry', async () => {
    const { api, controls } = await mountPreviewWorkspace();
    const stored = live(api).getArrangement();
    pressFader(controls.pan(), 30);
    renderLog.counts.clear();
    for (const deltaPx of [2, 4, 6]) {
      const steps = relativeFaderValue({
        startValue: 0,
        deltaPx,
        widthPx: 100,
        min: -TRACK_PAN_STEPS,
        max: TRACK_PAN_STEPS,
        step: 1,
      });
      windowPointer('pointermove', 30, 50 + deltaPx);
      expect(controls.pan().value).toBe(String(steps));
      expect(controls.pan().getAttribute('aria-valuetext')).toBe(
        formatTrackPan(steps / TRACK_PAN_STEPS),
      );
      expect(controls.panReset().textContent).toBe(formatTrackPan(steps / TRACK_PAN_STEPS));
      expect(live(api).getArrangement()).toBe(stored);
    }
    expect(renderLog.counts.get('ArrangementLane') ?? 0).toBe(0);
    expect(parentRenders()).toBe(0);
    windowPointer('pointerup', 30, 56);
    const music = live(api)
      .getArrangement()
      .tracks.find((track) => track.id === 'music');
    expect(music ? trackPanValue(music) : null).toBe(6 / TRACK_PAN_STEPS);
    expect(undoDepth(api)).toEqual([PAN_LABEL]);
  });

  it('FP11: unmounting mid-drag clears the override and the draft and leaves no window pointer listener', async () => {
    const added = new Set<string>();
    const listenerKey = new WeakMap<object, number>();
    let nextKey = 0;
    const keyOf = (type: string, listener: EventListenerOrEventListenerObject | null) => {
      if (!listener) {
        return `${type}:none`;
      }
      let key = listenerKey.get(listener);
      if (key === undefined) {
        key = nextKey++;
        listenerKey.set(listener, key);
      }
      return `${type}:${key}`;
    };
    const { api, view, controls } = await mountPreviewWorkspace();
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setTrackGain = vi.spyOn(handle, 'setTrackGain');
    const store = drafts(api);
    const originalAdd = window.addEventListener.bind(window);
    const originalRemove = window.removeEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type.startsWith('pointer')) {
        added.add(keyOf(type, listener));
      }
      originalAdd(type, listener, options);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
      if (type.startsWith('pointer')) {
        added.delete(keyOf(type, listener));
      }
      originalRemove(type, listener, options);
    });
    pressFader(controls.music(), 31);
    windowPointer('pointermove', 31, 30);
    expect(store.get('track:music')).toBe(
      trackVolumeFromDb(volumeSliderDbAfter(trackVolumeSliderDb(0.6), -20)),
    );
    expect(added.size).toBeGreaterThan(0);
    view.unmount();
    expect(store.get('track:music')).toBeUndefined();
    expect([...added]).toEqual([]);
    const callsAfterUnmount = setTrackGain.mock.calls.length;
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 31, clientX: 10 }));
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 31, clientX: 10 }));
    expect(setTrackGain.mock.calls.length).toBe(callsAfterUnmount);
  });

  it('FP12: for every slider dB the committed pointer value equals the pending onChange value (track and Master)', async () => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        ArrangementProvider,
        { collection: previewCollection, initialArrangement: previewArrangement() },
        children,
      );
    const { result } = renderHook(() => useWorkspaceProbe(), { wrapper });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const musicVolume = () =>
      result.current.getArrangement().tracks.find((track) => track.id === 'music')?.volume;
    let pointerId = 100;
    const mismatches: string[] = [];
    for (let tenth = TRACK_VOLUME_DB_MIN * 10; tenth <= TRACK_VOLUME_DB_MAX * 10; tenth++) {
      const sliderDb = tenth / 10;
      pointerId += 1;
      const id = pointerId;
      act(() => {
        result.current.beginTrackVolumeGesture('music', id);
      });
      act(() => result.current.previewTrackVolume('music', trackVolumeFromDb(sliderDb)));
      act(() => {
        window.dispatchEvent(new PointerEvent('pointerup', { pointerId: id }));
      });
      const viaPointer = musicVolume();
      if (result.current.undoLabel !== null && viaPointer !== 0.6) {
        act(() => result.current.undo());
      }
      act(() => result.current.previewTrackVolume('music', trackVolumeFromDb(sliderDb)));
      act(() => result.current.commitTrackVolume('music'));
      const viaPending = musicVolume();
      if (viaPending !== 0.6) {
        act(() => result.current.undo());
      }
      if (!Object.is(viaPointer, viaPending)) {
        mismatches.push(`track ${sliderDb}: ${viaPointer} vs ${viaPending}`);
      }
    }
    for (let half = MASTER_GAIN_MIN_DB * 2; half <= MASTER_GAIN_MAX_DB * 2; half++) {
      const gainDb = half / 2;
      pointerId += 1;
      const id = pointerId;
      act(() => {
        result.current.beginMasterGainGesture(id);
      });
      act(() => result.current.previewMasterGain(gainDb));
      act(() => {
        window.dispatchEvent(new PointerEvent('pointerup', { pointerId: id }));
      });
      const viaPointer = result.current.getArrangement().master.gainDb;
      if (viaPointer !== -3) {
        act(() => result.current.undo());
      }
      act(() => result.current.previewMasterGain(gainDb));
      act(() => result.current.commitMasterGain());
      const viaPending = result.current.getArrangement().master.gainDb;
      if (viaPending !== -3) {
        act(() => result.current.undo());
      }
      if (!Object.is(viaPointer, viaPending)) {
        mismatches.push(`master ${gainDb}: ${viaPointer} vs ${viaPending}`);
      }
    }
    expect(mismatches).toEqual([]);
    expect(result.current.undoLabel).toBeNull();
  });

  it('FP13: a native Pan change after a stolen claim shows no draft, adds no live pan write after the restore by the steal and leaves the model unchanged (D-29z186)', async () => {
    const { api, view, controls } = await mountPreviewWorkspace();
    act(() => {
      live(api).setTrackPan('music', SEEDED_PAN_STEPS / TRACK_PAN_STEPS);
    });
    act(() => live(api).togglePlayback());
    const setTrackPan = vi.spyOn(latestHandle(), 'setTrackPan');
    const stored = live(api).getArrangement();
    pressFader(controls.pan(), 40);
    const clipHeader = clipHeaderOf(view.container, 'cm');
    fireEvent.pointerDown(clipHeader, { button: 0, buttons: 1, pointerId: 40, clientX: 10 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    const panWritesBefore = trackParamCalls(setTrackPan, 'music').length;
    fireEvent.change(controls.pan(), { target: { value: '16' } });
    expect(drafts(api).get(trackPanDraftKey('music'))).toBeUndefined();
    expect(trackParamCalls(setTrackPan, 'music').length).toBe(panWritesBefore);
    expect(controls.pan().value).toBe(String(SEEDED_PAN_STEPS));
    expect(controls.panReset().textContent).toBe(
      formatTrackPan(SEEDED_PAN_STEPS / TRACK_PAN_STEPS),
    );
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBe(PAN_LABEL);
    windowPointer('pointerup', 40, 10);
    expect(undoDepth(api)).toEqual([PAN_LABEL]);
    act(() => live(api).togglePlayback());
  });

  it.each(
    PAN_CANCEL_TRIGGERS,
  )('%s: a Pan cancel restores the live pan, clears the draft and writes no entry (D-29z187)', async (_row, trigger) => {
    const { api, controls } = await mountPreviewWorkspace();
    const storedPan = SEEDED_PAN_STEPS / TRACK_PAN_STEPS;
    const draggedSteps = SEEDED_PAN_STEPS + 6;
    act(() => {
      live(api).setTrackPan('music', storedPan);
    });
    act(() => live(api).togglePlayback());
    const setTrackPan = vi.spyOn(latestHandle(), 'setTrackPan');
    const stored = live(api).getArrangement();
    const pointerId = 41;
    pressFader(controls.pan(), pointerId);
    windowPointer('pointermove', pointerId, 56);
    expect(drafts(api).get(trackPanDraftKey('music'))).toBe(draggedSteps / TRACK_PAN_STEPS);
    expect(trackParamCalls(setTrackPan, 'music').at(-1)).toBe(draggedSteps / TRACK_PAN_STEPS);
    expect(controls.pan().value).toBe(String(draggedSteps));
    let releaseClaim: (() => void) | null = null;
    if (trigger === 'cancel') {
      windowPointer('pointercancel', pointerId, 56);
    } else if (trigger === 'blur') {
      fireEvent.blur(controls.pan());
    } else {
      act(() => {
        releaseClaim = live(api).claimPointerGesture(pointerId, () => undefined);
      });
    }
    expect(trackParamCalls(setTrackPan, 'music').at(-1)).toBe(storedPan);
    expect(drafts(api).get(trackPanDraftKey('music'))).toBeUndefined();
    expect(controls.pan().value).toBe(String(SEEDED_PAN_STEPS));
    expect(controls.pan().getAttribute('aria-valuetext')).toBe(formatTrackPan(storedPan));
    expect(controls.panReset().textContent).toBe(formatTrackPan(storedPan));
    expect(live(api).getArrangement()).toBe(stored);
    expect(live(api).undoLabel).toBe(PAN_LABEL);
    act(() => releaseClaim?.());
    windowPointer('pointerup', pointerId, 56);
    expect(live(api).getArrangement()).toBe(stored);
    expect(undoDepth(api)).toEqual([PAN_LABEL]);
    act(() => live(api).togglePlayback());
  });
});
