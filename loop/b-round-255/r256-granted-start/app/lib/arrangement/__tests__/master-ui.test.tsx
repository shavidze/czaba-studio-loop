import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { ArrangementMaster } from '~/components/arrangement/ArrangementMaster';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementMixDraftStore,
} from '~/contexts/ArrangementContext';
import {
  applySchedule,
  renderArrangementWav,
  type ScheduleHandle,
} from '~/lib/arrangement/graph.client';
import { MASTER_GAIN_DRAFT_KEY } from '~/lib/arrangement/mix-draft-store';
import { studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

interface ProbeFiber {
  type: unknown;
  memoizedProps: unknown;
  memoizedState: unknown;
  alternate: ProbeFiber | null;
  child: ProbeFiber | null;
  sibling: ProbeFiber | null;
}

const renderLog = vi.hoisted(() => {
  const counts = new Map<string, number>();
  const seen = new WeakMap<object, { props: unknown; state: unknown }>();
  const componentName = (type: unknown): string | null =>
    typeof type === 'function' && 'name' in type && typeof type.name === 'string'
      ? type.name
      : null;
  const recordCommit = (root: ProbeFiber) => {
    const stack: ProbeFiber[] = [root];
    while (stack.length > 0) {
      const fiber = stack.pop();
      if (!fiber) {
        continue;
      }
      const name = componentName(fiber.type);
      if (name) {
        const previous =
          seen.get(fiber) ?? (fiber.alternate ? seen.get(fiber.alternate) : undefined);
        if (
          !previous ||
          previous.props !== fiber.memoizedProps ||
          previous.state !== fiber.memoizedState
        ) {
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        seen.set(fiber, { props: fiber.memoizedProps, state: fiber.memoizedState });
        if (fiber.alternate) {
          seen.delete(fiber.alternate);
        }
      }
      if (fiber.sibling) {
        stack.push(fiber.sibling);
      }
      if (fiber.child) {
        stack.push(fiber.child);
      }
    }
  };
  Object.defineProperty(globalThis, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: {
      isDisabled: false,
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => undefined,
      onCommitFiberRoot: (_rendererId: number, root: { current: ProbeFiber }) =>
        recordCommit(root.current),
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
    },
  });
  return { counts };
});

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="arrangement-exit">
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return {
    ...actual,
    applySchedule: vi.fn(actual.applySchedule),
    renderArrangementWav: vi.fn(),
  };
});

const applyScheduleMock = vi.mocked(applySchedule);
const renderWavMock = vi.mocked(renderArrangementWav);

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

const masterCollection: WorkspaceCollection = {
  id: 'master',
  label: 'master',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'master', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function masterArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
    ],
  };
}

function providerWrapper(initial: Arrangement) {
  return ({ children }: { children: ReactNode }) =>
    createElement(
      ArrangementProvider,
      { collection: masterCollection, initialArrangement: initial },
      children,
    );
}

interface MasterApiRef {
  current: ArrangementContextValue | null;
}

function MasterProbe({ api }: { api: MasterApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MasterApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function waitReal(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function latestHandle(): ScheduleHandle {
  const result = applyScheduleMock.mock.results.at(-1);
  if (!result || result.type !== 'return') {
    throw new Error('no graph was created');
  }
  return result.value;
}

const DONE_MESSAGE = studioExportStrings.wavDone('00:20.000', '');

describe('Master bus (SRW-13 stage 1, FB-14, D-29p)', { timeout: 15_000 }, () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    fakeClock.base = Date.now() / 1000;
    applyScheduleMock.mockClear();
    renderWavMock.mockReset();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: () => 'blob:master-test',
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function runFrames() {
    const pending = frames.splice(0, frames.length);
    act(() => {
      for (const frame of pending) {
        frame(performance.now());
      }
    });
  }

  describe('context and history', () => {
    it('toggleMasterMute commits one Master Mute entry that Undo and Redo restore, with no status text', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      const statusBefore = result.current.status;
      expect(result.current.master).toEqual({ gainDb: 0, mute: false });
      act(() => result.current.toggleMasterMute());
      expect(result.current.master).toEqual({ gainDb: 0, mute: true });
      expect(result.current.arrangement.master.mute).toBe(true);
      expect(result.current.undoLabel).toBe('Master Mute');
      expect(result.current.status).toBe(statusBefore);
      act(() => result.current.undo());
      expect(result.current.master.mute).toBe(false);
      expect(result.current.redoLabel).toBe('Master Mute');
      act(() => result.current.redo());
      expect(result.current.master.mute).toBe(true);
      expect(result.current.undoLabel).toBe('Master Mute');
    });

    it('applies a master change while playing to the live graph without creating a new one', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => result.current.togglePlayback());
      expect(result.current.isPlaying).toBe(true);
      const graphsAtPlay = applyScheduleMock.mock.calls.length;
      expect(graphsAtPlay).toBeGreaterThan(0);
      expect(applyScheduleMock.mock.calls.at(-1)?.[2].masterGain).toBe(1);
      const handle = latestHandle();
      const setMasterGain = vi.spyOn(handle, 'setMasterGain');
      act(() => result.current.toggleMasterMute());
      expect(setMasterGain).toHaveBeenLastCalledWith(0);
      act(() => result.current.toggleMasterMute());
      expect(setMasterGain).toHaveBeenLastCalledWith(1);
      act(() => result.current.previewMasterGain(-6));
      expect(setMasterGain.mock.calls.at(-1)?.[0]).toBeCloseTo(0.501187, 6);
      act(() => result.current.commitMasterGain());
      act(() => result.current.undo());
      expect(setMasterGain).toHaveBeenLastCalledWith(1);
      expect(applyScheduleMock.mock.calls.length).toBe(graphsAtPlay);
      act(() => result.current.togglePlayback());
    });

    it('starts a new graph with the current master gain', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => result.current.toggleMasterMute());
      act(() => result.current.togglePlayback());
      expect(applyScheduleMock.mock.calls.at(-1)?.[2].masterGain).toBe(0);
      act(() => result.current.togglePlayback());
    });

    it('a Master fader pointer drag with several previews gives exactly one Master Volume entry', async () => {
      const { result } = renderHook(
        () => ({ ...useArrangement(), mixDraftStore: useArrangementMixDraftStore() }),
        {
          wrapper: providerWrapper(masterArrangement()),
        },
      );
      await flushLoads();
      let began = false;
      act(() => {
        began = result.current.beginMasterGainGesture(7);
      });
      expect(began).toBe(true);
      act(() => result.current.previewMasterGain(-1));
      act(() => result.current.previewMasterGain(-2.5));
      act(() => result.current.previewMasterGain(-4));
      expect(result.current.mixDraftStore.get(MASTER_GAIN_DRAFT_KEY)).toBe(-4);
      expect(result.current.master.gainDb).toBe(0);
      expect(result.current.undoLabel).toBeNull();
      act(() => result.current.undo());
      expect(result.current.master.gainDb).toBe(0);
      fireEvent.pointerUp(window, { pointerId: 7 });
      expect(result.current.mixDraftStore.get(MASTER_GAIN_DRAFT_KEY)).toBeUndefined();
      expect(result.current.master.gainDb).toBe(-4);
      expect(result.current.undoLabel).toBe('Master Volume');
      expect(result.current.isPointerGestureActive()).toBe(false);
      act(() => result.current.undo());
      expect(result.current.master.gainDb).toBe(0);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.redoLabel).toBe('Master Volume');
    });

    it('keyboard steps commit one Master Volume entry per key-up, and a pending preview is flushed by Undo', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => result.current.previewMasterGain(-0.5));
      act(() => result.current.commitMasterGain());
      act(() => result.current.previewMasterGain(-1));
      act(() => result.current.commitMasterGain());
      act(() => result.current.previewMasterGain(-1.5));
      act(() => result.current.undo());
      expect(result.current.master.gainDb).toBe(-1);
      expect(result.current.redoLabel).toBe('Master Volume');
      act(() => result.current.undo());
      act(() => result.current.undo());
      expect(result.current.master.gainDb).toBe(0);
      expect(result.current.undoLabel).toBeNull();
    });

    it('cancels a Master drag on blur and restores the value without an entry', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => {
        result.current.beginMasterGainGesture(9);
      });
      act(() => result.current.previewMasterGain(-12));
      act(() => result.current.blurMasterGain());
      expect(result.current.master.gainDb).toBe(0);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.isPointerGestureActive()).toBe(false);
    });

    it('refuses Master edits during another pointer gesture and keeps track Volume labelled Volume', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      let release: () => void = () => undefined;
      act(() => {
        release = result.current.beginPointerGesture();
      });
      act(() => result.current.toggleMasterMute());
      act(() => result.current.previewMasterGain(-6));
      expect(result.current.master).toEqual({ gainDb: 0, mute: false });
      act(() => release());
      act(() => result.current.previewTrackVolume('music', 0.5));
      act(() => result.current.commitTrackVolume('music'));
      expect(result.current.undoLabel).toBe('Volume');
      act(() => result.current.toggleTrackMute('music'));
      expect(result.current.undoLabel).toBe('Mute — მუსიკა');
      expect(result.current.master).toEqual({ gainDb: 0, mute: false });
    });

    it('reverts a Master drag on pointercancel without an entry', async () => {
      const { result } = renderHook(
        () => ({ ...useArrangement(), mixDraftStore: useArrangementMixDraftStore() }),
        {
          wrapper: providerWrapper(masterArrangement()),
        },
      );
      await flushLoads();
      act(() => {
        result.current.beginMasterGainGesture(11);
      });
      act(() => result.current.previewMasterGain(-9));
      expect(result.current.mixDraftStore.get(MASTER_GAIN_DRAFT_KEY)).toBe(-9);
      expect(result.current.master.gainDb).toBe(0);
      fireEvent.pointerCancel(window, { pointerId: 11 });
      expect(result.current.mixDraftStore.get(MASTER_GAIN_DRAFT_KEY)).toBeUndefined();
      expect(result.current.master.gainDb).toBe(0);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.isPointerGestureActive()).toBe(false);
    });

    it('refuses a Master drag while another pointer owns a gesture, and keeps that gesture', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      const abortOther = vi.fn();
      let releaseOther: (() => void) | null = null;
      act(() => {
        releaseOther = result.current.claimPointerGesture(3, abortOther);
      });
      expect(releaseOther).not.toBeNull();
      let began = true;
      act(() => {
        began = result.current.beginMasterGainGesture(4);
      });
      expect(began).toBe(false);
      act(() => result.current.previewMasterGain(-6));
      expect(result.current.master.gainDb).toBe(0);
      expect(abortOther).not.toHaveBeenCalled();
      expect(result.current.isPointerGestureActive()).toBe(true);
      act(() => releaseOther?.());
      expect(result.current.isPointerGestureActive()).toBe(false);
    });

    it('removes the Master drag window listeners when the provider unmounts mid-drag', async () => {
      const { result, unmount } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      const added = vi.spyOn(window, 'addEventListener');
      const removed = vi.spyOn(window, 'removeEventListener');
      act(() => {
        result.current.beginMasterGainGesture(12);
      });
      const masterListeners = added.mock.calls.filter(
        ([type, , options]) =>
          (type === 'pointerup' || type === 'pointercancel') && options === true,
      );
      expect(masterListeners.map(([type]) => type)).toEqual(
        expect.arrayContaining(['pointerup', 'pointercancel']),
      );
      unmount();
      for (const [type, listener] of masterListeners) {
        expect(removed).toHaveBeenCalledWith(type, listener, true);
      }
      expect(() => fireEvent.pointerUp(window, { pointerId: 12 })).not.toThrow();
    });
  });

  describe('export state', () => {
    it('adds the overload warning after a clipped render and keeps the done message', async () => {
      renderWavMock.mockResolvedValue({
        blob: new Blob(['x']),
        peak: 1.1,
        clippedSamples: 3,
      });
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      await act(async () => {
        await result.current.exportWav();
      });
      expect(result.current.exportState).toEqual({
        phase: 'done',
        message: DONE_MESSAGE,
        warning: studioExportStrings.overloadWarning({
          peakDb: '0.8',
          clippedSamples: 3,
          reductionDb: '0.9',
        }),
      });
      act(() => result.current.resetExportState());
      expect(result.current.exportState).toEqual({ phase: 'idle', message: null });
    });

    it('has no warning key after a clean render, and renders with the current master', async () => {
      renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 0.5, clippedSamples: 0 });
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => result.current.previewMasterGain(-6));
      act(() => result.current.commitMasterGain());
      await act(async () => {
        await result.current.exportWav();
      });
      expect(result.current.exportState).toEqual({ phase: 'done', message: DONE_MESSAGE });
      expect(Object.hasOwn(result.current.exportState, 'warning')).toBe(false);
      expect(renderWavMock.mock.calls.at(-1)?.[0].master).toEqual({ gainDb: -6, mute: false });
    });

    it('still exports while Master is muted and says the file is silence', async () => {
      renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 0, clippedSamples: 0 });
      const { result } = renderHook(() => useArrangement(), {
        wrapper: providerWrapper(masterArrangement()),
      });
      await flushLoads();
      act(() => result.current.toggleMasterMute());
      await act(async () => {
        await result.current.exportWav();
      });
      expect(renderWavMock).toHaveBeenCalledTimes(1);
      expect(result.current.exportState).toEqual({
        phase: 'done',
        message: `${DONE_MESSAGE}${studioExportStrings.masterMutedSuffix}`,
      });
    });
  });

  describe('ArrangementMaster component', () => {
    it('renders the Master group with Mute, the fader and a readout that follows the value', async () => {
      const api: MasterApiRef = { current: null };
      const view = render(
        <ArrangementProvider collection={masterCollection} initialArrangement={masterArrangement()}>
          <ArrangementMaster />
          <MasterProbe api={api} />
        </ArrangementProvider>,
      );
      await flushLoads();
      const group = view.getByRole('group', { name: 'Master' });
      const mute = view.getByRole('button', { name: 'Master Mute' });
      const fader = view.getByRole('slider', { name: 'Master Volume' });
      const readout = view.getByTestId('arrangement-master-readout');
      expect(group.contains(mute)).toBe(true);
      expect(group.contains(fader)).toBe(true);
      expect(group.contains(readout)).toBe(true);
      expect(mute.compareDocumentPosition(fader) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(mute.textContent).toBe('M');
      expect(mute.getAttribute('aria-pressed')).toBe('false');
      expect(fader.getAttribute('min')).toBe('-60');
      expect(fader.getAttribute('max')).toBe('6');
      expect(fader.getAttribute('step')).toBe('0.5');
      expect(readout.textContent).toBe('0.0 dB');
      expect(fader.getAttribute('aria-valuetext')).toBe('0.0 dB');
      expect(readout.className).toContain('tabular-nums');
      fireEvent.change(fader, { target: { value: '-6' } });
      fireEvent.keyUp(fader, { key: 'ArrowDown' });
      expect(readout.textContent).toBe('−6.0 dB');
      expect(fader.getAttribute('aria-valuetext')).toBe('−6.0 dB');
      expect(live(api).undoLabel).toBe('Master Volume');
      fireEvent.click(mute);
      expect(mute.getAttribute('aria-pressed')).toBe('true');
      expect(live(api).undoLabel).toBe('Master Mute');
    });

    it('sits in the workspace header before the transport and renders 0 times per Play frame', async () => {
      const api: MasterApiRef = { current: null };
      const view = render(
        <ArrangementProvider collection={masterCollection} initialArrangement={masterArrangement()}>
          <StudioWorkspace />
          <MasterProbe api={api} />
        </ArrangementProvider>,
      );
      await flushLoads();
      expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBeGreaterThan(0);
      const header = view.container.querySelector('header');
      const mute = view.getByRole('button', { name: 'Master Mute' });
      const fader = view.getByRole('slider', { name: 'Master Volume' });
      const play = view.getByRole('button', { name: 'Play' });
      expect(header?.contains(mute)).toBe(true);
      expect(header?.contains(fader)).toBe(true);
      const exit = view.getByTestId('arrangement-exit');
      expect(exit.compareDocumentPosition(mute) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(fader.compareDocumentPosition(play) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      fireEvent.click(play);
      expect(live(api).isPlaying).toBe(true);
      await waitReal(450);
      renderLog.counts.clear();
      for (let frame = 0; frame < 30; frame++) {
        runFrames();
      }
      expect(live(api).getLivePosition()).toBeGreaterThan(0.3);
      expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBe(0);
      fireEvent.click(view.getByRole('button', { name: 'Pause' }));
    }, 15000);
  });

  describe('export dialog notes', () => {
    async function mountDialog() {
      const api: MasterApiRef = { current: null };
      const onClose = vi.fn();
      const view = render(
        <ArrangementProvider collection={masterCollection} initialArrangement={masterArrangement()}>
          <ArrangementExportDialog isOpen onClose={onClose} />
          <MasterProbe api={api} />
        </ArrangementProvider>,
      );
      await flushLoads();
      return { api, view };
    }

    it('shows the master-mute note only when muted and keeps the export button enabled', async () => {
      const { api, view } = await mountDialog();
      expect(view.queryByTestId('arrangement-export-master-mute')).toBeNull();
      act(() => live(api).toggleMasterMute());
      const note = view.getByTestId('arrangement-export-master-mute');
      expect(note.getAttribute('role')).toBe('note');
      expect(note.textContent).toBe(
        studioExportStrings.masterMutedNote(studioExportStrings.formatCreatesWav, '00:20.000'),
      );
      const exportButton = view.getByRole('button', { name: studioExportStrings.formatButtonWav });
      expect(exportButton).toHaveProperty('disabled', false);
      act(() => live(api).toggleMasterMute());
      expect(view.queryByTestId('arrangement-export-master-mute')).toBeNull();
    });

    it('shows the gain note only at a non-zero Master gain', async () => {
      const { api, view } = await mountDialog();
      expect(view.queryByTestId('arrangement-export-master-gain')).toBeNull();
      act(() => live(api).previewMasterGain(-6));
      act(() => live(api).commitMasterGain());
      expect(view.getByTestId('arrangement-export-master-gain').textContent).toBe(
        studioExportStrings.masterGainNote('−6.0 dB'),
      );
      act(() => live(api).previewMasterGain(0));
      act(() => live(api).commitMasterGain());
      expect(view.queryByTestId('arrangement-export-master-gain')).toBeNull();
    });

    it('renders the overload warning as an alert after a clipped export and removes it on close', async () => {
      renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 1.1, clippedSamples: 3 });
      const { api, view } = await mountDialog();
      expect(view.queryByTestId('arrangement-export-overload')).toBeNull();
      await act(async () => {
        fireEvent.click(view.getByRole('button', { name: studioExportStrings.formatButtonWav }));
        await Promise.resolve();
        await Promise.resolve();
      });
      const alert = view.getByTestId('arrangement-export-overload');
      expect(alert.getAttribute('role')).toBe('alert');
      expect(alert.className).toContain('text-foreground');
      expect(alert.className).not.toContain('text-accent');
      expect(alert.className).not.toContain('text-destructive');
      expect(alert.textContent).toBe(
        studioExportStrings.overloadWarning({
          peakDb: '0.8',
          clippedSamples: 3,
          reductionDb: '0.9',
        }),
      );
      fireEvent.click(view.getByRole('button', { name: studioExportStrings.closeButton }));
      expect(live(api).exportState).toEqual({ phase: 'idle', message: null });
      expect(view.queryByTestId('arrangement-export-overload')).toBeNull();
    });
  });
});
