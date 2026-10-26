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
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { resolveSnapStep } from '../grid';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { CLIP_LANE_REFUSAL_MESSAGES, planClipLaneMove } from '../selection';

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
const TRIM_START_TITLE = 'Trim — left edge';
const TRIM_END_TITLE = 'Trim — right edge';
const TRIM_START_BLOCKED =
  'Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).';
const TRIM_END_BLOCKED =
  'Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).';
const BEFORE_START_TEXT =
  'Part of the group would go before the start of the timeline (0) — the track does not change.';
const OUT_OF_RANGE_TEXT = 'There is no track for part of the group — only the time changes.';
const OVERLAP_TEXT = 'No room here';

const editCollection: WorkspaceCollection = {
  id: 'edit',
  label: 'edit',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'edit', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'edit', kind: 'sfx', origin: 'demo' },
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

function editArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface EditApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function EditProbe({ api }: { api: EditApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: EditApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: EditApiRef): number {
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

async function mountEditWorkspace(clips: ArrangementClip[]) {
  const api: EditApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider collection={editCollection} initialArrangement={editArrangement(clips)}>
      <StudioWorkspace />
      <EditProbe api={api} />
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

function clipOf(api: EditApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function clipEnd(api: EditApiRef, clipId: string): number {
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

function undoAll(api: EditApiRef): number {
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

describe('SRW-14 stage 2 resolveSnapStep', () => {
  it('SE1 resolves the snap step from Snap state, division and Alt', () => {
    expect(resolveSnapStep(1, 1, false)).toBe(1);
    expect(resolveSnapStep(0.25, 1, false)).toBe(0.25);
    expect(resolveSnapStep(1, 1, true)).toBeNull();
    expect(resolveSnapStep(null, 1, false)).toBeNull();
    expect(resolveSnapStep(null, 0.25, true)).toBe(0.25);
    expect(resolveSnapStep(null, undefined, true)).toBeNull();
  });
});

describe('SRW-14 stage 2 trim edges on the grid', () => {
  it('SE2 Snap off keeps a free right trim of exactly +0.375 s', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 3)]);
    expect(view.getByTestId('arrangement-zoom-readout').textContent).toBe('40 px/s');
    expect(live(api).sourceDurations.get('song')).toBe(40);
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 118, [{ dx: 15 }]);
    expect(clipEnd(api, 'm1')).toBe(10.375);
    expect(clipOf(api, 'm1').start).toBe(7);
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
  });

  it('SE3 Snap on 1 s puts a right trim on the next line with one Undo entry', async () => {
    const { api, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 2.3)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 90, [{ dx: 15 }]);
    expect(clipEnd(api, 'm1')).toBe(10);
    expect(clipOf(api, 'm1').start).toBe(7);
    expect(parts.root.dataset.clipStart).toBe('7.000');
    expect(live(api).undoLabel).toBe(TRIM_END_TITLE);
    expect(undoAll(api)).toBe(1);
    expect(clipEnd(api, 'm1')).toBe(9.3);
  });

  it('SE4 Snap on 1 s puts a left trim on 7 and lowers the source offset by 0.3', async () => {
    const { api, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7.3, 4, 0.6)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -10 }]);
    const trimmed = clipOf(api, 'm1');
    expect(trimmed.start).toBe(7);
    expect(trimmed.sourceOffset).toBeCloseTo(0.3, 9);
    expect(clipEnd(api, 'm1')).toBe(11.3);
    expect(live(api).undoLabel).toBe(TRIM_START_TITLE);
    expect(undoAll(api)).toBe(1);
  });

  it('SE5 a snapped left trim past the source start stops at the off-grid source start', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([
      clipAt('m1', 'music', 7.3, 4, 0.25),
    ]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -40 }], { release: false });
    expect(statusText(view)).toBe(TRIM_START_BLOCKED);
    expect(clipOf(api, 'm1').start).toBeCloseTo(7.05, 9);
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: -38, clientY: MUSIC_LANE_Y });
    expect(parts.root.dataset.clipStart).toBe('7.050');
    expect(clipOf(api, 'm1').sourceOffset).toBeCloseTo(0, 9);
    expect(live(api).undoLabel).toBe(TRIM_START_TITLE);
  });

  it('SE6 a 0.25 s snapped right trim below the minimum length stops at 0.05 s', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 0.2)]);
    chooseDivision(view, '0.25');
    dragFrom(clipParts('m1').trimEnd, clipParts('m1').root, 7, [{ dx: -5 }]);
    expect(clipEnd(api, 'm1')).toBe(7.075);
    expect(undoAll(api)).toBe(1);
    expect(clipEnd(api, 'm1')).toBe(7.2);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimEnd, parts.root, 7, [{ dx: -5 }], { release: false, pointerId: 2 });
    expect(statusText(view)).toBe(TRIM_END_BLOCKED);
    fireEvent.pointerUp(parts.root, { pointerId: 2, clientX: 2, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').duration).toBeCloseTo(0.05, 9);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('SE20 a snapped left trim whose line lies past an off-grid source start stops at that start', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7.7, 3, 0.1)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.trimStart, parts.root, 2, [{ dx: -10 }], { release: false });
    expect(clipOf(api, 'm1').start).toBeCloseTo(7.6, 9);
    expect(statusText(view)).toBe(TRIM_START_BLOCKED);
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: -8, clientY: MUSIC_LANE_Y });
    expect(parts.root.dataset.clipStart).toBe('7.600');
  });
});

describe('SRW-14 stage 2 clip-body time range on the grid', () => {
  it('SE7 Snap on 1 s snaps both range ends inside the clip', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, clipParts } = await mountEditWorkspace([music]);
    pressG();
    const parts = clipParts('m1');
    const from = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, from, [{ dx: xAt(music, 9.6) - from }]);
    expect(live(api).range).toEqual({ start: 7, end: 10, trackId: 'music' });
    expect(live(api).undoLabel).toBeNull();
  });

  it('SE8 a snapped range past the clip end is clamped to the clip end', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, clipParts } = await mountEditWorkspace([music]);
    pressG();
    const parts = clipParts('m1');
    const from = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, from, [{ dx: xAt(music, 24.3) - from }]);
    expect(live(api).range).toEqual({ start: 7, end: 23, trackId: 'music' });
  });

  it('SE9 a range whose ends snap onto one line is no range', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, view, clipParts } = await mountEditWorkspace([music]);
    pressG();
    const parts = clipParts('m1');
    const from = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, from, [{ dx: xAt(music, 9.6) - from }, { dx: 6 }], {
      release: false,
    });
    expect(live(api).range).toBeNull();
    expect(view.container.querySelector('[data-range-start]')).toBeNull();
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: from + 6, clientY: MUSIC_LANE_Y });
    expect(live(api).range).toBeNull();
  });

  it('SE10 a click in the body with Snap on 1 s seeks to the nearest line', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, clipParts } = await mountEditWorkspace([music]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.body, parts.root, xAt(music, 7.3), []);
    expect(live(api).range).toBeNull();
    expect(positionOf(api)).toBe(7);
  });

  it('SE10b Alt on the pointerup of a body click keeps the free time', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, clipParts } = await mountEditWorkspace([music]);
    pressG();
    const parts = clipParts('m1');
    const x = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, x, [], { release: false });
    fireEvent.pointerUp(parts.root, {
      pointerId: 1,
      clientX: x,
      clientY: MUSIC_LANE_Y,
      altKey: true,
    });
    expect(live(api).range).toBeNull();
    expect(positionOf(api)).toBeCloseTo(7.3, 9);
  });
});

describe('SRW-14 stage 2 Alt bypass and temporary enable', () => {
  it('SE11 Alt bypasses Snap on a move', async () => {
    const { api, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 4)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 100, [{ dx: 37, altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(7.925);
    expect(live(api).undoLabel).toBe('Move clip');
  });

  it('SE12 Alt enables the current division while Snap is off and leaves Snap off', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 4)]);
    expect(snapState(view)).toBe('off');
    dragFrom(clipParts('m1').header, clipParts('m1').root, 100, [{ dx: 37, altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(8);
    dragFrom(clipParts('m1').header, clipParts('m1').root, 100, [{ dx: 15 }], { pointerId: 2 });
    expect(clipOf(api, 'm1').start).toBe(8.375);
    expect(snapState(view)).toBe('off');
    expect(undoAll(api)).toBe(2);
  });

  it('SE12b Alt with Snap off uses the chosen 0.25 s division', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 4)]);
    chooseDivision(view, '0.25');
    dragFrom(clipParts('m1').header, clipParts('m1').root, 100, [{ dx: 13, altKey: true }]);
    expect(clipOf(api, 'm1').start).toBe(7.25);
    expect(snapState(view)).toBe('off');
  });

  it('SE13 Alt frees a trim with Snap on and snaps a range with Snap off', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const first = await mountEditWorkspace([clipAt('m1', 'music', 7, 2.3)]);
    pressG();
    const trimParts = first.clipParts('m1');
    dragFrom(trimParts.trimEnd, trimParts.root, 90, [{ dx: 15, altKey: true }]);
    expect(clipEnd(first.api, 'm1')).toBe(9.675);
    first.view.unmount();
    const second = await mountEditWorkspace([music]);
    expect(snapState(second.view)).toBe('off');
    const parts = second.clipParts('m1');
    const from = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, from, [{ dx: xAt(music, 9.6) - from, altKey: true }]);
    expect(live(second.api).range).toEqual({ start: 7, end: 10, trackId: 'music' });
  });

  it('SE14 Alt pressed mid-drag frees the final position; one Undo entry', async () => {
    const { api, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 4)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 100, [{ dx: 20 }, { dx: 37, altKey: true }], {
      release: false,
    });
    expect(clipOf(api, 'm1').start).toBe(7.925);
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 137, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(7.925);
    expect(live(api).undoLabel).toBe('Move clip');
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('SE14b Alt released mid-drag snaps again on the next move', async () => {
    const { api, clipParts } = await mountEditWorkspace([clipAt('m1', 'music', 7, 4)]);
    pressG();
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 100, [{ dx: 37, altKey: true }, { dx: 37 }]);
    expect(clipOf(api, 'm1').start).toBe(8);
  });

  it('SE15 Shift time lock wins over Alt on a cross-lane move with Snap off', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([
      clipAt('m1', 'music', 7, 4),
      clipAt('s1', 'sfx', 4.3, 1),
    ]);
    expect(snapState(view)).toBe('off');
    const parts = clipParts('s1');
    dragFrom(
      parts.header,
      parts.root,
      100,
      [{ dx: 30, y: MUSIC_LANE_Y, altKey: true, shiftKey: true }],
      { startY: SFX_LANE_Y },
    );
    expect(clipOf(api, 's1').trackId).toBe('music');
    expect(clipOf(api, 's1').start).toBe(4.3);
  });
});

describe('SRW-14 stage 2 group lane refusal before time 0', () => {
  const groupClips = () => [clipAt('m1', 'music', 7, 16), clipAt('st1', 'stems', 0.4, 2)];

  it('SE16 planClipLaneMove refuses a member before 0 as before-start and a missing lane as out-of-range', () => {
    const arrangement = editArrangement(groupClips());
    const before = planClipLaneMove(arrangement, {
      clipIds: ['m1', 'st1'],
      anchorClipId: 'm1',
      targetTrackId: 'stems',
      timeDelta: -7.3,
    });
    expect(before.refusal).toBe('before-start');
    expect(before.arrangement).toBeNull();
    const missing = planClipLaneMove(arrangement, {
      clipIds: ['m1', 'st1'],
      anchorClipId: 'm1',
      targetTrackId: 'sfx',
      timeDelta: -0.5,
    });
    expect(missing.refusal).toBe('out-of-range');
    const missingInTime = planClipLaneMove(arrangement, {
      clipIds: ['m1', 'st1'],
      anchorClipId: 'm1',
      targetTrackId: 'sfx',
      timeDelta: 0,
    });
    expect(missingInTime.refusal).toBe('out-of-range');
    expect(CLIP_LANE_REFUSAL_MESSAGES['before-start']).toBe(BEFORE_START_TEXT);
    expect(CLIP_LANE_REFUSAL_MESSAGES['out-of-range']).toBe(OUT_OF_RANGE_TEXT);
    expect(CLIP_LANE_REFUSAL_MESSAGES.overlap).toBe(OVERLAP_TEXT);
  });

  async function groupDragBeforeZero(snapOn: boolean) {
    const mounted = await mountEditWorkspace(groupClips());
    act(() => live(mounted.api).selectClip('st1'));
    act(() => live(mounted.api).toggleClipSelection('m1', 'toggle'));
    if (snapOn) {
      pressG();
    }
    const parts = mounted.clipParts('m1');
    dragFrom(parts.header, parts.root, 400, [{ dx: -292, y: STEMS_LANE_Y }], { release: false });
    const statusDuringMove = statusText(mounted.view);
    const ghostsDuringMove = mounted.view.container.querySelectorAll('[data-ghost-start]').length;
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 108, clientY: STEMS_LANE_Y });
    return { ...mounted, statusDuringMove, ghostsDuringMove };
  }

  it('SE17 Snap off: before-start text, no lane ghosts, time-only commit', async () => {
    const { api, statusDuringMove, ghostsDuringMove } = await groupDragBeforeZero(false);
    expect(statusDuringMove).toBe(BEFORE_START_TEXT);
    expect(ghostsDuringMove).toBe(0);
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 'm1').start).toBeCloseTo(6.6, 9);
    expect(clipOf(api, 'st1').trackId).toBe('stems');
    expect(clipOf(api, 'st1').start).toBeCloseTo(0, 9);
    expect(live(api).undoLabel).toBe('Move (2)');
    expect(undoAll(api)).toBe(1);
  });

  it('SE17b Snap on: before-start text, no lane ghosts, nothing changes and no history', async () => {
    const { api, statusDuringMove, ghostsDuringMove } = await groupDragBeforeZero(true);
    expect(statusDuringMove).toBe(BEFORE_START_TEXT);
    expect(ghostsDuringMove).toBe(0);
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 'm1').start).toBe(7);
    expect(clipOf(api, 'st1').start).toBe(0.4);
    expect(live(api).undoLabel).toBeNull();
  });

  it('SE18 a group onto an occupied lane still shows blocked ghosts and the overlap text', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([
      ...groupClips(),
      clipAt('x1', 'sfx', 0, 3),
    ]);
    act(() => live(api).selectClip('st1'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 400, [{ dx: 4, y: STEMS_LANE_Y }], { release: false });
    expect(statusText(view)).toBe(OVERLAP_TEXT);
    const ghosts = view.container.querySelectorAll<HTMLElement>('[data-ghost-start]');
    expect(ghosts.length).toBeGreaterThan(0);
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 404, clientY: STEMS_LANE_Y });
    expect(clipOf(api, 'st1').trackId).toBe('stems');
  });

  it('SE21 a group whose bottom member has no lane below shows no ghosts and moves in time only', async () => {
    const { api, view, clipParts } = await mountEditWorkspace([
      clipAt('m1', 'music', 7, 16),
      clipAt('s1', 'sfx', 2, 1),
    ]);
    act(() => live(api).selectClip('s1'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    expect(snapState(view)).toBe('off');
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 400, [{ dx: 6, y: STEMS_LANE_Y }], { release: false });
    expect(statusText(view)).toBe(OUT_OF_RANGE_TEXT);
    expect(view.container.querySelectorAll('[data-ghost-start]').length).toBe(0);
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 406, clientY: STEMS_LANE_Y });
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 's1').trackId).toBe('sfx');
    expect(clipOf(api, 'm1').start).toBeCloseTo(7.15, 9);
    expect(clipOf(api, 's1').start).toBeCloseTo(2.15, 9);
    expect(live(api).undoLabel).toBe('Move (2)');
    expect(undoAll(api)).toBe(1);
  });
});

describe('SRW-14 stage 2 all-tracks range overlay', () => {
  it('SE19 the all-tracks range overlay uses bg-foreground/30', async () => {
    const music = clipAt('m1', 'music', 7, 16);
    const { api, view, clipParts } = await mountEditWorkspace([music]);
    const parts = clipParts('m1');
    const from = xAt(music, 7.3);
    dragFrom(parts.body, parts.root, from, [{ dx: xAt(music, 9.6) - from }]);
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    expect(live(api).range?.allTracks).toBe(true);
    const overlays = view.getAllByTestId('arrangement-lane-range');
    expect(overlays.length).toBeGreaterThan(0);
    for (const overlay of overlays) {
      expect(overlay.className).toContain('bg-foreground/30');
      expect(overlay.className).not.toContain('bg-foreground/60');
    }
  });
});
