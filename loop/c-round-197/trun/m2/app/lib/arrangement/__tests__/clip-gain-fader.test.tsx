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
const NONE_REASON = 'Select a clip first';
const GROUP_REASON = 'Clip Gain works on audio clips only — remove the video from the selection';
const VIDEO_REASON = 'A video clip has no Clip Gain — use the track Volume/Mute';

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
  id: 'clip-gain-fader',
  label: 'clip-gain-fader',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'clip-gain-fader',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'clip-gain-fader', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function faderArrangement(): Arrangement {
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
    ],
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

async function mountFaderWorkspace() {
  const api: FaderApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={faderCollection} initialArrangement={faderArrangement()}>
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
  return { api, view, fader, field, musicVolume, master, select };
}

describe('Clip Gain fader in the detail panel (D-29z79, T12 stage 1)', () => {
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

  it('CF1: the fader has range −60…+24, step 0.1, the clip value, its label and a dB value text', async () => {
    const { api, fader, field, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    expect(input.disabled).toBe(false);
    expect(input.min).toBe('-60');
    expect(input.max).toBe('24');
    expect(input.step).toBe('0.1');
    expect(input.value).toBe('0');
    expect(input.getAttribute('aria-label')).toBe('Clip Gain — fader');
    expect(input.getAttribute('aria-valuetext')).toBe('0.0 dB');
    act(() => {
      live(api).setClipGain('m1', -6);
    });
    expect(fader().value).toBe('-6');
    expect(fader().getAttribute('aria-valuetext')).toBe('−6.0 dB');
    act(() => {
      live(api).setClipGain('m1', 3);
    });
    expect(fader().getAttribute('aria-valuetext')).toBe('+3.0 dB');
    const order = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-testid="arrangement-detail-clip-gain"] input, [data-testid="arrangement-detail-clip-gain"] button',
      ),
    );
    expect(order).toEqual([
      field(),
      fader(),
      document.querySelector('[data-testid="arrangement-detail-clip-gain-reset"]'),
    ]);
  });

  it('CF2: a +25 px drag over 100 px gives +21.0 dB with one Clip Gain entry; the field follows; Undo restores', async () => {
    const { api, fader, field, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 61, clientX: 50 });
    windowPointer('pointermove', 61, 60);
    expect(gainOf(api, 'm1')).toBe(8.4);
    windowPointer('pointermove', 61, 75);
    windowPointer('pointerup', 61, 75);
    expect(gainOf(api, 'm1')).toBe(21);
    expect(field().value).toBe('21.0');
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).undo());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CF3: the same drag with Shift held gives +2.1 dB with one entry', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    dragFader(fader(), { pointerId: 62, width: 100, deltaPx: 25, shiftKey: true });
    expect(gainOf(api, 'm1')).toBe(2.1);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
    expect(gainOf(api, 'm1')).toBe(0);
  });

  it('CF4: pressing Shift mid-drag re-anchors: +10 px coarse then +10 px fine totals +9.2 dB without a jump', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 63, clientX: 50 });
    windowPointer('pointermove', 63, 60);
    expect(gainOf(api, 'm1')).toBe(8.4);
    windowPointer('pointermove', 63, 70, true);
    const afterToggle = gainOf(api, 'm1');
    expect(Math.abs(afterToggle - 8.4)).toBeLessThanOrEqual(0.9);
    expect(afterToggle).toBeCloseTo(9.2, 6);
    windowPointer('pointermove', 63, 80, false);
    expect(gainOf(api, 'm1')).toBeCloseTo(17.6, 6);
    windowPointer('pointerup', 63, 80);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('CF5: a press with no move keeps the value and writes no entry', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    stubFaderWidth(input, 100);
    expect(fireEvent.pointerDown(input, { ...press, pointerId: 64, clientX: 85 })).toBe(false);
    expect(document.activeElement).toBe(input);
    expect(live(api).isPointerGestureActive()).toBe(true);
    windowPointer('pointerup', 64, 85);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CF6: a double-click from −6.0 resets to 0.0 with one entry; a double-click at 0.0 writes none', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    act(() => {
      live(api).setClipGain('m1', -6);
    });
    fireEvent.doubleClick(fader());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(fader().getAttribute('aria-valuetext')).toBe('0.0 dB');
    fireEvent.doubleClick(fader());
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL, CLIP_GAIN_LABEL]);
    expect(gainOf(api, 'm1')).toBe(0);
  });

  it('CF7: each keyboard step (change + keyup) moves 0.1 dB and writes one entry per press', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    input.focus();
    for (const value of ['0.1', '0.2', '0.3']) {
      fireEvent.keyDown(input, { key: 'ArrowRight' });
      fireEvent.change(input, { target: { value } });
      fireEvent.keyUp(input, { key: 'ArrowRight' });
    }
    expect(gainOf(api, 'm1')).toBe(0.3);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL, CLIP_GAIN_LABEL, CLIP_GAIN_LABEL]);
    expect(gainOf(api, 'm1')).toBe(0);
  });

  it('CF8: the fader is disabled with the field reason for a video clip, two clips and no selection', async () => {
    const { api, view, fader, field, select } = await mountFaderWorkspace();
    const cases: Array<[readonly string[], string]> = [
      [['v1'], VIDEO_REASON],
      [['m1', 'v1'], GROUP_REASON],
      [[], NONE_REASON],
    ];
    for (const [clipIds, reason] of cases) {
      select(clipIds);
      const input = fader();
      expect(input.disabled).toBe(true);
      expect(field().disabled).toBe(true);
      expect(input.title).toBe(reason);
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).not.toBeNull();
      expect(describedBy).toBe(field().getAttribute('aria-describedby'));
      expect(view.getByTestId('arrangement-detail-clip-gain-reason').id).toBe(describedBy);
      stubFaderWidth(input, 100);
      fireEvent.pointerDown(input, { ...press, pointerId: 65, clientX: 50 });
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireEvent.doubleClick(input);
      expect(live(api).undoLabel).toBeNull();
    }
  });

  it('CF9: typed −3 then a +25 px drag commits −3.0 first, then 18.0; Undo walks back −3.0 then 0.0', async () => {
    const { api, fader, field, select } = await mountFaderWorkspace();
    select(['m1']);
    const text = field();
    text.focus();
    fireEvent.change(text, { target: { value: '-3' } });
    dragFader(fader(), { pointerId: 66, width: 100, deltaPx: 25 });
    expect(gainOf(api, 'm1')).toBe(18);
    expect(field().value).toBe('18.0');
    act(() => live(api).undo());
    expect(gainOf(api, 'm1')).toBe(-3);
    act(() => live(api).undo());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CF10: a press during another pointer gesture is refused with the gesture status and no entry', async () => {
    const { api, view, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    const separator = view.getByTestId('arrangement-detail-separator');
    fireEvent.pointerDown(separator, { ...press, pointerId: 41, clientY: 400 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 67, clientX: 50 });
    windowPointer('pointermove', 67, 75);
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(gainOf(api, 'm1')).toBe(0);
    windowPointer('pointerup', 67, 75);
    windowPointer('pointerup', 41, 0);
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CF11: Shift makes music Volume and Master ten times finer', async () => {
    const coarse = await mountFaderWorkspace();
    dragFader(coarse.musicVolume(), { pointerId: 68, width: 100, deltaPx: -25 });
    dragFader(coarse.master(), { pointerId: 69, width: 132, deltaPx: -24 });
    const coarseVolume = live(coarse.api).arrangement.tracks.find((t) => t.id === 'music')?.volume;
    const coarseMaster = live(coarse.api).arrangement.master.gainDb;
    expect(undoChainLabels(coarse.api)).toEqual([MASTER_VOLUME_LABEL, VOLUME_LABEL]);
    coarse.view.unmount();
    const fine = await mountFaderWorkspace();
    dragFader(fine.musicVolume(), { pointerId: 70, width: 100, deltaPx: -25, shiftKey: true });
    dragFader(fine.master(), { pointerId: 71, width: 132, deltaPx: -24, shiftKey: true });
    expect(coarseVolume).toBe(trackVolumeFromDb(-19.4));
    expect(coarseMaster).toBe(-12);
    expect(live(fine.api).arrangement.tracks.find((t) => t.id === 'music')?.volume).toBe(
      trackVolumeFromDb(-5.9),
    );
    expect(live(fine.api).arrangement.master.gainDb).toBe(-1);
    expect(undoChainLabels(fine.api)).toEqual([MASTER_VOLUME_LABEL, VOLUME_LABEL]);
  });

  it('CF12: a drag while playing ramps the clip gain node without a new schedule or new sources', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    await flushLoads();
    select(['m1']);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const schedules = applyScheduleMock.mock.calls.length;
    const sourceCount = audioLog.sources.length;
    const musicSource = audioLog.sources.find((source) => source.starts[0]?.[1] === 0);
    if (!musicSource) {
      throw new Error('music source not started');
    }
    const clipGainNode = musicSource.outputs[0];
    if (!(clipGainNode instanceof FakeGain)) {
      throw new Error('music source has no clip gain node');
    }
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 72, clientX: 50 });
    windowPointer('pointermove', 72, 40);
    expect(gainOf(api, 'm1')).toBe(-8.4);
    expect(clipGainNode.gain.targets.at(-1)).toBeCloseTo(10 ** (-8.4 / 20), 9);
    windowPointer('pointermove', 72, 30);
    windowPointer('pointerup', 72, 30);
    expect(gainOf(api, 'm1')).toBe(-16.8);
    expect(clipGainNode.gain.targets.at(-1)).toBeCloseTo(10 ** (-16.8 / 20), 9);
    expect(applyScheduleMock.mock.calls.length).toBe(schedules);
    expect(audioLog.sources.length).toBe(sourceCount);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).togglePlayback());
  });

  it('CF13: a blur or a pointercancel mid-drag reverts the preview, writes no entry and releases the gesture', async () => {
    const { api, fader, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 73, clientX: 50 });
    windowPointer('pointermove', 73, 75);
    expect(gainOf(api, 'm1')).toBe(21);
    act(() => input.blur());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).isPointerGestureActive()).toBe(false);
    windowPointer('pointermove', 73, 90);
    windowPointer('pointerup', 73, 90);
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerDown(fader(), { ...press, pointerId: 74, clientX: 50 });
    windowPointer('pointermove', 74, 60);
    expect(gainOf(api, 'm1')).toBe(8.4);
    windowPointer('pointercancel', 74, 60);
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('CF14: a pending keyboard Clip Gain preview is committed under its own label before a Master preview or an Undo', async () => {
    const { api, fader, master, select } = await mountFaderWorkspace();
    select(['m1']);
    const input = fader();
    input.focus();
    fireEvent.change(input, { target: { value: '0.5' } });
    expect(gainOf(api, 'm1')).toBe(0.5);
    const masterInput = master();
    fireEvent.change(masterInput, { target: { value: '-6' } });
    fireEvent.keyUp(masterInput, { key: 'ArrowLeft' });
    expect(gainOf(api, 'm1')).toBe(0.5);
    expect(live(api).arrangement.master.gainDb).toBe(-6);
    act(() => live(api).undo());
    expect(live(api).arrangement.master.gainDb).toBe(0);
    expect(gainOf(api, 'm1')).toBe(0.5);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).undo());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.change(fader(), { target: { value: '0.2' } });
    act(() => live(api).undo());
    expect(gainOf(api, 'm1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).redoLabel).toBe(CLIP_GAIN_LABEL);
  });
});
