import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

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

const dockCollection: WorkspaceCollection = {
  id: 'dock',
  label: 'dock',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'dock', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function dockArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

const LIBRARY_RECT = { left: 0, top: 84, width: 288, height: 767 };
const LIBRARY_BODY_RECT = { left: 0, top: 233, width: 288, height: 451 };

function mockLibraryLayoutRects() {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.getAttribute('data-testid') === 'arrangement-library') {
      const { left, top, width, height } = LIBRARY_RECT;
      return new DOMRect(left, top, width, height);
    }
    if (this.firstElementChild?.getAttribute('data-testid') === 'arrangement-library-tree') {
      const { left, top, width, height } = LIBRARY_BODY_RECT;
      return new DOMRect(left, top, width, height);
    }
    return original.call(this);
  });
}

interface DockApiRef {
  current: ArrangementContextValue | null;
}

function DockProbe({ api }: { api: DockApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: DockApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountDockWorkspace() {
  const api: DockApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={dockCollection} initialArrangement={dockArrangement()}>
      <StudioWorkspace />
      <DockProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  mockLibraryLayoutRects();
  return { api, view };
}

describe('video dock English copy (V-0.5c)', () => {
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
    probeVideoMock.mockReset();
    decodeVideoMock.mockReset();
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

  it('VDS1: the compact dock without video shows the exact English names, captions and labels', async () => {
    const { view } = await mountDockWorkspace();
    const dock = view.getByRole('region', { name: 'Video' });
    expect(dock.getAttribute('data-testid')).toBe('arrangement-video-dock');
    const caption = view.getByTestId('arrangement-video-caption');
    const overviewLabel = caption.previousElementSibling;
    expect(overviewLabel?.textContent).toBe('Arrangement · Overview');
    expect(caption.textContent).toBe('Video · sound from the video track (M/S/Volume)');
    expect(view.getByText('No video added yet')).toBeTruthy();
    const expand = view.getByRole('button', { name: 'Expand video' });
    expect(expand.getAttribute('title')).toBe('Expand video');
    const videos = view.getAllByTestId('arrangement-video');
    expect(videos.map((video) => video.getAttribute('aria-label'))).toEqual([
      'Video preview',
      'Video preview (standby)',
    ]);
    expect(videos.map((video) => video.dataset.videoRole)).toEqual(['active', 'standby']);
    view.unmount();
  });

  it('VDS2: the expanded video shows the English placeholder, return, drag and close copy; Escape restores Expand video', async () => {
    const { view } = await mountDockWorkspace();
    fireEvent.click(view.getByRole('button', { name: 'Expand video' }));
    const placeholder = view.getByTestId('arrangement-video-placeholder');
    expect(placeholder.textContent).toContain('Video expanded');
    const returnButtons = view.getAllByRole('button', {
      name: 'Return the video to the compact view',
    });
    expect(returnButtons).toHaveLength(2);
    const placeholderReturn = view.getByTestId('arrangement-video-placeholder-return');
    expect(returnButtons).toContain(placeholderReturn);
    expect(returnButtons).toContain(view.getByTestId('arrangement-video-expand'));
    expect(placeholderReturn.textContent).toBe('Return');
    const drag = view.getByRole('button', { name: 'Move the video (arrow keys: 16 px)' });
    expect(drag).toBe(view.getByTestId('arrangement-video-drag'));
    expect(drag.getAttribute('title')).toBe('Move the video');
    const close = view.getByRole('button', { name: 'Close the expanded video' });
    expect(close).toBe(view.getByTestId('arrangement-video-close'));
    expect(close.getAttribute('title')).toBe('Close (Esc)');
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    const toggle = view.getByTestId('arrangement-video-expand');
    expect(toggle.getAttribute('aria-label')).toBe('Expand video');
    expect(toggle.getAttribute('title')).toBe('Expand video');
    expect(view.queryByTestId('arrangement-video-placeholder')).toBeNull();
    view.unmount();
  });

  it('LVD1: the dock float buttons carry lucide icons instead of ⠿ ⤢ ✕ glyphs (D-29z128)', async () => {
    const { view } = await mountDockWorkspace();
    const glyphs = /[⠿⤢✕]/u;
    const expectSingleIcon = (testId: string, lucideClass: string) => {
      const button = view.getByTestId(testId);
      const icons = button.querySelectorAll('svg');
      expect(icons, testId).toHaveLength(1);
      const icon = icons[0];
      expect(icon.classList.contains(lucideClass), testId).toBe(true);
      expect(icon.getAttribute('aria-hidden'), testId).toBe('true');
      expect(icon.classList.contains('size-2.5'), testId).toBe(true);
      expect(icon.classList.contains('shrink-0'), testId).toBe(true);
      expect(icon.getAttribute('stroke-width'), testId).toBe('2.4');
      expect(button.textContent, testId).toBe('');
      return button;
    };
    const dock = view.getByTestId('arrangement-video-dock');
    const compactExpand = expectSingleIcon('arrangement-video-expand', 'lucide-maximize-2');
    expect(compactExpand.getAttribute('aria-label')).toBe('Expand video');
    expect(compactExpand.getAttribute('title')).toBe('Expand video');
    expect(dock.textContent).not.toMatch(glyphs);
    fireEvent.click(compactExpand);
    const drag = expectSingleIcon('arrangement-video-drag', 'lucide-grip-vertical');
    const expand = expectSingleIcon('arrangement-video-expand', 'lucide-maximize-2');
    const close = expectSingleIcon('arrangement-video-close', 'lucide-x');
    expect(view.getByRole('button', { name: 'Move the video (arrow keys: 16 px)' })).toBe(drag);
    expect(drag.getAttribute('title')).toBe('Move the video');
    expect(expand.getAttribute('aria-label')).toBe('Return the video to the compact view');
    expect(expand.getAttribute('title')).toBe('Return the video to the compact view');
    expect(view.getByRole('button', { name: 'Close the expanded video' })).toBe(close);
    expect(close.getAttribute('title')).toBe('Close (Esc)');
    expect(dock.textContent).not.toMatch(glyphs);
    view.unmount();
  });

  it('VDS3: a rejected video play stops the transport with the exact English failure status', async () => {
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    decodeVideoMock.mockResolvedValue({ buffer: null, reason: 'no-audio' });
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(4);
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')));
    const { api, view } = await mountDockWorkspace();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
    });
    await waitFor(() => {
      expect(live(api).videoSources.size).toBe(1);
      expect(live(api).arrangement.clips).toHaveLength(1);
    });
    expect(live(api).getLivePosition()).toBe(0);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    await waitFor(() => {
      flushFrames();
      expect(playSpy).toHaveBeenCalled();
      expect(view.getByTestId('arrangement-status').textContent).toBe(
        'Video playback failed — try MP4 (H.264) or WebM.',
      );
    });
    expect(live(api).status).toBe('Video playback failed — try MP4 (H.264) or WebM.');
    expect(live(api).isPlaying).toBe(false);
    view.unmount();
  });
});

describe('V-3c-4c-3 video dock button radius (D-29z136)', () => {
  const FLOAT_INCLUDES = [
    'rounded-md',
    'bg-background/80',
    'hover:text-foreground',
    'h-6',
    'w-6',
    'focus-visible:ring-brand',
  ];
  const FLOAT_EXCLUDES = ['rounded-sm', 'bg-foreground/5'];

  function dockClassTokens(element: HTMLElement) {
    return element.className.split(/\s+/).filter((token) => token.length > 0);
  }

  function expectDockTokens(
    element: HTMLElement,
    label: string,
    includes: string[],
    excludes: string[],
  ) {
    const tokens = dockClassTokens(element);
    for (const token of includes) {
      expect(tokens.includes(token), `${label} includes ${token}`).toBe(true);
    }
    for (const token of excludes) {
      expect(tokens.includes(token), `${label} excludes ${token}`).toBe(false);
    }
    return tokens;
  }

  function expectFloatButton(element: HTMLElement, label: string) {
    const tokens = expectDockTokens(element, label, FLOAT_INCLUDES, FLOAT_EXCLUDES);
    expect(
      tokens.filter((token) => token.startsWith('motion-')),
      `${label} has no motion token`,
    ).toEqual([]);
  }

  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    probeVideoMock.mockReset();
    decodeVideoMock.mockReset();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
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

  it('VFR1: the dock float buttons and the placeholder Return take the 8 px radius only and keep their dark background, hover text and size', async () => {
    const { view } = await mountDockWorkspace();
    try {
      expectFloatButton(view.getByTestId('arrangement-video-expand'), 'compact expand');
      fireEvent.click(view.getByRole('button', { name: 'Expand video' }));
      expectFloatButton(view.getByTestId('arrangement-video-drag'), 'floating drag');
      expectFloatButton(view.getByTestId('arrangement-video-expand'), 'floating expand');
      expectFloatButton(view.getByTestId('arrangement-video-close'), 'floating close');
      const returnTokens = expectDockTokens(
        view.getByTestId('arrangement-video-placeholder-return'),
        'placeholder return',
        ['rounded-md', 'hover:bg-elevated', 'px-2', 'py-0.5'],
        ['rounded-sm', 'bg-foreground/5'],
      );
      expect(
        returnTokens.filter((token) => token.startsWith('motion-')),
        'placeholder return has no motion token',
      ).toEqual([]);
    } finally {
      view.unmount();
    }
  });
});
