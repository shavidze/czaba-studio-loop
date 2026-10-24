import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ArrangementTransport,
  type ArrangementTransportNavigation,
} from '~/components/arrangement/ArrangementTransport';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_UNDO_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
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

const focusCollection: WorkspaceCollection = {
  id: 'focus',
  label: 'focus',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'focus', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function focusArrangement(gainDb?: number): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  const clip: ArrangementClip = {
    id: 'music-1',
    trackId: 'music',
    sourceId: 'song',
    start: 2,
    sourceOffset: 0,
    duration: 8,
  };
  return { ...base, clips: [gainDb === undefined ? clip : { ...clip, gainDb }] };
}

interface FocusApiRef {
  current: ArrangementContextValue | null;
}

function FocusProbe({ api }: { api: FocusApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FocusApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function ZoomBackTransport({
  onZoomBackSpy,
  blurOnZoomBack,
}: {
  onZoomBackSpy: () => void;
  blurOnZoomBack: boolean;
}) {
  const [canZoomBack, setCanZoomBack] = useState(true);
  const navigation: ArrangementTransportNavigation = {
    followMode: 'off',
    canZoomBack,
    onToggleFollow: () => undefined,
    onZoomToRange: () => undefined,
    onZoomBack: () => {
      onZoomBackSpy();
      if (blurOnZoomBack && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setCanZoomBack(false);
    },
    onFit: () => undefined,
    onZoomSlider: () => undefined,
  };
  return <ArrangementTransport onOpenExport={() => undefined} navigation={navigation} />;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function asButton(element: HTMLElement | undefined, name: string): HTMLButtonElement {
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`button ${name} missing`);
  }
  return element;
}

function buttonByText(root: HTMLElement, prefix: string): HTMLButtonElement {
  const match = Array.from(root.querySelectorAll('button')).find((entry) =>
    entry.textContent?.trim().startsWith(prefix),
  );
  return asButton(match, prefix);
}

async function mountTransportHarness(blurOnZoomBack = false) {
  const api: FocusApiRef = { current: null };
  const onZoomBackSpy = vi.fn();
  const view = render(
    <ArrangementProvider collection={focusCollection} initialArrangement={focusArrangement()}>
      <ZoomBackTransport onZoomBackSpy={onZoomBackSpy} blurOnZoomBack={blurOnZoomBack} />
      <FocusProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  const root = view.container;
  return {
    api,
    onZoomBackSpy,
    undoButton: () => buttonByText(root, '↶'),
    redoButton: () => buttonByText(root, '↷'),
    deleteButton: () => buttonByText(root, '⌫'),
    zoomBackButton: () => asButton(view.getByTestId('arrangement-zoom-back'), 'zoom back'),
    fitButton: () => asButton(view.getByTestId('arrangement-fit'), 'fit'),
  };
}

function makeTwoGainEdits(api: FocusApiRef) {
  act(() => {
    live(api).setClipGain('music-1', 1);
  });
  act(() => {
    live(api).setClipGain('music-1', 2);
  });
}

async function mountDetailWorkspace() {
  const api: FocusApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={focusCollection} initialArrangement={focusArrangement(1)}>
      <StudioWorkspace />
      <FocusProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
  act(() => live(api).selectClip('music-1'));
  const field = () => {
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain input missing');
    }
    return input;
  };
  const reset = () =>
    asButton(view.getByTestId('arrangement-detail-clip-gain-reset'), 'clip gain reset');
  const status = () => view.getByTestId('arrangement-status').textContent;
  return { api, field, reset, status };
}

function clipGainOf(api: FocusApiRef): number | undefined {
  return live(api).arrangement.clips.find((clip) => clip.id === 'music-1')?.gainDb;
}

describe('a self-disabling button hands keyboard focus to its partner (C-R107-01, D-29z73)', () => {
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

  it('FL1: a keyboard 0 dB reset moves focus to the Clip Gain input, and a fresh Enter there adds no clip', async () => {
    const { api, field, reset, status } = await mountDetailWorkspace();
    expect(clipGainOf(api)).toBe(1);
    reset().focus();
    expect(document.activeElement).toBe(reset());
    fireEvent.click(reset());
    expect(clipGainOf(api)).toBe(undefined);
    expect(reset().disabled).toBe(true);
    expect(status()).toBe('Clip Gain: Song — 0.0 dB.');
    expect(document.activeElement).toBe(field());
    expect(field().value).toBe('0.0');
    const clipCount = live(api).arrangement.clips.length;
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(status()).toBe('Clip Gain უცვლელია: 0.0 dB.');
    expect(live(api).arrangement.clips.length).toBe(clipCount);
    expect(live(api).undoLabel).toBe('Clip Gain');
  });

  it('FL2: a mouse 0 dB reset never focuses the button and leaves focus on BODY', async () => {
    const { api, reset } = await mountDetailWorkspace();
    expect(document.activeElement).toBe(document.body);
    expect(fireEvent.mouseDown(reset())).toBe(false);
    fireEvent.click(reset());
    expect(clipGainOf(api)).toBe(undefined);
    expect(document.activeElement).toBe(document.body);
  });

  it('FL3: Undo keeps focus while history remains and hands it to Redo on the last step', async () => {
    const { api, undoButton, redoButton } = await mountTransportHarness();
    makeTwoGainEdits(api);
    undoButton().focus();
    fireEvent.click(undoButton());
    expect(clipGainOf(api)).toBe(1);
    expect(undoButton().disabled).toBe(false);
    expect(document.activeElement).toBe(undoButton());
    fireEvent.click(undoButton());
    expect(clipGainOf(api)).toBe(undefined);
    expect(undoButton().disabled).toBe(true);
    expect(document.activeElement).toBe(redoButton());
  });

  it('FL4: Redo keeps focus while redo entries remain and hands it to Undo on the last step', async () => {
    const { api, undoButton, redoButton } = await mountTransportHarness();
    makeTwoGainEdits(api);
    act(() => live(api).undo());
    act(() => live(api).undo());
    redoButton().focus();
    fireEvent.click(redoButton());
    expect(clipGainOf(api)).toBe(1);
    expect(document.activeElement).toBe(redoButton());
    fireEvent.click(redoButton());
    expect(clipGainOf(api)).toBe(2);
    expect(redoButton().disabled).toBe(true);
    expect(document.activeElement).toBe(undoButton());
  });

  it('FL5: ⌫ on the selected clip hands focus to Undo, which now undoes the delete', async () => {
    const { api, undoButton, deleteButton } = await mountTransportHarness();
    act(() => live(api).selectClip('music-1'));
    deleteButton().focus();
    fireEvent.click(deleteButton());
    expect(live(api).arrangement.clips.length).toBe(0);
    expect(deleteButton().disabled).toBe(true);
    expect(document.activeElement).toBe(undoButton());
    expect(undoButton().title).toBe('Undo: კლიპის წაშლა');
  });

  it('FL6: ↩ Zoom on its last history step hands focus to Fit', async () => {
    const { onZoomBackSpy, zoomBackButton, fitButton } = await mountTransportHarness();
    expect(zoomBackButton().disabled).toBe(false);
    zoomBackButton().focus();
    fireEvent.click(zoomBackButton());
    expect(onZoomBackSpy).toHaveBeenCalledTimes(1);
    expect(zoomBackButton().disabled).toBe(true);
    expect(document.activeElement).toBe(fitButton());
  });

  it('FL7: Undo clicked without holding focus never moves focus', async () => {
    const { api, undoButton } = await mountTransportHarness();
    makeTwoGainEdits(api);
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(undoButton());
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(undoButton());
    expect(undoButton().disabled).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('FL8: an Undo refused during a pointer gesture keeps Undo enabled and focused', async () => {
    const { api, undoButton } = await mountTransportHarness();
    act(() => {
      live(api).setClipGain('music-1', 1);
    });
    let release: () => void = () => undefined;
    act(() => {
      release = live(api).beginPointerGesture();
    });
    undoButton().focus();
    fireEvent.click(undoButton());
    expect(live(api).status).toBe(GESTURE_UNDO_BLOCKED_MESSAGE);
    expect(clipGainOf(api)).toBe(1);
    expect(undoButton().disabled).toBe(false);
    expect(document.activeElement).toBe(undoButton());
    act(() => release());
  });

  it('FL9: enabled Undo, Redo, ⌫ and ↩ Zoom prevent a repeated Enter and allow a fresh one; a repeated Space is untouched', async () => {
    const { api, undoButton, redoButton, deleteButton, zoomBackButton } =
      await mountTransportHarness();
    makeTwoGainEdits(api);
    act(() => live(api).undo());
    act(() => live(api).selectClip('music-1'));
    for (const button of [undoButton(), redoButton(), deleteButton(), zoomBackButton()]) {
      expect(button.disabled).toBe(false);
    }
    for (const button of [undoButton(), redoButton(), deleteButton(), zoomBackButton()]) {
      expect(fireEvent.keyDown(button, { key: 'Enter', repeat: true })).toBe(false);
      expect(fireEvent.keyDown(button, { key: 'Enter', repeat: false })).toBe(true);
    }
    expect(fireEvent.keyDown(undoButton(), { key: ' ', repeat: true })).toBe(true);
  });

  it('FL10: when the browser already dropped focus to BODY before the commit, ↩ Zoom still hands focus to Fit', async () => {
    const { zoomBackButton, fitButton } = await mountTransportHarness(true);
    zoomBackButton().focus();
    fireEvent.click(zoomBackButton());
    expect(zoomBackButton().disabled).toBe(true);
    expect(document.activeElement).toBe(fitButton());
  });
});
