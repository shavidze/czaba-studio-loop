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
import { GROUP_MOVE_BLOCKED_MESSAGE } from '~/lib/arrangement/selection';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';

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
const TRIM_START_TITLE = 'Trim — left edge';
const TRIM_END_TITLE = 'Trim — right edge';
const TRIM_START_BLOCKED =
  'Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).';
const TRIM_END_BLOCKED =
  'Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).';

const edgeCollection: WorkspaceCollection = {
  id: 'edges',
  label: 'edges',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'edges', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'edges', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
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

function edgeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface EdgeApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function EdgeProbe({ api }: { api: EdgeApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: EdgeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: EdgeApiRef): number {
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

async function mountEdgeWorkspace(clips: ArrangementClip[]) {
  const api: EdgeApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider collection={edgeCollection} initialArrangement={edgeArrangement(clips)}>
      <StudioWorkspace />
      <EdgeProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
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
    const body = root?.querySelector<HTMLElement>('[title^="drag = time selection"]');
    const trimStart = root?.querySelector<HTMLElement>(`[title="${TRIM_START_TITLE}"]`);
    const trimEnd = root?.querySelector<HTMLElement>(`[title="${TRIM_END_TITLE}"]`);
    if (!root || !(header instanceof HTMLElement) || !body || !trimStart || !trimEnd) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header, body, trimStart, trimEnd };
  };
  return { api, view, clipParts };
}

function clipOf(api: EdgeApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function clipEnd(api: EdgeApiRef, clipId: string): number {
  const clip = clipOf(api, clipId);
  return Math.round((clip.start + clip.duration) * 1000) / 1000;
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function snapState(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.snap;
}

function chooseDivision(view: ReturnType<typeof render>, value: string) {
  fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value } });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function undoAll(api: EdgeApiRef): number {
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

function xAt(clip: ArrangementClip, time: number): number {
  return Math.round((time - clip.start) * PX_PER_SECOND);
}

const SFX_NEIGHBOUR_FIXTURE = () => [clipAt('m1', 'music', 2, 2), clipAt('s1', 'sfx', 6.7, 1.3)];

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

describe('SRW-14 stage 4a single clip move snaps to the edges of other clips', () => {
  it('CM1 the moved end touches the next clip start on the same lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('m2', 'music', 10.4, 2.6),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }]);
    expect(clipOf(api, 'm1').start).toBe(8.4);
    expect(parts.root.dataset.clipStart).toBe('8.400');
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
    expect(statusText(view)).toBe(
      'Move clip: start 00:08.400, length 00:02.000, source offset 00:00.000.',
    );
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 'm1').start).toBe(2);
  });

  it('CM2 the moved start touches the start of a clip on another lane', async () => {
    const { api, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 184 }]);
    expect(clipOf(api, 'm1').start).toBe(6.7);
    expect(clipOf(api, 'm1').trackId).toBe('music');
  });

  it('CM3 a grid line nearer than any edge wins', async () => {
    const { api, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 196 }]);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('CM4 Snap off keeps the move free of edges', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    expect(snapState(view)).toBe('off');
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 184 }]);
    expect(clipOf(api, 'm1').start).toBe(6.6);
  });

  it('CM5 Alt with Snap on bypasses grid and edges', async () => {
    const { api, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 184, altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(6.6);
  });

  it('CM6 Alt with Snap off enables grid and edges', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 184, altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(6.7);
    expect(snapState(view)).toBe('off');
  });

  it('CM7 an edge as near as the grid line loses to the line', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace(SFX_NEIGHBOUR_FIXTURE());
    chooseDivision(view, '0.25');
    pressG();
    expect(snapState(view)).toBe('on');
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 184 }]);
    expect(clipOf(api, 'm1').start).toBe(6.5);
  });

  it('CM8 a cross-lane move lands with its end on a clip start of the target lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254, y: STEMS_LANE_Y }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.4, 9);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
    expect(statusText(view)).toBe('Move to track — სტემები: start 00:08.400.');
  });

  it('CM9 the Shift time lock ignores edges', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s1', 'sfx', 2.05, 0.95),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(2);
  });

  it('CM9b the Shift time lock keeps an off-grid start next to a nearer edge', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2.3, 2),
      clipAt('s1', 'sfx', 2.35, 0.95),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(2.3);
  });

  it('CM10 a group move lands the anchor end on a clip start of another lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    pressG();
    const first = clipParts('m1');
    dragFrom(first.header, first.root, 40, []);
    const second = clipParts('s2');
    fireEvent.pointerDown(second.header, {
      ...press,
      pointerId: 2,
      clientX: 40,
      clientY: SFX_LANE_Y,
      ctrlKey: true,
    });
    fireEvent.pointerUp(second.root, { pointerId: 2, clientX: 40, clientY: SFX_LANE_Y });
    expect([...live(api).selectedClipIds].sort()).toEqual(['m1', 's2']);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.4, 9);
    expect(clipOf(api, 's2').start).toBeCloseTo(8.4, 9);
    expect(live(api).undoLabel).toBe('Move (2)');
    expect(statusText(view)).toBe('Move (2): 2 clips moved 00:06.400 to the right.');
  });

  it('CM11 the moved clip ignores its own edges', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 7.3, 2)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 8 }]);
    expect(clipOf(api, 'm1').start).toBe(8);
  });

  it('CM17 a Snap-off move keeps a whole-millisecond start at a fractional zoom', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 2, 2)]);
    expect(snapState(view)).toBe('off');
    act(() => live(api).setPxPerSecond(30));
    expect(live(api).pxPerSecond).toBe(30);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 10 }]);
    expect(clipOf(api, 'm1').start).toBe(2.333);
  });
});

describe('SRW-14 stage 4a trim edges snap to the edges of other clips', () => {
  it('CT1 a right trim stops on the next clip start of the same lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('m2', 'music', 10.4, 2.6),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 42 }]);
    expect(clipEnd(api, 'm1')).toBe(10.4);
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
    expect(statusText(view)).not.toBe(TRIM_END_BLOCKED);
    expect(statusText(view)).toBe(
      'Trim — right edge: start 00:07.000, length 00:03.400, source offset 00:00.000.',
    );
  });

  it('CT2 a right trim lands on a clip start of another lane', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('s1', 'sfx', 9.6, 1.4),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 16 }]);
    expect(clipEnd(api, 'm1')).toBe(9.6);
  });

  it('CT3 a left trim lands on a clip end of another lane and lowers the source offset', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7.3, 4, 0.6),
      clipAt('s1', 'sfx', 5, 1.85),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -20 }]);
    const trimmed = clipOf(api, 'm1');
    expect(trimmed.start).toBe(6.85);
    expect(trimmed.sourceOffset).toBeCloseTo(0.15, 9);
    expect(clipEnd(api, 'm1')).toBe(11.3);
    expect(live(api).undoLabel).toBe(TRIM_START_TITLE);
  });

  it('CT4 an edge target past the source start is clamped with the existing blocked text', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7.3, 4, 0.2),
      clipAt('s1', 'sfx', 5, 2.05),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -9 }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(7.1, 9);
    expect(clipOf(api, 'm1').sourceOffset).toBeCloseTo(0, 9);
    expect(parts.root.dataset.clipStart).toBe('7.100');
    expect(statusText(view)).toBe(TRIM_START_BLOCKED);
  });

  it('CT5 Alt keeps a free right trim', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('s1', 'sfx', 9.6, 1.4),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 16, altKey: true }]);
    expect(clipEnd(api, 'm1')).toBe(9.7);
  });

  it('CT6 a left trim touches the end of the previous clip on the same lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m0', 'music', 2, 4.85),
      clipAt('m1', 'music', 7.3, 4, 0.6),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -20 }]);
    expect(clipOf(api, 'm1').start).toBe(6.85);
    expect(statusText(view)).not.toBe(TRIM_START_BLOCKED);
    expect(statusText(view)).toBe(
      'Trim — left edge: start 00:06.850, length 00:04.450, source offset 00:00.150.',
    );
  });
});

describe('SRW-14 stage 4a clip-body press cancel', () => {
  it('CC1 a cancelled body press does not move the playhead', async () => {
    const music = clipAt('m1', 'music', 7, 3);
    const { api, clipParts } = await mountEdgeWorkspace([music]);
    const before = positionOf(api);
    const parts = clipParts('m1');
    const x = xAt(music, 8.4);
    dragFrom(parts.body, parts.root, x, [], { release: false });
    fireEvent.pointerCancel(parts.root, { pointerId: 1, clientX: x, clientY: MUSIC_LANE_Y });
    expect(positionOf(api)).toBe(before);
    expect(live(api).range).toBeNull();
    expect(live(api).undoLabel).toBeNull();
  });

  it('CC2 a released body press still seeks', async () => {
    const music = clipAt('m1', 'music', 7, 3);
    const { api, clipParts } = await mountEdgeWorkspace([music]);
    const parts = clipParts('m1');
    dragFrom(parts.body, parts.root, xAt(music, 8.4), []);
    expect(positionOf(api)).toBeCloseTo(8.4, 9);
    expect(live(api).range).toBeNull();
  });
});

const MOVE_BLOCKED_TEXT =
  'Move blocked — a neighbouring clip or the start of the timeline. The clip stayed in its last free spot.';

function exactClipEnd(api: EdgeApiRef, clipId: string): number {
  const clip = clipOf(api, clipId);
  return clip.start + clip.duration;
}

describe('SRW-14 stage 4a exact edges and the placement-lane rule (D-29z18)', () => {
  it('CM12 a clip with a sub-millisecond length butt-joins the next clip on its lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2.0004),
      clipAt('m2', 'music', 10.4, 2.6),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.3996, 9);
    expect(exactClipEnd(api, 'm1')).toBeLessThanOrEqual(clipOf(api, 'm2').start + 1e-9);
    expect(statusText(view)).not.toBe(MOVE_BLOCKED_TEXT);
    expect(statusText(view)).toBe(
      'Move clip: start 00:08.400, length 00:02.000, source offset 00:00.000.',
    );
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('CM13 a start touches a previous clip end that is not a whole millisecond', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m0', 'music', 2, 4.0004),
      clipAt('m1', 'music', 9, 2),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: -118 }]);
    expect(clipOf(api, 'm1').start).toBeCloseTo(6.0004, 9);
    expect(statusText(view)).not.toBe(MOVE_BLOCKED_TEXT);
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('CM14 an end on the end of a same-lane clip is not a candidate', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 4),
      clipAt('m2', 'music', 12, 0.5),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 256 }]);
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(statusText(view)).toBe(
      'Move clip: start 00:08.000, length 00:04.000, source offset 00:00.000.',
    );
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('CM15 a cross-lane move applies the lane rule to the target lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('st1', 'stems', 10, 0.5),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 256, y: STEMS_LANE_Y }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
    expect(statusText(view)).toBe('Move to track — სტემები: start 00:08.000.');
  });

  it('CT7 a right trim ignores the end of the next clip on its lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('m2', 'music', 9.6, 0.1),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 15 }]);
    expect(clipEnd(api, 'm1')).toBe(9.6);
    expect(statusText(view)).not.toBe(TRIM_END_BLOCKED);
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
  });

  it('CT8 a right trim stops exactly on a sub-millisecond clip start', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('m2', 'music', 9.6004, 1),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 16 }]);
    expect(exactClipEnd(api, 'm1')).toBeCloseTo(9.6004, 9);
    expect(statusText(view)).not.toBe(TRIM_END_BLOCKED);
  });
});

describe('SRW-14 stage 4a exact cross-lane lock (C-R53-01, D-29z19)', () => {
  it('CM16 a cross-lane move locks its start onto a sub-millisecond clip end of the target lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('st0', 'stems', 0, 6.0004),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 162, y: STEMS_LANE_Y }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBeCloseTo(6.0004, 9);
    expect(clipOf(api, 'm1').start).toBeGreaterThanOrEqual(exactClipEnd(api, 'st0') - 1e-9);
    expect(statusText(view)).not.toBe(MOVE_BLOCKED_TEXT);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
    expect(statusText(view)).toBe('Move to track — სტემები: start 00:06.000.');
  });

  it('CT9 a right trim stops exactly on a sub-millisecond clip start of another lane', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 7, 2.3),
      clipAt('s1', 'sfx', 9.6004, 1),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 16 }]);
    expect(exactClipEnd(api, 'm1')).toBeCloseTo(9.6004, 9);
    expect(statusText(view)).not.toBe(TRIM_END_BLOCKED);
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
  });
});

describe('SRW-14 Shift time lock keeps a sub-millisecond start (C-R54-01, C-R54-02, D-29z20)', () => {
  it('CM9c a Shift cross-lane move keeps a sub-millisecond start next to a touching clip', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 6.0004, 2),
      clipAt('st0', 'stems', 0, 6.0004),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
    expect(clipOf(api, 'm1').start).toBeGreaterThanOrEqual(exactClipEnd(api, 'st0') - 1e-9);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
    expect(statusText(view)).toBe('Move to track — სტემები: start 00:06.000.');
  });

  it('CM9d a Shift cross-lane move keeps a sub-millisecond start on an empty lane', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 6.0004, 2)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
  });

  it('CM9e a Shift move on the same lane changes nothing and writes no history', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 6.0004, 2)]);
    pressG();
    const undoBefore = live(api).undoLabel;
    expect(undoBefore).toBeNull();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 40, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(statusText(view)).toBe(
      `${MOVE_LABEL}: nothing changed — the Undo history is unchanged.`,
    );
  });

  it('CM9f Shift on the last step of a same-lane move keeps the exact start and writes no history', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 6.0004, 2)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 250, [{ dx: 40 }, { dx: 40, shiftKey: true }]);
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(
      `${MOVE_LABEL}: nothing changed — the Undo history is unchanged.`,
    );
  });

  it('CM9g Shift on the last step of a cross-lane move keeps the exact start', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([clipAt('m1', 'music', 6.0004, 2)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 250, [
      { dx: 40, y: STEMS_LANE_Y },
      { dx: 40, y: STEMS_LANE_Y, shiftKey: true },
    ]);
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
    expect(live(api).undoLabel).toBe('Move to track — სტემები');
    expect(statusText(view)).toBe('Move to track — სტემები: start 00:06.000.');
  });

  it('CM9h the Shift ghost sits at the exact start next to a touching clip', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 6.0004, 2),
      clipAt('st0', 'stems', 0, 6.0004),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 250, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }], {
      release: false,
    });
    const ghosts = [
      ...view.container.querySelectorAll<HTMLElement>(
        '[data-testid="arrangement-lane-move-ghost"]',
      ),
    ];
    expect(ghosts).toHaveLength(1);
    expect(ghosts[0].closest('[data-track-id]')?.getAttribute('data-track-id')).toBe('stems');
    expect(ghosts[0].dataset.blocked).toBe('false');
    expect(ghosts[0].style.left).toBe('240.016px');
    expect(ghosts[0].dataset.ghostStart).toBe('6.000');
    fireEvent.pointerUp(parts.root, {
      pointerId: 1,
      clientX: 290,
      clientY: STEMS_LANE_Y,
      shiftKey: true,
    });
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(6.0004);
  });
});

describe('SRW-14 stage 4c group move snaps the anchor to edges of other clips (D-29z27)', () => {
  type EdgeClipParts = Awaited<ReturnType<typeof mountEdgeWorkspace>>['clipParts'];

  const selectGroupPair = (
    api: EdgeApiRef,
    clipParts: EdgeClipParts,
    otherId: string,
    otherY: number,
  ) => {
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
  };

  it('CG1 a group move lands the anchor start on a clip end of another lane', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('st1', 'stems', 5, 3.4),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.4, 9);
    expect(clipOf(api, 's2').start).toBeCloseTo(8.4, 9);
    expect(live(api).undoLabel).toBe('Move (2)');
  });

  it('CG2 the edges of other group members are not targets', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 6.4, 1),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 174 }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBe(6);
    expect(clipOf(api, 's2').start).toBe(10.4);
  });

  it('CG3 a group move touches a sub-millisecond clip end exactly', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('st0', 'stems', 0, 6.0004),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 162 }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBeCloseTo(6.0004, 9);
    expect(clipOf(api, 's2').start).toBeCloseTo(6.0004, 9);
    expect(clipOf(api, 'm1').start).toBeGreaterThanOrEqual(exactClipEnd(api, 'st0') - 1e-9);
  });

  it('CG4 an edge that would push a member into its neighbour falls back to the grid', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('s3', 'sfx', 9.3, 0.7),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBe(7);
    expect(clipOf(api, 's2').start).toBe(7);
    expect(clipOf(api, 's3').start).toBe(9.3);
    expect(live(api).undoLabel).toBe('Move (2)');
  });

  it('CG5 a cross-lane group move applies the lane rule to the anchor target lane', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 4),
      clipAt('st2', 'stems', 0, 1),
      clipAt('st9', 'stems', 12, 0.5),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 'st2', STEMS_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 256, y: STEMS_LANE_Y }], { pointerId: 3 });
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(clipOf(api, 'st2').trackId).toBe('sfx');
    expect(clipOf(api, 'st2').start).toBe(6);
    expect(live(api).undoLabel).toBe('Move (2)');
  });

  it('CG6 Alt with Snap on keeps a group move free of grid and edges', async () => {
    const { api, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254, altKey: true }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBe(8.35);
    expect(clipOf(api, 's2').start).toBe(8.35);
  });

  it('CG7 an unreachable edge does not report a completed group move as stopped (C-R62-01)', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('s3', 'sfx', 10.2, 0.8),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254 }], { pointerId: 3, release: false });
    expect(statusText(view)).not.toBe(GROUP_MOVE_BLOCKED_MESSAGE);
    fireEvent.pointerUp(parts.root, { pointerId: 3, clientX: 294, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(clipOf(api, 's2').start).toBe(8);
    expect(clipOf(api, 's3').start).toBe(10.2);
    expect(live(api).undoLabel).toBe('Move (2)');
    expect(statusText(view)).toBe('Move (2): 2 clips moved 00:06.000 to the right.');
  });

  it('CG8 a placement-lane clip start captures the anchor end in a cross-lane group move', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('st2', 'stems', 0, 1),
      clipAt('st9', 'stems', 10.4, 1),
    ]);
    pressG();
    selectGroupPair(api, clipParts, 'st2', STEMS_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254, y: STEMS_LANE_Y }], { pointerId: 3 });
    expect(clipOf(api, 'm1').trackId).toBe('stems');
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.4, 9);
    expect(clipOf(api, 'st2').trackId).toBe('sfx');
    expect(clipOf(api, 'st2').start).toBeCloseTo(6.4, 9);
    expect(clipOf(api, 'st9').trackId).toBe('stems');
    expect(clipOf(api, 'st9').start).toBe(10.4);
    expect(live(api).undoLabel).toBe('Move (2)');
    expect(statusText(view)).toBe('Move (2): start 00:08.400.');
  });

  it('CG9 Alt with Snap off enables grid and edges for a group', async () => {
    const { api, view, clipParts } = await mountEdgeWorkspace([
      clipAt('m1', 'music', 2, 2),
      clipAt('s2', 'sfx', 2, 2),
      clipAt('st1', 'stems', 10.4, 1.6),
    ]);
    expect(snapState(view)).toBe('off');
    selectGroupPair(api, clipParts, 's2', SFX_LANE_Y);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, [{ dx: 254, altKey: true }], { pointerId: 3 });
    expect(clipOf(api, 'm1').start).toBeCloseTo(8.4, 9);
    expect(clipOf(api, 's2').start).toBeCloseTo(8.4, 9);
    expect(snapState(view)).toBe('off');
    expect(live(api).undoLabel).toBe('Move (2)');
  });
});
