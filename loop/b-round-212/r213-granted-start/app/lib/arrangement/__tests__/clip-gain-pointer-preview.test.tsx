import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPeakShape } from '~/components/arrangement/ArrangementClip';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementMixDraftStore,
} from '~/contexts/ArrangementContext';
import { applySchedule, type ScheduleHandle } from '~/lib/arrangement/graph.client';
import { type ArrangementMixDraftStore, clipGainDraftKey } from '~/lib/arrangement/mix-draft-store';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import {
  applyClipGainTargets,
  clipGainMemberSpan,
  clipGainShiftTargets,
  formatClipGainMembersStatus,
  formatClipGainRange,
} from '../clip-gain-multi';
import { FADER_SHIFT_FINE_DIVISOR, relativeFaderValue } from '../fader';
import { CLIP_GAIN_MAX_DB, CLIP_GAIN_MIN_DB, createArrangement, setClipGainDb } from '../model';

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

class FakeWaveAudioBuffer {
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
  getChannelData(channel: number) {
    const data = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      const envelope = 0.5 + 0.5 * Math.abs(Math.cos((i + channel) / 97));
      data[i] = 0.05 + 0.3 * Math.abs(Math.sin((i + channel) / 13)) * envelope;
    }
    return data;
  }
  copyToChannel() {}
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

type MembersCancelTrigger = 'cancel' | 'steal' | 'blur';

const MEMBERS_CANCEL_TRIGGERS: Array<[string, MembersCancelTrigger]> = [
  ['CP3 pointercancel', 'cancel'],
  ['CP4 stolen claim', 'steal'],
  ['CP5-members fader blur', 'blur'],
];

const CLIP_GAIN_LABEL = 'Clip Gain';
const MEMBERS_ANCHORS: Array<[number, number[]]> = [
  [40, [17, 24]],
  [-100, [-60, -53]],
  [-2.5, [-9.5, -2.5]],
];
const MEMBERS = ['cm', 'cx'];
const PARENT_NAMES = [
  'StudioWorkspace',
  'ArrangementDetailPanel',
  'ArrangementDetailContentInner',
  'ArrangementDetailWaveform',
  'ArrangementClipViewInner',
  'ArrangementLane',
  'PreviewProbe',
];

const previewCollection: WorkspaceCollection = {
  id: 'clip-gain-preview',
  label: 'clip-gain-preview',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'clip-gain-preview',
      kind: 'music',
      origin: 'demo',
    },
    {
      id: 'stem',
      title: 'Stem',
      collectionLabel: 'clip-gain-preview',
      kind: 'stem',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'clip-gain-preview', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function previewArrangement(
  gains: Readonly<Record<string, number>>,
  loop: boolean,
  video: boolean,
): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  const clips: ArrangementClip[] = [
    { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 20 },
    { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 0, sourceOffset: 0, duration: 20 },
    { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 20 },
    ...(video
      ? [{ id: 'cv', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 }]
      : []),
  ];
  return {
    ...base,
    clips: clips.map((clip) => {
      const gainDb = gains[clip.id];
      return gainDb === undefined ? clip : { ...clip, gainDb };
    }),
    loop: loop ? { start: 0, end: 1, enabled: true } : null,
  };
}

interface PreviewApiRef {
  current: ArrangementContextValue | null;
  drafts: ArrangementMixDraftStore | null;
}

function PreviewProbe({ api }: { api: PreviewApiRef }) {
  api.current = useArrangement();
  api.drafts = useArrangementMixDraftStore();
  return null;
}

function live(api: PreviewApiRef): ArrangementContextValue {
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

function gainOf(api: PreviewApiRef, clipId: string): number {
  return (
    live(api)
      .getArrangement()
      .clips.find((clip) => clip.id === clipId)?.gainDb ?? 0
  );
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

async function mountClipGainWorkspace(
  gains: Readonly<Record<string, number>> = {},
  loop = false,
  video = false,
) {
  const api: PreviewApiRef = { current: null, drafts: null };
  const view = render(
    <ArrangementProvider
      collection={previewCollection}
      initialArrangement={previewArrangement(gains, loop, video)}
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
  const fader = (): HTMLInputElement => {
    const element = view.getByTestId('arrangement-detail-clip-gain-fader');
    if (!(element instanceof HTMLInputElement)) {
      throw new Error('clip gain fader missing');
    }
    return element;
  };
  const field = (): HTMLInputElement => {
    const element = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(element instanceof HTMLInputElement)) {
      throw new Error('clip gain field missing');
    }
    return element;
  };
  const reset = (): HTMLButtonElement => {
    const element = view.getByTestId('arrangement-detail-clip-gain-reset');
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error('clip gain reset missing');
    }
    return element;
  };
  const lanePath = (clipId: string): { d: string; columns: number } => {
    const svg = view.container.querySelector(
      `[data-clip-id="${clipId}"] [data-testid="arrangement-clip-waveform"]`,
    );
    return svgPath(svg, `lane ${clipId}`);
  };
  const detailPath = (): { d: string; columns: number } =>
    svgPath(view.getByTestId('arrangement-detail-waveform').querySelector('svg'), 'detail');
  const expectedShape = (clipId: string, columns: number, scale: number): string => {
    const clip = live(api)
      .getArrangement()
      .clips.find((entry) => entry.id === clipId);
    if (!clip) {
      throw new Error(`clip ${clipId} missing`);
    }
    const shape = buildPeakShape(
      live(api).sourcePeaks.get(clip.sourceId),
      clip.sourceOffset,
      clip.duration,
      columns,
      scale,
    );
    if (!shape) {
      throw new Error(`no expected shape for ${clipId}`);
    }
    return shape.path;
  };
  const select = (clipIds: readonly string[]) => {
    act(() => live(api).selectClips(clipIds));
  };
  return { api, view, fader, field, reset, lanePath, detailPath, expectedShape, select };
}

function svgPath(svg: Element | null, label: string): { d: string; columns: number } {
  const path = svg?.querySelector('path');
  const viewBox = svg?.getAttribute('viewBox') ?? '';
  const match = /^0 0 (\d+) 2$/.exec(viewBox);
  const d = path?.getAttribute('d');
  if (!match || !d) {
    throw new Error(`${label} waveform missing (viewBox "${viewBox}")`);
  }
  return { d, columns: Number(match[1]) };
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

function clipGainSliderDbAfter(startDb: number, deltaPx: number, fine = false): number {
  return relativeFaderValue({
    startValue: startDb,
    deltaPx,
    widthPx: fine ? 100 * FADER_SHIFT_FINE_DIVISOR : 100,
    min: CLIP_GAIN_MIN_DB,
    max: CLIP_GAIN_MAX_DB,
    step: 0.1,
  });
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

function clipGainCalls(spy: { mock: { calls: unknown[][] } }, clipId: string): unknown[] {
  return spy.mock.calls.filter((call) => call[0] === clipId).map((call) => call[1]);
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

describe('PERF-FADER-b Clip Gain pointer preview (D-29z189)', { timeout: 30_000 }, () => {
  beforeEach(() => {
    frames.length = 0;
    fakeClock.base = Date.now() / 1000;
    applyScheduleMock.mockClear();
    renderLog.counts.clear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeWaveAudioBuffer);
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

  it('CP1: a single Clip Gain drag writes no history and re-renders no parent per move; the model stays put while the live gain and both drawings follow', async () => {
    const { api, fader, field, lanePath, detailPath, expectedShape, select } =
      await mountClipGainWorkspace({ cm: -6 });
    select(['cm']);
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setClipGain = vi.spyOn(handle, 'setClipGain');
    const stored = live(api).getArrangement();
    pressFader(fader(), 21);
    renderLog.counts.clear();
    const deltas = [-5, -10, -15, -20];
    for (const deltaPx of deltas) {
      const sliderDb = clipGainSliderDbAfter(-6, deltaPx);
      windowPointer('pointermove', 21, 50 + deltaPx);
      expect(fader().value).toBe(String(sliderDb));
      expect(fader().getAttribute('aria-valuetext')).toBe(formatClipGainRange(sliderDb, sliderDb));
      expect(field().value).toBe(sliderDb.toFixed(1));
      expect(live(api).getArrangement()).toBe(stored);
      expect(live(api).undoLabel).toBeNull();
      expect(clipGainCalls(setClipGain, 'cm').at(-1)).toBe(10 ** (sliderDb / 20));
      const lane = lanePath('cm');
      expect(lane.d).toBe(expectedShape('cm', lane.columns, 10 ** (sliderDb / 20)));
      expect(detailPath().d).toBe(expectedShape('cm', 480, 10 ** (sliderDb / 20)));
    }
    expect(clipGainCalls(setClipGain, 'cx')).toEqual([]);
    expect(parentRenders()).toBe(0);
    expect(renderLog.counts.get('ArrangementDetailClipGain') ?? 0).toBe(deltas.length);
    expect(renderLog.counts.get('ArrangementPeakPath') ?? 0).toBe(deltas.length * 2);
    expect(applyScheduleMock.mock.calls.length).toBe(1);
    windowPointer('pointerup', 21, 30);
    act(() => live(api).togglePlayback());
  });

  it('CP2: pointerup writes one Clip Gain entry with the exact last previewed dB; Undo restores the model, the live gain and the lane drawing', async () => {
    const { api, fader, lanePath, select } = await mountClipGainWorkspace({ cm: -6 });
    select(['cm']);
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setClipGain = vi.spyOn(handle, 'setClipGain');
    const before = lanePath('cm').d;
    pressFader(fader(), 22);
    windowPointer('pointermove', 22, 40);
    windowPointer('pointermove', 22, 33);
    const previewDb = Number(fader().value);
    expect(previewDb).toBe(clipGainSliderDbAfter(-6, -17));
    windowPointer('pointerup', 22, 33);
    expect(undoDepth(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(gainOf(api, 'cm')).toBe(previewDb);
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBeUndefined();
    act(() => live(api).undo());
    expect(gainOf(api, 'cm')).toBe(-6);
    expect(clipGainCalls(setClipGain, 'cm').at(-1)).toBe(10 ** (-6 / 20));
    expect(lanePath('cm').d).toBe(before);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).togglePlayback());
  });

  for (const [title, trigger] of MEMBERS_CANCEL_TRIGGERS) {
    it(`${title}: a members drag follows clipGainShiftTargets live; the ${trigger} restores every member gain, both lane drawings and the block with no entry`, async () => {
      const { api, view, fader, field, lanePath, select } = await mountClipGainWorkspace({
        cm: -6,
        cx: 1,
      });
      select(MEMBERS);
      act(() => live(api).togglePlayback());
      const handle = latestHandle();
      const setClipGain = vi.spyOn(handle, 'setClipGain');
      const stored = live(api).getArrangement();
      const lanesBefore = MEMBERS.map((id) => lanePath(id).d);
      pressFader(fader(), 30);
      windowPointer('pointermove', 30, 40);
      const anchor = clipGainSliderDbAfter(1, -10);
      const targets = clipGainShiftTargets(stored, MEMBERS, anchor - 1);
      for (const id of MEMBERS) {
        expect(clipGainCalls(setClipGain, id).at(-1)).toBe(10 ** ((targets.get(id) ?? 0) / 20));
        expect(drafts(api).get(clipGainDraftKey(id))).toBe(targets.get(id));
      }
      expect(fader().getAttribute('aria-valuetext')).toBe(
        formatClipGainRange(targets.get('cm') ?? 0, targets.get('cx') ?? 0),
      );
      expect(live(api).getArrangement()).toBe(stored);
      expect(MEMBERS.map((id) => lanePath(id).d)).not.toEqual(lanesBefore);
      if (trigger === 'cancel') {
        windowPointer('pointercancel', 30, 40);
      } else if (trigger === 'steal') {
        fireEvent.pointerDown(clipHeaderOf(view.container, 'cs'), {
          button: 0,
          buttons: 1,
          pointerId: 30,
          clientX: 5,
        });
      } else {
        act(() => fader().blur());
      }
      for (const id of MEMBERS) {
        const clip = stored.clips.find((entry) => entry.id === id);
        expect(clipGainCalls(setClipGain, id).at(-1)).toBe(10 ** ((clip?.gainDb ?? 0) / 20));
        expect(drafts(api).get(clipGainDraftKey(id))).toBeUndefined();
      }
      expect(MEMBERS.map((id) => lanePath(id).d)).toEqual(lanesBefore);
      expect(gainOf(api, 'cm')).toBe(-6);
      expect(gainOf(api, 'cx')).toBe(1);
      expect(live(api).undoLabel).toBeNull();
      expect(live(api).isPointerGestureActive()).toBe(trigger === 'steal');
      if (trigger === 'steal') {
        windowPointer('pointerup', 30, 5);
      } else {
        select(MEMBERS);
        expect(fader().value).toBe('1');
        expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 … +1.0 dB');
        expect(field().value).toBe('');
      }
      act(() => live(api).togglePlayback());
    });
  }

  it('CP5: a fader blur mid single drag cancels with no entry and restores the display and the live gain', async () => {
    const { api, fader, field, select } = await mountClipGainWorkspace({ cm: -6 });
    select(['cm']);
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setClipGain = vi.spyOn(handle, 'setClipGain');
    pressFader(fader(), 23);
    windowPointer('pointermove', 23, 75);
    expect(field().value).toBe(clipGainSliderDbAfter(-6, 25).toFixed(1));
    act(() => fader().blur());
    expect(field().value).toBe('-6.0');
    expect(fader().value).toBe('-6');
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 dB');
    expect(clipGainCalls(setClipGain, 'cm').at(-1)).toBe(10 ** (-6 / 20));
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBeUndefined();
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).togglePlayback());
  });

  it('CP5b: a pointercancel mid single drag restores the field, the fader, the draft and the live gain with no entry', async () => {
    const { api, fader, field, select } = await mountClipGainWorkspace({ cm: -6 });
    select(['cm']);
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setClipGain = vi.spyOn(handle, 'setClipGain');
    pressFader(fader(), 35);
    windowPointer('pointermove', 35, 70);
    const draftDb = clipGainSliderDbAfter(-6, 20);
    expect(field().value).toBe(draftDb.toFixed(1));
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBe(draftDb);
    expect(clipGainCalls(setClipGain, 'cm').at(-1)).toBe(10 ** (draftDb / 20));
    windowPointer('pointercancel', 35, 70);
    expect(field().value).toBe('-6.0');
    expect(fader().value).toBe('-6');
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 dB');
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBeUndefined();
    expect(clipGainCalls(setClipGain, 'cm').at(-1)).toBe(10 ** (-6 / 20));
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).togglePlayback());
  });

  it('CP6: a members commit writes one entry, sets the members status exactly as the pending path does and stores the pending result for the same anchor', async () => {
    const { api, fader, select } = await mountClipGainWorkspace({ cm: -6, cx: 1 });
    select(MEMBERS);
    const stored = live(api).getArrangement();
    pressFader(fader(), 24);
    windowPointer('pointermove', 24, 75);
    windowPointer('pointerup', 24, 75);
    const anchor = clipGainSliderDbAfter(1, 25);
    const expected = applyClipGainTargets(
      stored,
      clipGainShiftTargets(stored, MEMBERS, anchor - 1),
    );
    expect(gainOf(api, 'cm')).toBe(expected.clips.find((clip) => clip.id === 'cm')?.gainDb);
    expect(gainOf(api, 'cx')).toBe(expected.clips.find((clip) => clip.id === 'cx')?.gainDb);
    const span = clipGainMemberSpan(live(api).getArrangement(), MEMBERS);
    if (!span) {
      throw new Error('members span missing');
    }
    expect(live(api).status).toBe(formatClipGainMembersStatus(span));
    expect(live(api).status).toBe('Clip Gain: 2 clips — +15.0 … +22.0 dB.');
    expect(undoDepth(api)).toEqual([CLIP_GAIN_LABEL]);
    act(() => live(api).undo());
    expect(live(api).getArrangement().clips).toEqual(stored.clips);
    pressFader(fader(), 25);
    windowPointer('pointermove', 25, 75);
    act(() => live(api).setStatus('before'));
    windowPointer('pointermove', 25, 50);
    windowPointer('pointerup', 25, 50);
    expect(live(api).status).toBe('before');
    expect(live(api).undoLabel).toBeNull();
  });

  it('CP7: playing, a stop and start or a forced resync mid-drag builds the new graph with the dragged clip gain', async () => {
    const { api, fader, select } = await mountClipGainWorkspace({ cm: -6 });
    select(['cm']);
    act(() => live(api).togglePlayback());
    const stored = live(api).getArrangement();
    pressFader(fader(), 26);
    windowPointer('pointermove', 26, 30);
    const dragged = 10 ** (clipGainSliderDbAfter(-6, -20) / 20);
    act(() => live(api).togglePlayback());
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(latestGraphOptions().clipGains?.get('cm')).toBe(dragged);
    const graphs = applyScheduleMock.mock.calls.length;
    act(() => live(api).setMetronomeBpm(120));
    expect(applyScheduleMock.mock.calls.length).toBe(graphs + 1);
    expect(latestGraphOptions().clipGains?.get('cm')).toBe(dragged);
    expect(live(api).getArrangement()).toBe(stored);
    windowPointer('pointerup', 26, 30);
    expect(gainOf(api, 'cm')).toBe(clipGainSliderDbAfter(-6, -20));
    act(() => live(api).togglePlayback());
  });

  it('CP8: playing a short loop, a late loop wrap mid-drag rebuilds the graph with the dragged clip gain', async () => {
    const { api, fader, select } = await mountClipGainWorkspace({ cm: -6 }, true);
    select(['cm']);
    act(() => live(api).togglePlayback());
    pressFader(fader(), 27);
    windowPointer('pointermove', 27, 30);
    const dragged = 10 ** (clipGainSliderDbAfter(-6, -20) / 20);
    const graphs = applyScheduleMock.mock.calls.length;
    fakeClock.base -= 5;
    runFrames();
    expect(applyScheduleMock.mock.calls.length).toBeGreaterThan(graphs);
    expect(latestGraphOptions().clipGains?.get('cm')).toBe(dragged);
    expect(gainOf(api, 'cm')).toBe(-6);
    windowPointer('pointerup', 27, 30);
    act(() => live(api).togglePlayback());
  });

  it('CP9: fader keyboard steps, double-click reset, the typed field and the reset button keep their values, labels and statuses', async () => {
    const { api, fader, field, reset, select } = await mountClipGainWorkspace({ cm: -6, cx: 1 });
    select(['cm']);
    const input = fader();
    input.focus();
    fireEvent.change(input, { target: { value: '-5.9' } });
    expect(gainOf(api, 'cm')).toBe(-5.9);
    expect(live(api).undoLabel).toBeNull();
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBeUndefined();
    fireEvent.keyUp(input, { key: 'ArrowRight' });
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    fireEvent.doubleClick(fader());
    expect(gainOf(api, 'cm')).toBe(0);
    expect(reset().disabled).toBe(true);
    fireEvent.change(field(), { target: { value: '-3' } });
    expect(field().getAttribute('data-pending')).toBe('true');
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field().value).toBe('0.0');
    fireEvent.change(field(), { target: { value: '-3' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(gainOf(api, 'cm')).toBe(-3);
    expect(live(api).status).toBe('Clip Gain: Song — −3.0 dB.');
    act(() => field().focus());
    fireEvent.change(field(), { target: { value: '2' } });
    act(() => field().blur());
    expect(gainOf(api, 'cm')).toBe(2);
    fireEvent.click(reset());
    expect(gainOf(api, 'cm')).toBe(0);
    expect(live(api).status).toBe('Clip Gain: Song — 0.0 dB.');
    expect(undoDepth(api)).toEqual(Array(5).fill(CLIP_GAIN_LABEL));
    select(MEMBERS);
    fireEvent.doubleClick(fader());
    expect(gainOf(api, 'cm')).toBe(0);
    expect(gainOf(api, 'cx')).toBe(0);
    expect(live(api).status).toBe('Clip Gain: 2 clips — 0.0 dB.');
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
  });

  it('CP10: mid-drag the field shows the draft with no pending marker and the reset button follows the draft; after release both show the committed state', async () => {
    const { api, view, fader, field, reset, select } = await mountClipGainWorkspace();
    select(['cm']);
    expect(reset().disabled).toBe(true);
    pressFader(fader(), 28);
    windowPointer('pointermove', 28, 60);
    const draftDb = clipGainSliderDbAfter(0, 10);
    expect(field().value).toBe(draftDb.toFixed(1));
    expect(field().getAttribute('data-pending')).toBeNull();
    expect(view.queryByTestId('arrangement-detail-clip-gain-pending')).toBeNull();
    expect(reset().disabled).toBe(false);
    windowPointer('pointermove', 28, 50);
    expect(field().value).toBe('0.0');
    expect(reset().disabled).toBe(true);
    windowPointer('pointermove', 28, 60);
    windowPointer('pointerup', 28, 60);
    expect(gainOf(api, 'cm')).toBe(draftDb);
    expect(field().value).toBe(draftDb.toFixed(1));
    expect(field().getAttribute('data-pending')).toBeNull();
    expect(reset().disabled).toBe(false);
    act(() => live(api).undo());
    select(MEMBERS);
    expect(reset().disabled).toBe(true);
    pressFader(fader(), 29);
    windowPointer('pointermove', 29, 60);
    expect(field().value).toBe(draftDb.toFixed(1));
    expect(field().getAttribute('data-pending')).toBeNull();
    expect(view.queryByTestId('arrangement-detail-clip-gain-range')).toBeNull();
    expect(reset().disabled).toBe(false);
    windowPointer('pointerup', 29, 60);
    expect(gainOf(api, 'cm')).toBe(draftDb);
    expect(gainOf(api, 'cx')).toBe(draftDb);
    expect(reset().disabled).toBe(false);
    expect(field().getAttribute('data-pending')).toBeNull();
  });

  it('CP10b: a selection change mid members-drag to clips that include a video clip shows the stored disabled state, not the draft', async () => {
    const { api, view, fader, field, select } = await mountClipGainWorkspace(
      { cm: -6, cx: 1 },
      false,
      true,
    );
    select(MEMBERS);
    pressFader(fader(), 36);
    windowPointer('pointermove', 36, 70);
    expect(drafts(api).get(clipGainDraftKey('cm'))).not.toBeUndefined();
    select(['cm', 'cv']);
    expect(view.getByTestId('arrangement-detail-clip-gain-reason')).toBeTruthy();
    expect(field().disabled).toBe(true);
    expect(field().value).toBe('0.0');
    expect(fader().value).toBe('0');
    expect(fader().getAttribute('aria-valuetext')).toBe('0.0 dB');
    windowPointer('pointerup', 36, 70);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    expect(gainOf(api, 'cv')).toBe(0);
  });

  it('CP11: unmounting mid-drag clears the override and every draft entry and leaves no window pointer listener', async () => {
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
    const { api, view, fader, select } = await mountClipGainWorkspace({ cm: -6, cx: 1 });
    select(MEMBERS);
    act(() => live(api).togglePlayback());
    const handle = latestHandle();
    const setClipGain = vi.spyOn(handle, 'setClipGain');
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
    pressFader(fader(), 31);
    windowPointer('pointermove', 31, 30);
    for (const id of MEMBERS) {
      expect(store.get(clipGainDraftKey(id))).not.toBeUndefined();
    }
    expect(added.size).toBeGreaterThan(0);
    view.unmount();
    for (const id of MEMBERS) {
      expect(store.get(clipGainDraftKey(id))).toBeUndefined();
    }
    expect([...added]).toEqual([]);
    const callsAfterUnmount = setClipGain.mock.calls.length;
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 31, clientX: 10 }));
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 31, clientX: 10 }));
    expect(setClipGain.mock.calls.length).toBe(callsAfterUnmount);
  });

  it('CP12: the committed pointer gainDb equals the pending onChange result for every slider dB (Shift-fine included) and for three members anchors including both clamps', async () => {
    const { api, fader, select } = await mountClipGainWorkspace({ cm: -6, cx: 1 });
    const mismatches: string[] = [];
    select(['cm']);
    let pointerId = 200;
    for (let tenth = CLIP_GAIN_MIN_DB * 10; tenth <= CLIP_GAIN_MAX_DB * 10; tenth++) {
      const sliderDb = tenth / 10;
      pointerId += 1;
      const id = pointerId;
      act(() => {
        live(api).beginClipGainFaderGesture('cm', id);
      });
      act(() => live(api).previewClipGainFader('cm', sliderDb));
      windowPointer('pointerup', id);
      const viaPointer = gainOf(api, 'cm');
      if (live(api).undoLabel !== null && viaPointer !== -6) {
        act(() => live(api).undo());
      }
      const viaPending = setClipGainDb(live(api).getArrangement(), 'cm', sliderDb).clips.find(
        (clip) => clip.id === 'cm',
      )?.gainDb;
      if (!Object.is(viaPointer, viaPending ?? 0)) {
        mismatches.push(`single ${sliderDb}: ${viaPointer} vs ${viaPending}`);
      }
    }
    expect(gainOf(api, 'cm')).toBe(-6);
    const fineDb = clipGainSliderDbAfter(-6, 13, true);
    pressFader(fader(), 400, true);
    windowPointer('pointermove', 400, 63, true);
    windowPointer('pointerup', 400, 63, true);
    expect(gainOf(api, 'cm')).toBe(fineDb);
    act(() => live(api).undo());
    act(() => live(api).previewClipGainFader('cm', fineDb));
    act(() => live(api).commitClipGainFader('cm'));
    expect(gainOf(api, 'cm')).toBe(fineDb);
    act(() => live(api).undo());
    select(MEMBERS);
    for (const [anchorDb, expected] of MEMBERS_ANCHORS) {
      pointerId += 1;
      const id = pointerId;
      act(() => {
        live(api).beginClipGainMembersGesture(MEMBERS, id);
      });
      act(() => live(api).previewClipGainMembers(MEMBERS, anchorDb));
      windowPointer('pointerup', id);
      const viaPointer = MEMBERS.map((clipId) => gainOf(api, clipId));
      act(() => live(api).undo());
      act(() => live(api).previewClipGainMembers(MEMBERS, anchorDb));
      act(() => live(api).commitClipGainMembers(MEMBERS));
      const viaPending = MEMBERS.map((clipId) => gainOf(api, clipId));
      act(() => live(api).undo());
      expect(viaPointer).toEqual(expected);
      expect(viaPending).toEqual(viaPointer);
    }
    expect(mismatches).toEqual([]);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CP13: at waveform zoom 2 the lane drawing during a drag is the shape for draft × 2; the detail drawing ignores the zoom', async () => {
    const { api, view, fader, lanePath, detailPath, expectedShape, select } =
      await mountClipGainWorkspace({ cm: -6 });
    const zoom = view.getByTestId('arrangement-waveform-zoom');
    fireEvent.change(zoom, { target: { value: '2' } });
    select(['cm']);
    pressFader(fader(), 32);
    windowPointer('pointermove', 32, 35);
    const draftDb = clipGainSliderDbAfter(-6, -15);
    const lane = lanePath('cm');
    expect(lane.d).toBe(expectedShape('cm', lane.columns, 10 ** (draftDb / 20) * 2));
    expect(lane.d).not.toBe(expectedShape('cm', lane.columns, 10 ** (draftDb / 20)));
    expect(detailPath().d).toBe(expectedShape('cm', 480, 10 ** (draftDb / 20)));
    expect(gainOf(api, 'cm')).toBe(-6);
    windowPointer('pointerup', 32, 35);
    expect(lanePath('cm').d).toBe(expectedShape('cm', lane.columns, 10 ** (draftDb / 20) * 2));
  });

  it('CP14: dragging back to the start value shows the stored value mid-gesture, writes no entry and clears every draft', async () => {
    const { api, fader, field, lanePath, select } = await mountClipGainWorkspace({ cm: -6, cx: 1 });
    select(['cm']);
    const before = lanePath('cm').d;
    pressFader(fader(), 33);
    windowPointer('pointermove', 33, 70);
    expect(field().value).toBe(clipGainSliderDbAfter(-6, 20).toFixed(1));
    windowPointer('pointermove', 33, 50);
    expect(field().value).toBe('-6.0');
    expect(fader().value).toBe('-6');
    expect(lanePath('cm').d).toBe(before);
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBe(-6);
    windowPointer('pointerup', 33, 50);
    expect(drafts(api).get(clipGainDraftKey('cm'))).toBeUndefined();
    expect(live(api).undoLabel).toBeNull();
    expect(field().value).toBe('-6.0');
    select(MEMBERS);
    pressFader(fader(), 34);
    windowPointer('pointermove', 34, 80);
    windowPointer('pointermove', 34, 50);
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 … +1.0 dB');
    expect(field().value).toBe('');
    windowPointer('pointerup', 34, 50);
    for (const id of MEMBERS) {
      expect(drafts(api).get(clipGainDraftKey(id))).toBeUndefined();
    }
    expect(live(api).undoLabel).toBeNull();
    expect(gainOf(api, 'cm')).toBe(-6);
    expect(gainOf(api, 'cx')).toBe(1);
  });

  it('CP15: releasing a value-changing single drag from a typed −12 dB commits the Clip Gain block once, never with the pending state', async () => {
    const { api, view, fader, field, select } = await mountClipGainWorkspace();
    select(['cm']);
    fireEvent.change(field(), { target: { value: '-12' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(gainOf(api, 'cm')).toBe(-12);
    expect(field().value).toBe('-12.0');
    pressFader(fader(), 41);
    windowPointer('pointermove', 41, 60);
    const draftDb = clipGainSliderDbAfter(-12, 10);
    expect(field().value).toBe(draftDb.toFixed(1));
    const input = field();
    const observer = new MutationObserver(() => undefined);
    observer.observe(view.getByTestId('arrangement-detail-clip-gain'), {
      attributes: true,
      attributeOldValue: true,
      childList: true,
      subtree: true,
    });
    renderLog.counts.clear();
    windowPointer('pointerup', 41, 60);
    const records = observer.takeRecords();
    observer.disconnect();
    expect(renderLog.counts.get('ArrangementDetailClipGain')).toBe(1);
    expect(gainOf(api, 'cm')).toBe(draftDb);
    expect(
      records
        .filter((record) => record.target === input)
        .map((record) => record.attributeName)
        .filter(
          (name) => name === 'data-pending' || name === 'title' || name === 'aria-describedby',
        ),
    ).toEqual([]);
    const addedPending = records.flatMap((record) =>
      [...record.addedNodes].filter(
        (node) =>
          node instanceof HTMLElement &&
          (node.dataset.testid === 'arrangement-detail-clip-gain-pending' ||
            node.querySelector('[data-testid="arrangement-detail-clip-gain-pending"]') !== null),
      ),
    );
    expect(addedPending).toEqual([]);
    expect(view.queryByTestId('arrangement-detail-clip-gain-pending')).toBeNull();
    expect(field().getAttribute('data-pending')).toBeNull();
    expect(field().value).toBe(draftDb.toFixed(1));
    expect(fader().value).toBe(String(draftDb));
  });

  it('CP16: after a release, Undo, Redo, typing then Escape and the reset button re-sync the field and the pending state as before', async () => {
    const { api, view, fader, field, reset, select } = await mountClipGainWorkspace();
    select(['cm']);
    fireEvent.change(field(), { target: { value: '-12' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    pressFader(fader(), 42);
    windowPointer('pointermove', 42, 60);
    windowPointer('pointerup', 42, 60);
    const draftDb = clipGainSliderDbAfter(-12, 10);
    const settled = (text: string) => {
      expect(field().value).toBe(text);
      expect(field().getAttribute('data-pending')).toBeNull();
      expect(field().getAttribute('title')).toBeNull();
      expect(view.queryByTestId('arrangement-detail-clip-gain-pending')).toBeNull();
    };
    settled(draftDb.toFixed(1));
    act(() => live(api).undo());
    expect(gainOf(api, 'cm')).toBe(-12);
    settled('-12.0');
    act(() => live(api).redo());
    expect(gainOf(api, 'cm')).toBe(draftDb);
    settled(draftDb.toFixed(1));
    fireEvent.change(field(), { target: { value: '5' } });
    expect(field().getAttribute('data-pending')).toBe('true');
    expect(view.getByTestId('arrangement-detail-clip-gain-pending')).toBeTruthy();
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(gainOf(api, 'cm')).toBe(draftDb);
    settled(draftDb.toFixed(1));
    fireEvent.click(reset());
    expect(gainOf(api, 'cm')).toBe(0);
    settled('0.0');
    expect(reset().disabled).toBe(true);
    act(() => live(api).undo());
    settled(draftDb.toFixed(1));
  });

  it('CP17: a members drag builds the range from the drafts and the stored gains passed as props; a mid-drag selection change shows the new selection’s stored gains', async () => {
    const { api, view, fader, field, select } = await mountClipGainWorkspace({
      cm: -6,
      cx: 1,
      cs: -3,
    });
    select(MEMBERS);
    pressFader(fader(), 43);
    windowPointer('pointermove', 43, 40);
    const draftCm = drafts(api).get(clipGainDraftKey('cm'));
    const draftCx = drafts(api).get(clipGainDraftKey('cx'));
    if (draftCm === undefined || draftCx === undefined) {
      throw new Error('members drafts missing');
    }
    expect(draftCx).toBe(clipGainSliderDbAfter(1, -10));
    expect(draftCm).toBeLessThan(-3);
    expect(fader().getAttribute('aria-valuetext')).toBe(
      formatClipGainRange(Math.min(draftCm, draftCx), Math.max(draftCm, draftCx)),
    );
    select(['cm', 'cs']);
    expect(drafts(api).get(clipGainDraftKey('cs'))).toBeUndefined();
    expect(fader().getAttribute('aria-valuetext')).toBe(formatClipGainRange(draftCm, -3));
    expect(view.getByTestId('arrangement-detail-clip-gain-range').textContent).toBe(
      formatClipGainRange(draftCm, -3),
    );
    expect(field().value).toBe('');
    select(['cs', 'cx']);
    expect(fader().getAttribute('aria-valuetext')).toBe(
      formatClipGainRange(Math.min(-3, draftCx), Math.max(-3, draftCx)),
    );
    select(['cs']);
    expect(field().value).toBe('-3.0');
    expect(fader().getAttribute('aria-valuetext')).toBe('−3.0 dB');
    windowPointer('pointerup', 43, 40);
    expect(gainOf(api, 'cs')).toBe(-3);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
  });
});
