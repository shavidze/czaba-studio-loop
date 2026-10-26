import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { Component, createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
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
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';

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
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
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

const hygieneCollection: WorkspaceCollection = {
  id: 'context-hygiene',
  label: 'context-hygiene',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'context-hygiene',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'context-hygiene', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function hygieneArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

interface HygieneApiRef {
  current: ArrangementContextValue | null;
}

interface ConsumerRenderCounter {
  count: number;
}

function CountingConsumerProbe({
  api,
  renders,
}: {
  api: HygieneApiRef;
  renders: ConsumerRenderCounter;
}) {
  renders.count += 1;
  api.current = useArrangement();
  return null;
}

function live(api: HygieneApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(readApi: () => ArrangementContextValue): string[] {
  const labels: string[] = [];
  for (let label = readApi().undoLabel; label !== null; label = readApi().undoLabel) {
    labels.push(label);
    act(() => readApi().undo());
  }
  return labels;
}

async function mountCountedProvider() {
  const api: HygieneApiRef = { current: null };
  const renders: ConsumerRenderCounter = { count: 0 };
  render(
    <ArrangementProvider collection={hygieneCollection} initialArrangement={hygieneArrangement()}>
      <CountingConsumerProbe api={api} renders={renders} />
    </ArrangementProvider>,
  );
  await flushLoads();
  return { api, renders };
}

async function mountCountedWorkspace() {
  const api: HygieneApiRef = { current: null };
  const renders: ConsumerRenderCounter = { count: 0 };
  const view = render(
    <ArrangementProvider collection={hygieneCollection} initialArrangement={hygieneArrangement()}>
      <StudioWorkspace />
      <CountingConsumerProbe api={api} renders={renders} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const musicVolume = () => {
    const input = view.container.querySelector(
      '[data-track-id="music"] input[aria-label="Volume — მუსიკა"]',
    );
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('music volume missing');
    }
    return input;
  };
  const status = () => view.getByTestId('arrangement-status').textContent;
  return { api, renders, view, musicVolume, status };
}

interface CaughtErrorState {
  message: string | null;
}

class CatchHookError extends Component<
  { children: ReactNode; onError: (message: string) => void },
  CaughtErrorState
> {
  state: CaughtErrorState = { message: null };

  static getDerivedStateFromError(error: unknown): CaughtErrorState {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : String(error));
  }

  render() {
    return this.state.message === null ? this.props.children : null;
  }
}

function PositionStoreOutsideProvider() {
  useArrangementPositionStore();
  return null;
}

function ArrangementOutsideProvider() {
  useArrangement();
  return null;
}

function thrownOutsideProvider(child: ReactNode): string | null {
  let caught: string | null = null;
  render(
    <CatchHookError
      onError={(message: string) => {
        caught = message;
      }}
    >
      {child}
    </CatchHookError>,
  );
  return caught;
}

describe('context hygiene (D-29z9, round 44) — counts React renders (consumer and provider), not audio', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
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
  });

  describe('PREVIEW-VOLUME-IDENTITY: a no-change Volume preview does nothing', () => {
    it('PV1: previewing the stored volume 1 causes 0 consumer renders and no entry', async () => {
      const { api, renders } = await mountCountedProvider();
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      const undoBefore = live(api).undoLabel;
      const arrangementBefore = live(api).arrangement;
      renders.count = 0;
      act(() => live(api).previewTrackVolume('music', 1));
      expect(renders.count).toBe(0);
      expect(live(api).arrangement).toBe(arrangementBefore);
      act(() => live(api).commitTrackVolume('music'));
      expect(renders.count).toBe(0);
      expect(live(api).undoLabel).toBe(undoBefore);
      expect(undoChainLabels(() => live(api))).toEqual([]);
    });

    it('PV2: a preview above the range clamps to the stored 1 and causes 0 consumer renders and no entry', async () => {
      const { api, renders } = await mountCountedProvider();
      const arrangementBefore = live(api).arrangement;
      renders.count = 0;
      act(() => live(api).previewTrackVolume('music', 1.5));
      expect(renders.count).toBe(0);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      act(() => live(api).commitTrackVolume('music'));
      expect(renders.count).toBe(0);
      expect(live(api).undoLabel).toBeNull();
    });

    it('PV3: a preview for a missing track causes 0 consumer renders and no entry', async () => {
      const { api, renders } = await mountCountedProvider();
      const arrangementBefore = live(api).arrangement;
      renders.count = 0;
      act(() => live(api).previewTrackVolume('no-such-track', 0.5));
      expect(renders.count).toBe(0);
      expect(live(api).arrangement).toBe(arrangementBefore);
      act(() => live(api).commitTrackVolume('no-such-track'));
      expect(renders.count).toBe(0);
      expect(live(api).undoLabel).toBeNull();
    });

    it('PV4: a double-click on the music Volume fader at 0 dB causes 0 provider and 0 consumer renders and 0 entries', async () => {
      const { api, renders, musicVolume, status } = await mountCountedWorkspace();
      expect(renderLog.counts.get('ArrangementProvider') ?? 0).toBeGreaterThan(0);
      expect(musicVolume().value).toBe('0');
      const statusBefore = status();
      const arrangementBefore = live(api).arrangement;
      renders.count = 0;
      renderLog.counts.clear();
      fireEvent.doubleClick(musicVolume());
      expect(renderLog.counts.get('ArrangementProvider') ?? 0).toBe(0);
      expect(renders.count).toBe(0);
      expect(live(api).arrangement).toBe(arrangementBefore);
      expect(musicVolume().value).toBe('0');
      expect(status()).toBe(statusBefore);
      expect(live(api).undoLabel).toBeNull();
    });

    it('PV5: an off-default round trip writes one Volume entry per change and Undo returns to 0.72', async () => {
      const { api, musicVolume } = await mountCountedWorkspace();
      act(() => live(api).previewTrackVolume('music', 0.72));
      act(() => live(api).commitTrackVolume('music'));
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.72);
      fireEvent.doubleClick(musicVolume());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      expect(musicVolume().value).toBe('0');
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.72);
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      expect(live(api).undoLabel).toBeNull();
    });

    it('PV6: repeating a pending preview value keeps the first before snapshot and commits one entry', async () => {
      const { api } = await mountCountedProvider();
      act(() => live(api).previewTrackVolume('music', 0.72));
      act(() => live(api).previewTrackVolume('music', 0.72));
      act(() => live(api).commitTrackVolume('music'));
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.72);
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      act(() => live(api).undo());
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      expect(live(api).undoLabel).toBeNull();
    });

    it('PV7: a no-change Volume preview still flushes a pending Master preview exactly once', async () => {
      const { api } = await mountCountedProvider();
      act(() => live(api).previewMasterGain(-3));
      expect(live(api).undoLabel).toBeNull();
      act(() => live(api).previewTrackVolume('music', 1));
      expect(live(api).undoLabel).toBe(MASTER_VOLUME_LABEL);
      expect(live(api).arrangement.master.gainDb).toBe(-3);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
      act(() => live(api).commitTrackVolume('music'));
      expect(undoChainLabels(() => live(api))).toEqual([MASTER_VOLUME_LABEL]);
      expect(live(api).arrangement.master.gainDb).toBe(0);
    });

    it('PV8: a pending preview that returns to the value before the gesture commits 0 entries', async () => {
      const { result } = renderHook(() => useArrangement(), {
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(
            ArrangementProvider,
            { collection: hygieneCollection, initialArrangement: hygieneArrangement() },
            children,
          ),
      });
      await flushLoads();
      const statusBefore = result.current.status;
      act(() => result.current.previewTrackVolume('music', 0.72));
      expect(trackOf(result.current.arrangement, 'music').volume).toBe(0.72);
      act(() => result.current.previewTrackVolume('music', 1));
      expect(trackOf(result.current.arrangement, 'music').volume).toBe(1);
      act(() => result.current.commitTrackVolume('music'));
      expect(trackOf(result.current.arrangement, 'music').volume).toBe(1);
      expect(result.current.undoLabel).toBeNull();
      expect(result.current.status).toBe(statusBefore);
    });
  });

  describe('R9-REVIEWER-L8: the provider hook errors name the hook that failed', () => {
    it('L8a: useArrangementPositionStore outside a provider throws its own name', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(thrownOutsideProvider(<PositionStoreOutsideProvider />)).toBe(
        'useArrangementPositionStore must be used within an ArrangementProvider',
      );
    });

    it('L8b: useArrangement outside a provider keeps its own name', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(thrownOutsideProvider(<ArrangementOutsideProvider />)).toBe(
        'useArrangement must be used within an ArrangementProvider',
      );
    });
  });
});
