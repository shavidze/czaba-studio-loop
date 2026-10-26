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
import type { Arrangement, ArrangementMarker, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };
const sourceCounter = { created: 0 };

function fakeNow(): number {
  return Date.now() / 1000 - fakeClock.base;
}

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
    return fakeNow();
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
    sourceCounter.created += 1;
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

const markerCollection: WorkspaceCollection = {
  id: 'markers',
  label: 'markers',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'markers', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 6000, numberOfChannels: 1, sampleRate: 100 }),
};

const PROJECT_END = 50;

function markerArrangement(markers?: ArrangementMarker[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  const arrangement: Arrangement = {
    ...base,
    clips: [
      {
        id: 'm1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: PROJECT_END,
      },
    ],
  };
  return markers ? { ...arrangement, markers } : arrangement;
}
interface MarkerApiRef {
  current: ArrangementContextValue | null;
}

function MarkerProbe({ api }: { api: MarkerApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MarkerApiRef): ArrangementContextValue {
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

async function mountMarkerWorkspace(initial: Arrangement = markerArrangement()) {
  const api: MarkerApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={markerCollection} initialArrangement={initial}>
      <StudioWorkspace />
      <MarkerProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  return { api, view };
}

type MarkerView = ReturnType<typeof render>;

const MOVE_MARKERS: ArrangementMarker[] = [
  { id: 'k5', time: 5, name: 'Intro' },
  { id: 'k12', time: 12, name: 'Drop' },
];

const MARKER_AT_START_STATUS = 'The marker is at the start of the timeline.';

function markerFlags(view: MarkerView): HTMLElement[] {
  return view.queryAllByTestId('arrangement-marker');
}

function markerTimes(view: MarkerView): string[] {
  return markerFlags(view).map((flag) => flag.dataset.markerTime ?? '');
}

function flagById(view: MarkerView, id: string): HTMLElement {
  const flag = markerFlags(view).find((entry) => entry.dataset.markerId === id);
  if (!flag) {
    throw new Error(`no marker ${id}`);
  }
  return flag;
}

function statusText(view: MarkerView): string {
  return view.getByTestId('arrangement-status').textContent ?? '';
}

function stubPointerCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

function pxPerSecondOf(view: MarkerView): number {
  const flag = flagById(view, 'k12');
  return Number.parseFloat(flag.style.left) / 12;
}

function setGridOneSecond(view: MarkerView, snap: boolean) {
  fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value: '1' } });
  const control = view.getByTestId('arrangement-grid-control');
  expect(control.dataset.gridSeconds).toBe('1');
  if ((control.dataset.snap === 'on') !== snap) {
    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
  }
  expect(control.dataset.snap).toBe(snap ? 'on' : 'off');
}

interface DragOptions {
  pointerId: number;
  altKey?: boolean;
  release?: boolean;
}

function pressFlag(flag: HTMLElement, pointerId: number, clientX = 100) {
  stubPointerCapture(flag);
  fireEvent.pointerDown(flag, { button: 0, buttons: 1, pointerId, clientX, clientY: 30 });
}

function dragFlag(flag: HTMLElement, steps: readonly number[], options: DragOptions) {
  const { pointerId, altKey = false, release = true } = options;
  pressFlag(flag, pointerId);
  for (const dx of steps) {
    fireEvent.pointerMove(flag, { buttons: 1, pointerId, clientX: 100 + dx, clientY: 30, altKey });
  }
  if (release) {
    const last = steps.at(-1) ?? 0;
    fireEvent.pointerUp(flag, { button: 0, buttons: 0, pointerId, clientX: 100 + last, altKey });
    fireEvent.click(flag);
  }
}

function markerMenu(view: MarkerView): HTMLElement | null {
  return view.queryByTestId('arrangement-marker-menu');
}

function menuItems(view: MarkerView): HTMLElement[] {
  const menu = markerMenu(view);
  if (!menu) {
    throw new Error('marker menu not open');
  }
  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

function menuItem(view: MarkerView, action: 'rename' | 'play' | 'delete'): HTMLElement {
  const item = menuItems(view).find((entry) => entry.dataset.markerMenuAction === action);
  if (!item) {
    throw new Error(`menu item ${action} missing`);
  }
  return item;
}

function rightClickFlag(flag: HTMLElement, clientX = 300, clientY = 40): boolean {
  fireEvent.pointerDown(flag, { button: 2, buttons: 2, pointerId: 1, clientX, clientY });
  fireEvent.pointerUp(flag, { button: 2, buttons: 0, pointerId: 1, clientX, clientY });
  return fireEvent.contextMenu(flag, { button: 2, clientX, clientY });
}

function laneBody(view: MarkerView, trackId: string): HTMLElement {
  const body = view.container.querySelector<HTMLElement>(
    `[data-track-id="${trackId}"] [data-grid-seconds]`,
  );
  if (!body) {
    throw new Error(`lane ${trackId} not rendered`);
  }
  return body;
}

async function flushClickSuppression() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  sourceCounter.created = 0;
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('marker drag (SRW-16 stage 2a)', { timeout: 15000 }, () => {
  it('MV1: with Snap on (1 s) a drag lands on the grid line as one Move Marker entry; Undo and Redo', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    setGridOneSecond(view, true);
    const pps = pxPerSecondOf(view);
    dragFlag(flagById(view, 'k5'), [pps, 2.4 * pps], { pointerId: 11 });
    expect(markerTimes(view)).toEqual(['7.000', '12.000']);
    expect(live(api).undoLabel).toBe('Move Marker');
    expect(statusText(view)).toBe('Marker “Intro” moved to 00:07.000.');
    expect(flagById(view, 'k5').getAttribute('aria-current')).toBe('true');
    act(() => live(api).undo());
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).redo());
    expect(markerTimes(view)).toEqual(['7.000', '12.000']);
    expect(live(api).arrangement.markers?.[0]).toEqual({ id: 'k5', time: 7, name: 'Intro' });
  });

  it('MV2: Snap off gives a free ms time; Alt inverts Snap in both directions', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    setGridOneSecond(view, false);
    const pps = pxPerSecondOf(view);
    dragFlag(flagById(view, 'k5'), [2.425 * pps], { pointerId: 12 });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('7.425');
    dragFlag(flagById(view, 'k5'), [0.4 * pps], { pointerId: 13, altKey: true });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('8.000');
    setGridOneSecond(view, true);
    dragFlag(flagById(view, 'k5'), [-1.375 * pps], { pointerId: 14, altKey: true });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('6.625');
    dragFlag(flagById(view, 'k5'), [-1.375 * pps], { pointerId: 15 });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('5.000');
    expect(live(api).undoLabel).toBe('Move Marker');
  });

  it('MV3: movement under the threshold is a click: the playhead jumps and nothing is recorded', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    act(() => live(api).seekTo(1));
    dragFlag(flagById(view, 'k5'), [2], { pointerId: 16 });
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(live(api).getLivePosition()).toBe(5);
    expect(live(api).undoLabel).toBeNull();
  });

  it('MV4: the click and double-click that follow a drag neither seek nor play; a later click jumps again', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    act(() => live(api).seekTo(1));
    const pps = pxPerSecondOf(view);
    const flag = flagById(view, 'k5');
    dragFlag(flag, [2 * pps], { pointerId: 17 });
    fireEvent.doubleClick(flag);
    expect(flag.dataset.markerTime).toBe('7.000');
    expect(live(api).getLivePosition()).toBe(1);
    expect(live(api).isPlaying).toBe(false);
    await flushClickSuppression();
    fireEvent.click(flag);
    expect(live(api).getLivePosition()).toBe(7);
  });

  it('MV5: a drag onto another marker keeps the last valid time; passing it re-sorts', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    setGridOneSecond(view, true);
    const pps = pxPerSecondOf(view);
    const flag = flagById(view, 'k5');
    dragFlag(flag, [5 * pps, 7 * pps], { pointerId: 18, release: false });
    expect(markerTimes(view).sort()).toEqual(['10.000', '12.000']);
    fireEvent.pointerUp(flag, { button: 0, buttons: 0, pointerId: 18, clientX: 100 + 7 * pps });
    expect(markerTimes(view)).toEqual(['10.000', '12.000']);
    expect(live(api).arrangement.markers?.filter((marker) => marker.time === 12)).toHaveLength(1);
    act(() => live(api).undo());
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    await flushClickSuppression();
    dragFlag(flagById(view, 'k5'), [8 * pps], { pointerId: 19 });
    expect(markerTimes(view)).toEqual(['12.000', '13.000']);
    expect(markerFlags(view).map((entry) => entry.dataset.markerId)).toEqual(['k12', 'k5']);
    expect(live(api).arrangement.markers?.map((marker) => marker.id)).toEqual(['k12', 'k5']);
  });

  it('MV8: a press focuses and selects the pressed flag even when another flag had focus', async () => {
    const { view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const intro = flagById(view, 'k5');
    intro.focus();
    const drop = flagById(view, 'k12');
    pressFlag(drop, 20);
    expect(document.activeElement).toBe(drop);
    expect(drop.getAttribute('aria-current')).toBe('true');
    expect(intro.getAttribute('aria-current')).toBeNull();
    fireEvent.pointerUp(drop, { button: 0, buttons: 0, pointerId: 20, clientX: 100 });
  });
});

describe('marker arrows (SRW-16 stage 2a)', { timeout: 15000 }, () => {
  it('MV6: arrows step to grid lines with Snap on and 0.1 s with Snap off, refuse at 0 and on collisions, keep focus, never move the clip', async () => {
    const { api, view } = await mountMarkerWorkspace(
      markerArrangement([
        { id: 'k0', time: 0, name: 'Start' },
        { id: 'k5', time: 5.4, name: 'Intro' },
        { id: 'k12', time: 12, name: 'Drop' },
      ]),
    );
    act(() => live(api).selectClip('m1'));
    setGridOneSecond(view, true);
    const intro = flagById(view, 'k5');
    intro.focus();
    fireEvent.keyDown(intro, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('6.000');
    fireEvent.keyDown(document.activeElement ?? intro, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('5.000');
    expect(document.activeElement).toBe(flagById(view, 'k5'));
    expect(flagById(view, 'k5').getAttribute('aria-current')).toBe('true');
    expect(live(api).undoLabel).toBe('Move Marker');
    setGridOneSecond(view, false);
    flagById(view, 'k5').focus();
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(flagById(view, 'k5').dataset.markerTime).toBe('5.100');
    expect(document.activeElement).toBe(flagById(view, 'k5'));
    expect(live(api).arrangement.clips[0].start).toBe(0);
    act(() => live(api).undo());
    act(() => live(api).undo());
    act(() => live(api).undo());
    expect(flagById(view, 'k5').dataset.markerTime).toBe('5.400');
    expect(live(api).undoLabel).toBeNull();

    const start = flagById(view, 'k0');
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(start.dataset.markerTime).toBe('0.000');
    expect(statusText(view)).toBe(MARKER_AT_START_STATUS);
    setGridOneSecond(view, true);
    fireEvent.keyDown(start, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(statusText(view)).toBe(MARKER_AT_START_STATUS);
    expect(live(api).undoLabel).toBeNull();

    flagById(view, 'k5').focus();
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(markerTimes(view)).toEqual(['0.000', '7.000', '12.000']);
    for (let step = 0; step < 4; step += 1) {
      fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    }
    expect(markerTimes(view)).toEqual(['0.000', '11.000', '12.000']);
    const undoBefore = live(api).undoLabel;
    const pastMarkers = live(api).arrangement.markers;
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(statusText(view)).toBe('A marker already exists at this time: “Drop”');
    expect(live(api).arrangement.markers).toBe(pastMarkers);
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(live(api).arrangement.clips[0].start).toBe(0);
    expect(live(api).selectedClipIds).toEqual(['m1']);
  });

  it('MV7: Ctrl+Right on a focused flag still navigates to the next marker and moves nothing', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const intro = flagById(view, 'k5');
    fireEvent.click(intro);
    intro.focus();
    fireEvent.keyDown(intro, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true });
    expect(live(api).getLivePosition()).toBe(12);
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(live(api).undoLabel).toBeNull();
  });
});

describe('marker context menu (SRW-16 stage 2a)', { timeout: 15000 }, () => {
  it('MV9: right-click opens the menu with three items in order and targets the right-clicked marker', async () => {
    const { view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const intro = flagById(view, 'k5');
    intro.focus();
    const drop = flagById(view, 'k12');
    expect(rightClickFlag(drop, 300, 40)).toBe(false);
    expect(menuItems(view).map((item) => item.textContent)).toEqual([
      'Rename (F2)',
      'Play from here',
      'Delete (Delete)',
    ]);
    expect(markerMenu(view)?.getAttribute('role')).toBe('menu');
    expect(markerMenu(view)?.style.left).toBe('300px');
    expect(markerMenu(view)?.style.top).toBe('40px');
    expect(drop.getAttribute('aria-current')).toBe('true');
    expect(intro.getAttribute('aria-current')).toBeNull();
    expect(document.activeElement).toBe(menuItem(view, 'rename'));
    expect(flagById(view, 'k12').getAttribute('aria-keyshortcuts')).toBe(
      'F2 Delete ArrowLeft ArrowRight Shift+F10',
    );
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape', code: 'Escape' });
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(drop);
    rightClickFlag(drop, window.innerWidth + 500, window.innerHeight + 500);
    expect(markerMenu(view)?.style.left).toBe(`${window.innerWidth - 4}px`);
    expect(markerMenu(view)?.style.top).toBe(`${window.innerHeight - 4}px`);
  });

  it('MV10: Rename, Play from here (stopped and playing) and Delete act through the menu', async () => {
    const { api, view } = await mountMarkerWorkspace(
      markerArrangement([...MOVE_MARKERS, { id: 'k30', time: 30, name: 'Outro' }]),
    );
    flagById(view, 'k5').focus();
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'rename'));
    expect(markerMenu(view)).toBeNull();
    const input = view.getByTestId('arrangement-marker-name-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('name input missing');
    }
    expect(input.value).toBe('Drop');
    fireEvent.change(input, { target: { value: 'Chorus' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(live(api).undoLabel).toBe('Rename Marker');
    expect(live(api).arrangement.markers?.find((marker) => marker.id === 'k12')?.name).toBe(
      'Chorus',
    );
    expect(document.activeElement).toBe(flagById(view, 'k12'));

    act(() => live(api).seekTo(1));
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'play'));
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(12);
    expect(live(api).getLivePosition()).toBeLessThan(12.5);
    expect(document.activeElement).toBe(flagById(view, 'k12'));
    rightClickFlag(flagById(view, 'k30'));
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(menuItem(view, 'play'), { key: 'Enter', code: 'Enter' });
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(30);
    expect(live(api).getLivePosition()).toBeLessThan(30.5);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);

    flagById(view, 'k5').focus();
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'delete'));
    expect(markerTimes(view)).toEqual(['5.000', '30.000']);
    expect(live(api).undoLabel).toBe('Delete Marker');
    expect(document.activeElement).toBe(flagById(view, 'k30'));
    act(() => live(api).undo());
    expect(markerTimes(view)).toEqual(['5.000', '12.000', '30.000']);
  });

  it('MV11: Shift+F10 and the ContextMenu key open it; arrows wrap, Home/End, Escape and Tab close; an outside press closes without acting', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const drop = flagById(view, 'k12');
    act(() => live(api).seekTo(3));
    Object.defineProperty(drop, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(333, 57, 40, 20),
    });
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F10', code: 'F10', shiftKey: true });
    expect(markerMenu(view)).not.toBeNull();
    expect(markerMenu(view)?.style.left).toBe('333px');
    expect(markerMenu(view)?.style.top).toBe('77px');
    expect(drop.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.contextMenu(drop, { button: 0, clientX: 0, clientY: 0 });
    expect(view.queryAllByTestId('arrangement-marker-menu')).toHaveLength(1);
    expect(document.activeElement).toBe(menuItem(view, 'play'));
    fireEvent.keyDown(menuItem(view, 'play'), { key: 'Home', code: 'Home' });
    expect(document.activeElement).toBe(menuItem(view, 'rename'));
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'ArrowUp', code: 'ArrowUp' });
    expect(document.activeElement).toBe(menuItem(view, 'delete'));
    fireEvent.keyDown(menuItem(view, 'delete'), { key: 'ArrowDown', code: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItem(view, 'rename'));
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'End', code: 'End' });
    expect(document.activeElement).toBe(menuItem(view, 'delete'));
    fireEvent.keyDown(menuItem(view, 'delete'), { key: 'Home', code: 'Home' });
    expect(document.activeElement).toBe(menuItem(view, 'rename'));
    expect(live(api).getLivePosition()).toBe(3);
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'Escape', code: 'Escape' });
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(drop);

    fireEvent.keyDown(drop, { key: 'ContextMenu', code: 'ContextMenu' });
    expect(markerMenu(view)).not.toBeNull();
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'Tab', code: 'Tab' });
    expect(markerMenu(view)).toBeNull();
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);

    act(() => live(api).seekTo(1));
    rightClickFlag(drop);
    const intro = flagById(view, 'k5');
    stubPointerCapture(intro);
    fireEvent.pointerDown(intro, { button: 0, buttons: 1, pointerId: 31, clientX: 100 });
    fireEvent.pointerMove(intro, { buttons: 1, pointerId: 31, clientX: 400 });
    fireEvent.pointerUp(intro, { button: 0, buttons: 0, pointerId: 31, clientX: 400 });
    fireEvent.click(intro);
    expect(markerMenu(view)).toBeNull();
    expect(live(api).getLivePosition()).toBe(1);
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(intro.getAttribute('aria-current')).toBeNull();
    expect(live(api).undoLabel).toBeNull();
  });

  it('MV11b: only one CZABA menu is open at a time (lane grid menu vs marker menu)', async () => {
    const { view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const lane = laneBody(view, 'music');
    fireEvent.pointerDown(lane, {
      button: 2,
      buttons: 2,
      pointerId: 41,
      clientX: 300,
      clientY: 200,
    });
    fireEvent.contextMenu(lane, { button: 2, clientX: 300, clientY: 200 });
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    rightClickFlag(flagById(view, 'k12'));
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(0);
    expect(view.queryAllByTestId('arrangement-marker-menu')).toHaveLength(1);
    fireEvent.pointerDown(lane, {
      button: 2,
      buttons: 2,
      pointerId: 42,
      clientX: 300,
      clientY: 200,
    });
    fireEvent.contextMenu(lane, { button: 2, clientX: 300, clientY: 200 });
    expect(view.queryAllByTestId('arrangement-marker-menu')).toHaveLength(0);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
  });

  it('MV12: during another pointer gesture menu actions, a drag and arrows are refused', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const pps = pxPerSecondOf(view);
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(4, () => undefined);
    });
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'delete'));
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'rename'));
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    rightClickFlag(flagById(view, 'k12'));
    fireEvent.click(menuItem(view, 'play'));
    expect(live(api).isPlaying).toBe(false);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    dragFlag(flagById(view, 'k5'), [3 * pps], { pointerId: 9 });
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).undoLabel).toBeNull();
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
    fireEvent.keyDown(flagById(view, 'k5'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(api).undoLabel).toBe('Move Marker');
  });
});

describe('marker moves during playback (SRW-16 stage 2a)', { timeout: 15000 }, () => {
  it('MV13: a drag and arrow moves while playing create no buffer sources and playback keeps advancing', async () => {
    vi.useFakeTimers();
    fakeClock.base = Date.now() / 1000;
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const pps = pxPerSecondOf(view);
    act(() => live(api).seekTo(2));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const created = sourceCounter.created;
    expect(created).toBeGreaterThan(0);
    const startPosition = live(api).getLivePosition();
    dragFlag(flagById(view, 'k12'), [2 * pps], { pointerId: 51 });
    fireEvent.keyDown(flagById(view, 'k12'), { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(api).undoLabel).toBe('Move Marker');
    expect(flagById(view, 'k12').dataset.markerTime).toBe('14.100');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThan(startPosition);
    expect(sourceCounter.created).toBe(created);
    act(() => live(api).togglePlayback());
  });
});

describe('marker drag abort (SRW-16 stage 2a)', { timeout: 15000 }, () => {
  it('MV14: a window blur mid-drag restores the marker, records nothing, and the following click does not seek', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    act(() => live(api).seekTo(1));
    const pps = pxPerSecondOf(view);
    const flag = flagById(view, 'k5');
    dragFlag(flag, [3 * pps], { pointerId: 61, release: false });
    expect(flag.dataset.markerTime).toBe('8.000');
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    fireEvent.pointerUp(flag, { button: 0, buttons: 0, pointerId: 61, clientX: 100 + 3 * pps });
    fireEvent.click(flag);
    expect(live(api).getLivePosition()).toBe(1);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(false);
    await flushClickSuppression();
    dragFlag(flagById(view, 'k5'), [2 * pps], { pointerId: 62 });
    expect(markerTimes(view)).toEqual(['7.000', '12.000']);
    expect(live(api).undoLabel).toBe('Move Marker');
  });
});

describe('marker menu vs timeline scroll and zoom (C-R74-02)', { timeout: 15000 }, () => {
  it('MV15: a vertical-only scroll keeps the menu; a horizontal scroll closes it and returns focus to the flag', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    const intro = flagById(view, 'k5');
    intro.focus();
    scroller.scrollLeft = 40;
    fireEvent.scroll(scroller);
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(intro);

    act(() => live(api).selectClip('m1'));
    act(() => live(api).seekTo(3));
    const drop = flagById(view, 'k12');
    rightClickFlag(drop);
    expect(markerMenu(view)).not.toBeNull();
    const selectionBefore = live(api).selectedClipIds;
    const undoBefore = live(api).undoLabel;
    scroller.scrollTop = 60;
    fireEvent.scroll(scroller);
    expect(markerMenu(view)).not.toBeNull();
    scroller.scrollLeft = 340;
    expect(scroller.scrollLeft).toBe(340);
    fireEvent.scroll(scroller);
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(flagById(view, 'k12'));
    expect(scroller.scrollLeft).toBe(340);
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(live(api).getLivePosition()).toBe(3);
    expect(live(api).selectedClipIds).toEqual(selectionBefore);
    expect(live(api).undoLabel).toBe(undoBefore);

    rightClickFlag(flagById(view, 'k12'));
    fireEvent.keyDown(menuItem(view, 'rename'), { key: 'Escape', code: 'Escape' });
    expect(markerMenu(view)).toBeNull();
    intro.focus();
    scroller.scrollLeft = 120;
    fireEvent.scroll(scroller);
    expect(document.activeElement).toBe(intro);
  });

  it('MV16: playing with Follow on, a scroll within the follow tolerance keeps the menu; a user scroll beyond it closes it', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('on');
    const anchor = scroller.scrollLeft;
    rightClickFlag(flagById(view, 'k12'));
    expect(markerMenu(view)).not.toBeNull();
    scroller.scrollLeft = anchor + 1;
    expect(scroller.scrollLeft).toBe(anchor + 1);
    fireEvent.scroll(scroller);
    expect(markerMenu(view)).not.toBeNull();
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('on');
    scroller.scrollLeft = anchor + 200;
    fireEvent.scroll(scroller);
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(flagById(view, 'k12'));
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('paused');
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).togglePlayback());
  });

  it('MV17: a Ctrl+wheel zoom closes the menu and returns focus to the flag without a seek', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(MOVE_MARKERS));
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    act(() => live(api).seekTo(2));
    const ppsBefore = pxPerSecondOf(view);
    const drop = flagById(view, 'k12');
    rightClickFlag(drop);
    expect(markerMenu(view)).not.toBeNull();
    fireEvent.wheel(scroller, { ctrlKey: true, deltaY: -100, clientX: 400, clientY: 200 });
    expect(pxPerSecondOf(view)).not.toBe(ppsBefore);
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(flagById(view, 'k12'));
    expect(live(api).getLivePosition()).toBe(2);
    expect(markerTimes(view)).toEqual(['5.000', '12.000']);
    expect(live(api).undoLabel).toBeNull();

    const intro = flagById(view, 'k5');
    intro.focus();
    fireEvent.wheel(scroller, { ctrlKey: true, deltaY: 100, clientX: 400, clientY: 200 });
    expect(markerMenu(view)).toBeNull();
    expect(document.activeElement).toBe(intro);
  });
});
