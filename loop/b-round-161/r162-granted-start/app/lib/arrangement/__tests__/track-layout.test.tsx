import { act, fireEvent, render } from '@testing-library/react';
import { Profiler, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementDetailPanel } from '~/components/arrangement/ArrangementDetailPanel';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
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

const resizeCallbacks = new Set<() => void>();

class ControlledResizeObserver {
  private readonly callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe() {
    resizeCallbacks.add(this.callback);
  }
  disconnect() {
    resizeCallbacks.delete(this.callback);
  }
}

const layoutFrame = { column: 0, chrome: 44, timeline: 368 };

function stubTimelineFrame(column: number) {
  layoutFrame.column = column;
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.testid !== 'arrangement-timeline-scroller') {
      return 0;
    }
    const panel = this.nextElementSibling;
    const panelHeight =
      panel instanceof HTMLElement ? Number.parseFloat(panel.style.height) || 0 : 0;
    return layoutFrame.column - panelHeight;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.dataset.testid === 'arrangement-detail-panel') {
      return Number.parseFloat(this.style.height) || 0;
    }
    const parent = this.parentElement;
    if (parent?.dataset.testid === 'arrangement-timeline-scroller') {
      return layoutFrame.timeline;
    }
    if (parent?.parentElement?.dataset.testid === 'arrangement-timeline-scroller') {
      return parent.firstElementChild === this ? layoutFrame.chrome : 0;
    }
    return 0;
  });
}

function fireTimelineResize(column: number) {
  layoutFrame.column = column;
  act(() => {
    for (const callback of resizeCallbacks) {
      callback();
    }
  });
}

const layoutCollection: WorkspaceCollection = {
  id: 'layout',
  label: 'layout',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'layout', kind: 'music', origin: 'demo' },
    { id: 'stem', title: 'Stem', collectionLabel: 'layout', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'layout', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function layoutArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 8 },
      { id: 'stem-1', trackId: 'stems', sourceId: 'stem', start: 12, sourceOffset: 0, duration: 4 },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 12, sourceOffset: 0, duration: 2 },
    ],
  };
}

interface LayoutApiRef {
  current: ArrangementContextValue | null;
}

function LayoutProbe({ api }: { api: LayoutApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: LayoutApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountTrackLayout(onWorkspaceCommit: () => void = () => undefined) {
  const api: LayoutApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={layoutCollection} initialArrangement={layoutArrangement()}>
      <Profiler id="studio-workspace" onRender={onWorkspaceCommit}>
        <StudioWorkspace />
      </Profiler>
      <LayoutProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const row = (trackId: string) => {
    const element = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
    if (!element) {
      throw new Error(`row ${trackId} missing`);
    }
    return element;
  };
  const part = (trackId: string, testId: string) => {
    const element = row(trackId).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`${testId} missing on ${trackId}`);
    }
    return element;
  };
  return {
    api,
    view,
    row,
    rowHeight: (trackId: string) => Number.parseFloat(row(trackId).style.height),
    fold: (trackId: string) => part(trackId, 'arrangement-track-fold'),
    handle: (trackId: string) => part(trackId, 'arrangement-track-height'),
    header: (trackId: string) => part(trackId, 'arrangement-track-header'),
  };
}

function clipRoot(container: HTMLElement, clipId: string): HTMLElement {
  const root = container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
  if (!root) {
    throw new Error(`clip ${clipId} missing`);
  }
  return root;
}

function stubPointerCapture(element: Element) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

const press = { button: 0, buttons: 1 };
const FOLDED_TITLE_LINE = 'The track is folded — unfold it to make a time selection';

describe(
  'track fold, height and lane auto-fit (SRW-11B stage 2, D-29, R11-U)',
  { timeout: 15_000 },
  () => {
    beforeEach(() => {
      fakeClock.base = Date.now() / 1000;
      resizeCallbacks.clear();
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
      vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
      vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

    it('folds a lane to a 36 px row with compact M/S that keep their aria-pressed and click behaviour', async () => {
      stubTimelineFrame(660);
      const { api, view, row, rowHeight, fold } = await mountTrackLayout();
      expect(rowHeight('music')).toBe(81);
      const button = fold('music');
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-label')).toBe('Fold or unfold — მუსიკა');
      expect(button.title).toBe('Fold / unfold');
      expect(button.textContent).toBe('▾');
      fireEvent.click(button);
      expect(rowHeight('music')).toBe(36);
      expect(row('music').dataset.trackFolded).toBe('true');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.textContent).toBe('▸');
      expect(view.queryByRole('slider', { name: 'Volume — მუსიკა' })).toBeNull();
      const mute = view.getByRole('button', { name: 'Mute — მუსიკა' });
      const solo = view.getByRole('button', {
        name: 'Solo — მუსიკა (Ctrl/Cmd+click = add to solo)',
      });
      expect(mute.getAttribute('aria-pressed')).toBe('false');
      fireEvent.click(mute);
      expect(mute.getAttribute('aria-pressed')).toBe('true');
      expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.mute).toBe(true);
      fireEvent.click(solo);
      expect(solo.getAttribute('aria-pressed')).toBe('true');
      expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.solo).toBe(true);
      fireEvent.click(button);
      expect(rowHeight('music')).toBe(81);
      expect(view.getByRole('slider', { name: 'Volume — მუსიკა' })).toBeTruthy();
    });

    it('keeps the video lane picker reachable as a compact ＋ when folded and hides the original-sound line', async () => {
      stubTimelineFrame(660);
      const { view, header, fold } = await mountTrackLayout();
      expect(header('video').textContent).toContain('Original sound');
      expect(view.getByRole('button', { name: '＋ Your own video' }).textContent).toBe(
        '＋ Your own video',
      );
      fireEvent.click(fold('video'));
      expect(header('video').textContent).not.toContain('Original sound');
      const compact = view.getByRole('button', { name: '＋ Your own video' });
      expect(compact.textContent).toBe('＋');
      expect(view.getByTestId('arrangement-video-dropzone')).toBeTruthy();
    });

    it('writes no history for fold, height or auto-fit, and Undo leaves every height alone', async () => {
      stubTimelineFrame(442);
      const { api, view, rowHeight, fold, handle } = await mountTrackLayout();
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      expect(rowHeight('music')).toBe(67);
      fireEvent.click(fold('stems'));
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(live(api).undoLabel).toBeNull();
      act(() => live(api).nudgeSelectedClip(0.5));
      act(() => live(api).selectClip('hit-1'));
      act(() => live(api).nudgeSelectedClip(0.5));
      expect(live(api).undoLabel).not.toBeNull();
      const before = ['video', 'music', 'stems', 'sfx'].map(rowHeight);
      act(() => live(api).undo());
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual(before);
      expect(live(api).undoLabel).toBeNull();
    });

    it('claims the gesture registry while dragging a height handle and restores the start height on pointercancel', async () => {
      stubTimelineFrame(660);
      const { api, view, rowHeight, handle } = await mountTrackLayout();
      const sfxHandle = handle('sfx');
      expect(sfxHandle.getAttribute('role')).toBe('separator');
      expect(sfxHandle.getAttribute('aria-label')).toBe('Height — SFX');
      expect(sfxHandle.getAttribute('aria-valuemin')).toBe('60');
      expect(sfxHandle.getAttribute('aria-valuemax')).toBe('180');
      expect(handle('video').getAttribute('aria-valuemin')).toBe('52');
      fireEvent.pointerDown(sfxHandle, { ...press, pointerId: 1, clientX: 300, clientY: 500 });
      expect(live(api).isPointerGestureActive()).toBe(true);
      fireEvent.pointerMove(window, { pointerId: 1, clientX: 300, clientY: 560 });
      expect(rowHeight('sfx')).toBe(141);
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('140');
      const clipHeader = clipRoot(view.container, 'music-1').firstElementChild;
      if (!(clipHeader instanceof HTMLElement)) {
        throw new Error('clip header missing');
      }
      fireEvent.pointerDown(clipHeader, { ...press, pointerId: 2, clientX: 500, clientY: 200 });
      fireEvent.pointerMove(clipHeader, { pointerId: 2, clientX: 600, clientY: 200 });
      fireEvent.pointerUp(clipHeader, { pointerId: 2, clientX: 600, clientY: 200 });
      expect(live(api).selectedClipIds).toEqual([]);
      expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.start).toBe(2);
      fireEvent.click(view.getByRole('button', { name: 'Mute — მუსიკა' }));
      expect(view.getByTestId('arrangement-status').textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.mute).toBe(false);
      fireEvent.pointerMove(window, { pointerId: 1, clientX: 300, clientY: 900 });
      expect(rowHeight('sfx')).toBe(181);
      fireEvent.pointerCancel(window, { pointerId: 1 });
      expect(rowHeight('sfx')).toBe(81);
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('80');
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireEvent.pointerDown(sfxHandle, { ...press, pointerId: 3, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 3, clientY: 400 });
      expect(rowHeight('sfx')).toBe(61);
      fireEvent.pointerUp(window, { pointerId: 3, clientY: 400 });
      expect(rowHeight('sfx')).toBe(61);
      expect(live(api).isPointerGestureActive()).toBe(false);
      expect(live(api).undoLabel).toBeNull();
    });

    it('ignores a height-handle pointerdown while another gesture is active', async () => {
      stubTimelineFrame(660);
      const { api, rowHeight, handle } = await mountTrackLayout();
      const release = live(api).claimPointerGesture(9, () => undefined);
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 4, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 4, clientY: 560 });
      expect(rowHeight('sfx')).toBe(81);
      release?.();
    });

    it('steps ↓ +8 / ↑ −8 on the focused handle, clamps per kind and never nudges the selected clip', async () => {
      stubTimelineFrame(660);
      const { api, rowHeight, handle, row } = await mountTrackLayout();
      act(() => live(api).selectClip('hit-1'));
      const sfxHandle = handle('sfx');
      sfxHandle.focus();
      fireEvent.keyDown(sfxHandle, { key: 'ArrowDown' });
      expect(rowHeight('sfx')).toBe(89);
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('88');
      expect(row('sfx').className).toContain('motion-safe:transition-[height]');
      for (let i = 0; i < 3; i++) {
        fireEvent.keyDown(sfxHandle, { key: 'ArrowUp' });
      }
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('64');
      fireEvent.keyDown(sfxHandle, { key: 'ArrowUp' });
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('60');
      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(sfxHandle, { key: 'ArrowDown' });
      }
      expect(sfxHandle.getAttribute('aria-valuenow')).toBe('180');
      const videoHandle = handle('video');
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(videoHandle, { key: 'ArrowUp' });
      }
      expect(videoHandle.getAttribute('aria-valuenow')).toBe('52');
      fireEvent.keyDown(sfxHandle, { key: 'ArrowLeft' });
      fireEvent.keyDown(sfxHandle, { key: 'ArrowRight' });
      expect(live(api).arrangement.clips.find((clip) => clip.id === 'hit-1')?.start).toBe(12);
      expect(live(api).undoLabel).toBeNull();
    });

    it('a key on the handle of a folded lane only unfolds it first', async () => {
      stubTimelineFrame(660);
      const { rowHeight, handle, fold } = await mountTrackLayout();
      fireEvent.click(fold('sfx'));
      expect(rowHeight('sfx')).toBe(36);
      expect(handle('sfx').getAttribute('aria-valuetext')).toBe('folded · 80 px');
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(rowHeight('sfx')).toBe(81);
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(rowHeight('sfx')).toBe(89);
    });

    it('Space on the focused fold button folds the lane and does not start the transport', async () => {
      stubTimelineFrame(660);
      const { api, rowHeight, fold } = await mountTrackLayout();
      const button = fold('music');
      button.focus();
      const notPrevented = fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      fireEvent.keyUp(button, { key: ' ', code: 'Space' });
      expect(notPrevented).toBe(false);
      expect(rowHeight('music')).toBe(36);
      expect(live(api).isPlaying).toBe(false);
      fireEvent.keyDown(button, { key: ' ', code: 'Space', repeat: true });
      expect(rowHeight('music')).toBe(36);
      expect(live(api).isPlaying).toBe(false);
    });

    it('sets one height on the row so the header and the lane body share it', async () => {
      stubTimelineFrame(660);
      const { row, header } = await mountTrackLayout();
      const sfx = row('sfx');
      expect(sfx.style.height).toBe('81px');
      const body = sfx.children[1];
      if (!(body instanceof HTMLElement)) {
        throw new Error('lane body missing');
      }
      expect(body.className).not.toContain('h-20');
      expect(body.style.height).toBe('');
      expect(header('sfx').style.height).toBe('');
      expect(sfx.className).toContain('flex');
    });

    it('renders no range body on a folded clip, adds the title line, and keeps trim with one history entry', async () => {
      stubTimelineFrame(660);
      const { api, view, fold } = await mountTrackLayout();
      const rangeBodySelector = '[title="drag = time selection · click = playhead"]';
      const openRoot = clipRoot(view.container, 'music-1');
      stubPointerCapture(openRoot);
      const openBody = openRoot.querySelector<HTMLElement>(rangeBodySelector);
      if (!openBody) {
        throw new Error('range body missing on the open lane');
      }
      expect(openRoot.title).toBe('');
      fireEvent.pointerDown(openBody, { ...press, pointerId: 4, clientX: 300, clientY: 60 });
      fireEvent.pointerMove(openRoot, { pointerId: 4, clientX: 360, clientY: 60 });
      fireEvent.pointerUp(openRoot, { pointerId: 4, clientX: 360, clientY: 60 });
      expect(live(api).range).not.toBeNull();
      act(() => live(api).setTimeRange(null));
      fireEvent.click(fold('music'));
      const root = clipRoot(view.container, 'music-1');
      stubPointerCapture(root);
      expect(root.querySelector(rangeBodySelector)).toBeNull();
      expect(root.children).toHaveLength(3);
      expect(root.title).toContain(FOLDED_TITLE_LINE);
      expect(root.firstElementChild?.getAttribute('title')).toContain(FOLDED_TITLE_LINE);
      fireEvent.pointerDown(root, { ...press, pointerId: 5, clientX: 300, clientY: 30 });
      fireEvent.pointerMove(root, { pointerId: 5, clientX: 360, clientY: 30 });
      fireEvent.pointerUp(root, { pointerId: 5, clientX: 360, clientY: 30 });
      expect(live(api).range).toBeNull();
      expect(live(api).isPointerGestureActive()).toBe(false);
      const trimStart = root.querySelector<HTMLElement>('[title="Trim — left edge"]');
      if (!trimStart) {
        throw new Error('trim edge missing');
      }
      const pxPerSecond = live(api).pxPerSecond;
      fireEvent.pointerDown(trimStart, { ...press, pointerId: 6, clientX: 400, clientY: 30 });
      fireEvent.pointerMove(root, { pointerId: 6, clientX: 400 + pxPerSecond, clientY: 30 });
      fireEvent.pointerUp(root, { pointerId: 6, clientX: 400 + pxPerSecond, clientY: 30 });
      const trimmed = live(api).arrangement.clips.find((clip) => clip.id === 'music-1');
      expect(trimmed?.start).toBe(3);
      expect(trimmed?.duration).toBe(7);
      expect(live(api).undoLabel).toBe('Trim — left edge');
      act(() => live(api).undo());
      expect(live(api).undoLabel).toBeNull();
      fireEvent.click(fold('music'));
      expect(clipRoot(view.container, 'music-1').querySelector(rangeBodySelector)).toBeTruthy();
    });

    it('auto-fit shrinks the lanes, gives a folded lane’s height back, and the first manual change turns it off', async () => {
      stubTimelineFrame(442);
      const { view, rowHeight, fold, handle } = await mountTrackLayout();
      expect(rowHeight('music')).toBe(81);
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 67, 67, 67]);
      fireEvent.click(fold('music'));
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 36, 81, 81]);
      fireEvent.click(fold('music'));
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 67, 67, 67]);
      fireTimelineResize(560);
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([81, 81, 81, 81]);
      fireTimelineResize(442);
      expect(rowHeight('sfx')).toBe(67);
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(rowHeight('sfx')).toBe(75);
      fireTimelineResize(700);
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 67, 67, 75]);
      fireTimelineResize(380);
      expect(rowHeight('sfx')).toBe(75);
    });

    it('keeps auto-fit on after a fold and after a cancelled height drag', async () => {
      stubTimelineFrame(442);
      const { view, rowHeight, fold, handle } = await mountTrackLayout();
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      fireEvent.click(fold('stems'));
      fireEvent.click(fold('stems'));
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 7, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 7, clientY: 340 });
      expect(rowHeight('sfx')).toBe(107);
      fireEvent.pointerCancel(window, { pointerId: 7 });
      expect(rowHeight('sfx')).toBe(67);
      fireTimelineResize(560);
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([81, 81, 81, 81]);
    });
    it('skips the lane refit while the detail panel animates and refits once on its height transitionend', async () => {
      stubTimelineFrame(442);
      let commits = 0;
      const { view, rowHeight } = await mountTrackLayout(() => {
        commits += 1;
      });
      const panel = view.getByTestId('arrangement-detail-panel');
      Object.defineProperty(panel, 'getAnimations', { configurable: true, value: () => [{}] });
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      commits = 0;
      fireTimelineResize(442);
      fireTimelineResize(442);
      expect(rowHeight('music')).toBe(81);
      expect(commits).toBe(0);
      Object.defineProperty(panel, 'getAnimations', { configurable: true, value: () => [] });
      fireEvent.transitionEnd(panel, { propertyName: 'opacity' });
      expect(rowHeight('music')).toBe(81);
      fireEvent.transitionEnd(panel, { propertyName: 'height' });
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 67, 67, 67]);
      expect(commits).toBe(1);
    });

    it('does not re-render the workspace on observer ticks whose metrics change nothing', async () => {
      stubTimelineFrame(442);
      let commits = 0;
      const { view } = await mountTrackLayout(() => {
        commits += 1;
      });
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      fireTimelineResize(442);
      commits = 0;
      for (let i = 0; i < 5; i++) {
        fireTimelineResize(442);
      }
      expect(commits).toBe(0);
      fireTimelineResize(441);
      expect(commits).toBe(1);
    });

    it('restores the start height and auto-fit when the registry aborts a height drag (window blur)', async () => {
      stubTimelineFrame(442);
      const { api, view, rowHeight, handle } = await mountTrackLayout();
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 11, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 11, clientY: 380 });
      expect(rowHeight('sfx')).toBe(147);
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      expect(rowHeight('sfx')).toBe(67);
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireTimelineResize(560);
      expect(rowHeight('sfx')).toBe(81);
    });

    it('a committed height drag turns auto-fit off and a move back to the start is honoured', async () => {
      stubTimelineFrame(442);
      const { view, rowHeight, handle } = await mountTrackLayout();
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(442);
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 12, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 12, clientY: 320 });
      expect(rowHeight('sfx')).toBe(87);
      fireEvent.pointerMove(window, { pointerId: 12, clientY: 300 });
      expect(rowHeight('sfx')).toBe(67);
      fireEvent.pointerMove(window, { pointerId: 12, clientY: 310 });
      fireEvent.pointerUp(window, { pointerId: 12, clientY: 310 });
      expect(rowHeight('sfx')).toBe(77);
      fireTimelineResize(700);
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([53, 67, 67, 77]);
    });

    it('a pointerdown on the handle of a folded lane neither unfolds it nor starts a gesture (C-R11-01)', async () => {
      stubTimelineFrame(660);
      const { api, rowHeight, handle, fold } = await mountTrackLayout();
      fireEvent.click(fold('stems'));
      fireEvent.pointerDown(handle('stems'), { ...press, pointerId: 13, clientY: 300 });
      expect(rowHeight('stems')).toBe(36);
      expect(live(api).isPointerGestureActive()).toBe(false);
      fireEvent.pointerMove(window, { pointerId: 13, clientY: 360 });
      expect(rowHeight('stems')).toBe(36);
    });

    it('ignores a fold click while another pointer gesture is active', async () => {
      stubTimelineFrame(660);
      const { api, rowHeight, fold } = await mountTrackLayout();
      const release = live(api).claimPointerGesture(14, () => undefined);
      fireEvent.click(fold('music'));
      expect(rowHeight('music')).toBe(81);
      release?.();
      fireEvent.click(fold('music'));
      expect(rowHeight('music')).toBe(36);
    });

    it('caps the detail panel while auto-fit is on, keeps the cap after a click or a cancelled drag, and keeps the rendered height when a manual lane change drops it', async () => {
      stubTimelineFrame(410);
      const { view, handle } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      const separator = view.getByTestId('arrangement-detail-separator');
      const toggle = view.getByTestId('arrangement-detail-toggle');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      expect(separator.getAttribute('aria-valuenow')).toBe('130');
      fireEvent.pointerDown(separator, { ...press, pointerId: 15, clientY: 500 });
      fireEvent.pointerUp(window, { pointerId: 15, clientY: 500 });
      fireEvent.pointerDown(separator, { ...press, pointerId: 16, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 16, clientY: 440 });
      expect(panel.style.height).toBe('190px');
      fireEvent.pointerCancel(window, { pointerId: 16 });
      expect(panel.style.height).toBe('130px');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(panel.style.height).toBe('130px');
      expect(separator.getAttribute('aria-valuenow')).toBe('130');
    });

    it('lands cross-lane header drags by real row rectangles on mixed heights (music folded, SFX 140)', async () => {
      stubTimelineFrame(660);
      const { api, view, row, rowHeight, fold, handle } = await mountTrackLayout();
      fireEvent.click(fold('music'));
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 20, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 20, clientY: 560 });
      fireEvent.pointerUp(window, { pointerId: 20, clientY: 560 });
      expect(['video', 'music', 'stems', 'sfx'].map(rowHeight)).toEqual([81, 36, 81, 141]);
      let top = 0;
      for (const trackId of ['video', 'music', 'stems', 'sfx']) {
        const height = rowHeight(trackId);
        const rowTop = top;
        Object.defineProperty(row(trackId), 'getBoundingClientRect', {
          configurable: true,
          value: () => new DOMRect(0, rowTop, 900, height),
        });
        top += height;
      }
      const drag = (clipId: string, fromY: number, toY: number, pointerId: number) => {
        const root = clipRoot(view.container, clipId);
        stubPointerCapture(root);
        const header = root.firstElementChild;
        if (!(header instanceof HTMLElement)) {
          throw new Error('clip header missing');
        }
        fireEvent.pointerDown(header, { ...press, pointerId, clientX: 300, clientY: fromY });
        fireEvent.pointerMove(root, { pointerId, clientX: 300, clientY: toY });
        fireEvent.pointerUp(root, { pointerId, clientX: 300, clientY: toY });
      };
      drag('music-1', 100, 150, 21);
      expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.trackId).toBe(
        'stems',
      );
      drag('stem-1', 150, 100, 22);
      expect(live(api).arrangement.clips.find((clip) => clip.id === 'stem-1')?.trackId).toBe(
        'music',
      );
      drag('music-1', 150, 300, 23);
      expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.trackId).toBe(
        'sfx',
      );
    });
    it('resizes the panel without a transition when only the cap changes it, and animates the next toggle again', async () => {
      stubTimelineFrame(410);
      const { view, fold } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      const toggle = view.getByTestId('arrangement-detail-toggle');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      expect(panel.className).toContain('motion-safe:transition-[height]');
      fireEvent.click(fold('music'));
      expect(panel.style.height).toBe('144px');
      expect(panel.className).not.toContain('motion-safe:transition-[height]');
      fireEvent.click(toggle);
      expect(panel.className).toContain('motion-safe:transition-[height]');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('144px');
    });

    it('keeps the cap when a separator key only opens the collapsed panel or a drag moves only sideways', async () => {
      stubTimelineFrame(410);
      const { view } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      const separator = view.getByTestId('arrangement-detail-separator');
      const toggle = view.getByTestId('arrangement-detail-toggle');
      fireEvent.keyDown(separator, { key: 'ArrowDown' });
      expect(panel.style.height).toBe('130px');
      fireEvent.pointerDown(separator, { ...press, pointerId: 30, clientX: 400, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 30, clientX: 480, clientY: 500 });
      fireEvent.pointerUp(window, { pointerId: 30, clientX: 480, clientY: 500 });
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      fireEvent.keyDown(separator, { key: 'ArrowUp' });
      expect(panel.style.height).toBe('146px');
      expect(panel.className).toContain('motion-safe:transition-[height]');
    });

    it('forwards a drop over the height handle to the lane body only when it is over the lane, not the header strip', async () => {
      stubTimelineFrame(660);
      const { api, view, row, handle, header } = await mountTrackLayout();
      const body = row('sfx').children[1];
      if (!(body instanceof HTMLElement)) {
        throw new Error('lane body missing');
      }
      let bodyLeft = 224;
      Object.defineProperty(body, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(bodyLeft, 0, 900, 80),
      });
      Object.defineProperty(header('sfx'), 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, 0, 224, 80),
      });
      vi.stubGlobal('DragEvent', class TestDragEvent extends MouseEvent {});
      const files = [new File(['x'], 'clip.mp4', { type: 'video/mp4' })];
      const dataTransfer = { types: ['Files'], files, dropEffect: 'none' };
      const status = () => view.getByTestId('arrangement-status').textContent;
      fireEvent.dragOver(handle('sfx'), { clientX: 100, dataTransfer });
      expect(body.className).not.toContain('ring-2');
      fireEvent.dragOver(handle('sfx'), { clientX: 500, dataTransfer });
      expect(body.className).toContain('ring-2');
      fireEvent.dragLeave(body, { relatedTarget: handle('sfx'), dataTransfer });
      expect(body.className).toContain('ring-2');
      fireEvent.dragOver(handle('sfx'), { clientX: 100, dataTransfer });
      expect(body.className).not.toContain('ring-2');
      fireEvent.drop(body, { clientX: 500, dataTransfer });
      const bodyMessage = status();
      expect(bodyMessage).toBeTruthy();
      act(() => live(api).setStatus('—'));
      fireEvent.drop(handle('sfx'), { clientX: 100, dataTransfer });
      expect(status()).toBe('—');
      fireEvent.drop(handle('sfx'), { clientX: 500, dataTransfer });
      expect(status()).toBe(bodyMessage);
      bodyLeft = 124;
      act(() => live(api).setStatus('—'));
      fireEvent.dragOver(handle('sfx'), { clientX: 200, dataTransfer });
      expect(body.className).not.toContain('ring-2');
      fireEvent.drop(handle('sfx'), { clientX: 200, dataTransfer });
      expect(status()).toBe('—');
      fireEvent.drop(handle('sfx'), { clientX: 300, dataTransfer });
      expect(status()).toBe(bodyMessage);
    });
  },
);

const UNFOLDED_HANDLE_CLASS =
  'absolute inset-x-0 bottom-0 z-20 h-1.5 cursor-row-resize touch-none hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand';

describe(
  'panel polish 14a (C-R11-01..03, deviation 9, C-R15-02; D-29c, D-29g, R16-U)',
  { timeout: 15_000 },
  () => {
    beforeEach(() => {
      fakeClock.base = Date.now() / 1000;
      resizeCallbacks.clear();
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
      vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
      vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

    it('gives a folded lane’s height handle no pointer hit area but keeps it focusable, and restores the round-15 classes when unfolded (C-R11-01)', async () => {
      stubTimelineFrame(660);
      const { rowHeight, handle, fold } = await mountTrackLayout();
      expect(handle('music').className).toBe(UNFOLDED_HANDLE_CLASS);
      fireEvent.click(fold('music'));
      expect(rowHeight('music')).toBe(36);
      const folded = handle('music');
      expect(folded.className).toContain('pointer-events-none');
      expect(folded.className).not.toContain('cursor-row-resize');
      expect(folded.className).not.toContain('hover:bg-accent/60');
      expect(folded.tabIndex).toBe(0);
      expect(folded.getAttribute('role')).toBe('separator');
      expect(folded.getAttribute('aria-valuenow')).toBe('80');
      expect(folded.getAttribute('aria-valuetext')).toBe('folded · 80 px');
      fireEvent.keyDown(folded, { key: 'ArrowUp' });
      expect(rowHeight('music')).toBe(81);
      expect(handle('music').className).toBe(UNFOLDED_HANDLE_CLASS);
      expect(handle('music').getAttribute('aria-valuetext')).toBe('80 px');
      fireEvent.click(fold('music'));
      fireEvent.keyDown(handle('music'), { key: 'ArrowDown' });
      expect(rowHeight('music')).toBe(81);
    });

    it('reserves the selected-clip row with an aria-hidden placeholder and renders the real line as one truncated full-width row (C-R11-02, C-R15-02)', async () => {
      stubTimelineFrame(660);
      const { api, view } = await mountTrackLayout();
      const reserve = () => view.queryByTestId('arrangement-selected-clip-reserve');
      const line = () => view.queryByTestId('arrangement-selected-clip');
      const placeholder = reserve();
      expect(placeholder).not.toBeNull();
      expect(line()).toBeNull();
      expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
      expect(placeholder?.textContent).toBe(String.fromCharCode(160));
      expect(placeholder?.className.split(' ').sort()).toEqual(
        ['basis-full', 'tabular-nums', 'text-muted'].sort(),
      );
      act(() => live(api).selectClip('music-1'));
      const selected = line();
      expect(selected).not.toBeNull();
      expect(reserve()).toBeNull();
      expect(selected?.className.split(' ')).toEqual(
        expect.arrayContaining(['basis-full', 'truncate', 'tabular-nums', 'text-muted']),
      );
      expect(selected?.textContent).toBe(
        'Clip: Song · start 00:02.000 · length 00:08.000 · source offset 00:01.000',
      );
      expect(selected?.getAttribute('title')).toBe(selected?.textContent);
      expect(selected?.getAttribute('aria-hidden')).toBeNull();
      act(() => live(api).selectClip(null));
      expect(line()).toBeNull();
      expect(reserve()?.getAttribute('data-testid')).toBe('arrangement-selected-clip-reserve');
    });

    it('keeps the capped panel height when the first manual lane change turns auto-fit off, through resize and reopen (C-R11-03)', async () => {
      stubTimelineFrame(410);
      const { view, handle } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      const separator = view.getByTestId('arrangement-detail-separator');
      const toggle = view.getByTestId('arrangement-detail-toggle');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      expect(panel.className).toContain('motion-safe:transition-[height]');
      fireEvent.keyDown(handle('sfx'), { key: 'ArrowDown' });
      expect(panel.style.height).toBe('130px');
      expect(separator.getAttribute('aria-valuenow')).toBe('130');
      expect(panel.className).not.toContain('motion-safe:transition-[height]');
      fireTimelineResize(560);
      expect(panel.style.height).toBe('130px');
      fireTimelineResize(410);
      expect(panel.style.height).toBe('130px');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('36px');
      fireEvent.click(toggle);
      expect(panel.style.height).toBe('130px');
      fireEvent.keyDown(handle('music'), { key: 'ArrowDown' });
      expect(panel.style.height).toBe('130px');
      fireEvent.pointerDown(separator, { ...press, pointerId: 40, clientY: 500 });
      fireEvent.pointerMove(window, { pointerId: 40, clientY: 490 });
      fireEvent.pointerUp(window, { pointerId: 40, clientY: 490 });
      expect(panel.style.height).toBe('140px');
      expect(separator.getAttribute('aria-valuenow')).toBe('140');
      fireTimelineResize(560);
      expect(panel.style.height).toBe('140px');
    });

    it('still restores the stored height when the cap is released because the room grows (C-R11-03 control)', async () => {
      stubTimelineFrame(410);
      const { view } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      expect(panel.style.height).toBe('130px');
      fireTimelineResize(560);
      expect(panel.style.height).toBe('144px');
      fireTimelineResize(410);
      expect(panel.style.height).toBe('130px');
    });

    it('restores the pre-clamp stored height after a cancelled lane-height drag (C-R11-03 snapshot path)', async () => {
      stubTimelineFrame(410);
      const { view, rowHeight, handle } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(410);
      expect(panel.style.height).toBe('130px');
      const sfxBefore = rowHeight('sfx');
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 41, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 41, clientY: 340 });
      expect(panel.style.height).toBe('130px');
      fireEvent.pointerCancel(window, { pointerId: 41 });
      expect(rowHeight('sfx')).toBe(sfxBefore);
      expect(panel.style.height).toBe('130px');
      fireTimelineResize(560);
      expect(panel.style.height).toBe('144px');
    });

    it('keeps the capped height when a committed lane drag is followed by a cancelled one', async () => {
      stubTimelineFrame(410);
      const { view, handle } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(410);
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 43, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 43, clientY: 320 });
      fireEvent.pointerUp(window, { pointerId: 43, clientY: 320 });
      expect(panel.style.height).toBe('130px');
      fireEvent.pointerDown(handle('stems'), { ...press, pointerId: 44, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 44, clientY: 320 });
      fireEvent.pointerCancel(window, { pointerId: 44 });
      expect(panel.style.height).toBe('130px');
      fireTimelineResize(560);
      expect(panel.style.height).toBe('130px');
    });

    it('does not override a user panel resize made during a lane drag when that drag is cancelled', async () => {
      stubTimelineFrame(410);
      const { view, handle } = await mountTrackLayout();
      const panel = view.getByTestId('arrangement-detail-panel');
      const separator = view.getByTestId('arrangement-detail-separator');
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      fireTimelineResize(410);
      fireEvent.pointerDown(handle('sfx'), { ...press, pointerId: 45, clientY: 300 });
      fireEvent.pointerMove(window, { pointerId: 45, clientY: 320 });
      fireEvent.keyDown(separator, { key: 'ArrowUp' });
      fireEvent.keyDown(separator, { key: 'ArrowDown' });
      expect(panel.style.height).toBe('130px');
      fireEvent.pointerCancel(window, { pointerId: 45 });
      fireTimelineResize(560);
      expect(panel.style.height).toBe('130px');
    });

    it('writes the gesture refusal status when a fold is refused during a pointer gesture (deviation 9)', async () => {
      stubTimelineFrame(660);
      const { api, view, rowHeight, fold } = await mountTrackLayout();
      const status = () => view.getByTestId('arrangement-status').textContent;
      act(() => live(api).setStatus('—'));
      const release = live(api).claimPointerGesture(42, () => undefined);
      fireEvent.click(fold('music'));
      expect(rowHeight('music')).toBe(81);
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => live(api).setStatus('—'));
      fireEvent.keyDown(fold('music'), { key: ' ', code: 'Space' });
      expect(rowHeight('music')).toBe(81);
      expect(status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => {
        release?.();
      });
      fireEvent.click(fold('music'));
      expect(rowHeight('music')).toBe(36);
    });

    it('points every fold button’s aria-controls at its own lane body, outside the header, through fold and unfold (R23-F1)', async () => {
      stubTimelineFrame(660);
      const { row, header, fold } = await mountTrackLayout();
      const controlled = (trackId: string) => {
        const value = fold(trackId).getAttribute('aria-controls') ?? '';
        expect(value).not.toBe('');
        const target = document.getElementById(value);
        if (!target) {
          throw new Error(`aria-controls of ${trackId} does not resolve`);
        }
        expect(row(trackId).contains(target)).toBe(true);
        expect(header(trackId).contains(target)).toBe(false);
        expect(target).toBe(header(trackId).nextElementSibling);
        return { value, target };
      };
      const ids = new Set<string>();
      for (const trackId of ['video', 'music', 'stems', 'sfx']) {
        const { value, target } = controlled(trackId);
        ids.add(value);
        const laneClipIds = Array.from(
          row(trackId).querySelectorAll<HTMLElement>('[data-clip-id]'),
          (clip) => clip.dataset.clipId,
        );
        for (const clipId of laneClipIds) {
          expect(target.querySelector(`[data-clip-id="${clipId}"]`)).not.toBeNull();
        }
        if (trackId !== 'video') {
          expect(laneClipIds.length).toBeGreaterThan(0);
        }
      }
      expect(ids.size).toBe(4);
      const before = controlled('music').value;
      fireEvent.click(fold('music'));
      expect(fold('music').getAttribute('aria-expanded')).toBe('false');
      expect(controlled('music').value).toBe(before);
      fireEvent.click(fold('music'));
      expect(fold('music').getAttribute('aria-expanded')).toBe('true');
      expect(controlled('music').value).toBe(before);
    });

    it('draws the track-name button’s focus ring inset on folded and unfolded lanes (R23-N)', async () => {
      stubTimelineFrame(660);
      const { view, fold } = await mountTrackLayout();
      const expectInsetRing = (name: string) => {
        const classes = view
          .getByRole('button', { name: `${name} — set as the active track` })
          .className.split(/\s+/);
        expect(classes).toContain('focus-visible:ring-2');
        expect(classes).toContain('focus-visible:ring-inset');
        expect(classes).toContain('focus-visible:ring-brand');
      };
      expectInsetRing('მუსიკა');
      expectInsetRing('ვიდეო');
      fireEvent.click(fold('music'));
      fireEvent.click(fold('video'));
      expect(fold('music').getAttribute('aria-expanded')).toBe('false');
      expect(fold('video').getAttribute('aria-expanded')).toBe('false');
      expectInsetRing('მუსიკა');
      expectInsetRing('ვიდეო');
    });
  },
);

describe(
  'separator Home and the detail-panel ref (R24-H, R24-HC, R24-F; D-29o)',
  { timeout: 15_000 },
  () => {
    beforeEach(() => {
      fakeClock.base = Date.now() / 1000;
      resizeCallbacks.clear();
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
      vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
      vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

    interface PositionStoreRef {
      current: ArrangementPositionStore | null;
    }

    function PositionStoreProbe({ store }: { store: PositionStoreRef }) {
      store.current = useArrangementPositionStore();
      return null;
    }

    async function mountHomeHarness() {
      const api: LayoutApiRef = { current: null };
      const store: PositionStoreRef = { current: null };
      const view = render(
        <ArrangementProvider collection={layoutCollection} initialArrangement={layoutArrangement()}>
          <StudioWorkspace />
          <LayoutProbe api={api} />
          <PositionStoreProbe store={store} />
        </ArrangementProvider>,
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      const readPosition = () => {
        if (!store.current) {
          throw new Error('position store not mounted');
        }
        return store.current.getPosition();
      };
      const seekToFive = () => {
        act(() => live(api).seekTo(5));
        expect(readPosition()).toBe(5);
      };
      const pressHome = (target: HTMLElement) => {
        target.focus();
        return fireEvent.keyDown(target, { key: 'Home', code: 'Home' });
      };
      return { api, view, readPosition, seekToFive, pressHome };
    }

    it('keeps the position, status and aria-valuenow when Home is pressed on each focused separator, but still prevents the default (R24-H)', async () => {
      stubTimelineFrame(660);
      const { api, view, readPosition, seekToFive, pressHome } = await mountHomeHarness();
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      seekToFive();
      const separators = [
        view.getByRole('separator', { name: 'Height — მუსიკა' }),
        view.getByTestId('arrangement-detail-separator'),
        view.getByTestId('arrangement-library-separator'),
      ];
      for (const separator of separators) {
        const valueBefore = separator.getAttribute('aria-valuenow');
        const statusBefore = live(api).status;
        const isNotPrevented = pressHome(separator);
        expect(isNotPrevented).toBe(false);
        expect(document.activeElement).toBe(separator);
        expect(readPosition()).toBe(5);
        expect(separator.getAttribute('aria-valuenow')).toBe(valueBefore);
        expect(live(api).status).toBe(statusBefore);
      }
    });

    it('still seeks to 0 on Home from the body and a fold button, and leaves a focused volume slider to the browser (R24-HC)', async () => {
      stubTimelineFrame(660);
      const { view, readPosition, seekToFive, pressHome } = await mountHomeHarness();
      seekToFive();
      expect(pressHome(document.body)).toBe(false);
      expect(readPosition()).toBe(0);
      seekToFive();
      const fold = view.container.querySelector<HTMLElement>(
        '[data-track-id="music"] [data-testid="arrangement-track-fold"]',
      );
      if (!fold) {
        throw new Error('music fold button missing');
      }
      expect(pressHome(fold)).toBe(false);
      expect(readPosition()).toBe(0);
      seekToFive();
      const volume = view.container.querySelector<HTMLInputElement>(
        '[data-track-id="music"] input[type="range"]',
      );
      if (!volume) {
        throw new Error('music volume slider missing');
      }
      expect(pressHome(volume)).toBe(true);
      expect(readPosition()).toBe(5);
    });

    it('points an optional panelRef at the detail panel section (R24-F)', async () => {
      const panelRef: { current: HTMLElement | null } = { current: null };
      const view = render(
        <ArrangementProvider collection={layoutCollection} initialArrangement={layoutArrangement()}>
          <ArrangementDetailPanel
            selection={null}
            group={null}
            peaks={undefined}
            range={null}
            setTimeRange={() => undefined}
            setStatus={() => undefined}
            isPointerGestureActive={() => false}
            claimPointerGesture={() => () => undefined}
            measureTimelineFit={() => null}
            panelRef={panelRef}
          />
        </ArrangementProvider>,
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(panelRef.current).not.toBeNull();
      expect(panelRef.current).toBe(view.getByTestId('arrangement-detail-panel'));
    });
  },
);
