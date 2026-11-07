import { act, fireEvent, render, within } from '@testing-library/react';
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
import { OVERVIEW_HIDDEN_STORAGE_KEY, setOverviewHidden } from '../overview-visibility';
import { studioViewStrings } from '../strings';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

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
  currentTime = 0;
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

const overviewCollection: WorkspaceCollection = {
  id: 'overview-visibility',
  label: 'overview-visibility',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'overview-visibility',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: () =>
    Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 })),
};

function emptyOverviewArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface OverviewApiRef {
  current: ArrangementContextValue | null;
}

function OverviewProbe({ api }: { api: OverviewApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: OverviewApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountOverviewWorkspace() {
  const api: OverviewApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={overviewCollection}
      initialArrangement={emptyOverviewArrangement()}
    >
      <StudioWorkspace />
      <OverviewProbe api={api} />
    </ArrangementProvider>,
  );
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  const overview = () => view.queryByTestId('arrangement-overview');
  const slot = () => view.queryByTestId('arrangement-overview-hidden-slot');
  const status = () => view.getByTestId('arrangement-status').textContent ?? '';
  return { api, view, overview, slot, status };
}

const TOGGLE = { key: 'o', code: 'KeyO', ctrlKey: true, altKey: true };

beforeEach(() => {
  window.localStorage.clear();
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
  act(() => setOverviewHidden(false));
  window.localStorage.clear();
});

describe('CALM-3 Overview empty state and Ctrl+Alt+O (SABA-B-8)', () => {
  it('OV-E1: an empty project shows the quiet state; the first clip shows the full view; undo returns', async () => {
    const { api, overview, view } = await mountOverviewWorkspace();
    const root = overview();
    expect(root?.getAttribute('data-overview-state')).toBe('empty');
    const baseline = view.getByTestId('arrangement-overview-baseline');
    expect(root?.children[0]).toBe(baseline);
    expect(root?.children[1]?.getAttribute('data-testid')).toBeNull();
    expect(root?.children[1]?.children).toHaveLength(2);
    act(() => live(api).addSourceToActiveTrack('song'));
    expect(live(api).arrangement.clips).toHaveLength(1);
    expect(overview()?.getAttribute('data-overview-state')).toBe('full');
    expect(view.queryByTestId('arrangement-overview-baseline')).toBeNull();
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(overview()?.getAttribute('data-overview-state')).toBe('empty');
    expect(view.queryByTestId('arrangement-overview-baseline')).not.toBeNull();
  });

  it('OV-E2: the empty Overview keeps its slider values and ← / → navigation', async () => {
    const { api, overview, view } = await mountOverviewWorkspace();
    const root = overview();
    if (!root) {
      throw new Error('overview missing');
    }
    expect(root.getAttribute('data-overview-state')).toBe('empty');
    expect(root.getAttribute('aria-valuenow')).toBe('0');
    expect(root.getAttribute('aria-valuemax')).toBe('10');
    expect(view.getByTestId('arrangement-overview-frame')).toBeDefined();
    expect(view.getByTestId('arrangement-overview-playhead')).toBeDefined();
    const scroller = view.getByTestId('arrangement-timeline-scroller');
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 1200 });
    act(() => live(api).setPxPerSecond(100));
    root.focus();
    expect(fireEvent.keyDown(root, { key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
    fireEvent.scroll(scroller);
    expect(root.getAttribute('aria-valuenow')).toBe('5');
    fireEvent.keyDown(root, { key: 'ArrowLeft', code: 'ArrowLeft' });
    fireEvent.scroll(scroller);
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });

  it('OV-T1: Ctrl+Alt+O hides the Overview into a slot, remembers it, and Cmd+Option+O shows it again', async () => {
    const { overview, slot, status } = await mountOverviewWorkspace();
    expect(overview()).not.toBeNull();
    expect(fireEvent.keyDown(document.body, TOGGLE)).toBe(false);
    expect(overview()).toBeNull();
    expect(slot()?.getAttribute('aria-hidden')).toBe('true');
    expect(window.localStorage.getItem(OVERVIEW_HIDDEN_STORAGE_KEY)).toBe('1');
    expect(status()).toBe(studioViewStrings.overviewHidden);
    expect(fireEvent.keyDown(document.body, { ...TOGGLE, ctrlKey: false, metaKey: true })).toBe(
      false,
    );
    expect(overview()).not.toBeNull();
    expect(slot()).toBeNull();
    expect(window.localStorage.getItem(OVERVIEW_HIDDEN_STORAGE_KEY)).toBeNull();
    expect(status()).toBe(studioViewStrings.overviewShown);
  });

  it('OV-T2: AltGr, Shift, auto-repeat, text fields, the open sheet, a pointer gesture and partial modifiers are ignored', async () => {
    const { api, overview, view } = await mountOverviewWorkspace();
    const expectShownAndUnstored = () => {
      expect(overview()).not.toBeNull();
      expect(window.localStorage.getItem(OVERVIEW_HIDDEN_STORAGE_KEY)).toBeNull();
    };
    expect(fireEvent.keyDown(document.body, { ...TOGGLE, modifierAltGraph: true })).toBe(true);
    expectShownAndUnstored();
    fireEvent.keyDown(document.body, { ...TOGGLE, shiftKey: true });
    expectShownAndUnstored();
    expect(fireEvent.keyDown(document.body, { ...TOGGLE, repeat: true })).toBe(false);
    expectShownAndUnstored();
    fireEvent.keyDown(view.getByTestId('arrangement-library-search'), TOGGLE);
    expectShownAndUnstored();
    fireEvent.keyDown(document.body, { key: '?', code: 'Slash', shiftKey: true });
    const sheet = view.getByRole('dialog', { name: 'Keyboard shortcuts' });
    fireEvent.keyDown(document.body, TOGGLE);
    expectShownAndUnstored();
    fireEvent.keyDown(within(sheet).getByRole('searchbox', { name: 'Search shortcuts' }), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(view.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull();
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(7, () => undefined);
    });
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(fireEvent.keyDown(document.body, TOGGLE)).toBe(false);
    expectShownAndUnstored();
    act(() => release?.());
    expect(live(api).isPointerGestureActive()).toBe(false);
    fireEvent.keyDown(document.body, { key: 'o', code: 'KeyO', ctrlKey: true });
    expectShownAndUnstored();
    fireEvent.keyDown(document.body, { key: 'o', code: 'KeyO', altKey: true });
    expectShownAndUnstored();
  });

  it('OV-T6: hiding the focused Overview moves focus to the next dock control, never to body (GATE232-S1)', async () => {
    const { overview, view } = await mountOverviewWorkspace();
    const play = view.getByRole('button', { name: 'Play' });
    const expand = () => view.getByTestId('arrangement-video-expand');
    play.focus();
    expect(document.activeElement).toBe(play);
    fireEvent.keyDown(play, { ...TOGGLE, ctrlKey: false, metaKey: true });
    expect(overview()).toBeNull();
    expect(document.activeElement).toBe(play);
    fireEvent.keyDown(play, { ...TOGGLE, ctrlKey: false, metaKey: true });
    expect(overview()).not.toBeNull();
    expect(document.activeElement).toBe(play);
    overview()?.focus();
    expect(document.activeElement).toBe(overview());
    expect(fireEvent.keyDown(document.activeElement ?? document.body, TOGGLE)).toBe(false);
    expect(overview()).toBeNull();
    expect(document.activeElement).toBe(expand());
    expect(fireEvent.keyDown(document.activeElement ?? document.body, TOGGLE)).toBe(false);
    expect(overview()).not.toBeNull();
    expect(document.activeElement).toBe(expand());
    fireEvent.click(expand());
    overview()?.focus();
    expect(document.activeElement).toBe(overview());
    expect(fireEvent.keyDown(document.activeElement ?? document.body, TOGGLE)).toBe(false);
    expect(overview()).toBeNull();
    expect(document.activeElement).toBe(view.getByTestId('arrangement-video-placeholder-return'));
  });

  it('OV-T4: the toggle is view state and adds no history entry', async () => {
    const { api, overview } = await mountOverviewWorkspace();
    act(() => live(api).addSourceToActiveTrack('song'));
    expect(live(api).arrangement.clips).toHaveLength(1);
    const undoLabel = live(api).undoLabel;
    expect(undoLabel).not.toBeNull();
    fireEvent.keyDown(document.body, TOGGLE);
    expect(overview()).toBeNull();
    expect(live(api).undoLabel).toBe(undoLabel);
    fireEvent.keyDown(document.body, TOGGLE);
    expect(overview()).not.toBeNull();
    expect(live(api).undoLabel).toBe(undoLabel);
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(overview()).not.toBeNull();
    expect(live(api).undoLabel).toBeNull();
  });

  it('OV-T5: when storage throws the toggle still hides and shows for this session', async () => {
    const { overview, slot, status } = await mountOverviewWorkspace();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    fireEvent.keyDown(document.body, TOGGLE);
    expect(setItem).toHaveBeenCalled();
    expect(overview()).toBeNull();
    expect(slot()).not.toBeNull();
    expect(status()).toBe(studioViewStrings.overviewHidden);
    fireEvent.keyDown(document.body, TOGGLE);
    expect(removeItem).toHaveBeenCalled();
    expect(overview()).not.toBeNull();
    expect(status()).toBe(studioViewStrings.overviewShown);
  });
});
