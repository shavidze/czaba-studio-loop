import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  WorkspaceCollection,
} from '~/types/arrangement';
import { formatGridDivision, GRID_DIVISIONS_SECONDS } from '../grid';
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
const MENU_LABEL = 'Grid division';
const SNAP_ITEM_LABEL = 'Snap (G)';
const SNAP_ON_STATUS = 'Snap on — grid 1 s (G)';
const SNAP_OFF_STATUS = 'Snap off — free movement (G)';
const LOOP_FIXTURE: ArrangementLoop = { start: 12.3, end: 14.1, enabled: true };

const menuCollection: WorkspaceCollection = {
  id: 'grid-menu',
  label: 'grid-menu',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid-menu', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid-menu', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const DEFAULT_CLIPS: ArrangementClip[] = [
  { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 2 },
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 12.5, sourceOffset: 0, duration: 2 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4.3, sourceOffset: 0, duration: 1 },
];

function menuArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: DEFAULT_CLIPS, loop: LOOP_FIXTURE };
}

interface MenuApiRef {
  current: ArrangementContextValue | null;
}

function MenuProbe({ api }: { api: MenuApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MenuApiRef): ArrangementContextValue {
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

async function mountMenuWorkspace() {
  const api: MenuApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={menuCollection} initialArrangement={menuArrangement()}>
      <StudioWorkspace />
      <MenuProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
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
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
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
  const brace = () => {
    const element = view.getByTestId('arrangement-loop-brace');
    stubCapture(element);
    return element;
  };
  return { api, view, clipParts, laneBody, brace };
}

function clipOf(api: MenuApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function loopOf(api: MenuApiRef): ArrangementLoop {
  const loop = live(api).arrangement.loop;
  if (!loop) {
    throw new Error('loop missing');
  }
  return loop;
}

function gridMenu(view: ReturnType<typeof render>): HTMLElement | null {
  return view.queryByTestId('arrangement-grid-menu');
}

function openMenu(view: ReturnType<typeof render>): HTMLElement {
  const menu = gridMenu(view);
  if (!menu) {
    throw new Error('grid menu not open');
  }
  return menu;
}

function fixedGridRadios(menu: HTMLElement): HTMLElement[] {
  return within(within(menu).getByRole('group', { name: 'Fixed grid' })).getAllByRole(
    'menuitemradio',
  );
}

function menuItem(view: ReturnType<typeof render>, name: string): HTMLElement {
  return within(openMenu(view)).getByRole(
    name === SNAP_ITEM_LABEL ? 'menuitemcheckbox' : 'menuitemradio',
    { name },
  );
}

function focusedElement(): HTMLElement {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) {
    throw new Error('no focused element');
  }
  return element;
}

function pressFocused(key: string, extra: Partial<KeyboardEventInit> = {}) {
  const code = key === ' ' ? 'Space' : key.length === 1 ? `Key${key.toUpperCase()}` : key;
  return fireEvent.keyDown(focusedElement(), { key, code, ...extra });
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function gridControl(view: ReturnType<typeof render>): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function laneTimelines(view: ReturnType<typeof render>): HTMLElement[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-track-id] [data-grid-lines]'),
  );
}

function rightClick(target: HTMLElement, clientX = 300, clientY = 200): boolean {
  fireEvent.pointerDown(target, { button: 2, buttons: 2, pointerId: 9, clientX, clientY });
  return fireEvent.contextMenu(target, { button: 2, clientX, clientY });
}

const press = { button: 0, buttons: 1 };

function clickClipHeader(parts: { root: HTMLElement; header: HTMLElement }, pointerId: number) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.click(parts.header, { clientX: 100, clientY: MUSIC_LANE_Y });
}

function dragClip(parts: { root: HTMLElement; header: HTMLElement }, dx: number, pointerId = 1) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.pointerMove(parts.root, { pointerId, clientX: 100 + dx, clientY: MUSIC_LANE_Y });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100 + dx, clientY: MUSIC_LANE_Y });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function editSnapshot(api: MenuApiRef) {
  const current = live(api);
  return {
    arrangement: current.arrangement,
    clips: current.arrangement.clips.map(({ id, start, trackId, duration }) => ({
      id,
      start,
      trackId,
      duration,
    })),
    selectedClipIds: current.selectedClipIds,
    position: current.getLivePosition(),
    range: current.range,
    activeTrackId: current.activeTrackId,
    loop: current.arrangement.loop,
    undoLabel: current.undoLabel,
  };
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
  cleanup();
  fireEvent.pointerDown(window);
  expect(fireEvent.click(document.body)).toBe(true);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SRW-14 stage 4b-1 lane grid menu (D-29z22-M)', { timeout: 15_000 }, () => {
  it('GM1 a right-click on an empty audio lane opens the grid menu at the pointer', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    expect(gridMenu(view)).toBeNull();
    const notPrevented = fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 });
    expect(notPrevented).toBe(false);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    const menu = openMenu(view);
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.getAttribute('aria-label')).toBe(MENU_LABEL);
    const radios = fixedGridRadios(menu);
    expect(radios).toHaveLength(GRID_DIVISIONS_SECONDS.length);
    GRID_DIVISIONS_SECONDS.forEach((step, index) => {
      expect(radios[index]).toBe(
        within(menu).getByRole('menuitemradio', { name: formatGridDivision(step) }),
      );
      expect(radios[index].getAttribute('aria-checked')).toBe('false');
    });
    expect(menuItem(view, 'Medium').getAttribute('aria-checked')).toBe('true');
    const snapItems = within(menu).getAllByRole('menuitemcheckbox');
    expect(snapItems).toHaveLength(1);
    expect(snapItems[0]).toBe(menuItem(view, SNAP_ITEM_LABEL));
    expect(snapItems[0].getAttribute('aria-checked')).toBe('false');
    expect(menu.style.left).toBe('300px');
    expect(menu.style.top).toBe('200px');
  });

  it('GM2 a right-click on another clip body opens the menu and edits nothing', async () => {
    const { api, view, clipParts } = await mountMenuWorkspace();
    act(() => live(api).selectClip('s1'));
    const before = editSnapshot(api);
    expect(before.selectedClipIds).toEqual(['s1']);
    const notPrevented = rightClick(clipParts('m1').root, 320, MUSIC_LANE_Y);
    expect(notPrevented).toBe(false);
    expect(gridMenu(view)).not.toBeNull();
    const after = editSnapshot(api);
    expect(after.arrangement).toBe(before.arrangement);
    expect(after).toEqual(before);
    expect(view.queryByTestId('arrangement-marquee')).toBeNull();
  });

  it('GM3 the video lane opens the same single menu on its empty area and its clip body', async () => {
    const { view, laneBody, clipParts } = await mountMenuWorkspace();
    expect(rightClick(laneBody('video'), 500, 40)).toBe(false);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    const first = openMenu(view);
    const focusedItem = focusedElement();
    expect(first.contains(focusedItem)).toBe(true);
    expect(
      fireEvent.contextMenu(clipParts('v1').root, { button: 2, clientX: 30, clientY: 60 }),
    ).toBe(false);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    expect(openMenu(view)).toBe(first);
    expect(first.style.left).toBe('30px');
    expect(first.style.top).toBe('60px');
    expect(focusedElement()).toBe(focusedItem);
    pressFocused('Escape');
    expect(gridMenu(view)).toBeNull();
    expect(rightClick(clipParts('v1').root, 30, 40)).toBe(false);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    expect(openMenu(view).style.left).toBe('30px');
  });

  it('GM4 choosing 0.25 s drives the shared grid state without history', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    pressG();
    expect(gridControl(view).dataset.snap).toBe('on');
    const before = live(api).arrangement;
    rightClick(laneBody('music'));
    fireEvent.click(menuItem(view, '0.25 s'));
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('0.25');
    for (const body of laneTimelines(view)) {
      expect(body.dataset.gridSeconds).toBe('0.25');
    }
    const select = view.getByTestId('arrangement-grid-division');
    expect(select instanceof HTMLSelectElement ? select.value : null).toBe('0.25');
    expect(statusText(view)).toBe('Grid: 0.25 s (Snap on)');
    expect(live(api).undoLabel).toBeNull();
    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    expect(gridControl(view).dataset.gridSeconds).toBe('0.25');
    expect(live(api).arrangement).toBe(before);
    expect(live(api).arrangement).toEqual(before);
  });

  it('GM5 a division chosen in the menu snaps the next clip drag', async () => {
    const { api, view, laneBody, clipParts } = await mountMenuWorkspace();
    pressG();
    rightClick(laneBody('sfx'));
    fireEvent.click(menuItem(view, '0.25 s'));
    dragClip(clipParts('m1'), 13);
    const start = clipOf(api, 'm1').start;
    expect(start).toBe(7.25);
    expect(Number.isInteger(start / 0.25)).toBe(true);
  });

  it('GM6 the Snap item toggles Snap with the G status text and reflects it on reopen', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    expect(gridControl(view).dataset.snap).toBe('off');
    rightClick(laneBody('music'));
    expect(menuItem(view, SNAP_ITEM_LABEL).getAttribute('aria-checked')).toBe('false');
    fireEvent.click(menuItem(view, SNAP_ITEM_LABEL));
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(statusText(view)).toBe(SNAP_ON_STATUS);
    rightClick(laneBody('music'));
    expect(menuItem(view, SNAP_ITEM_LABEL).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(menuItem(view, SNAP_ITEM_LABEL));
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(statusText(view)).toBe(SNAP_OFF_STATUS);
  });

  it('GM7 keyboard: focus on the checked item, wrap, Home/End, Enter and Space choose', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    const checked = menuItem(view, 'Medium');
    expect(focusedElement()).toBe(checked);
    expect(checked.tabIndex).toBe(0);
    for (let step = 0; step < 13; step++) {
      pressFocused('ArrowDown');
    }
    expect(focusedElement()).toBe(checked);
    pressFocused('Home');
    expect(focusedElement()).toBe(menuItem(view, 'Widest'));
    pressFocused('ArrowUp');
    expect(focusedElement()).toBe(menuItem(view, SNAP_ITEM_LABEL));
    pressFocused('Home');
    pressFocused('End');
    expect(focusedElement()).toBe(menuItem(view, SNAP_ITEM_LABEL));
    pressFocused('Home');
    for (let step = 0; step < 9; step++) {
      pressFocused('ArrowDown');
    }
    expect(focusedElement()).toBe(menuItem(view, '0.5 s'));
    expect(pressFocused('Enter')).toBe(false);
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('0.5');
    rightClick(laneBody('music'));
    expect(focusedElement()).toBe(menuItem(view, '0.5 s'));
    pressFocused('ArrowUp');
    pressFocused('ArrowUp');
    expect(focusedElement()).toBe(menuItem(view, '2 s'));
    expect(live(api).isPlaying).toBe(false);
    pressFocused(' ');
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('2');
    expect(live(api).isPlaying).toBe(false);
  });

  it('GM8 Escape closes the menu without a change and keeps the floating video expanded', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    fireEvent.click(view.getByTestId('arrangement-video-expand'));
    const box = view.getByTestId('arrangement-video-box');
    expect(box.dataset.videoExpanded).toBe('true');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    pressFocused('Escape');
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
    expect(view.getByTestId('arrangement-video-box').dataset.videoExpanded).toBe('true');
  });

  it('GM9 workspace shortcuts do not run while focus is in the menu', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    act(() => live(api).selectClip('s1'));
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 's1').start).toBeCloseTo(4.4, 9);
    const before = editSnapshot(api);
    expect(before.undoLabel).not.toBeNull();
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    pressFocused('g');
    pressFocused('Delete');
    pressFocused('Backspace');
    pressFocused('z', { ctrlKey: true });
    pressFocused('ArrowRight');
    pressFocused('ArrowLeft');
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(live(api).arrangement).toBe(before.arrangement);
    expect(editSnapshot(api).clips).toEqual(before.clips);
    expect(live(api).undoLabel).toBe(before.undoLabel);
    expect(gridMenu(view)).not.toBeNull();
  });

  it('GM10 the press that dismisses the menu does nothing else; the next press works', async () => {
    const { api, view, laneBody, clipParts } = await mountMenuWorkspace();
    rightClick(laneBody('sfx'), 300, 250);
    expect(gridMenu(view)).not.toBeNull();
    const parts = clipParts('m1');
    fireEvent.pointerDown(parts.header, { ...press, pointerId: 3, clientX: 100, clientY: 150 });
    fireEvent.pointerUp(parts.root, { pointerId: 3, clientX: 100, clientY: 150 });
    expect(gridMenu(view)).toBeNull();
    expect(live(api).selectedClipIds).not.toContain('m1');
    expect(clipOf(api, 'm1').start).toBe(7);
    fireEvent.pointerDown(parts.header, { ...press, pointerId: 4, clientX: 100, clientY: 150 });
    fireEvent.pointerUp(parts.root, { pointerId: 4, clientX: 100, clientY: 150 });
    expect(live(api).selectedClipIds).toEqual(['m1']);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('GM11 Escape returns focus to the element that had it before the menu opened', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    act(() => snapButton.focus());
    expect(focusedElement()).toBe(snapButton);
    fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 });
    expect(focusedElement()).not.toBe(snapButton);
    expect(openMenu(view).contains(focusedElement())).toBe(true);
    pressFocused('Escape');
    expect(gridMenu(view)).toBeNull();
    expect(focusedElement()).toBe(snapButton);
  });

  it('GM12 a right-click during a left clip drag opens no menu and leaves the drag intact', async () => {
    const { api, view, laneBody, clipParts } = await mountMenuWorkspace();
    dragClip(clipParts('m1'), 37);
    const controlStart = clipOf(api, 'm1').start;
    act(() => live(api).undo());
    expect(clipOf(api, 'm1').start).toBe(7);
    const parts = clipParts('m1');
    fireEvent.pointerDown(parts.header, { ...press, pointerId: 2, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(parts.root, { pointerId: 2, clientX: 137, clientY: 150 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(fireEvent.contextMenu(laneBody('music'), { clientX: 137, clientY: 150 })).toBe(false);
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerUp(parts.root, { pointerId: 2, clientX: 137, clientY: 150 });
    expect(clipOf(api, 'm1').start).toBe(controlStart);
    expect(controlStart).toBe(7.925);
  });

  it('GM13 scrolling the timeline, resizing or leaving the window closes the menu', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    fireEvent.scroll(view.getByTestId('arrangement-timeline-scroller'));
    expect(gridMenu(view)).toBeNull();
    rightClick(laneBody('music'));
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(gridMenu(view)).toBeNull();
    rightClick(laneBody('music'));
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM14 headers, ruler, loop strip and library keep the native context menu', async () => {
    const { view } = await mountMenuWorkspace();
    const targets = [
      view.getAllByTestId('arrangement-track-header')[0],
      view.getByTestId('arrangement-ruler'),
      view.getByTestId('arrangement-loop-strip'),
      view.getAllByTestId('arrangement-library-option-title')[0],
    ];
    for (const target of targets) {
      expect(fireEvent.contextMenu(target, { clientX: 50, clientY: 50 })).toBe(true);
      expect(gridMenu(view)).toBeNull();
    }
  });

  it('GM15 choosing a division while playing keeps playback running', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    rightClick(laneBody('music'));
    fireEvent.click(menuItem(view, '0.5 s'));
    expect(gridMenu(view)).toBeNull();
    expect(live(api).isPlaying).toBe(true);
    const before = live(api).getLivePosition();
    fakeClock.base -= 0.5;
    expect(live(api).getLivePosition()).toBeGreaterThan(before);
    expect(live(api).isPlaying).toBe(true);
  });

  it('GM16 the dismissing press also swallows its click on the Snap toggle and on Play', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(snapButton, { ...press, pointerId: 11 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerUp(snapButton, { pointerId: 11 });
    expect(fireEvent.click(snapButton)).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('off');
    fireEvent.pointerDown(snapButton, { ...press, pointerId: 12 });
    fireEvent.pointerUp(snapButton, { pointerId: 12 });
    fireEvent.click(snapButton);
    expect(gridControl(view).dataset.snap).toBe('on');
    const play = view.getByRole('button', { name: 'Play' });
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(play, { ...press, pointerId: 13 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerUp(play, { pointerId: 13 });
    expect(fireEvent.click(play)).toBe(false);
    expect(live(api).isPlaying).toBe(false);
    fireEvent.pointerDown(play, { ...press, pointerId: 14 });
    fireEvent.pointerUp(play, { pointerId: 14 });
    fireEvent.click(play);
    expect(live(api).isPlaying).toBe(true);
  });

  it('GM17 a dismiss with no click releases the swallow on pointerup or on the next press', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    const before = editSnapshot(api);
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 15, clientX: 300, clientY: 250 });
    fireEvent.pointerUp(laneBody('sfx'), { pointerId: 15, clientX: 300, clientY: 250 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(gridMenu(view)).toBeNull();
    fireEvent.click(snapButton);
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(editSnapshot(api)).toEqual(before);
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    const second = editSnapshot(api);
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 16, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerDown(snapButton, { ...press, pointerId: 17 });
    fireEvent.click(snapButton);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(editSnapshot(api)).toEqual(second);
  });

  it('GM18 C-R57-01 choosing a division returns focus to the element focused before the menu', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    act(() => snapButton.focus());
    expect(focusedElement()).toBe(snapButton);
    fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 });
    expect(openMenu(view).contains(focusedElement())).toBe(true);
    fireEvent.click(menuItem(view, '0.5 s'));
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('0.5');
    expect(document.activeElement).toBe(snapButton);
  });

  it('GM19 C-R57-02 a reposition keeps the original focus origin for Escape', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    act(() => snapButton.focus());
    expect(focusedElement()).toBe(snapButton);
    fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 });
    const first = openMenu(view);
    expect(first.contains(focusedElement())).toBe(true);
    fireEvent.contextMenu(laneBody('video'), { clientX: 30, clientY: 60 });
    expect(openMenu(view)).toBe(first);
    expect(first.style.left).toBe('30px');
    pressFocused('Escape');
    expect(gridMenu(view)).toBeNull();
    expect(document.activeElement).toBe(snapButton);
  });

  it('GM20 G7 no grid menu opens while the export dialog is open', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    expect(fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 })).toBe(false);
    expect(view.queryByTestId('arrangement-grid-menu')).toBeNull();
  });

  it('GM21 G6 a Follow scroll keeps the menu open; a user scroll while playing closes it', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('on');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    const anchor = scroller.scrollLeft;
    fireEvent.scroll(scroller);
    expect(scroller.scrollLeft).toBe(anchor);
    expect(gridMenu(view)).not.toBeNull();
    scroller.scrollLeft = 200;
    expect(scroller.scrollLeft).toBe(200);
    fireEvent.scroll(scroller);
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM22 C-R58-01 a full press inside the menu chooses the item and arms no swallow', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    const item = menuItem(view, '0.5 s');
    fireEvent.pointerDown(item, { ...press, pointerId: 21 });
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerUp(item, { pointerId: 21 });
    expect(fireEvent.click(item)).toBe(true);
    expect(gridControl(view).dataset.gridSeconds).toBe('0.5');
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerDown(snapButton, { ...press, pointerId: 22 });
    fireEvent.pointerUp(snapButton, { pointerId: 22 });
    fireEvent.click(snapButton);
    expect(gridControl(view).dataset.snap).toBe('on');
  });

  it('GM23 C-R58-02 the press that releases a pending swallow is not cancelled', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    expect(
      fireEvent.pointerDown(laneBody('sfx'), {
        ...press,
        pointerId: 23,
        clientX: 300,
        clientY: 250,
      }),
    ).toBe(false);
    expect(gridMenu(view)).toBeNull();
    expect(fireEvent.pointerDown(snapButton, { ...press, pointerId: 24 })).toBe(true);
    fireEvent.click(snapButton);
    expect(gridControl(view).dataset.snap).toBe('on');
  });

  it('GM24 C-R58-INFO-M with Follow paused a scroll back onto the follow anchor closes the menu', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    const anchor = scroller.scrollLeft;
    scroller.scrollLeft = anchor + 200;
    expect(scroller.scrollLeft).toBe(anchor + 200);
    fireEvent.scroll(scroller);
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('paused');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    scroller.scrollLeft = anchor;
    expect(scroller.scrollLeft).toBe(anchor);
    fireEvent.scroll(scroller);
    expect(gridMenu(view)).toBeNull();
    expect(live(api).isPlaying).toBe(true);
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM25 ROOT-R50-58-L3 a right-click on the open menu is prevented and changes nothing', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    const menu = openMenu(view);
    const left = menu.style.left;
    const top = menu.style.top;
    expect(fireEvent.contextMenu(menuItem(view, '0.5 s'), { button: 2 })).toBe(false);
    expect(fireEvent.contextMenu(menu, { button: 2 })).toBe(false);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    expect(openMenu(view)).toBe(menu);
    expect(menu.style.left).toBe(left);
    expect(menu.style.top).toBe(top);
    expect(menu.contains(focusedElement())).toBe(true);
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM26 ROOT-R50-58-L2 any key after a dismiss with a lost pointerup releases the swallow', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 25, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.keyDown(snapButton, { key: 'Enter', code: 'Enter' });
    expect(live(api).isPlaying).toBe(false);
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('on');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 26, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.keyDown(document.body, { key: 'Shift', code: 'ShiftLeft', shiftKey: true });
    expect(live(api).isPlaying).toBe(false);
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(live(api).isPlaying).toBe(false);
  });

  it('GM27 ROOT-R50-58-L2 a window blur after a dismiss with a lost pointerup releases the swallow', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 27, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.blur(window);
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('on');
  });

  it('GM28 a pointercancel on the dismissing press releases the swallow after one task', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 28, clientX: 300, clientY: 250 });
    fireEvent.pointerCancel(laneBody('sfx'), { pointerId: 28, clientX: 300, clientY: 250 });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(gridMenu(view)).toBeNull();
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('on');
  });

  it('GM29 a right-button dismiss keeps the native context menu and releases on its pointerup', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(snapButton, { button: 2, buttons: 2, pointerId: 32 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.pointerUp(snapButton, { button: 2, pointerId: 32 });
    expect(fireEvent.contextMenu(snapButton, { button: 2 })).toBe(true);
    expect(gridMenu(view)).toBeNull();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('on');
  });

  it('GM30 Tab in the open menu is not prevented and closes it without a change', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    const focused = focusedElement();
    expect(focused).toBe(menuItem(view, 'Medium'));
    expect(fireEvent.keyDown(focused, { key: 'Tab', code: 'Tab' })).toBe(true);
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM31 unmounting with the menu open leaves no window listener behind', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    view.unmount();
    expect(fireEvent.pointerDown(document.body, { ...press, pointerId: 31 })).toBe(true);
    expect(fireEvent.click(document.body)).toBe(true);
  });

  it('GM32 C-R60-01 a press on the menu padding or divider keeps focus; an item press is not prevented', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    rightClick(laneBody('music'));
    const menu = openMenu(view);
    const left = menu.style.left;
    const top = menu.style.top;
    const divider = menu.querySelector('hr');
    if (!divider) {
      throw new Error('menu divider not rendered');
    }
    expect(fireEvent.mouseDown(menu, { button: 0 })).toBe(false);
    expect(fireEvent.mouseDown(menu, { button: 2 })).toBe(false);
    expect(fireEvent.mouseDown(divider, { button: 0 })).toBe(false);
    expect(fireEvent.mouseDown(menuItem(view, '0.5 s'), { button: 0 })).toBe(true);
    expect(view.queryAllByTestId('arrangement-grid-menu')).toHaveLength(1);
    expect(openMenu(view)).toBe(menu);
    expect(menu.style.left).toBe(left);
    expect(menu.style.top).toBe(top);
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
    pressFocused('Escape');
    expect(gridMenu(view)).toBeNull();
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM33 C-R60-02 an auto-repeat key keeps the swallow armed; a fresh key releases it', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    const shift = { key: 'Shift', code: 'ShiftLeft', shiftKey: true };
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 33, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.keyDown(document.body, { ...shift, repeat: true });
    expect(live(api).isPlaying).toBe(false);
    expect(fireEvent.click(snapButton)).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(live(api).isPlaying).toBe(false);
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 34, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    fireEvent.keyDown(document.body, shift);
    expect(fireEvent.click(snapButton)).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(live(api).isPlaying).toBe(false);
  });

  it('GM34 ROOT-R50-58-L1 a vertical scroll during Follow playback closes the menu', async () => {
    const { api, view, laneBody } = await mountMenuWorkspace();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const follow = view.getByTestId('arrangement-follow');
    expect(follow.dataset.followMode).toBe('on');
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    const anchor = scroller.scrollLeft;
    scroller.scrollTop = 120;
    expect(scroller.scrollTop).toBe(120);
    fireEvent.scroll(scroller);
    expect(follow.dataset.followMode).toBe('on');
    rightClick(laneBody('music'));
    expect(gridMenu(view)).not.toBeNull();
    fireEvent.scroll(scroller);
    expect(gridMenu(view)).not.toBeNull();
    scroller.scrollTop = 240;
    expect(scroller.scrollTop).toBe(240);
    fireEvent.scroll(scroller);
    expect(gridMenu(view)).toBeNull();
    expect(live(api).isPlaying).toBe(true);
    expect(view.getByTestId('arrangement-follow').dataset.followMode).toBe('on');
    expect(scroller.scrollLeft).toBe(anchor);
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
  });

  it('GM35 the blur release ignores the menu item blur caused by the focus return', async () => {
    const { view, laneBody } = await mountMenuWorkspace();
    const snapButton = view.getByTestId('arrangement-snap-toggle');
    act(() => snapButton.focus());
    expect(focusedElement()).toBe(snapButton);
    fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 });
    expect(openMenu(view).contains(focusedElement())).toBe(true);
    fireEvent.pointerDown(laneBody('sfx'), { ...press, pointerId: 35, clientX: 300, clientY: 250 });
    expect(gridMenu(view)).toBeNull();
    expect(document.activeElement).toBe(snapButton);
    fireEvent.pointerUp(laneBody('sfx'), { pointerId: 35, clientX: 300, clientY: 250 });
    expect(fireEvent.click(snapButton)).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('off');
  });
});

describe(
  'C-R51-02 keyboard ownership after a timeline press (D-29z22-F)',
  {
    timeout: 15_000,
  },
  () => {
    it('FR1 a clip header click releases the focused brace so ArrowRight nudges the clip', async () => {
      const { api, clipParts, brace } = await mountMenuWorkspace();
      act(() => live(api).selectClip('s1'));
      const element = brace();
      act(() => element.focus());
      expect(focusedElement()).toBe(element);
      clickClipHeader(clipParts('s1'), 5);
      expect(element.contains(document.activeElement)).toBe(false);
      pressFocused('ArrowRight');
      expect(clipOf(api, 's1').start).toBeCloseTo(4.4, 9);
      expect(loopOf(api)).toEqual(LOOP_FIXTURE);
    });

    it('FR2 LK-CLIP order: clip header, then a brace press keeps ArrowRight on the brace', async () => {
      const { api, clipParts, brace } = await mountMenuWorkspace();
      clickClipHeader(clipParts('s1'), 5);
      expect(live(api).selectedClipIds).toEqual(['s1']);
      const element = brace();
      act(() => element.focus());
      expect(focusedElement()).toBe(element);
      fireEvent.pointerDown(element, { ...press, pointerId: 6, clientX: 500, clientY: 30 });
      fireEvent.pointerUp(element, { pointerId: 6, clientX: 500, clientY: 30 });
      expect(focusedElement()).toBe(element);
      pressFocused('ArrowRight');
      expect(loopOf(api).start).toBeCloseTo(12.4, 9);
      expect(loopOf(api).end).toBeCloseTo(14.2, 9);
      expect(clipOf(api, 's1').start).toBe(4.3);
    });

    it('FR3 a right-click on the lane releases the brace and the menu does not restore it', async () => {
      const { api, view, laneBody, brace } = await mountMenuWorkspace();
      act(() => live(api).selectClip('s1'));
      const element = brace();
      act(() => element.focus());
      expect(focusedElement()).toBe(element);
      rightClick(laneBody('sfx'), 600, 250);
      expect(gridMenu(view)).not.toBeNull();
      pressFocused('Escape');
      expect(gridMenu(view)).toBeNull();
      expect(element.contains(document.activeElement)).toBe(false);
      pressFocused('ArrowRight');
      expect(clipOf(api, 's1').start).toBeCloseTo(4.4, 9);
      expect(loopOf(api)).toEqual(LOOP_FIXTURE);
    });

    it('FR4 a press on the brace start edge keeps the brace focused and moving', async () => {
      const { api, view, brace } = await mountMenuWorkspace();
      act(() => live(api).selectClip('s1'));
      const element = brace();
      const edge = view.getByTestId('arrangement-loop-start-edge');
      stubCapture(edge);
      act(() => element.focus());
      expect(focusedElement()).toBe(element);
      fireEvent.pointerDown(edge, {
        button: 2,
        buttons: 2,
        pointerId: 8,
        clientX: 492,
        clientY: 30,
      });
      expect(focusedElement()).toBe(element);
      fireEvent.pointerDown(edge, { ...press, pointerId: 7, clientX: 492, clientY: 30 });
      fireEvent.pointerUp(element, { pointerId: 7, clientX: 492, clientY: 30 });
      expect(focusedElement()).toBe(element);
      pressFocused('ArrowRight');
      expect(loopOf(api).start).toBeCloseTo(12.4, 9);
      expect(clipOf(api, 's1').start).toBe(4.3);
    });
  },
);
