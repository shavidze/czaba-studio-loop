import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
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

const videoReturnCollection: WorkspaceCollection = {
  id: 'video-return',
  label: 'video-return',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'video-return', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'video-return', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function videoReturnArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 8 },
      { id: 'video-1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
    ],
  };
}

const LIBRARY_RECT = { left: 0, top: 84, width: 288, height: 767 };
const LIBRARY_BODY_RECT = { left: 0, top: 233, width: 288, height: 451 };

function mockLibraryLayoutRects() {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.getAttribute('data-testid') === 'arrangement-library') {
      return new DOMRect(
        LIBRARY_RECT.left,
        LIBRARY_RECT.top,
        LIBRARY_RECT.width,
        LIBRARY_RECT.height,
      );
    }
    if (this.firstElementChild?.getAttribute('data-testid') === 'arrangement-library-tree') {
      return new DOMRect(
        LIBRARY_BODY_RECT.left,
        LIBRARY_BODY_RECT.top,
        LIBRARY_BODY_RECT.width,
        LIBRARY_BODY_RECT.height,
      );
    }
    return original.call(this);
  });
}

interface VideoReturnApiRef {
  current: ArrangementContextValue | null;
}

function VideoReturnProbe({ api }: { api: VideoReturnApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: VideoReturnApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function asButton(element: Element | null, name: string): HTMLButtonElement {
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`button ${name} missing`);
  }
  return element;
}

async function mountVideoReturnWorkspace() {
  const api: VideoReturnApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={videoReturnCollection}
      initialArrangement={videoReturnArrangement()}
    >
      <StudioWorkspace />
      <VideoReturnProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  mockLibraryLayoutRects();
  act(() => live(api).selectSource('song'));
  const library = view.getByTestId('arrangement-library');
  const box = view.getByTestId('arrangement-video-box');
  const collapse = () =>
    asButton(view.queryByTestId('arrangement-library-collapse'), 'library collapse');
  const expand = () => asButton(view.queryByTestId('arrangement-library-expand'), 'library expand');
  const selectedOption = () =>
    asButton(view.container.querySelector('[role="option"][aria-selected="true"]'), 'option');
  const search = () => {
    const input = view.getByTestId('arrangement-library-search');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('library search missing');
    }
    return input;
  };
  const play = () => asButton(view.getByLabelText('Play'), 'Play');
  const videoExpand = () => asButton(view.getByTestId('arrangement-video-expand'), 'video expand');
  const videoClose = () => asButton(view.queryByTestId('arrangement-video-close'), 'video close');
  const clipCount = () => live(api).arrangement.clips.length;
  const clipElementCount = () => view.container.querySelectorAll('[data-clip-id]').length;
  return {
    api,
    library,
    box,
    collapse,
    expand,
    selectedOption,
    search,
    play,
    videoExpand,
    videoClose,
    clipCount,
    clipElementCount,
  };
}

function pressKeyOnActiveElement(key: string) {
  const target = document.activeElement ?? document.body;
  act(() => {
    fireEvent.keyDown(target, { key });
  });
}

function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

describe('Escape returning the floating video keeps focus in the library (C-R110-01, D-29z76)', () => {
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

  async function mountOpenedForVideo() {
    const workspace = await mountVideoReturnWorkspace();
    expect(live(workspace.api).selectedSourceId).toBe('song');
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(workspace.collapse());
    expect(workspace.library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(workspace.videoExpand());
    expect(workspace.library.dataset.collapsed).toBe('false');
    flushFrames();
    expect(workspace.box.dataset.videoExpanded).toBe('true');
    expect(workspace.box.dataset.videoFloating).toBe('true');
    return workspace;
  }

  function expectDockedAndCollapsed(workspace: Awaited<ReturnType<typeof mountOpenedForVideo>>) {
    expect(workspace.box.dataset.videoExpanded).toBe('false');
    expect(workspace.box.dataset.videoFloating).toBe('false');
    expect(workspace.library.dataset.collapsed).toBe('true');
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
    blurActiveElement();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('VR0: with focus on BODY, Escape leaves focus on BODY and the armed Enter adds one clip', async () => {
    const workspace = await mountOpenedForVideo();
    blurActiveElement();
    expect(document.activeElement).toBe(document.body);
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    expect(document.activeElement).toBe(document.body);
    const before = workspace.clipCount();
    const elementsBefore = workspace.clipElementCount();
    expect(elementsBefore).toBe(before);
    pressKeyOnActiveElement('Enter');
    expect(workspace.clipCount()).toBe(before + 1);
    expect(workspace.clipElementCount()).toBe(elementsBefore + 1);
  });

  it('VR1: Escape from a focused ◀ docks the video, collapses the library and focuses ▶', async () => {
    const workspace = await mountOpenedForVideo();
    workspace.collapse().focus();
    expect(document.activeElement).toBe(workspace.collapse());
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    expect(document.activeElement).toBe(workspace.expand());
  });

  it('VR2: Escape from the focused selected option focuses ▶', async () => {
    const workspace = await mountOpenedForVideo();
    workspace.selectedOption().focus();
    expect(document.activeElement).toBe(workspace.selectedOption());
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    expect(document.activeElement).toBe(workspace.expand());
  });

  it('VR3a: an Enter after the Escape from ◀ adds no clip', async () => {
    const workspace = await mountOpenedForVideo();
    const before = workspace.clipCount();
    const elementsBefore = workspace.clipElementCount();
    expect(elementsBefore).toBe(before);
    workspace.collapse().focus();
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    pressKeyOnActiveElement('Enter');
    expect(workspace.clipCount()).toBe(before);
    expect(workspace.clipElementCount()).toBe(elementsBefore);
  });

  it('VR3b: an Enter after the Escape from the selected option adds no clip', async () => {
    const workspace = await mountOpenedForVideo();
    const before = workspace.clipCount();
    const elementsBefore = workspace.clipElementCount();
    expect(elementsBefore).toBe(before);
    workspace.selectedOption().focus();
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    pressKeyOnActiveElement('Enter');
    expect(workspace.clipCount()).toBe(before);
    expect(workspace.clipElementCount()).toBe(elementsBefore);
  });

  it('VR4: Escape with Play focused leaves focus on Play', async () => {
    const workspace = await mountOpenedForVideo();
    workspace.play().focus();
    expect(document.activeElement).toBe(workspace.play());
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    expect(document.activeElement).toBe(workspace.play());
  });

  it('VR4b: Escape with the float ✕ focused returns focus to ⤢, not to ▶', async () => {
    const workspace = await mountOpenedForVideo();
    workspace.videoClose().focus();
    expect(document.activeElement).toBe(workspace.videoClose());
    pressKeyOnActiveElement('Escape');
    expectDockedAndCollapsed(workspace);
    expect(document.activeElement).toBe(workspace.videoExpand());
  });

  it('VR5: Escape in the search input clears the query, keeps focus there and the video floating', async () => {
    const workspace = await mountOpenedForVideo();
    workspace.search().focus();
    fireEvent.change(workspace.search(), { target: { value: 'so' } });
    expect(workspace.search().value).toBe('so');
    pressKeyOnActiveElement('Escape');
    expect(workspace.search().value).toBe('');
    expect(document.activeElement).toBe(workspace.search());
    expect(workspace.box.dataset.videoExpanded).toBe('true');
    expect(workspace.box.dataset.videoFloating).toBe('true');
    expect(workspace.library.dataset.collapsed).toBe('false');
  });

  it('VR6: when the library was not opened for the video, Escape keeps it expanded and focus on the option', async () => {
    const workspace = await mountVideoReturnWorkspace();
    fireEvent.click(workspace.videoExpand());
    flushFrames();
    expect(workspace.box.dataset.videoFloating).toBe('true');
    expect(workspace.library.dataset.collapsed).toBe('false');
    const option = workspace.selectedOption();
    option.focus();
    pressKeyOnActiveElement('Escape');
    expect(workspace.box.dataset.videoExpanded).toBe('false');
    expect(workspace.box.dataset.videoFloating).toBe('false');
    expect(workspace.library.dataset.collapsed).toBe('false');
    expect(option.isConnected).toBe(true);
    expect(document.activeElement).toBe(option);
  });

  it('VR7: the rescue focuses ▶ once, with preventScroll', async () => {
    const workspace = await mountOpenedForVideo();
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    workspace.collapse().focus();
    focusSpy.mockClear();
    pressKeyOnActiveElement('Escape');
    expect(document.activeElement).toBe(workspace.expand());
    expect(focusSpy.mock.calls).toEqual([[{ preventScroll: true }]]);
  });
});
