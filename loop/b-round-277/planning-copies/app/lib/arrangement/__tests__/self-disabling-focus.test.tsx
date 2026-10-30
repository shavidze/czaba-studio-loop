import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { studioEditStrings, studioLoopStrings, studioViewStrings } from '../strings';

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
    undoButton: () => buttonByText(root, 'Undo'),
    redoButton: () => buttonByText(root, 'Redo'),
    deleteButton: () => buttonByText(root, 'Delete'),
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
    expect(status()).toBe('Clip Gain unchanged: 0.0 dB.');
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
    expect(undoButton().getAttribute('aria-disabled')).toBeNull();
    expect(undoButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(undoButton());
    fireEvent.click(undoButton());
    expect(clipGainOf(api)).toBe(undefined);
    expect(undoButton().getAttribute('aria-disabled')).toBe('true');
    expect(undoButton().hasAttribute('disabled')).toBe(false);
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
    expect(redoButton().getAttribute('aria-disabled')).toBe('true');
    expect(redoButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(undoButton());
  });

  it('FL5: Delete on the selected clip hands focus to Undo, which now undoes the delete', async () => {
    const { api, undoButton, deleteButton } = await mountTransportHarness();
    act(() => live(api).selectClip('music-1'));
    deleteButton().focus();
    fireEvent.click(deleteButton());
    expect(live(api).arrangement.clips.length).toBe(0);
    expect(deleteButton().getAttribute('aria-disabled')).toBe('true');
    expect(deleteButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(undoButton());
    expect(undoButton().title).toBe(
      studioEditStrings.undoTitle(studioEditStrings.historyDeleteClip),
    );
  });

  it('FL6: Zoom back on its last history step hands focus to Fit', async () => {
    const { onZoomBackSpy, zoomBackButton, fitButton } = await mountTransportHarness();
    expect(zoomBackButton().getAttribute('aria-disabled')).toBeNull();
    expect(zoomBackButton().hasAttribute('disabled')).toBe(false);
    zoomBackButton().focus();
    fireEvent.click(zoomBackButton());
    expect(onZoomBackSpy).toHaveBeenCalledTimes(1);
    expect(zoomBackButton().getAttribute('aria-disabled')).toBe('true');
    expect(zoomBackButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(fitButton());
  });

  it('FL7: Undo clicked without holding focus never moves focus', async () => {
    const { api, undoButton } = await mountTransportHarness();
    makeTwoGainEdits(api);
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(undoButton());
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(undoButton());
    expect(undoButton().getAttribute('aria-disabled')).toBe('true');
    expect(undoButton().hasAttribute('disabled')).toBe(false);
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
    expect(undoButton().getAttribute('aria-disabled')).toBeNull();
    expect(undoButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(undoButton());
    act(() => release());
  });

  it('FL9: enabled Undo, Redo, Delete and Zoom back prevent a repeated Enter and allow a fresh one; a repeated Space is untouched', async () => {
    const { api, undoButton, redoButton, deleteButton, zoomBackButton } =
      await mountTransportHarness();
    makeTwoGainEdits(api);
    act(() => live(api).undo());
    act(() => live(api).selectClip('music-1'));
    for (const button of [undoButton(), redoButton(), deleteButton(), zoomBackButton()]) {
      expect(button.getAttribute('aria-disabled')).toBeNull();
      expect(button.hasAttribute('disabled')).toBe(false);
    }
    for (const button of [undoButton(), redoButton(), deleteButton(), zoomBackButton()]) {
      expect(fireEvent.keyDown(button, { key: 'Enter', repeat: true })).toBe(false);
      expect(fireEvent.keyDown(button, { key: 'Enter', repeat: false })).toBe(true);
    }
    expect(fireEvent.keyDown(undoButton(), { key: ' ', repeat: true })).toBe(true);
  });

  it('FL10: when the browser already dropped focus to BODY before the commit, Zoom back still hands focus to Fit', async () => {
    const { zoomBackButton, fitButton } = await mountTransportHarness(true);
    zoomBackButton().focus();
    fireEvent.click(zoomBackButton());
    expect(zoomBackButton().getAttribute('aria-disabled')).toBe('true');
    expect(zoomBackButton().hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(fitButton());
  });
});

const SOFT_DISABLED_TRANSPORT_SOURCE = resolve(
  __dirname,
  '../../../components/arrangement/ArrangementTransport.tsx',
);

function emptyTransportArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [],
  };
}

interface SoftDisabledNavigationSpies {
  onZoomToRange: () => void;
  onZoomBack: () => void;
  onFit: () => void;
}

function SoftDisabledTransport({ spies }: { spies: SoftDisabledNavigationSpies }) {
  const navigation: ArrangementTransportNavigation = {
    followMode: 'off',
    canZoomBack: false,
    onToggleFollow: () => undefined,
    onZoomToRange: spies.onZoomToRange,
    onZoomBack: spies.onZoomBack,
    onFit: spies.onFit,
    onZoomSlider: () => undefined,
  };
  return <ArrangementTransport onOpenExport={() => undefined} navigation={navigation} />;
}

async function mountSoftDisabledTransport(initialArrangement: Arrangement) {
  const api: FocusApiRef = { current: null };
  const spies = { onZoomToRange: vi.fn(), onZoomBack: vi.fn(), onFit: vi.fn() };
  const view = render(
    <ArrangementProvider collection={focusCollection} initialArrangement={initialArrangement}>
      <SoftDisabledTransport spies={spies} />
      <FocusProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  const root = view.container;
  const split = () => buttonByText(root, 'Split');
  const remove = () => buttonByText(root, 'Delete');
  const softDisabledSeven = () => [
    { name: 'Undo', button: buttonByText(root, 'Undo'), title: studioEditStrings.undoTitle(null) },
    { name: 'Redo', button: buttonByText(root, 'Redo'), title: studioEditStrings.redoTitle(null) },
    { name: 'Split', button: split(), title: studioEditStrings.splitNeedsTargetTitle },
    { name: 'Delete', button: remove(), title: studioEditStrings.deleteNeedsTargetTitle },
    {
      name: 'Loop',
      button: buttonByText(root, 'Loop'),
      title: studioLoopStrings.needsSelectionTitle,
    },
    {
      name: 'Zoom to selection',
      button: asButton(view.getByTestId('arrangement-zoom-range'), 'zoom to selection'),
      title: studioViewStrings.zoomToSelectionNeedsRangeTitle,
    },
    {
      name: 'Zoom back',
      button: asButton(view.getByTestId('arrangement-zoom-back'), 'zoom back'),
      title: studioViewStrings.zoomBackEmptyTitle,
    },
  ];
  return {
    api,
    spies,
    split,
    remove,
    softDisabledSeven,
    fitButton: () => asButton(view.getByTestId('arrangement-fit'), 'fit'),
  };
}

describe('SYS-5 stage 1: soft-disabled transport buttons (D-29z615)', () => {
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SD1: in an empty arrangement the seven unavailable buttons are aria-disabled, focusable and titled with their reason', async () => {
    const { softDisabledSeven } = await mountSoftDisabledTransport(emptyTransportArrangement());
    const seven = softDisabledSeven();
    expect(seven).toHaveLength(7);
    for (const { name, button, title } of seven) {
      expect(button.getAttribute('aria-disabled'), name).toBe('true');
      expect(button.hasAttribute('disabled'), name).toBe(false);
      expect(button.disabled, name).toBe(false);
      act(() => button.focus());
      expect(document.activeElement, name).toBe(button);
      expect(button.title, name).toBe(title);
    }
    expect(studioEditStrings.undoTitle(null)).toBe('Undo — nothing to undo yet (Ctrl+Z)');
    expect(studioEditStrings.redoTitle(null)).toBe('Redo — nothing to redo (Ctrl+Shift+Z)');
  });

  it('SD2: a click on each soft-disabled button changes no status, history, range, loop, clips or zoom', async () => {
    const { api, spies, softDisabledSeven } = await mountSoftDisabledTransport(
      emptyTransportArrangement(),
    );
    act(() => live(api).setStatus('SD2 known status.'));
    const statusBefore = live(api).status;
    const sequenceBefore = live(api).statusSequence;
    expect(statusBefore).toBe('SD2 known status.');
    for (const { name, button } of softDisabledSeven()) {
      fireEvent.click(button);
      expect(live(api).status, name).toBe(statusBefore);
      expect(live(api).statusSequence, name).toBe(sequenceBefore);
      expect(live(api).undoLabel, name).toBeNull();
      expect(live(api).redoLabel, name).toBeNull();
      expect(live(api).range, name).toBeNull();
      expect(live(api).arrangement.loop ?? null, name).toBeNull();
      expect(live(api).arrangement.clips, name).toHaveLength(0);
      expect(spies.onZoomToRange, name).not.toHaveBeenCalled();
      expect(spies.onZoomBack, name).not.toHaveBeenCalled();
      expect(button.title, name).not.toBe('');
    }
    expect(softDisabledSeven()[0]?.button.title).toBe(studioEditStrings.undoTitle(null));
  });

  it('SD2b: during a pointer gesture a click on each soft-disabled button still writes no refusal status (A-R276-REVIEW-SD2-UNDO)', async () => {
    const { api, spies, softDisabledSeven } = await mountSoftDisabledTransport(
      emptyTransportArrangement(),
    );
    act(() => live(api).setStatus('SD2b known status.'));
    let release: () => void = () => undefined;
    act(() => {
      release = live(api).beginPointerGesture();
    });
    const statusBefore = live(api).status;
    const sequenceBefore = live(api).statusSequence;
    expect(statusBefore).toBe('SD2b known status.');
    for (const { name, button } of softDisabledSeven()) {
      fireEvent.click(button);
      expect(live(api).status, name).toBe(statusBefore);
      expect(live(api).statusSequence, name).toBe(sequenceBefore);
      expect(spies.onZoomToRange, name).not.toHaveBeenCalled();
      expect(spies.onZoomBack, name).not.toHaveBeenCalled();
    }
    act(() => release());
  });

  it('SD3: mousedown on a soft-disabled button is default-prevented, on Fit it is not', async () => {
    const { softDisabledSeven, fitButton } = await mountSoftDisabledTransport(
      emptyTransportArrangement(),
    );
    for (const { name, button } of softDisabledSeven()) {
      expect(fireEvent.mouseDown(button), name).toBe(false);
    }
    expect(fireEvent.mouseDown(fitButton())).toBe(true);
  });

  it('SD4: a selected clip or a range makes Split and Delete available with their action titles', async () => {
    const { api, split, remove } = await mountSoftDisabledTransport(focusArrangement());
    act(() => live(api).selectClip('music-1'));
    for (const button of [split(), remove()]) {
      expect(button.getAttribute('aria-disabled')).toBeNull();
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(fireEvent.mouseDown(button)).toBe(true);
    }
    expect(split().title).toBe(studioEditStrings.splitAtInsertMarkerTitle);
    expect(remove().title).toBe(studioEditStrings.deleteClipTitle);
    expect(remove().getAttribute('aria-label')).toBe(studioEditStrings.deleteClipLabel);
    act(() => live(api).setTimeRange({ start: 3, end: 5, trackId: 'music' }));
    expect(split().getAttribute('aria-disabled')).toBeNull();
    expect(split().title).toBe(studioEditStrings.splitRangeTitle);
    expect(remove().title).toBe(studioEditStrings.deleteRangeHint);
    expect(remove().getAttribute('aria-label')).toBe(studioEditStrings.deleteRangeHint);
  });

  it('SD5: after one edit, Undo hands focus to Redo when it becomes soft-disabled, and Redo hands it back', async () => {
    const { api, undoButton, redoButton } = await mountTransportHarness();
    act(() => {
      live(api).setClipGain('music-1', 1);
    });
    undoButton().focus();
    fireEvent.click(undoButton());
    expect(clipGainOf(api)).toBe(undefined);
    expect(undoButton().getAttribute('aria-disabled')).toBe('true');
    expect(undoButton().hasAttribute('disabled')).toBe(false);
    expect(redoButton().getAttribute('aria-disabled')).toBeNull();
    expect(document.activeElement).toBe(redoButton());
    fireEvent.click(redoButton());
    expect(clipGainOf(api)).toBe(1);
    expect(redoButton().getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(undoButton());
  });

  it('SD6: a focused soft-disabled Redo becomes available in place after Ctrl+Z, and a click then redoes', async () => {
    const { api, undoButton, redoButton } = await mountTransportHarness();
    act(() => {
      live(api).setClipGain('music-1', 1);
    });
    const editLabel = live(api).undoLabel;
    expect(editLabel).not.toBeNull();
    expect(redoButton().getAttribute('aria-disabled')).toBe('true');
    act(() => redoButton().focus());
    expect(document.activeElement).toBe(redoButton());
    act(() => live(api).undo());
    expect(redoButton().getAttribute('aria-disabled')).toBeNull();
    expect(document.activeElement).toBe(redoButton());
    expect(undoButton().title).toBe(studioEditStrings.undoTitle(null));
    fireEvent.click(redoButton());
    expect(clipGainOf(api)).toBe(1);
    expect(undoButton().title).toBe(studioEditStrings.undoTitle(editLabel));
  });

  it('SD7: the transport source has no enabled:/disabled: tokens or disabled props, and the rendered Undo keeps the aria-disabled tokens', async () => {
    const source = readFileSync(SOFT_DISABLED_TRANSPORT_SOURCE, 'utf8');
    expect(source.match(/(^|[^a-z-])enabled:/gm) ?? []).toHaveLength(0);
    expect(source.match(/(^|[^a-z-])disabled:/gm) ?? []).toHaveLength(0);
    expect(source.match(/disabled=\{/g) ?? []).toHaveLength(0);
    const { softDisabledSeven } = await mountSoftDisabledTransport(emptyTransportArrangement());
    const undo = softDisabledSeven()[0]?.button;
    const tokens = undo?.className.split(/\s+/) ?? [];
    for (const token of [
      'not-aria-disabled:hover:bg-foreground/8',
      'not-aria-disabled:active:bg-foreground/12',
      'aria-disabled:cursor-not-allowed',
      'aria-disabled:*:opacity-40',
    ]) {
      expect(tokens).toContain(token);
    }
  });
});
