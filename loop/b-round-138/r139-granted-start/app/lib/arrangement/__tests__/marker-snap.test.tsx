import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { GROUP_MOVE_BLOCKED_MESSAGE } from '~/lib/arrangement/selection';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementMarker,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { clipEdgeTargets } from '../grid';
import { LIBRARY_DRAG_MIME } from '../library';
import { markerSnapTimes } from '../markers';
import { createArrangement } from '../model';

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
const MUSIC_LANE_Y = 150;
const STEMS_LANE_Y = 250;
const SFX_LANE_Y = 350;
const MOVE_LABEL = 'Move clip';
const STEMS_LANE_MOVE_LABEL = 'Move to track — სტემები';
const GROUP_MOVE_LABEL = 'Move (2)';
const TRIM_START_TITLE = 'Trim — left edge';
const TRIM_END_TITLE = 'Trim — right edge';
const MARKER_A = 12.3;
const MARKER_B = 20.7;
const OFF_GRID_MARKERS: ArrangementMarker[] = [
  { id: 'k1', time: MARKER_A, name: 'Hit A' },
  { id: 'k2', time: MARKER_B, name: 'Hit B' },
];

const markerSnapCollection: WorkspaceCollection = {
  id: 'marker-snap',
  label: 'marker-snap',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'marker-snap', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'marker-snap', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: source.id === 'hit' ? 200 : 4000,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

function clipAt(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  sourceOffset = 0,
): ArrangementClip {
  return {
    id,
    trackId,
    sourceId: trackId === 'sfx' ? 'hit' : 'song',
    start,
    sourceOffset,
    duration,
  };
}

function markerSnapArrangement(
  clips: ArrangementClip[],
  markers: ArrangementMarker[] | null,
): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  const arrangement = { ...base, clips };
  return markers ? { ...arrangement, markers } : arrangement;
}

interface MarkerSnapApiRef {
  current: ArrangementContextValue | null;
}

function MarkerSnapProbe({ api }: { api: MarkerSnapApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MarkerSnapApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountMarkerSnapWorkspace(
  clips: ArrangementClip[],
  markers: ArrangementMarker[] | null = OFF_GRID_MARKERS,
) {
  const api: MarkerSnapApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={markerSnapCollection}
      initialArrangement={markerSnapArrangement(clips, markers)}
    >
      <StudioWorkspace />
      <MarkerSnapProbe api={api} />
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
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    const trimStart = root?.querySelector<HTMLElement>(`[title="${TRIM_START_TITLE}"]`);
    const trimEnd = root?.querySelector<HTMLElement>(`[title="${TRIM_END_TITLE}"]`);
    if (!root || !(header instanceof HTMLElement) || !trimStart || !trimEnd) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header, trimStart, trimEnd };
  };
  const laneBody = (trackId: string) => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  return { api, view, clipParts, laneBody };
}

function clipOf(api: MarkerSnapApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function clipEnd(api: MarkerSnapApiRef, clipId: string): number {
  const clip = clipOf(api, clipId);
  return Math.round((clip.start + clip.duration) * 1000) / 1000;
}

function markersSnapshot(api: MarkerSnapApiRef): string {
  return JSON.stringify(live(api).arrangement.markers ?? null);
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function snapState(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.snap;
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function undoAll(api: MarkerSnapApiRef): number {
  let steps = 0;
  while (live(api).undoLabel !== null && steps < 20) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
}

const press = { button: 0, buttons: 1 };

interface PointerStep {
  dx: number;
  y?: number;
  altKey?: boolean;
  shiftKey?: boolean;
}

function dragFrom(
  handle: HTMLElement,
  root: HTMLElement,
  startX: number,
  moves: PointerStep[],
  options: { pointerId?: number; startY?: number; release?: boolean } = {},
) {
  const pointerId = options.pointerId ?? 1;
  const startY = options.startY ?? MUSIC_LANE_Y;
  fireEvent.pointerDown(handle, { ...press, pointerId, clientX: startX, clientY: startY });
  for (const move of moves) {
    fireEvent.pointerMove(root, {
      pointerId,
      clientX: startX + move.dx,
      clientY: move.y ?? startY,
      altKey: move.altKey ?? false,
      shiftKey: move.shiftKey ?? false,
    });
  }
  if (options.release === false) {
    return;
  }
  const last = moves.at(-1);
  fireEvent.pointerUp(root, {
    pointerId,
    clientX: startX + (last?.dx ?? 0),
    clientY: last?.y ?? startY,
    altKey: last?.altKey ?? false,
    shiftKey: last?.shiftKey ?? false,
  });
}

function dxForStart(fromStart: number, rawStart: number): number {
  return Math.round((rawStart - fromStart) * PX_PER_SECOND);
}

function selectGroupPair(
  api: MarkerSnapApiRef,
  clipParts: Awaited<ReturnType<typeof mountMarkerSnapWorkspace>>['clipParts'],
  otherId: string,
  otherY: number,
) {
  const first = clipParts('m1');
  dragFrom(first.header, first.root, 40, []);
  const second = clipParts(otherId);
  fireEvent.pointerDown(second.header, {
    ...press,
    pointerId: 2,
    clientX: 40,
    clientY: otherY,
    ctrlKey: true,
  });
  fireEvent.pointerUp(second.root, { pointerId: 2, clientX: 40, clientY: otherY });
  expect([...live(api).selectedClipIds].sort()).toEqual(['m1', otherId].sort());
}

function libraryTransfer() {
  return { types: [LIBRARY_DRAG_MIME], files: [], dropEffect: 'none' };
}

function xFor(time: number): number {
  return Math.round(time * PX_PER_SECOND);
}

function dragLibraryOver(lane: HTMLElement, time: number, altKey = false) {
  fireEvent.dragOver(lane, { clientX: xFor(time), altKey, dataTransfer: libraryTransfer() });
}

function dropLibrary(lane: HTMLElement, time: number, altKey = false) {
  fireEvent.drop(lane, { clientX: xFor(time), altKey, dataTransfer: libraryTransfer() });
}

function dropGhost(view: ReturnType<typeof render>) {
  const ghost = view.getByTestId('arrangement-drop-ghost');
  return { text: ghost.textContent, left: ghost.style.left, blocked: ghost.dataset.blocked };
}

function addedClips(api: MarkerSnapApiRef, existing: string[]): ArrangementClip[] {
  return live(api).arrangement.clips.filter((clip) => !existing.includes(clip.id));
}

const SINGLE_MUSIC_CLIP = () => [clipAt('m1', 'music', 2, 2)];

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('DragEvent', class TestDragEvent extends MouseEvent {});
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

describe('SRW-16 stage 2b-1 marker snap targets (D-29z41)', () => {
  it('MSU1 clipEdgeTargets merges marker times into both lists, sorted and unique', () => {
    const clips = [
      clipAt('m1', 'music', 2, 2),
      clipAt('m2', 'music', 6, 2),
      clipAt('s1', 'sfx', 10, 1),
    ];
    const plain = { startEdges: [8, 10, 11], endEdges: [6, 10, 11] };
    expect(clipEdgeTargets(clips, 'm1', 'music')).toEqual(plain);
    expect(clipEdgeTargets(clips, 'm1', 'music', [])).toEqual(plain);
    expect(clipEdgeTargets(clips, 'm1', 'music', [20.7, 12.3, 12.3, 10])).toEqual({
      startEdges: [8, 10, 11, 12.3, 20.7],
      endEdges: [6, 10, 11, 12.3, 20.7],
    });
  });

  it('MSU2 markerSnapTimes reads the marker times and is empty without markers', () => {
    expect(markerSnapTimes(markerSnapArrangement([], OFF_GRID_MARKERS))).toEqual([12.3, 20.7]);
    expect(markerSnapTimes(markerSnapArrangement([], null))).toEqual([]);
  });
});

describe('SRW-16 stage 2b-1 a clip move snaps to markers', { timeout: 15_000 }, () => {
  it('MS1 a raw start nearer a marker than any grid line lands on the marker', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    expect(snapState(view)).toBe('on');
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(parts.root.dataset.clipStart).toBe('12.300');
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('MS1b without markers the same drag lands on the grid line (M8)', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP(), null);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBe(12);
    expect(parts.root.dataset.clipStart).toBe('12.000');
  });

  it('MS2 a raw end nearer a marker lands the clip end on the marker', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 18.65) }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(18.7, 9);
    expect(clipEnd(api, 'm1')).toBe(MARKER_B);
  });

  it('MS3 a nearer grid line beats a marker and an exact tie goes to the grid line', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.1) }]);
    expect(clipOf(api, 'm1').start).toBe(12);
    undoAll(api);
    expect(clipOf(api, 'm1').start).toBe(2);
    const again = clipParts('m1');
    dragFrom(again.header, again.root, 40, [{ dx: dxForStart(2, 12.15) }]);
    expect(clipOf(api, 'm1').start).toBe(12);
  });

  it('MS4 Snap off without Alt ignores markers', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    expect(snapState(view)).toBe('off');
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBe(12.35);
  });

  it('MS5 Alt with Snap on ignores markers', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35), altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(12.35);
    expect(snapState(view)).toBe('on');
  });

  it('MS6 Alt with Snap off snaps to the marker', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35), altKey: true }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(snapState(view)).toBe('off');
  });

  it('MS9 a cross-lane move lands its start on a marker of the timeline', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35), y: STEMS_LANE_Y }], {
      release: false,
    });
    const ghosts = [
      ...view.container.querySelectorAll<HTMLElement>(
        '[data-testid="arrangement-lane-move-ghost"]',
      ),
    ];
    expect(ghosts).toHaveLength(1);
    expect(ghosts[0].closest('[data-track-id]')?.getAttribute('data-track-id')).toBe('stems');
    expect(ghosts[0].dataset.ghostStart).toBe('12.300');
    fireEvent.pointerUp(parts.root, {
      pointerId: 1,
      clientX: 40 + dxForStart(2, 12.35),
      clientY: STEMS_LANE_Y,
    });
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(live(api).undoLabel).toBe(STEMS_LANE_MOVE_LABEL);
  });

  it('MS11 markers stay byte-equal through the move and its Undo; one history step', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const before = markersSnapshot(api);
    expect(before).toBe(JSON.stringify(OFF_GRID_MARKERS));
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(markersSnapshot(api)).toBe(before);
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 'm1').start).toBe(2);
    expect(markersSnapshot(api)).toBe(before);
    act(() => live(api).redo());
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(markersSnapshot(api)).toBe(before);
  });

  it('MS12 a nearer clip edge beats a marker', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([
      ...SINGLE_MUSIC_CLIP(),
      clipAt('s1', 'sfx', 12.33, 0.5),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(12.33, 9);
  });

  it('MS12b a nearer marker beats a clip edge', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([
      ...SINGLE_MUSIC_CLIP(),
      clipAt('s1', 'sfx', 12.42, 0.5),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
  });

  it('MS14 a marker at the clip current start is a target, so a small drag snaps back (M9)', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace([
      clipAt('m1', 'music', MARKER_A, 2),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 4 }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(parts.root.dataset.clipStart).toBe('12.300');
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe('Move clip: nothing changed — the Undo history is unchanged.');
  });

  it('MS13 the Shift time lock ignores markers', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace(SINGLE_MUSIC_CLIP());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [
      { dx: dxForStart(2, 12.35), y: STEMS_LANE_Y, shiftKey: true },
    ]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(2);
    expect(live(api).undoLabel).toBe(STEMS_LANE_MOVE_LABEL);
  });
});

describe('SRW-16 stage 2b-1 a trim snaps to markers', { timeout: 15_000 }, () => {
  it('MS7 a right trim lands its end on a marker', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([clipAt('m1', 'music', 2, 10)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 400, [{ dx: 14 }]);
    expect(clipOf(api, 'm1').start).toBe(2);
    expect(clipEnd(api, 'm1')).toBe(MARKER_A);
    expect(clipOf(api, 'm1').sourceOffset).toBe(0);
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
  });

  it('MS7b a left trim lands its start on a marker and raises the source offset', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([clipAt('m1', 'music', 10, 10)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: 94 }]);
    const trimmed = clipOf(api, 'm1');
    expect(trimmed.start).toBeCloseTo(MARKER_A, 9);
    expect(trimmed.sourceOffset).toBeCloseTo(2.3, 9);
    expect(clipEnd(api, 'm1')).toBe(20);
    expect(live(api).undoLabel).toBe(TRIM_START_TITLE);
  });

  it('MS7c a left trim lands its start on a marker and lowers the source offset', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([clipAt('m1', 'music', 13, 4, 1)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -26 }]);
    const trimmed = clipOf(api, 'm1');
    expect(trimmed.start).toBeCloseTo(MARKER_A, 9);
    expect(trimmed.sourceOffset).toBeCloseTo(0.3, 9);
    expect(clipEnd(api, 'm1')).toBe(17);
  });
});

describe('SRW-16 stage 2b-1 a group move snaps to markers', { timeout: 15_000 }, () => {
  it('MS8 the anchor start lands on a marker and the other clip keeps its offset', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 3, 1),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBeCloseTo(MARKER_A, 9);
    expect(clipOf(api, 's2').start).toBeCloseTo(13.3, 9);
    expect(live(api).undoLabel).toBe(GROUP_MOVE_LABEL);
  });

  it('MS8b the anchor end lands on a marker', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 1),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 18.65) }], { pointerId: 3 });
    expect(clipEnd(api, 'm1')).toBe(MARKER_B);
    expect(clipOf(api, 's2').start).toBeCloseTo(18.7, 9);
  });

  it('MS8c a marker outside the group bounds falls back to the grid result', async () => {
    const { api, clipParts } = await mountMarkerSnapWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('s3', 'sfx', 14.25, 0.75),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBe(12);
    expect(clipOf(api, 's2').start).toBe(12);
    expect(clipOf(api, 's3').start).toBe(14.25);
    expect(live(api).undoLabel).toBe(GROUP_MOVE_LABEL);
  });

  it('MS8d a blocked group falls back to the grid inside its bounds and says so', async () => {
    const { api, view, clipParts } = await mountMarkerSnapWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('s3', 'sfx', 13, 1),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: dxForStart(2, 12.35) }], {
      pointerId: 3,
      release: false,
    });
    expect(statusText(view)).toBe(GROUP_MOVE_BLOCKED_MESSAGE);
    fireEvent.pointerUp(parts.root, {
      pointerId: 3,
      clientX: 40 + dxForStart(2, 12.35),
      clientY: MUSIC_LANE_Y,
    });
    expect(clipOf(api, 'm1').start).toBe(11);
    expect(clipOf(api, 's2').start).toBe(11);
    expect(clipOf(api, 's3').start).toBe(13);
  });
});

describe('SRW-16 stage 2b-1 a library drop snaps to markers', { timeout: 15_000 }, () => {
  const DROP_FIXTURE_IDS = ['m1'];
  const dropFixture = () => [clipAt('m1', 'music', 30, 2)];

  it('MS10 the drop ghost and the dropped start land on a marker', async () => {
    const { api, view, laneBody } = await mountMarkerSnapWorkspace(dropFixture());
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 12.35);
    expect(dropGhost(view)).toEqual({ text: '00:12.300', left: '492px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 12.35);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.trackId).toBe('sfx');
    expect(added[0]?.start).toBeCloseTo(MARKER_A, 9);
    expect(markersSnapshot(api)).toBe(JSON.stringify(OFF_GRID_MARKERS));
  });

  it('MS10b a drop whose raw end is near a marker lands its end there', async () => {
    const { api, view, laneBody } = await mountMarkerSnapWorkspace(dropFixture());
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('stems'), 18.65);
    expect(dropGhost(view).text).toBe('00:18.700');
    dropLibrary(laneBody('stems'), 18.65);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBeCloseTo(18.7, 9);
    expect((added[0]?.start ?? 0) + (added[0]?.duration ?? 0)).toBeCloseTo(MARKER_B, 9);
  });

  it('MS10c the video lane keeps its grid-only refusal', async () => {
    const { api, view, laneBody } = await mountMarkerSnapWorkspace(dropFixture());
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('video'), 12.35);
    expect(dropGhost(view)).toEqual({
      text: '00:12.000 · აუდიო ვიდეოხაზზე არ ემატება',
      left: '480px',
      blocked: 'true',
    });
    dropLibrary(laneBody('video'), 12.35);
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
  });
});
