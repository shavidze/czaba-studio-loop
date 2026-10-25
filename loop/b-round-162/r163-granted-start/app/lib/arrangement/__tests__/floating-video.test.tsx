import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
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

const floatCollection: WorkspaceCollection = {
  id: 'float',
  label: 'float',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'float', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'float', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function floatArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 8 },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 12, sourceOffset: 0, duration: 2 },
      { id: 'video-1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
    ],
  };
}

const EXPANDED_TEXT =
  'The video is expanded over the library. Drag it where you want; Esc or ✕ brings it back.';
const LIBRARY_OPENED_TEXT =
  'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or ✕ brings it back.';
const LIBRARY_COLLAPSED_TEXT = 'The library collapsed, so the video went back to the compact view.';
const RETURNED_TEXT = 'The video went back to the compact view.';
const RETURNED_RECOLLAPSED_TEXT =
  'The video went back to the compact view; the library collapsed again.';
const EXPAND_LABEL = 'Expand video';
const RETURN_LABEL = 'Return the video to the compact view';

const LIBRARY_RECT = { left: 0, top: 84, width: 288, height: 767 };
const LIBRARY_HEADER_RECT = { left: 0, top: 84, width: 288, height: 40 };
const LIBRARY_SEARCH_RECT = { left: 0, top: 124, width: 288, height: 109 };
const LIBRARY_BODY_RECT = { left: 0, top: 233, width: 288, height: 451 };
const LIBRARY_PREVIEW_RECT = { left: 0, top: 684, width: 288, height: 167 };
const PLACED_TOP = LIBRARY_BODY_RECT.top + LIBRARY_BODY_RECT.height - 8 - 153;

interface LayoutRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function toDomRect(rect: LayoutRect): DOMRect {
  return new DOMRect(rect.left, rect.top, rect.width, rect.height);
}

function mockLibraryLayoutRects() {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.getAttribute('data-testid') === 'arrangement-library') {
      return toDomRect(LIBRARY_RECT);
    }
    if (this.firstElementChild?.getAttribute('data-testid') === 'arrangement-library-tree') {
      return toDomRect(LIBRARY_BODY_RECT);
    }
    return original.call(this);
  });
}

interface FloatApiRef {
  current: ArrangementContextValue | null;
}

function FloatProbe({ api }: { api: FloatApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FloatApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

const press = { button: 0, buttons: 1 };

function stubCapture(element: Element) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountFloatWorkspace() {
  const api: FloatApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={floatCollection} initialArrangement={floatArrangement()}>
      <StudioWorkspace />
      <FloatProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const library = view.getByTestId('arrangement-library');
  mockLibraryLayoutRects();
  const box = view.getByTestId('arrangement-video-box');
  stubCapture(box);
  const videos = Array.from(box.querySelectorAll('video'));
  const status = view.getByTestId('arrangement-status');
  const expand = () => view.getByTestId('arrangement-video-expand');
  return { api, view, library, box, videos, status, expand };
}

function boxRect(box: HTMLElement) {
  return {
    left: Number.parseFloat(box.style.left),
    top: Number.parseFloat(box.style.top),
    width: Number.parseFloat(box.style.width),
  };
}

function expectCompact(view: ReturnType<typeof render>, box: HTMLElement) {
  expect(box.dataset.videoExpanded).toBe('false');
  expect(box.dataset.videoFloating).toBe('false');
  expect(box.className).not.toContain('fixed');
  expect(box.className).toContain('w-40');
  expect(box.style.left).toBe('');
  expect(box.style.top).toBe('');
  expect(box.style.width).toBe('');
  expect(view.queryByTestId('arrangement-video-placeholder')).toBeNull();
  expect(view.queryByTestId('arrangement-video-close')).toBeNull();
  expect(view.queryByTestId('arrangement-video-drag')).toBeNull();
}

function pressEscapeOnWindow(options: { prevent: boolean }) {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  if (options.prevent) {
    event.preventDefault();
  }
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe('floating expanded video (SRW-11B stage 3, D-29d, R13-U)', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 0;

  function flushFrames() {
    const pending = Array.from(frames.values());
    frames.clear();
    act(() => {
      for (const frame of pending) {
        frame(performance.now());
      }
    });
  }

  beforeEach(() => {
    frames.clear();
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrameId += 1;
      frames.set(nextFrameId, callback);
      return nextFrameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (frameId: number) => {
      frames.delete(frameId);
    });
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

  it('expands the same box over the library, keeps both <video> nodes and shows the placeholder', async () => {
    const { api, view, box, videos, status, expand } = await mountFloatWorkspace();
    const arrangementBefore = live(api).arrangement;
    expect(videos).toHaveLength(2);
    expect(expand().getAttribute('aria-label')).toBe(EXPAND_LABEL);
    expectCompact(view, box);
    fireEvent.click(expand());
    const floating = view.getByTestId('arrangement-video-box');
    expect(floating).toBe(box);
    const after = Array.from(floating.querySelectorAll('video'));
    expect(after[0]).toBe(videos[0]);
    expect(after[1]).toBe(videos[1]);
    expect(after.map((video) => video.dataset.testid)).toEqual([
      'arrangement-video',
      'arrangement-video',
    ]);
    expect(after.every((video) => video.muted)).toBe(true);
    expect(box.dataset.videoFloating).toBe('true');
    expect(box.className).toContain('fixed');
    expect(box.className).toContain('aspect-video');
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
    expect(status.textContent).toBe(EXPANDED_TEXT);
    expect(expand().getAttribute('aria-label')).toBe(RETURN_LABEL);
    const placeholder = view.getByTestId('arrangement-video-placeholder');
    expect(placeholder.textContent).toContain('Video expanded');
    expect(placeholder.className).toContain('w-40');
    expect(placeholder.className).toContain('aspect-video');
    expect(view.getByTestId('arrangement-video-close').getAttribute('aria-label')).toBeTruthy();
    expect(view.getByTestId('arrangement-video-drag').getAttribute('aria-label')).toBeTruthy();
    expect(live(api).arrangement).toBe(arrangementBefore);
    expect(live(api).undoLabel).toBeNull();
  });

  const returnPaths: ReadonlyArray<[string, 'close' | 'placeholder' | 'escape']> = [
    ['✕', 'close'],
    ['the placeholder button', 'placeholder'],
    ['Esc', 'escape'],
  ];

  it.each(
    returnPaths,
  )('returns to compact with %s and keeps the same <video> nodes', async (_label, path) => {
    const { api, view, box, videos, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expect(box.dataset.videoFloating).toBe('true');
    if (path === 'close') {
      fireEvent.click(view.getByTestId('arrangement-video-close'));
    } else if (path === 'placeholder') {
      fireEvent.click(view.getByTestId('arrangement-video-placeholder-return'));
    } else {
      const event = pressEscapeOnWindow({ prevent: false });
      expect(event.defaultPrevented).toBe(true);
    }
    expectCompact(view, box);
    expect(expand().getAttribute('aria-label')).toBe(EXPAND_LABEL);
    const after = Array.from(view.getByTestId('arrangement-video-box').querySelectorAll('video'));
    expect(after[0]).toBe(videos[0]);
    expect(after[1]).toBe(videos[1]);
    expect(live(api).undoLabel).toBeNull();
  });

  it('ignores Esc that was already handled (defaultPrevented)', async () => {
    const { box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    pressEscapeOnWindow({ prevent: true });
    expect(box.dataset.videoFloating).toBe('true');
  });

  it('ignores Esc in a plain text field that does not handle Escape itself', async () => {
    const { box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const field = document.createElement('input');
    field.type = 'text';
    document.body.appendChild(field);
    try {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        field.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(false);
      expect(box.dataset.videoFloating).toBe('true');
    } finally {
      field.remove();
    }
  });

  it('clears a non-empty library search on the first Esc and returns the video on the second', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const search = view.getByTestId('arrangement-library-search');
    if (!(search instanceof HTMLInputElement)) {
      throw new Error('search input missing');
    }
    fireEvent.change(search, { target: { value: 'hit' } });
    expect(search.value).toBe('hit');
    search.focus();
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(search.value).toBe('');
    expect(box.dataset.videoFloating).toBe('true');
    search.blur();
    pressEscapeOnWindow({ prevent: false });
    expectCompact(view, box);
  });

  it('does not change the video on Esc while the Export dialog is open', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    pressEscapeOnWindow({ prevent: false });
    expect(box.dataset.videoFloating).toBe('true');
    expect(box.className).toContain('z-40');
  });

  it('keeps the video when Esc closes Export and React flushes between listeners (real browser order)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    let dialogGoneBeforeWindowListener = false;
    const flushBetweenListeners = () => {
      flushSync(() => undefined);
      dialogGoneBeforeWindowListener = document.querySelector('[role=dialog]') === null;
    };
    document.addEventListener('keydown', flushBetweenListeners);
    try {
      act(() => {
        document.body.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        );
      });
    } finally {
      document.removeEventListener('keydown', flushBetweenListeners);
    }
    expect(dialogGoneBeforeWindowListener).toBe(true);
    expect(view.queryByRole('dialog')).toBeNull();
    expect(box.dataset.videoFloating).toBe('true');
  });

  it('collapses both video and library on ◀ while expanded, with the status text', async () => {
    const { view, library, box, status, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expectCompact(view, box);
    expect(library.dataset.collapsed).toBe('true');
    expect(status.textContent).toBe(LIBRARY_COLLAPSED_TEXT);
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(status.textContent).toBe(LIBRARY_OPENED_TEXT);
    flushFrames();
    expect(box.dataset.videoFloating).toBe('true');
    fireEvent.click(view.getByTestId('arrangement-video-close'));
    expect(library.dataset.collapsed).toBe('true');
    expectCompact(view, box);
  });

  it('opens a collapsed library for the video and collapses it again on return', async () => {
    const { view, library, box, status, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expect(library.dataset.collapsed).toBe('true');
    expect(library.style.width).toBe('40px');
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(status.textContent).toBe(LIBRARY_OPENED_TEXT);
    expect(box.dataset.videoExpanded).toBe('true');
    expect(box.dataset.videoFloating).toBe('false');
    flushFrames();
    expect(box.dataset.videoFloating).toBe('true');
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
    pressEscapeOnWindow({ prevent: false });
    expectCompact(view, box);
    expect(library.dataset.collapsed).toBe('true');
    expect(library.style.width).toBe('40px');
  });

  it('places the box on the next frame under reduced motion (transition-property none, duration kept)', async () => {
    const { view, library, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    library.style.transitionProperty = 'none';
    library.style.transitionDuration = '0.3s';
    fireEvent.click(expand());
    expect(box.dataset.videoFloating).toBe('false');
    expect(frames.size).toBeGreaterThan(0);
    flushFrames();
    expect(box.dataset.videoFloating).toBe('true');
    expect(boxRect(box).left).toBe(8);
  });

  it('waits for the library width transitionend before placing the box', async () => {
    const { view, library, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    library.style.transitionProperty = 'width';
    library.style.transitionDuration = '0.3s';
    fireEvent.click(expand());
    flushFrames();
    expect(box.dataset.videoFloating).toBe('false');
    const childEnd = new Event('transitionend', { bubbles: true });
    Object.defineProperty(childEnd, 'propertyName', { value: 'width' });
    act(() => {
      view.getByTestId('arrangement-library-search').dispatchEvent(childEnd);
    });
    expect(box.dataset.videoFloating).toBe('false');
    const opacityEnd = new Event('transitionend', { bubbles: true });
    Object.defineProperty(opacityEnd, 'propertyName', { value: 'opacity' });
    act(() => {
      library.dispatchEvent(opacityEnd);
    });
    expect(box.dataset.videoFloating).toBe('false');
    const widthEnd = new Event('transitionend', { bubbles: true });
    Object.defineProperty(widthEnd, 'propertyName', { value: 'width' });
    act(() => {
      library.dispatchEvent(widthEnd);
    });
    expect(box.dataset.videoFloating).toBe('true');
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
  });

  it('moves the box 16 px per arrow on ⠿ without nudging a selected clip, seeking or zooming', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    act(() => live(api).selectClip('music-1'));
    const zoomBefore = live(api).pxPerSecond;
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    handle.focus();
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    }
    expect(boxRect(box).left).toBe(8 + 48);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(boxRect(box).top).toBe(PLACED_TOP + 16);
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(boxRect(box)).toEqual({ left: 8 + 32, top: PLACED_TOP, width: 272 });
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.start).toBe(2);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).pxPerSecond).toBe(zoomBefore);
    expect(view.getByTestId('arrangement-position').textContent).toBe('00:00.000');
  });

  it('drags the box with the pointer, clamps it and claims the D-26 gesture registry', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(box, { ...press, pointerId: 7, clientX: 100, clientY: 150 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 300, clientY: 250 });
    expect(boxRect(box)).toEqual({ left: 208, top: PLACED_TOP + 100, width: 272 });
    const clip = view.container.querySelector<HTMLElement>('[data-clip-id="hit-1"]');
    const clipHeader = clip?.firstElementChild;
    if (!clip || !(clipHeader instanceof HTMLElement)) {
      throw new Error('clip not rendered');
    }
    stubCapture(clip);
    fireEvent.pointerDown(clipHeader, { ...press, pointerId: 21, clientX: 500, clientY: 200 });
    expect(live(api).selectedClipId).toBeNull();
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 5000, clientY: 5000 });
    expect(boxRect(box)).toEqual({ left: 1440 - 272, top: 900 - 153, width: 272 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: -5000, clientY: -5000 });
    expect(boxRect(box)).toEqual({ left: 0, top: 0, width: 272 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: -5000, clientY: -5000 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 300, clientY: 300 });
    expect(boxRect(box)).toEqual({ left: 0, top: 0, width: 272 });
    expect(live(api).undoLabel).toBeNull();
  });

  it('does not start a drag from ⤢ or ✕', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(view.getByTestId('arrangement-video-close'), {
      ...press,
      pointerId: 3,
      clientX: 10,
      clientY: 10,
    });
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerDown(expand(), { ...press, pointerId: 4, clientX: 10, clientY: 10 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(box.dataset.videoFloating).toBe('true');
  });

  it('releases an active drag when the video returns to compact', async () => {
    const { api, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(box, { ...press, pointerId: 7, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 160, clientY: 170 });
    expect(boxRect(box)).toEqual({ left: 68, top: PLACED_TOP + 20, width: 272 });
    expect(live(api).isPointerGestureActive()).toBe(true);
    pressEscapeOnWindow({ prevent: false });
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(box.style.left).toBe('');
    fireEvent.click(expand());
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 400, clientY: 400 });
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
  });

  it('re-clamps on window resize and does not follow a library width change', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    for (let i = 0; i < 80; i++) {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
    }
    expect(boxRect(box)).toEqual({ left: 1440 - 272, top: 900 - 153, width: 272 });
    vi.stubGlobal('innerWidth', 1280);
    vi.stubGlobal('innerHeight', 720);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(boxRect(box)).toEqual({ left: 1280 - 272, top: 720 - 153, width: 272 });
    fireEvent.keyDown(view.getByTestId('arrangement-library-separator'), { key: 'ArrowRight' });
    expect(boxRect(box)).toEqual({ left: 1280 - 272, top: 720 - 153, width: 272 });
  });

  it('keeps Space as the workspace transport toggle on the float buttons', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(true);
    expect(box.dataset.videoFloating).toBe('true');
    fireEvent.keyDown(expand(), { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(false);
    expect(box.dataset.videoFloating).toBe('true');
  });

  function enableLibraryWidthTransition(library: HTMLElement) {
    library.style.transitionProperty = 'width';
    library.style.transitionDuration = '0.3s';
  }

  function fireLibraryWidthEnd(library: HTMLElement) {
    const widthEnd = new Event('transitionend', { bubbles: true });
    Object.defineProperty(widthEnd, 'propertyName', { value: 'width' });
    act(() => {
      library.dispatchEvent(widthEnd);
    });
  }

  async function waitReal(ms: number) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    });
  }

  it('places the box by the fallback timer when transitionend never arrives', async () => {
    const { view, library, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    enableLibraryWidthTransition(library);
    fireEvent.click(expand());
    flushFrames();
    await waitReal(200);
    expect(box.dataset.videoFloating).toBe('false');
    await waitReal(300);
    expect(box.dataset.videoFloating).toBe('true');
    expect(boxRect(box)).toEqual({ left: 8, top: PLACED_TOP, width: 272 });
  });

  it.each([
    'collapse',
    'escape',
  ])('never places a box whose expand was cancelled (%s) before the library transition ended', async (path) => {
    const { view, library, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    enableLibraryWidthTransition(library);
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    if (path === 'collapse') {
      fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    } else {
      pressEscapeOnWindow({ prevent: false });
    }
    expect(library.dataset.collapsed).toBe('true');
    fireLibraryWidthEnd(library);
    flushFrames();
    await waitReal(450);
    expectCompact(view, box);
    expect(expand().getAttribute('aria-label')).toBe(EXPAND_LABEL);
  });

  it('commits the dragged position so the next arrow step starts from it', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(box, { ...press, pointerId: 7, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 300, clientY: 250 });
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 300, clientY: 250 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.keyDown(view.getByTestId('arrangement-video-drag'), { key: 'ArrowRight' });
    expect(boxRect(box)).toEqual({ left: 224, top: PLACED_TOP + 100, width: 272 });
  });

  it('ends the drag through the registry on window blur and ignores later moves', async () => {
    const { api, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(box, { ...press, pointerId: 7, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 150, clientY: 150 });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 600, clientY: 600 });
    expect(boxRect(box)).toEqual({ left: 58, top: PLACED_TOP, width: 272 });
  });

  it('focuses ⠿ on pointerdown so arrows work after a mouse click on the handle', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    fireEvent.pointerDown(handle, { ...press, pointerId: 9, clientX: 50, clientY: 100 });
    expect(document.activeElement).toBe(handle);
    expect(live(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerUp(window, { pointerId: 9, clientX: 50, clientY: 100 });
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(box.dataset.videoFloating).toBe('true');
  });

  it('returns focus to ⤢ after ✕ or Esc from a float control, but not after ◀', async () => {
    const { view, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const close = view.getByTestId('arrangement-video-close');
    close.focus();
    fireEvent.click(close);
    expect(document.activeElement).toBe(expand());
    fireEvent.click(expand());
    view.getByTestId('arrangement-video-drag').focus();
    pressEscapeOnWindow({ prevent: false });
    expect(document.activeElement).toBe(expand());
    fireEvent.click(expand());
    const collapse = view.getByTestId('arrangement-library-collapse');
    collapse.focus();
    fireEvent.click(collapse);
    expect(document.activeElement).not.toBe(expand());
  });

  it('ignores ⠿ arrows and resize re-clamps during a drag, then commits the clamped drag position', async () => {
    const { api, view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    fireEvent.pointerDown(handle, { ...press, pointerId: 9, clientX: 50, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 9, clientX: 1350, clientY: 900 });
    expect(boxRect(box)).toEqual({ left: 1440 - 272, top: 900 - 153, width: 272 });
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(boxRect(box)).toEqual({ left: 1440 - 272, top: 900 - 153, width: 272 });
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.start).toBe(2);
    vi.stubGlobal('innerWidth', 1280);
    vi.stubGlobal('innerHeight', 720);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(boxRect(box)).toEqual({ left: 1440 - 272, top: 900 - 153, width: 272 });
    fireEvent.pointerUp(window, { pointerId: 9, clientX: 1350, clientY: 900 });
    expect(boxRect(box)).toEqual({ left: 1280 - 272, top: 720 - 153, width: 272 });
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(boxRect(box)).toEqual({ left: 1280 - 288, top: 720 - 153, width: 272 });
  });

  it('applies every arrow of a synchronous burst (no stale rect between React renders)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    const handle = view.getByTestId('arrangement-video-drag');
    act(() => {
      for (let i = 0; i < 3; i++) {
        handle.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
        );
      }
    });
    expect(boxRect(box)).toEqual({ left: 8 + 48, top: PLACED_TOP, width: 272 });
  });

  function placedRect(box: HTMLElement): LayoutRect {
    const rect = boxRect(box);
    return { ...rect, height: (rect.width * 9) / 16 };
  }

  function intersects(a: LayoutRect, b: LayoutRect): boolean {
    return (
      a.left < b.left + b.width &&
      b.left < a.left + a.width &&
      a.top < b.top + b.height &&
      b.top < a.top + a.height
    );
  }

  function expectInsideLibraryBody(box: HTMLElement) {
    const rect = placedRect(box);
    expect(rect.left).toBeGreaterThanOrEqual(LIBRARY_BODY_RECT.left);
    expect(rect.left + rect.width).toBeLessThanOrEqual(
      LIBRARY_BODY_RECT.left + LIBRARY_BODY_RECT.width,
    );
    expect(rect.top).toBeGreaterThanOrEqual(LIBRARY_BODY_RECT.top);
    expect(rect.top + rect.height).toBeLessThanOrEqual(
      LIBRARY_BODY_RECT.top + LIBRARY_BODY_RECT.height,
    );
    expect(intersects(rect, LIBRARY_HEADER_RECT)).toBe(false);
    expect(intersects(rect, LIBRARY_SEARCH_RECT)).toBe(false);
    expect(intersects(rect, LIBRARY_PREVIEW_RECT)).toBe(false);
  }

  it('places the expanded box inside the library body, clear of the header, search and preview (D-29e)', async () => {
    const { box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expect(box.dataset.videoFloating).toBe('true');
    expectInsideLibraryBody(box);
    expect(placedRect(box).top + placedRect(box).height).toBe(
      LIBRARY_BODY_RECT.top + LIBRARY_BODY_RECT.height - 8,
    );
  });

  it('places the box inside the remounted library body after a temporary opening (D-29e)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    fireEvent.click(expand());
    flushFrames();
    expect(box.dataset.videoFloating).toBe('true');
    expectInsideLibraryBody(box);
  });

  it.each(
    returnPaths,
  )('writes the return status after %s when the library was already open (C-R13-02)', async (_label, path) => {
    const { view, status, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expect(status.textContent).toBe(EXPANDED_TEXT);
    if (path === 'close') {
      fireEvent.click(view.getByTestId('arrangement-video-close'));
    } else if (path === 'placeholder') {
      fireEvent.click(view.getByTestId('arrangement-video-placeholder-return'));
    } else {
      pressEscapeOnWindow({ prevent: false });
    }
    expect(status.textContent).toBe(RETURNED_TEXT);
    expect(view.getByTestId('arrangement-library').dataset.collapsed).toBe('false');
  });

  it.each(
    returnPaths,
  )('writes the re-collapse status after %s from a temporary opening (C-R13-02)', async (_label, path) => {
    const { view, library, status, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    fireEvent.click(expand());
    flushFrames();
    expect(status.textContent).toBe(LIBRARY_OPENED_TEXT);
    if (path === 'close') {
      fireEvent.click(view.getByTestId('arrangement-video-close'));
    } else if (path === 'placeholder') {
      fireEvent.click(view.getByTestId('arrangement-video-placeholder-return'));
    } else {
      pressEscapeOnWindow({ prevent: false });
    }
    expect(status.textContent).toBe(RETURNED_RECOLLAPSED_TEXT);
    expect(library.dataset.collapsed).toBe('true');
    expect(library.style.width).toBe('40px');
  });

  it('writes the return status when ⤢ itself returns an expanded video (C-R13-02)', async () => {
    const { box, status, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expect(expand().getAttribute('aria-label')).toBe(RETURN_LABEL);
    fireEvent.click(expand());
    expect(box.dataset.videoExpanded).toBe('false');
    expect(status.textContent).toBe(RETURNED_TEXT);
  });

  it('writes no status for a no-op return or for ▶/◀ without an expanded video (C-R13-02)', async () => {
    const { api, view, status } = await mountFloatWorkspace();
    act(() => live(api).setStatus('სტატუსის საწყისი ტექსტი'));
    const event = pressEscapeOnWindow({ prevent: false });
    expect(event.defaultPrevented).toBe(false);
    expect(status.textContent).toBe('სტატუსის საწყისი ტექსტი');
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expect(status.textContent).toBe('სტატუსის საწყისი ტექსტი');
    fireEvent.click(view.getByTestId('arrangement-library-expand'));
    expect(status.textContent).toBe('სტატუსის საწყისი ტექსტი');
  });

  it('keeps the ◀ status text, not a return text, when ◀ collapses an expanded video', async () => {
    const { view, status, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    fireEvent.click(expand());
    flushFrames();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expect(status.textContent).toBe(LIBRARY_COLLAPSED_TEXT);
  });

  const PLACED_INSET = `${153 + 16}px`;

  function libraryInsetTargets(view: ReturnType<typeof render>): HTMLElement[] {
    return [
      view.getByTestId('arrangement-library-tree'),
      view.getByTestId('arrangement-library-list'),
    ];
  }

  function expectLibraryInset(view: ReturnType<typeof render>, inset: string) {
    for (const target of libraryInsetTargets(view)) {
      expect(target.style.paddingBottom).toBe(inset);
      expect(target.style.scrollPaddingBottom).toBe(inset);
    }
  }

  function expectNoLibraryStyleAttribute(view: ReturnType<typeof render>) {
    for (const target of libraryInsetTargets(view)) {
      expect(target.hasAttribute('style')).toBe(false);
    }
  }

  it('pads the library tree and list by the box height + 16 while expanded (D-29f, C-R14-01)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    expectNoLibraryStyleAttribute(view);
    fireEvent.click(expand());
    expect(box.dataset.videoFloating).toBe('true');
    expect(placedRect(box).height).toBe(153);
    expectLibraryInset(view, PLACED_INSET);
  });

  it('keeps the inset at 0 while the box waits for placement after a temporary opening (D-29f)', async () => {
    const { view, library, box, expand } = await mountFloatWorkspace();
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(box.dataset.videoExpanded).toBe('true');
    expect(box.dataset.videoFloating).toBe('false');
    expectNoLibraryStyleAttribute(view);
    flushFrames();
    expect(box.dataset.videoFloating).toBe('true');
    expectLibraryInset(view, PLACED_INSET);
  });

  it('keeps the inset unchanged while the box is dragged or moved with arrows (D-29f)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    fireEvent.pointerDown(box, { ...press, pointerId: 7, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 300, clientY: 250 });
    expectLibraryInset(view, PLACED_INSET);
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 300, clientY: 250 });
    const handle = view.getByTestId('arrangement-video-drag');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(boxRect(box)).toEqual({ left: 224, top: PLACED_TOP + 84, width: 272 });
    expectLibraryInset(view, PLACED_INSET);
  });

  const insetReturnPaths: ReadonlyArray<[string, 'close' | 'escape']> = [
    ['✕', 'close'],
    ['Esc', 'escape'],
  ];

  it.each(
    insetReturnPaths,
  )('clears every inline inset declaration after %s (D-29f, R15-P3)', async (_label, path) => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expectLibraryInset(view, PLACED_INSET);
    if (path === 'close') {
      fireEvent.click(view.getByTestId('arrangement-video-close'));
    } else {
      pressEscapeOnWindow({ prevent: false });
    }
    expectCompact(view, box);
    for (const target of libraryInsetTargets(view)) {
      expect(target.style.cssText).toBe('');
      expect(target.style.paddingBottom).toBe('');
      expect(target.style.scrollPaddingBottom).toBe('');
    }
  });

  it('renders the tree and list without a style attribute after ◀ and ▶ from an expanded video (D-29f, R15-P3)', async () => {
    const { view, box, expand } = await mountFloatWorkspace();
    fireEvent.click(expand());
    expectLibraryInset(view, PLACED_INSET);
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expectCompact(view, box);
    expect(view.queryByTestId('arrangement-library-tree')).toBeNull();
    fireEvent.click(view.getByTestId('arrangement-library-expand'));
    expectNoLibraryStyleAttribute(view);
  });
});
