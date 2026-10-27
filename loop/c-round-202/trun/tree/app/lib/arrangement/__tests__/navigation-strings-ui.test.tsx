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

const navigationCollection: WorkspaceCollection = {
  id: 'navigation',
  label: 'navigation',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'navigation', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function navigationArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 8 },
    ],
  };
}

const MUSIC_RANGE = { start: 3, end: 5, trackId: 'music' };

interface NavigationApiRef {
  current: ArrangementContextValue | null;
}

function NavigationProbe({ api }: { api: NavigationApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: NavigationApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function asElement(element: Element | null | undefined, name: string): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${name} missing`);
  }
  return element;
}

async function mountNavigationWorkspace() {
  const api: NavigationApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={navigationCollection}
      initialArrangement={navigationArrangement()}
    >
      <StudioWorkspace />
      <NavigationProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const toolbar = asElement(
    view.getByRole('button', { name: 'Play' }).parentElement,
    'transport toolbar',
  );
  const toolbarButton = (prefix: string) =>
    asElement(
      Array.from(toolbar.querySelectorAll('button')).find((button) =>
        button.textContent?.trim().startsWith(prefix),
      ),
      `transport button ${prefix}`,
    );
  return {
    api,
    view,
    backToStart: () => asElement(toolbar.querySelectorAll('button')[1], 'back to start'),
    split: () => toolbarButton('Split'),
    remove: () => toolbarButton('Delete'),
    loop: () => toolbarButton('Loop'),
    follow: () => view.getByTestId('arrangement-follow'),
    zoomSlider: () => view.getByTestId('arrangement-zoom'),
    zoomToSelection: () => view.getByTestId('arrangement-zoom-range'),
    zoomBack: () => view.getByTestId('arrangement-zoom-back'),
    fit: () => view.getByTestId('arrangement-fit'),
    status: () => view.getByTestId('arrangement-status').textContent,
    pressKey: (key: string, code: string) => {
      fireEvent.keyDown(document.body, { key, code });
    },
  };
}

describe('transport and navigation texts in the real workspace (V-0.3b, D-29z100)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
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

  it('NS1 without a time selection the transport, tempo field and metronome read in English', async () => {
    const workspace = await mountNavigationWorkspace();
    const { api, view } = workspace;
    expect(workspace.backToStart().getAttribute('aria-label')).toBe('Back to start');
    expect(workspace.backToStart().title).toBe('Back to start (0)');
    const projectEnd = view.getByTestId('arrangement-project-end');
    expect(projectEnd.textContent).toBe('00:10.000');
    expect(asElement(projectEnd.parentElement, 'project end').textContent).toBe('/ end 00:10.000');
    expect(workspace.split().title).toBe('Split at the playhead (Ctrl/Cmd+E)');
    act(() => live(api).selectClip('music-1'));
    expect(workspace.remove().title).toBe('Delete clip — leaves a gap (Delete)');
    expect(workspace.remove().getAttribute('aria-label')).toBe(
      'Delete — the selected clip; leaves a gap',
    );
    expect(workspace.remove().textContent).toBe('Delete');
    expect(workspace.follow().dataset.followMode).toBe('on');
    expect(workspace.follow().title).toBe('Follow: the view follows the playback position');
    expect(workspace.zoomSlider().getAttribute('aria-label')).toBe('Zoom (px/s)');
    expect(workspace.zoomSlider().title).toBe('Zoom around the playhead · + / − · Ctrl+wheel');
    expect(workspace.zoomToSelection().getAttribute('aria-label')).toBe('Zoom to selection (Z)');
    expect(workspace.zoomToSelection().title).toBe(
      'Zoom to selection: make a time selection first (Z)',
    );
    expect(workspace.zoomBack().title).toBe(
      'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
    );
    expect(workspace.fit().title).toBe(
      'Fit — the entire project is visible (double-click the ruler or the overview)',
    );
    const tempo = view.getByTestId('arrangement-tempo-input');
    expect(tempo.getAttribute('aria-label')).toBe('Project tempo (BPM)');
    expect(tempo.title).toBe(
      'Project tempo — bars grid only; audio is not stretched (no time-stretch). Enter — save · Esc — cancel · empty — hide the bars',
    );
    expect(view.getByTestId('arrangement-metronome-toggle').textContent).toBe('Metronome');
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    act(() => live(api).toggleLoopSelection());
    act(() => live(api).setTimeRange(null));
    expect(live(api).arrangement.loop).not.toBeNull();
    expect(live(api).range).toBeNull();
    expect(workspace.loop().title).toBe('Loop on / off (Ctrl/Cmd+L)');
  });

  it('NS2 a one-track and an all-tracks time selection switch the Split, Delete, Loop and Zoom texts', async () => {
    const workspace = await mountNavigationWorkspace();
    const { api } = workspace;
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    expect(workspace.split().title).toBe('Split at both edges of the time selection (Ctrl/Cmd+E)');
    expect(workspace.remove().title).toBe(
      'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
    );
    expect(workspace.remove().getAttribute('aria-label')).toBe(
      'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
    );
    expect(workspace.loop().title).toBe('Loop the time selection (Ctrl/Cmd+L)');
    expect(workspace.zoomToSelection().title).toBe('Zoom to the time selection (Z)');
    act(() => live(api).extendRangeToAllTracks());
    expect(live(api).range?.allTracks).toBe(true);
    expect(workspace.remove().title).toBe(
      'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
    );
    expect(workspace.remove().getAttribute('aria-label')).toBe(
      'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
    );
    expect(workspace.remove().textContent).toBe('Delete');
  });

  it('NS3 Z, X, Fit and Follow write their English statuses and switch the button titles', async () => {
    const workspace = await mountNavigationWorkspace();
    const { api } = workspace;
    workspace.pressKey('z', 'KeyZ');
    expect(workspace.status()).toBe('To zoom, make a time selection first.');
    workspace.pressKey('x', 'KeyX');
    expect(workspace.status()).toBe('The zoom history is empty — there is no view to go back to.');
    fireEvent.click(workspace.fit());
    expect(workspace.status()).toBe('Fit: the entire project is visible (00:10.000). X goes back.');
    expect(workspace.zoomBack().title).toBe('Back to the previous zoom (X)');
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    workspace.pressKey('z', 'KeyZ');
    expect(workspace.status()).toBe('Zoom to selection: 00:03.000 — 00:05.000. X goes back.');
    workspace.pressKey('x', 'KeyX');
    expect(workspace.status()).toBe('Previous view restored. X goes back one more step.');
    expect(workspace.zoomBack().title).toBe('Back to the previous zoom (X)');
    workspace.pressKey('x', 'KeyX');
    expect(workspace.status()).toBe('Previous view restored.');
    expect(workspace.zoomBack().title).toBe(
      'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
    );
    fireEvent.click(workspace.follow());
    expect(workspace.follow().dataset.followMode).toBe('off');
    expect(workspace.status()).toBe('Follow off: the view does not move by itself.');
    expect(workspace.follow().title).toBe('Follow off: the view does not follow playback');
    fireEvent.click(workspace.follow());
    expect(workspace.follow().dataset.followMode).toBe('on');
    expect(workspace.status()).toBe(
      'Follow on: the view follows the playback position during playback.',
    );
    expect(workspace.follow().title).toBe('Follow: the view follows the playback position');
  });

  it('NS3b a manual scroll during playback pauses Follow, and Follow resumes it with its own status', async () => {
    const workspace = await mountNavigationWorkspace();
    const { api, view } = workspace;
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    scroller.scrollLeft += 200;
    fireEvent.scroll(scroller);
    expect(workspace.follow().dataset.followMode).toBe('paused');
    expect(workspace.status()).toBe(
      'Follow paused by manual navigation. Follow or Play resumes it.',
    );
    expect(workspace.follow().title).toBe(
      'Follow paused by manual navigation — press Follow or Play',
    );
    fireEvent.click(workspace.follow());
    expect(workspace.follow().dataset.followMode).toBe('on');
    expect(workspace.status()).toBe('Follow is following the playback position again.');
    expect(workspace.follow().title).toBe('Follow: the view follows the playback position');
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);
  });

  it('NS4 the ruler, playhead, overview and loop brace read in English', async () => {
    const workspace = await mountNavigationWorkspace();
    const { api, view } = workspace;
    expect(view.getByTestId('arrangement-ruler').title).toBe(
      'Click = playhead · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection',
    );
    expect(view.getByTestId('arrangement-playhead-handle').title).toBe(
      'Playhead — drag · ←/→ = ±0.1 s',
    );
    const overview = view.getByTestId('arrangement-overview');
    expect(overview.getAttribute('aria-label')).toBe(
      'Overview — entire project (← → = 5 s, double-click = Fit)',
    );
    expect(overview.title).toBe(
      'Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit',
    );
    expect(overview.getAttribute('aria-valuetext')).toBe('Visible start 00:00.000 / 00:10.000');
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 1200 });
    act(() => live(api).setPxPerSecond(100));
    scroller.scrollLeft = 300;
    fireEvent.scroll(scroller);
    expect(overview.getAttribute('aria-valuetext')).toBe('Visible start 00:03.000 / 00:10.000');
    expect(view.getByTestId('arrangement-loop-strip').textContent).toBe(
      'Loop: make a time selection and press Loop (Ctrl+L)',
    );
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    act(() => live(api).toggleLoopSelection());
    const brace = view.getByTestId('arrangement-loop-brace');
    expect(brace.getAttribute('aria-label')).toBe(
      'Loop 00:03.000 — 00:05.000 · ← → nudge · Shift + ← → length',
    );
    expect(brace.title).toBe(
      'Loop 00:03.000 — 00:05.000 · the bar moves the loop; the edges change its length',
    );
    expect(view.getByTestId('arrangement-loop-start-edge').title).toBe('Loop start');
    expect(view.getByTestId('arrangement-loop-end-edge').title).toBe('Loop end');
  });
});
