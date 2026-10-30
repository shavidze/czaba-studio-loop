import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { setOverviewHidden } from '../overview-visibility';
import { studioEditStrings, studioLoopStrings } from '../strings';

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

const metaCollection: WorkspaceCollection = {
  id: 'meta-shortcuts',
  label: 'meta-shortcuts',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'meta-shortcuts',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: () =>
    Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 })),
};

function emptyMetaArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface MetaApiRef {
  current: ArrangementContextValue | null;
}

function MetaProbe({ api }: { api: MetaApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MetaApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountMetaWorkspace() {
  const api: MetaApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={metaCollection} initialArrangement={emptyMetaArrangement()}>
      <StudioWorkspace />
      <MetaProbe api={api} />
    </ArrangementProvider>,
  );
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  const clipCount = () => live(api).arrangement.clips.length;
  const status = () => view.getByTestId('arrangement-status').textContent ?? '';
  const undoButton = () => view.getByRole('button', { name: /^Undo/ });
  const redoButton = () => view.getByRole('button', { name: /^Redo/ });
  const loopButton = () => {
    const matches = view
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L');
    expect(matches).toHaveLength(1);
    const [button] = matches;
    if (!button) {
      throw new Error('loop button missing');
    }
    return button;
  };
  return { api, view, clipCount, status, undoButton, redoButton, loopButton };
}

type MetaMount = Awaited<ReturnType<typeof mountMetaWorkspace>>;

const HALVES = [
  ['Ctrl', { ctrlKey: true, metaKey: false }],
  ['Meta', { ctrlKey: false, metaKey: true }],
] as const;

const Z = { key: 'z', code: 'KeyZ' };
const SHIFT_Z = { key: 'Z', code: 'KeyZ', shiftKey: true };
const Y = { key: 'y', code: 'KeyY' };
const E = { key: 'e', code: 'KeyE' };
const L = { key: 'l', code: 'KeyL' };

function press(init: KeyboardEventInit): boolean {
  return fireEvent.keyDown(document.body, init);
}

function addOneClip(mounted: MetaMount) {
  act(() => live(mounted.api).addSourceToActiveTrack('song'));
  expect(mounted.clipCount()).toBe(1);
}

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

describe('L46-CONTRACT-CHECKS: the Meta bit runs the same handlers as Ctrl (TLM-R228-META-KEYS)', () => {
  it.each(HALVES)('MS1 %s+Z undoes the last edit', async (_label, modifier) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const addLabel = live(mounted.api).undoLabel;
    expect(addLabel).not.toBeNull();
    expect(mounted.undoButton().getAttribute('title')).toBe(studioEditStrings.undoTitle(addLabel));
    const notPrevented = press({ ...Z, ...modifier });
    expect(mounted.clipCount()).toBe(0);
    expect(notPrevented).toBe(false);
    expect(live(mounted.api).undoLabel).toBeNull();
    expect(mounted.undoButton().getAttribute('title')).toBe(studioEditStrings.undoTitle(null));
    expect(mounted.redoButton().getAttribute('title')).toBe(studioEditStrings.redoTitle(addLabel));
  });

  it.each(HALVES)('MS2 %s+Shift+Z redoes the undone edit', async (_label, modifier) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const addLabel = live(mounted.api).undoLabel;
    act(() => live(mounted.api).undo());
    expect(mounted.clipCount()).toBe(0);
    const notPrevented = press({ ...SHIFT_Z, ...modifier });
    expect(mounted.clipCount()).toBe(1);
    expect(notPrevented).toBe(false);
    expect(live(mounted.api).undoLabel).toBe(addLabel);
    expect(mounted.undoButton().getAttribute('title')).toBe(studioEditStrings.undoTitle(addLabel));
    expect(mounted.redoButton().getAttribute('title')).toBe(studioEditStrings.redoTitle(null));
  });

  it.each(HALVES)('MS3 %s+Y redoes the undone edit', async (_label, modifier) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const addLabel = live(mounted.api).undoLabel;
    act(() => live(mounted.api).undo());
    expect(mounted.clipCount()).toBe(0);
    expect(live(mounted.api).redoLabel).toBe(addLabel);
    const notPrevented = press({ ...Y, ...modifier });
    expect(mounted.clipCount()).toBe(1);
    expect(notPrevented).toBe(false);
    expect(live(mounted.api).redoLabel).toBeNull();
    expect(mounted.undoButton().getAttribute('title')).toBe(studioEditStrings.undoTitle(addLabel));
  });

  it.each(
    HALVES,
  )('MS4 %s+E splits the selected clip at the insert marker', async (_label, modifier) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const [clip] = live(mounted.api).arrangement.clips;
    if (!clip) {
      throw new Error('clip missing');
    }
    act(() => live(mounted.api).selectClip(clip.id));
    act(() => live(mounted.api).setInsertMarker(clip.start + 5));
    const notPrevented = press({ ...E, ...modifier });
    expect(mounted.clipCount()).toBe(2);
    expect(notPrevented).toBe(false);
    expect(
      live(mounted.api)
        .arrangement.clips.map((part) => part.start)
        .sort((a, b) => a - b),
    ).toEqual([clip.start, clip.start + 5]);
    expect(mounted.status()).toBe(studioEditStrings.splitDone('00:05.000'));
  });

  it.each(
    HALVES,
  )('MS5 %s+L turns the loop on from the time selection, and again turns it off', async (_label, modifier) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    act(() => live(mounted.api).setTimeRange({ start: 2.5, end: 7.5, trackId: 'music' }));
    expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('false');
    const firstNotPrevented = press({ ...L, ...modifier });
    expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('true');
    expect(firstNotPrevented).toBe(false);
    expect(live(mounted.api).arrangement.loop).toEqual({ start: 2.5, end: 7.5, enabled: true });
    expect(mounted.status()).toBe(studioLoopStrings.created('00:02.500 — 00:07.500'));
    const secondNotPrevented = press({ ...L, ...modifier });
    expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('false');
    expect(secondNotPrevented).toBe(false);
    expect(live(mounted.api).arrangement.loop).toEqual({ start: 2.5, end: 7.5, enabled: false });
    expect(mounted.status()).toBe(studioLoopStrings.off);
  });

  it('MS6 Alt alone with Z, E or L changes no clip count, history or loop state', async () => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const [clip] = live(mounted.api).arrangement.clips;
    if (!clip) {
      throw new Error('clip missing');
    }
    act(() => live(mounted.api).selectClip(clip.id));
    act(() => live(mounted.api).setInsertMarker(clip.start + 5));
    act(() => live(mounted.api).setTimeRange({ start: 2.5, end: 7.5, trackId: 'music' }));
    const undoLabel = live(mounted.api).undoLabel;
    const statusBefore = mounted.status();
    const alone = { altKey: true, ctrlKey: false, metaKey: false };
    for (const key of [Z, E, L]) {
      const notPrevented = press({ ...key, ...alone });
      expect(mounted.clipCount()).toBe(1);
      expect(live(mounted.api).undoLabel).toBe(undoLabel);
      expect(live(mounted.api).arrangement.loop).toBeNull();
      expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('false');
      expect(mounted.status()).toBe(statusBefore);
      expect(notPrevented).toBe(true);
    }
  });
});

describe('GATE264-S2: Alt or AltGr held with Ctrl/Meta runs no Ctrl-letter command', () => {
  const ALT_CHORDS = [
    ['AltGr', { ctrlKey: true, altKey: true, modifierAltGraph: true }],
    ['Ctrl+Alt', { ctrlKey: true, altKey: true }],
    ['Meta+Alt', { metaKey: true, altKey: true }],
  ] as const;

  const CTRL = { ctrlKey: true };

  function selectOnlyClip(mounted: MetaMount) {
    const [clip] = live(mounted.api).arrangement.clips;
    if (!clip) {
      throw new Error('clip missing');
    }
    act(() => live(mounted.api).selectClip(clip.id));
    return clip;
  }

  it.each(ALT_CHORDS)('AG1 %s+Z, +Shift+Z and +Y neither undo nor redo', async (_label, chord) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const undoLabel = live(mounted.api).undoLabel;
    expect(undoLabel).not.toBeNull();
    const statusBefore = mounted.status();
    const undoNotPrevented = press({ ...Z, ...chord });
    expect(mounted.clipCount()).toBe(1);
    expect(live(mounted.api).undoLabel).toBe(undoLabel);
    expect(mounted.status()).toBe(statusBefore);
    expect(undoNotPrevented).toBe(true);
    press({ ...Z, ...CTRL });
    expect(mounted.clipCount()).toBe(0);
    expect(live(mounted.api).redoLabel).toBe(undoLabel);
    const statusAfterUndo = mounted.status();
    const redoShiftNotPrevented = press({ ...SHIFT_Z, ...chord });
    const redoYNotPrevented = press({ ...Y, ...chord });
    expect(mounted.clipCount()).toBe(0);
    expect(mounted.status()).toBe(statusAfterUndo);
    expect(redoShiftNotPrevented).toBe(true);
    expect(redoYNotPrevented).toBe(true);
    press({ ...Y, ...CTRL });
    expect(mounted.clipCount()).toBe(1);
  });

  it.each(ALT_CHORDS)('AG2 %s+E does not split the selected clip', async (_label, chord) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const clip = selectOnlyClip(mounted);
    act(() => live(mounted.api).setInsertMarker(clip.start + 5));
    const statusBefore = mounted.status();
    const notPrevented = press({ ...E, ...chord });
    expect(mounted.clipCount()).toBe(1);
    expect(mounted.status()).toBe(statusBefore);
    expect(notPrevented).toBe(true);
    press({ ...E, ...CTRL });
    expect(mounted.clipCount()).toBe(2);
  });

  it.each(
    ALT_CHORDS,
  )('AG3 %s+L and +Shift+L neither loop nor extend the time selection', async (_label, chord) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    act(() => live(mounted.api).setTimeRange({ start: 2.5, end: 7.5, trackId: 'music' }));
    const rangeBefore = live(mounted.api).range;
    const statusBefore = mounted.status();
    const loopNotPrevented = press({ ...L, ...chord });
    const allTracksNotPrevented = press({ key: 'L', code: 'KeyL', shiftKey: true, ...chord });
    expect(live(mounted.api).arrangement.loop).toBeNull();
    expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('false');
    expect(live(mounted.api).range).toEqual(rangeBefore);
    expect(mounted.status()).toBe(statusBefore);
    expect(loopNotPrevented).toBe(true);
    expect(allTracksNotPrevented).toBe(true);
    press({ ...L, ...CTRL });
    expect(mounted.loopButton().getAttribute('aria-pressed')).toBe('true');
    expect(live(mounted.api).arrangement.loop).toEqual({ start: 2.5, end: 7.5, enabled: true });
  });

  it.each(
    ALT_CHORDS,
  )('AG4 %s+A, D, C, X, V, G and Shift+G change no selection, clip, history or group', async (_label, chord) => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    selectOnlyClip(mounted);
    const selectionBefore = [...live(mounted.api).selectedClipIds];
    const undoLabel = live(mounted.api).undoLabel;
    const statusBefore = mounted.status();
    const letters = [
      { key: 'a', code: 'KeyA' },
      { key: 'd', code: 'KeyD' },
      { key: 'c', code: 'KeyC' },
      { key: 'x', code: 'KeyX' },
      { key: 'v', code: 'KeyV' },
      { key: 'g', code: 'KeyG' },
      { key: 'G', code: 'KeyG', shiftKey: true },
    ];
    for (const letter of letters) {
      const notPrevented = press({ ...letter, ...chord });
      expect(mounted.clipCount()).toBe(1);
      expect(live(mounted.api).selectedClipIds).toEqual(selectionBefore);
      expect(live(mounted.api).undoLabel).toBe(undoLabel);
      expect(mounted.view.container.querySelectorAll('[data-group-id]')).toHaveLength(0);
      expect(mounted.status()).toBe(statusBefore);
      expect(notPrevented).toBe(true);
    }
    press({ key: 'd', code: 'KeyD', ...CTRL });
    expect(mounted.clipCount()).toBe(2);
  });

  it('AG5 AltGr+E during a pointer gesture does not show the gesture-blocked message', async () => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const statusBefore = mounted.status();
    let release: (() => void) | null = null;
    act(() => {
      release = live(mounted.api).claimPointerGesture(42, () => {});
    });
    const notPrevented = press({ ...E, ctrlKey: true, altKey: true, modifierAltGraph: true });
    expect(mounted.status()).toBe(statusBefore);
    expect(mounted.status()).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(mounted.clipCount()).toBe(1);
    expect(notPrevented).toBe(true);
    press({ ...E, ...CTRL });
    expect(mounted.status()).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => release?.());
  });

  it('AG6 the AltGraph state alone, without altKey, blocks Ctrl+Z and stops Ctrl+G before the plain G branch', async () => {
    const mounted = await mountMetaWorkspace();
    addOneClip(mounted);
    const snapToggle = mounted.view.getByTestId('arrangement-snap-toggle');
    const snapBefore = snapToggle.getAttribute('aria-pressed');
    expect(snapBefore).not.toBeNull();
    const statusBefore = mounted.status();
    const altGraphOnly = { ctrlKey: true, altKey: false, modifierAltGraph: true };
    const undoNotPrevented = press({ ...Z, ...altGraphOnly });
    const snapNotPrevented = press({ key: 'g', code: 'KeyG', ...altGraphOnly });
    expect(mounted.clipCount()).toBe(1);
    expect(mounted.view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).toBe(
      snapBefore,
    );
    expect(mounted.status()).toBe(statusBefore);
    expect(undoNotPrevented).toBe(true);
    expect(snapNotPrevented).toBe(true);
    press({ ...Z, ...CTRL });
    expect(mounted.clipCount()).toBe(0);
  });
});
