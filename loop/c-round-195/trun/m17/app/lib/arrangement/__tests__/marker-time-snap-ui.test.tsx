import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  ArrangementMarker,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioLoopStrings } from '../strings';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

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
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const RULER_Y = 10;
const MUSIC_LANE_Y = 150;
const SFX_LANE_Y = 250;
const BRACE_X = 500;
const MARKER_A = 6.375;
const MARKER_B = 12;
const LOOP_LABEL = studioLoopStrings.historyRange;
const TIME_SNAP_MARKERS: ArrangementMarker[] = [
  { id: 'kA', time: MARKER_A, name: 'A' },
  { id: 'kB', time: MARKER_B, name: 'B' },
];

const timeSnapCollection: WorkspaceCollection = {
  id: 'marker-time-snap',
  label: 'marker-time-snap',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'marker-time-snap',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'marker-time-snap', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: source.id === 'hit' ? 200 : 4000,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const MUSIC_CLIP: ArrangementClip = {
  id: 'm1',
  trackId: 'music',
  sourceId: 'song',
  start: 0,
  sourceOffset: 0,
  duration: 40,
};

function timeSnapArrangement(
  markers: ArrangementMarker[] | null,
  loop: ArrangementLoop | null,
): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  const arrangement: Arrangement = { ...base, clips: [MUSIC_CLIP], loop };
  return markers ? { ...arrangement, markers } : arrangement;
}

interface TimeSnapApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function TimeSnapProbe({ api }: { api: TimeSnapApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: TimeSnapApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: TimeSnapApiRef): number {
  if (!api.position) {
    throw new Error('position store not mounted');
  }
  return api.position.getPosition();
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountTimeSnapWorkspace(
  options: { markers?: ArrangementMarker[] | null; loop?: ArrangementLoop | null } = {},
) {
  const markers = options.markers === undefined ? TIME_SNAP_MARKERS : options.markers;
  const api: TimeSnapApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={timeSnapCollection}
      initialArrangement={timeSnapArrangement(markers, options.loop ?? null)}
    >
      <StudioWorkspace />
      <TimeSnapProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 &&
    (live(api).sourceDurations.get('song') === undefined ||
      live(api).sourceDurations.get('hit') === undefined);
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const ruler = view.getByTestId('arrangement-ruler');
  const handle = view.getByTestId('arrangement-playhead-handle');
  stubCapture(ruler);
  stubCapture(handle);
  const laneBody = (trackId: string) => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  const musicClip = () => {
    const root = view.container.querySelector<HTMLElement>('[data-clip-id="m1"]');
    const body = root?.querySelector<HTMLElement>('[title^="drag = time selection"]');
    if (!root || !body) {
      throw new Error('music clip not rendered');
    }
    stubCapture(root);
    return { root, body };
  };
  const brace = () => {
    const element = view.getByTestId('arrangement-loop-brace');
    stubCapture(element);
    return element;
  };
  return { api, view, ruler, handle, laneBody, musicClip, brace };
}

type TimeSnapView = ReturnType<typeof render>;

function setSnap(view: TimeSnapView, snap: boolean) {
  const control = view.getByTestId('arrangement-grid-control');
  if (control.dataset.gridSeconds !== '1') {
    fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value: '1' } });
  }
  if ((control.dataset.snap === 'on') !== snap) {
    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
  }
  expect(control.dataset.gridSeconds).toBe('1');
  expect(control.dataset.snap).toBe(snap ? 'on' : 'off');
}

const press = { button: 0, buttons: 1 };

function xFor(time: number): number {
  return Math.round(time * PX_PER_SECOND);
}

function clickRuler(ruler: HTMLElement, time: number, altKey = false) {
  const x = xFor(time);
  fireEvent.pointerDown(ruler, { ...press, pointerId: 1, clientX: x, clientY: RULER_Y });
  fireEvent.pointerUp(ruler, { pointerId: 1, clientX: x, clientY: RULER_Y, altKey });
}

function handleValue(handle: HTMLElement): number {
  return Number(handle.getAttribute('aria-valuenow'));
}

function clickLane(lane: HTMLElement, time: number, altKey = false) {
  const x = xFor(time);
  fireEvent.pointerDown(lane, { ...press, pointerId: 1, clientX: x, clientY: SFX_LANE_Y });
  fireEvent.pointerUp(window, { pointerId: 1, clientX: x, clientY: SFX_LANE_Y, altKey });
}

function dragWaveform(
  parts: { root: HTMLElement; body: HTMLElement },
  from: number,
  through: readonly number[],
  altKey = false,
) {
  fireEvent.pointerDown(parts.body, {
    ...press,
    pointerId: 1,
    clientX: xFor(from),
    clientY: MUSIC_LANE_Y,
  });
  for (const time of through) {
    fireEvent.pointerMove(parts.root, {
      pointerId: 1,
      clientX: xFor(time),
      clientY: MUSIC_LANE_Y,
      altKey,
    });
  }
  const last = through.at(-1) ?? from;
  fireEvent.pointerUp(parts.root, {
    pointerId: 1,
    clientX: xFor(last),
    clientY: MUSIC_LANE_Y,
    altKey,
  });
}

function dragBrace(
  view: TimeSnapView,
  element: HTMLElement,
  part: 'move' | 'start' | 'end',
  dx: number,
  altKey = false,
) {
  const target = part === 'move' ? element : view.getByTestId(`arrangement-loop-${part}-edge`);
  fireEvent.pointerDown(target, { ...press, pointerId: 1, clientX: BRACE_X, clientY: 30 });
  fireEvent.pointerMove(element, { pointerId: 1, clientX: BRACE_X + dx, clientY: 30, altKey });
  fireEvent.pointerUp(element, { pointerId: 1, clientX: BRACE_X + dx, clientY: 30, altKey });
}

function loopOf(api: TimeSnapApiRef): { start: number; end: number } {
  const loop = live(api).arrangement.loop;
  if (!loop) {
    throw new Error('loop missing');
  }
  return { start: loop.start, end: loop.end };
}

function markerTime(api: TimeSnapApiRef, id: string): number | undefined {
  return live(api).arrangement.markers?.find((marker) => marker.id === id)?.time;
}

function dragMarkerFlag(view: TimeSnapView, id: string, steps: readonly number[]) {
  const flag = view
    .queryAllByTestId('arrangement-marker')
    .find((entry) => entry.dataset.markerId === id);
  if (!flag) {
    throw new Error(`no marker ${id}`);
  }
  stubCapture(flag);
  fireEvent.pointerDown(flag, { ...press, pointerId: 7, clientX: 100, clientY: 30 });
  for (const dx of steps) {
    fireEvent.pointerMove(flag, { buttons: 1, pointerId: 7, clientX: 100 + dx, clientY: 30 });
  }
  const last = steps.at(-1) ?? 0;
  fireEvent.pointerUp(flag, { button: 0, buttons: 0, pointerId: 7, clientX: 100 + last });
  fireEvent.click(flag);
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
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

describe('SRW-16 stage 2b-3 seeks snap to markers', { timeout: 15_000 }, () => {
  it('TS1 a ruler click follows the bypass matrix with the marker as a candidate', async () => {
    const { api, view, ruler, handle } = await mountTimeSnapWorkspace();
    expect(view.getByTestId('arrangement-zoom-readout').textContent).toBe('40 px/s');
    setSnap(view, true);
    clickRuler(ruler, 6.45);
    expect(positionOf(api)).toBe(MARKER_A);
    expect(handle.getAttribute('aria-valuetext')).toBe('00:06.375');
    clickRuler(ruler, 6.1);
    expect(positionOf(api)).toBe(6);
    clickRuler(ruler, 6.45, true);
    expect(positionOf(api)).toBeCloseTo(6.45, 9);
    setSnap(view, false);
    clickRuler(ruler, 6.45);
    expect(positionOf(api)).toBeCloseTo(6.45, 9);
    clickRuler(ruler, 6.45, true);
    expect(positionOf(api)).toBe(MARKER_A);
    expect(live(api).undoLabel).toBeNull();
  });

  it('TS1b the ruler reads markers at event time', async () => {
    const { api, view, ruler } = await mountTimeSnapWorkspace({ markers: null });
    setSnap(view, true);
    clickRuler(ruler, 6.45);
    expect(positionOf(api)).toBe(6);
    const before = live(api).getArrangement();
    act(() => {
      live(api).commitArrangement(
        { ...before, markers: [{ id: 'late', time: MARKER_A, name: 'Late' }] },
        'Add Marker',
        before,
      );
    });
    clickRuler(ruler, 6.45);
    expect(positionOf(api)).toBe(MARKER_A);
  });

  it('TS2 a playhead drag reports the marker while scrubbing and on release; Alt stays free', async () => {
    const { api, view, handle } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: xFor(2), clientY: RULER_Y });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(4), clientY: RULER_Y });
    expect(positionOf(api)).toBe(4);
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(6.45), clientY: RULER_Y });
    expect(handleValue(handle)).toBe(MARKER_A);
    expect(positionOf(api)).toBe(MARKER_A);
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: xFor(6.45), clientY: RULER_Y });
    expect(positionOf(api)).toBe(MARKER_A);
    expect(handleValue(handle)).toBe(MARKER_A);
    fireEvent.pointerDown(handle, { ...press, pointerId: 2, clientX: xFor(2), clientY: RULER_Y });
    fireEvent.pointerMove(handle, {
      pointerId: 2,
      clientX: xFor(6.45),
      clientY: RULER_Y,
      altKey: true,
    });
    expect(handleValue(handle)).toBe(6.45);
    fireEvent.pointerUp(handle, {
      pointerId: 2,
      clientX: xFor(6.45),
      clientY: RULER_Y,
      altKey: true,
    });
    expect(positionOf(api)).toBeCloseTo(6.45, 9);
    expect(live(api).undoLabel).toBeNull();
  });

  it('TS2b a cancelled scrub keeps the last marker sample', async () => {
    const { api, view, handle } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: xFor(2), clientY: RULER_Y });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(6.45), clientY: RULER_Y });
    fireEvent.pointerCancel(handle, { pointerId: 1, clientX: xFor(7.6), clientY: RULER_Y });
    expect(positionOf(api)).toBe(MARKER_A);
    expect(handleValue(handle)).toBe(MARKER_A);
  });

  it('TS3 an empty-lane click snaps to the marker; Snap off stays free', async () => {
    const { api, view, laneBody } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    clickLane(laneBody('sfx'), 6.45);
    expect(positionOf(api)).toBe(MARKER_A);
    expect(live(api).activeTrackId).toBe('sfx');
    clickLane(laneBody('sfx'), 6.1);
    expect(positionOf(api)).toBe(6);
    setSnap(view, false);
    clickLane(laneBody('sfx'), 6.45);
    expect(positionOf(api)).toBeCloseTo(6.45, 9);
    expect(live(api).undoLabel).toBeNull();
  });

  it('TS4 a click in the clip waveform snaps to the marker', async () => {
    const { api, view, musicClip } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    const parts = musicClip();
    fireEvent.pointerDown(parts.body, {
      ...press,
      pointerId: 1,
      clientX: xFor(6.45),
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: xFor(6.45), clientY: MUSIC_LANE_Y });
    expect(live(api).range).toBeNull();
    expect(positionOf(api)).toBe(MARKER_A);
    expect(live(api).undoLabel).toBeNull();
  });
});

describe('SRW-16 stage 2b-3 the in-clip range snaps to markers', { timeout: 15_000 }, () => {
  it('TS5 range edges snap to the marker; equal edges give no range; Alt stays free', async () => {
    const { api, view, musicClip } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    dragWaveform(musicClip(), 3.2, [4, 6.45]);
    expect(live(api).range).toEqual({ start: 3, end: MARKER_A, trackId: 'music' });
    dragWaveform(musicClip(), 6.4, [6.9, 6.45]);
    expect(live(api).range).toBeNull();
    dragWaveform(musicClip(), 3.2, [4, 6.45], true);
    expect(live(api).range).toEqual({ start: 3.2, end: 6.45, trackId: 'music' });
    expect(live(api).undoLabel).toBeNull();
  });
});

describe('SRW-16 stage 2b-3 the loop brace snaps to markers', { timeout: 15_000 }, () => {
  it('TS6a the dragged end edge lands on the marker; one history entry; Undo restores', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      loop: { start: 2, end: 4, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'end', xFor(2.45));
    expect(loopOf(api)).toEqual({ start: 2, end: MARKER_A });
    expect(live(api).undoLabel).toBe(LOOP_LABEL);
    act(() => live(api).undo());
    expect(loopOf(api)).toEqual({ start: 2, end: 4 });
    expect(live(api).undoLabel).toBeNull();
    dragBrace(view, brace(), 'end', xFor(2.8));
    expect(loopOf(api)).toEqual({ start: 2, end: 7 });
  });

  it('TS6b the dragged start edge lands on the marker', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      loop: { start: 5, end: 9, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'start', xFor(1.3));
    expect(loopOf(api)).toEqual({ start: MARKER_A, end: 9 });
    expect(live(api).undoLabel).toBe(LOOP_LABEL);
    act(() => live(api).undo());
    expect(loopOf(api)).toEqual({ start: 5, end: 9 });
  });

  it('TS7 a loop move lands its start or its end on the marker and keeps the length', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      loop: { start: 2, end: 4, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'move', xFor(4.45));
    expect(loopOf(api)).toEqual({ start: MARKER_A, end: 8.375 });
    expect(live(api).undoLabel).toBe(LOOP_LABEL);
    act(() => live(api).undo());
    expect(loopOf(api)).toEqual({ start: 2, end: 4 });
    dragBrace(view, brace(), 'move', xFor(2.425));
    expect(loopOf(api)).toEqual({ start: 4.375, end: MARKER_A });
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
  });

  it('TS7b without markers the same moves give the grid results', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      markers: null,
      loop: { start: 2, end: 4, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'move', xFor(4.45));
    expect(loopOf(api)).toEqual({ start: 6, end: 8 });
    act(() => live(api).undo());
    dragBrace(view, brace(), 'move', xFor(2.425));
    expect(loopOf(api)).toEqual({ start: 4, end: 6 });
  });

  it('TS7c a marker landing keeps a clean stored start for non-binary times', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      markers: [{ id: 'k1', time: 1.3, name: 'Hit' }],
      loop: { start: 0.3, end: 1, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'move', xFor(0.3));
    expect(loopOf(api)).toEqual({ start: 0.6, end: 1.3 });
  });

  it('TS7d Snap on + Alt and Snap off keep the brace free of markers and grid', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      loop: { start: 2, end: 4, enabled: true },
    });
    setSnap(view, true);
    dragBrace(view, brace(), 'move', xFor(4.45), true);
    expect(loopOf(api)).toEqual({ start: 6.45, end: 8.45 });
    act(() => live(api).undo());
    dragBrace(view, brace(), 'end', xFor(2.45), true);
    expect(loopOf(api)).toEqual({ start: 2, end: 6.45 });
    act(() => live(api).undo());
    setSnap(view, false);
    dragBrace(view, brace(), 'end', xFor(2.45));
    expect(loopOf(api)).toEqual({ start: 2, end: 6.45 });
    act(() => live(api).undo());
    dragBrace(view, brace(), 'move', xFor(4.45));
    expect(loopOf(api)).toEqual({ start: 6.45, end: 8.45 });
    act(() => live(api).undo());
    dragBrace(view, brace(), 'end', xFor(2.45), true);
    expect(loopOf(api)).toEqual({ start: 2, end: MARKER_A });
  });
});

describe('SRW-16 stage 2b-3 no markers keep the grid results', { timeout: 15_000 }, () => {
  it('TS8 ruler, lane, range and loop resize snap to the grid only', async () => {
    const { api, view, ruler, laneBody, musicClip, brace } = await mountTimeSnapWorkspace({
      markers: null,
      loop: { start: 2, end: 4, enabled: true },
    });
    setSnap(view, true);
    clickRuler(ruler, 6.45);
    expect(positionOf(api)).toBe(6);
    clickLane(laneBody('sfx'), 6.45);
    expect(positionOf(api)).toBe(6);
    dragWaveform(musicClip(), 3.2, [4, 6.45]);
    expect(live(api).range).toEqual({ start: 3, end: 6, trackId: 'music' });
    dragBrace(view, brace(), 'end', xFor(2.45));
    expect(loopOf(api)).toEqual({ start: 2, end: 6 });
  });
});

describe('SRW-16 stage 2b-3 unchanged neighbours', { timeout: 15_000 }, () => {
  it('TS9a loop arrow keys step to grid lines past a marker', async () => {
    const { api, view, brace } = await mountTimeSnapWorkspace({
      loop: { start: 6, end: 8, enabled: true },
    });
    setSnap(view, true);
    const element = brace();
    act(() => element.focus());
    fireEvent.keyDown(element, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(loopOf(api)).toEqual({ start: 7, end: 9 });
    fireEvent.keyDown(element, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.keyDown(element, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(loopOf(api)).toEqual({ start: 5, end: 7 });
  });

  it('TS9b playhead arrow keys keep the 0.1 s step near a marker', async () => {
    const { api, view, ruler, handle } = await mountTimeSnapWorkspace();
    setSnap(view, false);
    clickRuler(ruler, 6.3);
    expect(positionOf(api)).toBeCloseTo(6.3, 9);
    setSnap(view, true);
    act(() => handle.focus());
    fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(positionOf(api)).toBe(6.4);
  });

  it('TS9c a marker drag near the off-grid marker lands on the grid line', async () => {
    const { api, view } = await mountTimeSnapWorkspace();
    setSnap(view, true);
    dragMarkerFlag(view, 'kB', [-xFor(1), -xFor(12 - 6.45)]);
    expect(markerTime(api, 'kB')).toBe(6);
    expect(markerTime(api, 'kA')).toBe(MARKER_A);
    expect(live(api).undoLabel).toBe('Move Marker');
  });
});
