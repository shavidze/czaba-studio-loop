import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementLibrary } from '~/components/arrangement/ArrangementLibrary';
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

const handoffCollection: WorkspaceCollection = {
  id: 'handoff',
  label: 'handoff',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'handoff', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'handoff', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function handoffArrangement(): Arrangement {
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

interface HandoffApiRef {
  current: ArrangementContextValue | null;
}

function HandoffProbe({ api }: { api: HandoffApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: HandoffApiRef): ArrangementContextValue {
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

async function mountHandoffWorkspace() {
  const api: HandoffApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={handoffCollection} initialArrangement={handoffArrangement()}>
      <StudioWorkspace />
      <HandoffProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  mockLibraryLayoutRects();
  act(() => live(api).selectSource('song'));
  const library = view.getByTestId('arrangement-library');
  const collapse = () =>
    asButton(view.queryByTestId('arrangement-library-collapse'), 'library collapse');
  const expand = () => asButton(view.queryByTestId('arrangement-library-expand'), 'library expand');
  const search = () => {
    const input = view.getByTestId('arrangement-library-search');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('library search missing');
    }
    return input;
  };
  const play = () => asButton(view.getByLabelText('Play'), 'Play');
  const videoExpand = () => asButton(view.getByTestId('arrangement-video-expand'), 'video expand');
  const clipCount = () => live(api).arrangement.clips.length;
  const clipElementCount = () => view.container.querySelectorAll('[data-clip-id]').length;
  return {
    api,
    view,
    library,
    collapse,
    expand,
    search,
    play,
    videoExpand,
    clipCount,
    clipElementCount,
  };
}

function pressEnterOnActiveElement(options: { repeat: boolean }): boolean {
  const target = document.activeElement ?? document.body;
  let notPrevented = true;
  act(() => {
    notPrevented = fireEvent.keyDown(target, { key: 'Enter', repeat: options.repeat });
  });
  return notPrevented;
}

function pressEscapeOnWindow() {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
  });
}

function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function BareLibraryHost({ refocusPlayBeforeChange }: { refocusPlayBeforeChange: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <>
      <button type="button" data-testid="host-play">
        Play
      </button>
      <ArrangementLibrary
        isCollapsed={isCollapsed}
        onCollapsedChange={(collapsed) => {
          if (refocusPlayBeforeChange) {
            document.querySelector<HTMLButtonElement>('[data-testid="host-play"]')?.focus();
          }
          setIsCollapsed(collapsed);
        }}
      />
    </>
  );
}

async function mountBareLibrary(refocusPlayBeforeChange: boolean) {
  const view = render(
    <ArrangementProvider collection={handoffCollection} initialArrangement={handoffArrangement()}>
      <BareLibraryHost refocusPlayBeforeChange={refocusPlayBeforeChange} />
    </ArrangementProvider>,
  );
  await settle();
  return view;
}

describe('library ◀ / ▶ / × keep keyboard focus (B-R108-LIB-FOCUS-LOSS, D-29z75)', () => {
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
    blurActiveElement();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('LF0: the harness arms the hazard — Enter on BODY adds the selected source as a clip', async () => {
    const { api, clipCount, clipElementCount } = await mountHandoffWorkspace();
    expect(live(api).selectedSourceId).toBe('song');
    expect(document.activeElement).toBe(document.body);
    const before = clipCount();
    const elementsBefore = clipElementCount();
    pressEnterOnActiveElement({ repeat: false });
    expect(clipCount()).toBe(before + 1);
    expect(clipElementCount()).toBe(elementsBefore + 1);
  });

  it('LF1: a focused ◀ click collapses the library and focuses ▶', async () => {
    const { library, collapse, expand } = await mountHandoffWorkspace();
    collapse().focus();
    expect(document.activeElement).toBe(collapse());
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(expand());
  });

  it('LF2: a focused ▶ click expands the library and focuses ◀', async () => {
    const { library, collapse, expand } = await mountHandoffWorkspace();
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    expand().focus();
    expect(document.activeElement).toBe(expand());
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(document.activeElement).toBe(collapse());
  });

  it('LF3: a focused × click clears the query, removes × and focuses the search input', async () => {
    const { view, search } = await mountHandoffWorkspace();
    fireEvent.change(search(), { target: { value: 'so' } });
    expect(search().value).toBe('so');
    const clear = asButton(view.queryByTestId('arrangement-library-search-clear'), 'search clear');
    clear.focus();
    expect(document.activeElement).toBe(clear);
    fireEvent.click(clear);
    expect(search().value).toBe('');
    expect(view.queryByTestId('arrangement-library-search-clear')).toBe(null);
    expect(clear.isConnected).toBe(false);
    expect(document.activeElement).toBe(search());
  });

  it('LF4: an Enter after a focused ◀, ▶ or × click adds no clip', async () => {
    const { view, library, collapse, expand, search, clipCount, clipElementCount } =
      await mountHandoffWorkspace();
    const before = clipCount();
    const elementsBefore = clipElementCount();
    expect(elementsBefore).toBe(before);
    collapse().focus();
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    pressEnterOnActiveElement({ repeat: false });
    expect(clipCount()).toBe(before);
    expect(clipElementCount()).toBe(elementsBefore);
    expand().focus();
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    pressEnterOnActiveElement({ repeat: false });
    expect(clipCount()).toBe(before);
    expect(clipElementCount()).toBe(elementsBefore);
    fireEvent.change(search(), { target: { value: 'so' } });
    const clear = asButton(view.queryByTestId('arrangement-library-search-clear'), 'search clear');
    clear.focus();
    fireEvent.click(clear);
    expect(search().value).toBe('');
    pressEnterOnActiveElement({ repeat: false });
    expect(clipCount()).toBe(before);
    expect(clipElementCount()).toBe(elementsBefore);
  });

  it('LF5: ◀ and ▶ clicked while Play holds focus leave focus on Play', async () => {
    const { library, collapse, expand, play } = await mountHandoffWorkspace();
    play().focus();
    expect(document.activeElement).toBe(play());
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(play());
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(document.activeElement).toBe(play());
  });

  it('LF5b: ◀ and ▶ clicked with nothing focused leave focus on BODY', async () => {
    const { library, collapse, expand } = await mountHandoffWorkspace();
    blurActiveElement();
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(expand());
    expect(library.dataset.collapsed).toBe('false');
    expect(document.activeElement).toBe(document.body);
  });

  it('LF6: the video ⤢ opening and the return re-collapsing the library never move focus to ◀ or ▶', async () => {
    const { library, collapse, expand, play, videoExpand } = await mountHandoffWorkspace();
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    play().focus();
    fireEvent.click(videoExpand());
    expect(library.dataset.collapsed).toBe('false');
    expect(document.activeElement).toBe(play());
    flushFrames();
    expect(document.activeElement).toBe(play());
    fireEvent.click(videoExpand());
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(play());
    play().focus();
    fireEvent.click(videoExpand());
    expect(library.dataset.collapsed).toBe('false');
    flushFrames();
    pressEscapeOnWindow();
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(play());
    expect(document.activeElement === expand()).toBe(false);
  });

  it('LF7: when the parent moves focus elsewhere before the commit, ◀ does not steal it back for ▶', async () => {
    const view = await mountBareLibrary(true);
    const hostPlay = asButton(view.getByTestId('host-play'), 'host play');
    const collapse = asButton(view.queryByTestId('arrangement-library-collapse'), 'collapse');
    collapse.focus();
    expect(document.activeElement).toBe(collapse);
    fireEvent.click(collapse);
    expect(view.getByTestId('arrangement-library').dataset.collapsed).toBe('true');
    const expand = asButton(view.queryByTestId('arrangement-library-expand'), 'expand');
    expect(document.activeElement).toBe(hostPlay);
    expect(document.activeElement === expand).toBe(false);
  });

  it('LF8: a repeated Enter is prevented on ◀, ▶ and ×; a fresh Enter and a repeated Space are not', async () => {
    const view = await mountBareLibrary(false);
    const collapse = () => asButton(view.queryByTestId('arrangement-library-collapse'), 'collapse');
    const expand = () => asButton(view.queryByTestId('arrangement-library-expand'), 'expand');
    expect(fireEvent.keyDown(collapse(), { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(collapse(), { key: 'Enter', repeat: false })).toBe(true);
    expect(fireEvent.keyDown(collapse(), { key: ' ', repeat: true })).toBe(true);
    fireEvent.change(view.getByTestId('arrangement-library-search'), { target: { value: 'so' } });
    const clear = asButton(view.queryByTestId('arrangement-library-search-clear'), 'search clear');
    expect(fireEvent.keyDown(clear, { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(clear, { key: 'Enter', repeat: false })).toBe(true);
    expect(fireEvent.keyDown(clear, { key: ' ', repeat: true })).toBe(true);
    fireEvent.click(collapse());
    expect(view.getByTestId('arrangement-library').dataset.collapsed).toBe('true');
    expect(fireEvent.keyDown(expand(), { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(expand(), { key: 'Enter', repeat: false })).toBe(true);
    expect(fireEvent.keyDown(expand(), { key: ' ', repeat: true })).toBe(true);
  });

  it('LF9: after a focused ◀ click a held Enter on ▶ is prevented and the library stays collapsed', async () => {
    const { library, collapse, expand, clipCount } = await mountHandoffWorkspace();
    const before = clipCount();
    collapse().focus();
    fireEvent.click(collapse());
    expect(document.activeElement).toBe(expand());
    expect(pressEnterOnActiveElement({ repeat: true })).toBe(false);
    expect(library.dataset.collapsed).toBe('true');
    expect(document.activeElement).toBe(expand());
    expect(clipCount()).toBe(before);
  });

  it('LF10: a focused ◀ click while the video floats hands focus to ▶, not to ⤢ or BODY', async () => {
    const { view, library, collapse, expand, videoExpand } = await mountHandoffWorkspace();
    fireEvent.click(videoExpand());
    flushFrames();
    expect(view.getByTestId('arrangement-video-box').dataset.videoFloating).toBe('true');
    collapse().focus();
    fireEvent.click(collapse());
    expect(library.dataset.collapsed).toBe('true');
    expect(view.getByTestId('arrangement-video-box').dataset.videoExpanded).toBe('false');
    expect(document.activeElement).toBe(expand());
  });

  it('LF11: the ◀ / ▶ handoff focuses the partner without scrolling the library', async () => {
    const { collapse, expand } = await mountHandoffWorkspace();
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    collapse().focus();
    focusSpy.mockClear();
    fireEvent.click(collapse());
    expect(document.activeElement).toBe(expand());
    expect(focusSpy.mock.calls).toEqual([[{ preventScroll: true }]]);
    focusSpy.mockClear();
    fireEvent.click(expand());
    expect(document.activeElement).toBe(collapse());
    expect(focusSpy.mock.calls).toEqual([[{ preventScroll: true }]]);
  });
});
