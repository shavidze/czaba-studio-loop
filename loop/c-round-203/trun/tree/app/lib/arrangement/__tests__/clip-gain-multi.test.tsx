import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import {
  clipGainMemberSpan,
  formatClipGainRange,
  setClipGainsDb,
  shiftClipGainsDb,
} from '../clip-gain-multi';
import { createArrangement } from '../model';
import { trackVolumeFromDb } from '../track-volume-db';

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

const CLIP_GAIN_LABEL = 'Clip Gain';
const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';
const GROUP_REASON = 'Clip Gain works on audio clips only — remove the video from the selection';

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  targets: number[] = [];
  setTargetAtTime(target: number) {
    this.targets.push(target);
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
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
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
  starts: Array<[number, number, number]> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop() {}
}

const audioLog: { sources: FakeSource[] } = { sources: [] };

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
    const source = new FakeSource();
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

const faderCollection: WorkspaceCollection = {
  id: 'clip-gain-multi',
  label: 'clip-gain-multi',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'clip-gain-multi',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'clip-gain-multi', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function faderArrangement(gains: Readonly<Record<string, number>> = {}): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => (track.id === 'music' ? { ...track, volume: 0.6 } : track)),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
      { id: 'x1', trackId: 'sfx', sourceId: 'hit', start: 8, sourceOffset: 0.25, duration: 2 },
    ].map((clip) => {
      const gainDb = gains[clip.id];
      return gainDb === undefined ? clip : { ...clip, gainDb };
    }),
  };
}

interface FaderApiRef {
  current: ArrangementContextValue | null;
}

function FaderProbe({ api }: { api: FaderApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FaderApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function clipOf(arrangement: Arrangement, id: string): ArrangementClip {
  const clip = arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

function gainOf(api: FaderApiRef, id: string): number {
  return clipOf(live(api).arrangement, id).gainDb ?? 0;
}

function undoChainLabels(api: FaderApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

const press = { button: 0, buttons: 1 };

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

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  clientX: number,
  shiftKey = false,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX, shiftKey }));
  });
}

function dragFader(
  input: HTMLInputElement,
  options: { pointerId: number; width: number; deltaPx: number; shiftKey?: boolean },
) {
  stubFaderWidth(input, options.width);
  const startX = options.width / 2;
  const shiftKey = options.shiftKey === true;
  fireEvent.pointerDown(input, {
    ...press,
    pointerId: options.pointerId,
    clientX: startX,
    shiftKey,
  });
  windowPointer('pointermove', options.pointerId, startX + options.deltaPx, shiftKey);
  windowPointer('pointerup', options.pointerId, startX + options.deltaPx, shiftKey);
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountFaderWorkspace(gains: Readonly<Record<string, number>> = {}) {
  const api: FaderApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={faderCollection} initialArrangement={faderArrangement(gains)}>
      <StudioWorkspace />
      <FaderProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const rangeInput = (selector: string) => {
    const input = view.container.querySelector(selector);
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
      throw new Error(`range ${selector} missing`);
    }
    return input;
  };
  const fader = () => rangeInput('[data-testid="arrangement-detail-clip-gain-fader"]');
  const field = () => {
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain field missing');
    }
    return input;
  };
  const musicVolume = () =>
    rangeInput('[data-track-id="music"] input[aria-label="Volume — მუსიკა"]');
  const master = () => rangeInput('input[aria-label="Master Volume"]');
  const select = (clipIds: readonly string[]) => {
    act(() => live(api).selectClips(clipIds));
  };
  const reset = () => {
    const button = view.getByTestId('arrangement-detail-clip-gain-reset');
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error('clip gain reset missing');
    }
    return button;
  };
  const rangeNode = () => view.queryByTestId('arrangement-detail-clip-gain-range');
  return { api, view, fader, field, reset, rangeNode, musicVolume, master, select };
}

function gainsOf(api: FaderApiRef, ids: readonly string[]): number[] {
  return ids.map((id) => gainOf(api, id));
}

const MIXED = { m1: -6, s1: 1 };
const MEMBERS = ['m1', 's1'];

describe('multi-clip Clip Gain pure helpers (D-29z80, T12 stage 2)', () => {
  function pureArrangement(gains: Readonly<Record<string, number>>): Arrangement {
    const base = createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'a', kind: 'audio', name: 'A' },
    ]);
    return {
      ...base,
      clips: [
        { id: 'v', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
        { id: 'p', trackId: 'a', sourceId: 's', start: 0, sourceOffset: 0, duration: 1 },
        { id: 'q', trackId: 'a', sourceId: 's', start: 1, sourceOffset: 0, duration: 1 },
        { id: 'r', trackId: 'a', sourceId: 's', start: 2, sourceOffset: 0, duration: 1 },
      ].map((clip) => {
        const gainDb = gains[clip.id];
        return gainDb === undefined ? clip : { ...clip, gainDb };
      }),
    };
  }

  function pureGains(arrangement: Arrangement, ids: readonly string[]): number[] {
    return ids.map((id) => clipOf(arrangement, id).gainDb ?? 0);
  }

  it('MG1: a shared delta keeps the differences exact, clamps as one block and ignores video and unknown ids', () => {
    const start = pureArrangement({ p: -6, q: -2, r: 1 });
    const ids = ['p', 'q', 'r', 'v', 'missing'];
    expect(pureGains(shiftClipGainsDb(start, ids, 2), ['p', 'q', 'r'])).toEqual([-4, 0, 3]);
    expect(pureGains(shiftClipGainsDb(start, ids, 30), ['p', 'q', 'r'])).toEqual([17, 21, 24]);
    expect(pureGains(shiftClipGainsDb(start, ids, -70), ['p', 'q', 'r'])).toEqual([-60, -56, -53]);
    const shifted = shiftClipGainsDb(start, ids, 30);
    expect(clipOf(shifted, 'v')).toBe(clipOf(start, 'v'));
    expect(clipOf(shifted, 'q').gainDb).toBe(21);
    const atTop = shiftClipGainsDb(start, ids, 30);
    expect(shiftClipGainsDb(atTop, ids, 5)).toBe(atTop);
    expect(shiftClipGainsDb(start, ['v', 'missing'], 3)).toBe(start);
    expect(shiftClipGainsDb(start, ids, 0)).toBe(start);
    expect(clipGainMemberSpan(start, ids)).toEqual({
      clipIds: ['p', 'q', 'r'],
      minDb: -6,
      maxDb: 1,
    });
    expect(formatClipGainRange(-6, 1)).toBe('−6.0 … +1.0 dB');
    expect(formatClipGainRange(-60, 24)).toBe('−60.0 … +24.0 dB');
    expect(formatClipGainRange(-3, -3)).toBe('−3.0 dB');
  });

  it('MG2: an absolute set writes every member, 0 removes the key, and an equal set returns the same object', () => {
    const start = pureArrangement({ p: -6, q: -2, r: 1 });
    const ids = ['p', 'q', 'r', 'v'];
    const minusThree = setClipGainsDb(start, ids, -3);
    expect(pureGains(minusThree, ['p', 'q', 'r'])).toEqual([-3, -3, -3]);
    expect(setClipGainsDb(minusThree, ids, -3)).toBe(minusThree);
    const zero = setClipGainsDb(start, ids, 0);
    for (const id of ['p', 'q', 'r']) {
      expect('gainDb' in clipOf(zero, id)).toBe(false);
    }
    expect(clipOf(zero, 'v')).toBe(clipOf(start, 'v'));
    expect(setClipGainsDb(zero, ids, 0)).toBe(zero);
    expect(setClipGainsDb(start, ids, Number.NaN)).toBe(start);
  });
});

describe('multi-clip Clip Gain in the detail panel (D-29z80, T12 stage 2)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    audioLog.sources = [];
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

  it('MG3: mixed members show an empty field, the range text, the max anchor and a linked description; equal members show the value', async () => {
    const { view, fader, field, rangeNode, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    const range = rangeNode();
    expect(range?.textContent).toBe('−6.0 … +1.0 dB');
    expect(field().disabled).toBe(false);
    expect(field().value).toBe('');
    expect(field().getAttribute('aria-describedby')).toBe(range?.id);
    expect(field().title).toBe('−6.0 … +1.0 dB');
    expect(fader().disabled).toBe(false);
    expect(fader().value).toBe('1');
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 … +1.0 dB');
    view.unmount();
    const equal = await mountFaderWorkspace({ m1: -3, s1: -3 });
    equal.select(MEMBERS);
    expect(equal.field().value).toBe('-3.0');
    expect(equal.rangeNode()).toBeNull();
    expect(equal.fader().value).toBe('-3');
    expect(equal.fader().getAttribute('aria-valuetext')).toBe('−3.0 dB');
  });

  it('MG4: a +25 px drag over 100 px shifts both by +21.0 with one entry; Undo and Redo move both; two moves are not cumulative', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    dragFader(fader(), { pointerId: 81, width: 100, deltaPx: 25 });
    expect(gainsOf(api, MEMBERS)).toEqual([15, 22]);
    expect(gainOf(api, 'x1')).toBe(0);
    expect(live(api).status).toBe('Clip Gain: 2 clips — +15.0 … +22.0 dB.');
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).undo());
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).redo());
    expect(gainsOf(api, MEMBERS)).toEqual([15, 22]);
    act(() => live(api).undo());
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 82, clientX: 50 });
    windowPointer('pointermove', 82, 60);
    expect(gainsOf(api, MEMBERS)).toEqual([2.4, 9.4]);
    windowPointer('pointermove', 82, 75);
    windowPointer('pointerup', 82, 75);
    expect(gainsOf(api, MEMBERS)).toEqual([15, 22]);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
  });

  it('MG5: the block clamps at +24 and −60 with the difference kept at 7.0, and returning to the start restores the start values', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    dragFader(fader(), { pointerId: 83, width: 100, deltaPx: 200 });
    expect(gainsOf(api, MEMBERS)).toEqual([17, 24]);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 84, clientX: 50 });
    windowPointer('pointermove', 84, -150);
    expect(gainsOf(api, MEMBERS)).toEqual([-60, -53]);
    windowPointer('pointermove', 84, 50);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    windowPointer('pointermove', 84, -150);
    windowPointer('pointerup', 84, -150);
    expect(gainsOf(api, MEMBERS)).toEqual([-60, -53]);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('MG6: a Shift drag of +25 px moves both by +2.1 with one entry', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    dragFader(fader(), { pointerId: 85, width: 100, deltaPx: 25, shiftKey: true });
    expect(gainsOf(api, MEMBERS)).toEqual([-3.9, 3.1]);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('MG7: each keyboard step moves every member by 0.1 with one entry per press', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    const input = fader();
    input.focus();
    for (const value of ['1.1', '1.2', '1.3']) {
      fireEvent.keyDown(input, { key: 'ArrowRight' });
      fireEvent.change(input, { target: { value } });
      fireEvent.keyUp(input, { key: 'ArrowRight' });
    }
    expect(gainsOf(api, MEMBERS)).toEqual([-5.7, 1.3]);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL, CLIP_GAIN_LABEL, CLIP_GAIN_LABEL]);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
  });

  it('MG8: a double-click and the 0 dB button reset every member with one entry and none at 0.0', async () => {
    const { api, fader, field, reset, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    fireEvent.doubleClick(fader());
    expect(gainsOf(api, MEMBERS)).toEqual([0, 0]);
    expect(live(api).status).toBe('Clip Gain: 2 clips — 0.0 dB.');
    act(() => live(api).setStatus('before second double-click'));
    fireEvent.doubleClick(fader());
    expect(live(api).status).toBe('before second double-click');
    expect(reset().disabled).toBe(true);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(reset().disabled).toBe(false);
    const button = reset();
    button.focus();
    fireEvent.click(button);
    expect(gainsOf(api, MEMBERS)).toEqual([0, 0]);
    expect(document.activeElement).toBe(field());
    expect(field().value).toBe('0.0');
    expect(reset().disabled).toBe(true);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('MG9: a typed value sets every member; Escape restores the empty text; typed text before a drag commits first', async () => {
    const { api, fader, field, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(live(api).status).toBe('Clip Gain unchanged: −6.0 … +1.0 dB.');
    expect(live(api).undoLabel).toBeNull();
    fireEvent.change(field(), { target: { value: '-3' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(gainsOf(api, MEMBERS)).toEqual([-3, -3]);
    expect(field().value).toBe('-3.0');
    expect(live(api).status).toBe('Clip Gain: 2 clips — −3.0 dB.');
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(field().value).toBe('');
    fireEvent.change(field(), { target: { value: '-3' } });
    expect(field().getAttribute('data-pending')).toBe('true');
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field().value).toBe('');
    act(() => field().blur());
    expect(live(api).undoLabel).toBeNull();
    const text = field();
    text.focus();
    fireEvent.change(text, { target: { value: '-3' } });
    dragFader(fader(), { pointerId: 86, width: 100, deltaPx: 25 });
    expect(gainsOf(api, MEMBERS)).toEqual([18, 18]);
    act(() => live(api).undo());
    expect(gainsOf(api, MEMBERS)).toEqual([-3, -3]);
    act(() => live(api).undo());
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(live(api).undoLabel).toBeNull();
  });

  it('MG10: a selection with a video clip disables field, fader and 0 dB with the linked reason and changes nothing', async () => {
    const { api, view, fader, field, reset, select } = await mountFaderWorkspace(MIXED);
    select(['m1', 'v1']);
    const reason = view.getByTestId('arrangement-detail-clip-gain-reason');
    expect(reason.textContent).toBe(GROUP_REASON);
    for (const control of [field(), fader(), reset()]) {
      expect(control.disabled).toBe(true);
      expect(control.title).toBe(GROUP_REASON);
    }
    expect(field().getAttribute('aria-describedby')).toBe(reason.id);
    expect(fader().getAttribute('aria-describedby')).toBe(reason.id);
    select(['m1', 's1', 'v1']);
    expect(view.queryByTestId('arrangement-detail-clip-gain-range')).toBeNull();
    expect(field().value).toBe('0.0');
    expect(fader().getAttribute('aria-valuetext')).toBe('0.0 dB');
    expect(field().disabled).toBe(true);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 87, clientX: 50 });
    windowPointer('pointermove', 87, 75);
    windowPointer('pointerup', 87, 75);
    fireEvent.doubleClick(input);
    expect(gainsOf(api, ['m1', 's1', 'v1'])).toEqual([-6, 1, 0]);
    expect(live(api).undoLabel).toBeNull();
  });

  it('MG11: the clip ids captured at the press stay the target when the selection changes mid-drag (group→group proves the capture; the remounting cases guard the outcome)', async () => {
    const single = await mountFaderWorkspace(MIXED);
    single.select(['m1']);
    const singleInput = single.fader();
    stubFaderWidth(singleInput, 100);
    fireEvent.pointerDown(singleInput, { ...press, pointerId: 88, clientX: 50 });
    windowPointer('pointermove', 88, 60);
    expect(gainOf(single.api, 'm1')).toBe(2.4);
    single.select(['s1']);
    windowPointer('pointermove', 88, 75);
    expect(live(single.api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    windowPointer('pointerup', 88, 75);
    expect(gainsOf(single.api, ['m1', 's1', 'x1'])).toEqual([2.4, 1, 0]);
    expect(undoChainLabels(single.api)).toEqual([CLIP_GAIN_LABEL]);
    single.view.unmount();

    const toSingle = await mountFaderWorkspace(MIXED);
    toSingle.select(MEMBERS);
    const toSingleInput = toSingle.fader();
    stubFaderWidth(toSingleInput, 100);
    fireEvent.pointerDown(toSingleInput, { ...press, pointerId: 89, clientX: 50 });
    windowPointer('pointermove', 89, 60);
    toSingle.select(['s1']);
    windowPointer('pointermove', 89, 75);
    expect(live(toSingle.api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    windowPointer('pointerup', 89, 75);
    expect(gainsOf(toSingle.api, ['m1', 's1', 'x1'])).toEqual([2.4, 9.4, 0]);
    expect(undoChainLabels(toSingle.api)).toEqual([CLIP_GAIN_LABEL]);
    toSingle.view.unmount();

    const toGroup = await mountFaderWorkspace(MIXED);
    toGroup.select(MEMBERS);
    const toGroupInput = toGroup.fader();
    stubFaderWidth(toGroupInput, 100);
    fireEvent.pointerDown(toGroupInput, { ...press, pointerId: 90, clientX: 50 });
    windowPointer('pointermove', 90, 60);
    toGroup.select(['s1', 'x1']);
    windowPointer('pointermove', 90, 75);
    expect(live(toGroup.api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(gainsOf(toGroup.api, ['m1', 's1', 'x1'])).toEqual([15, 22, 0]);
    windowPointer('pointerup', 90, 75);
    expect(gainsOf(toGroup.api, ['m1', 's1', 'x1'])).toEqual([15, 22, 0]);
    expect(undoChainLabels(toGroup.api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('MG14: a blur or a pointercancel mid multi-drag reverts every member, writes no entry and releases the gesture', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    select(MEMBERS);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 95, clientX: 50 });
    windowPointer('pointermove', 95, 75);
    expect(gainsOf(api, MEMBERS)).toEqual([15, 22]);
    act(() => input.blur());
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(live(api).isPointerGestureActive()).toBe(false);
    windowPointer('pointermove', 95, 90);
    windowPointer('pointerup', 95, 90);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerDown(fader(), { ...press, pointerId: 96, clientX: 50 });
    windowPointer('pointermove', 96, 60);
    expect(gainsOf(api, MEMBERS)).toEqual([2.4, 9.4]);
    windowPointer('pointercancel', 96, 60);
    expect(gainsOf(api, MEMBERS)).toEqual([-6, 1]);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('MG12: a multi drag while playing ramps both clip gain nodes without a new schedule or new sources', async () => {
    const { api, fader, select } = await mountFaderWorkspace(MIXED);
    await flushLoads();
    select(MEMBERS);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const schedules = applyScheduleMock.mock.calls.length;
    const sourceCount = audioLog.sources.length;
    const gainNodeAt = (offset: number) => {
      const source = audioLog.sources.find((entry) => entry.starts[0]?.[1] === offset);
      const node = source?.outputs[0];
      if (!(node instanceof FakeGain)) {
        throw new Error(`no clip gain node for offset ${offset}`);
      }
      return node;
    };
    const musicNode = gainNodeAt(0);
    const sfxNode = gainNodeAt(0.5);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 91, clientX: 50 });
    windowPointer('pointermove', 91, 40);
    expect(gainsOf(api, MEMBERS)).toEqual([-14.4, -7.4]);
    expect(musicNode.gain.targets.at(-1)).toBeCloseTo(10 ** (-14.4 / 20), 9);
    expect(sfxNode.gain.targets.at(-1)).toBeCloseTo(10 ** (-7.4 / 20), 9);
    windowPointer('pointerup', 91, 40);
    expect(applyScheduleMock.mock.calls.length).toBe(schedules);
    expect(audioLog.sources.length).toBe(sourceCount);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).togglePlayback());
  });

  it('MG13 must-not: track Volume and Master keep their values, and one clip keeps the stage-1 display and no count status', async () => {
    const { api, view, fader, field, rangeNode, musicVolume, master, select } =
      await mountFaderWorkspace(MIXED);
    dragFader(musicVolume(), { pointerId: 92, width: 100, deltaPx: -25 });
    dragFader(master(), { pointerId: 93, width: 132, deltaPx: -24 });
    expect(live(api).arrangement.tracks.find((t) => t.id === 'music')?.volume).toBe(
      trackVolumeFromDb(-19.4),
    );
    expect(live(api).arrangement.master.gainDb).toBe(-12);
    expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL, VOLUME_LABEL]);
    select(['m1']);
    expect(field().value).toBe('-6.0');
    expect(rangeNode()).toBeNull();
    expect(fader().value).toBe('-6');
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 dB');
    const statusBefore = live(api).status;
    dragFader(fader(), { pointerId: 94, width: 100, deltaPx: 25 });
    expect(gainsOf(api, ['m1', 's1'])).toEqual([15, 1]);
    expect(live(api).status).toBe(statusBefore);
    expect(view.queryByTestId('arrangement-detail-clip-gain-reason')).toBeNull();
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });
});
