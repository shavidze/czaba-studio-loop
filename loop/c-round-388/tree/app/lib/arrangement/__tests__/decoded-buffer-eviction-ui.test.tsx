import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import {
  type ArrangementWavResult,
  applySchedule,
  renderArrangementWav,
} from '~/lib/arrangement/graph.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { addClip, createArrangement } from '../model';
import { studioExportStrings, studioLibraryStrings, studioPlaybackStrings } from '../strings';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

interface ObservedDecodedCache {
  has: (id: string) => boolean;
  setPinnedCalls: () => number;
  deleteManyCalls: () => string[][];
  clearCalls: () => number;
}

const cacheObserver = vi.hoisted(() => {
  const instances: ObservedDecodedCache[] = [];
  return { instances };
});

vi.mock('~/lib/arrangement/decoded-buffer-cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/decoded-buffer-cache')>();
  const createSpiedCache: typeof actual.createDecodedBufferCache = (options) => {
    const cache = actual.createDecodedBufferCache(options);
    const setPinned = vi.fn(cache.setPinned);
    const deleteManyCalls: string[][] = [];
    const deleteMany = vi.fn((ids: Iterable<string>) => {
      const list = [...ids];
      deleteManyCalls.push(list);
      cache.deleteMany(list);
    });
    const clear = vi.fn(cache.clear);
    cacheObserver.instances.push({
      has: cache.has,
      setPinnedCalls: () => setPinned.mock.calls.length,
      deleteManyCalls: () => deleteManyCalls.map((ids) => [...ids]),
      clearCalls: () => clear.mock.calls.length,
    });
    return { ...cache, setPinned, deleteMany, clear };
  };
  return { ...actual, createDecodedBufferCache: vi.fn(createSpiedCache) };
});

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, applySchedule: vi.fn(actual.applySchedule), renderArrangementWav: vi.fn() };
});

const renderWavMock = vi.mocked(renderArrangementWav);
const applyScheduleMock = vi.mocked(applySchedule);

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

const createdSources: FakeSource[] = [];

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
    const source = new FakeSource();
    createdSources.push(source);
    return source;
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

const BIG_TITLE = 'Big Preview';
const KEEP_TITLE = 'Kept Synth';
const BIG_FRAMES = (40 * 1024 * 1024) / 4;
const SAMPLE_RATE = 48000;
const DECODE_ERROR = 'Decode failed (network)';

interface PendingLoad {
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: Error) => void;
}

function bigBuffer(): AudioBuffer {
  return new AudioBuffer({ length: BIG_FRAMES, numberOfChannels: 1, sampleRate: SAMPLE_RATE });
}

function evictionCollection() {
  const pending: PendingLoad[] = [];
  const bigLoads = { count: 0 };
  const collection: WorkspaceCollection = {
    id: 'eviction',
    label: 'eviction',
    origin: 'demo',
    sources: [
      { id: 'big', title: BIG_TITLE, collectionLabel: 'eviction', kind: 'music', origin: 'demo' },
      { id: 'keep', title: KEEP_TITLE, collectionLabel: 'eviction', kind: 'sfx', origin: 'demo' },
    ],
    loadSource: (source) => {
      if (source.id === 'keep') {
        return Promise.resolve(
          new AudioBuffer({ length: 4800, numberOfChannels: 2, sampleRate: SAMPLE_RATE }),
        );
      }
      bigLoads.count += 1;
      return new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      });
    },
    canReloadSource: (source) => source.id === 'big',
  };
  return { collection, pending, bigLoads };
}

function evictionArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface ProbeRef {
  current: WorkspaceProbeValue | null;
}

function EvictionProbe({ api }: { api: ProbeRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: ProbeRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushAsync(rounds = 5) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

function observedCache(): ObservedDecodedCache {
  const cache = cacheObserver.instances.at(-1);
  if (!cache) {
    throw new Error('decoded buffer cache not created');
  }
  return cache;
}

async function settleNext(pending: PendingLoad[], outcome: AudioBuffer | Error) {
  const next = pending.shift();
  if (!next) {
    throw new Error('no decode in flight');
  }
  if (outcome instanceof Error) {
    next.reject(outcome);
  } else {
    next.resolve(outcome);
  }
  await flushAsync();
}

async function mountEviction() {
  const setup = evictionCollection();
  const api: ProbeRef = { current: null };
  const view = render(
    <ArrangementProvider collection={setup.collection} initialArrangement={evictionArrangement()}>
      <EvictionProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  await settleNext(setup.pending, bigBuffer());
  return { ...setup, api, view };
}

async function placeBigDecoded(api: ProbeRef, pending: PendingLoad[]) {
  act(() => live(api).addSourceToActiveTrack('big'));
  await settleNext(pending, bigBuffer());
  expect(observedCache().has('big')).toBe(true);
}

function sameTickPeaksCollection() {
  const pending: PendingLoad[] = [];
  const collection: WorkspaceCollection = {
    id: 'same-tick',
    label: 'same-tick',
    origin: 'demo',
    sources: [
      { id: 'first', title: 'First', collectionLabel: 'same-tick', kind: 'sfx', origin: 'demo' },
      { id: 'second', title: 'Second', collectionLabel: 'same-tick', kind: 'sfx', origin: 'demo' },
    ],
    loadSource: () =>
      new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
  };
  return { collection, pending };
}

describe('decoded audio eviction and re-decode (PERF-13b-i)', () => {
  beforeEach(() => {
    cacheObserver.instances.length = 0;
    createdSources.length = 0;
    fakeClock.base = Date.now() / 1000;
    renderWavMock.mockReset();
    applyScheduleMock.mockReset();
    renderWavMock.mockResolvedValue({
      blob: new Blob(['wav']),
      peak: 0.5,
      clippedSamples: 0,
    });
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: () => 'blob:eviction-test',
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

  it('EV1: after load the evictable buffer is gone, the other stays, and both stay ready', async () => {
    const { api } = await mountEviction();
    const cache = observedCache();
    expect(cache.has('big')).toBe(false);
    expect(cache.has('keep')).toBe(true);
    expect(live(api).sourceStates.big).toEqual({
      status: 'ready',
      duration: BIG_FRAMES / SAMPLE_RATE,
      error: null,
    });
    expect(live(api).sourceStates.keep).toEqual({
      status: 'ready',
      duration: 4800 / SAMPLE_RATE,
      error: null,
    });
  });

  it('EV2: placing the evicted source decodes it again exactly once, even when placed twice in flight', async () => {
    const { api, pending, bigLoads } = await mountEviction();
    expect(bigLoads.count).toBe(1);
    act(() => live(api).addSourceToActiveTrack('big'));
    expect(bigLoads.count).toBe(2);
    act(() => live(api).addSourceToActiveTrack('big'));
    expect(live(api).arrangement.clips.filter((clip) => clip.sourceId === 'big')).toHaveLength(2);
    expect(bigLoads.count).toBe(2);
    expect(pending).toHaveLength(1);
    await settleNext(pending, bigBuffer());
    expect(observedCache().has('big')).toBe(true);
    expect(live(api).sourceStates.big?.status).toBe('ready');
  });

  it('EV3: Play is refused while the placed source decodes, and starts once it settles', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    await settleNext(pending, bigBuffer());
    expect(live(api).isPlaying).toBe(false);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).togglePlayback());
  });

  it('EV3: while already playing, a newly placed clip joins through the resync and playback never stops', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('keep'));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).addSourceToActiveTrack('big'));
    expect(live(api).isPlaying).toBe(true);
    const decoded = bigBuffer();
    expect(createdSources.some((source) => source.buffer === decoded)).toBe(false);
    await settleNext(pending, decoded);
    expect(live(api).isPlaying).toBe(true);
    expect(createdSources.some((source) => source.buffer === decoded)).toBe(true);
    act(() => live(api).togglePlayback());
  });

  it('EV4: Undo of the place evicts the buffer again, and Redo decodes it again', async () => {
    const { api, pending, bigLoads } = await mountEviction();
    await placeBigDecoded(api, pending);
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(observedCache().has('big')).toBe(false);
    act(() => live(api).redo());
    expect(live(api).arrangement.clips).toHaveLength(1);
    expect(bigLoads.count).toBe(3);
    await settleNext(pending, bigBuffer());
    expect(observedCache().has('big')).toBe(true);
  });

  it('EV5: export waits for the decode, renders with the buffer, and releases its pins', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    const heldAtRender: boolean[] = [];
    renderWavMock.mockImplementation(async (_arrangement, buffers) => {
      heldAtRender.push(buffers.has('big'));
      return { blob: new Blob(['wav']), peak: 0.5, clippedSamples: 0 };
    });
    let exported: Promise<void> = Promise.resolve();
    act(() => {
      exported = live(api).exportWav();
    });
    await flushAsync();
    expect(renderWavMock).not.toHaveBeenCalled();
    await settleNext(pending, bigBuffer());
    await act(async () => {
      await exported;
    });
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(heldAtRender).toEqual([true]);
    expect(live(api).exportState.phase).toBe('done');
    act(() => live(api).undo());
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV5: a cancelled export also releases its pins', async () => {
    const { api, pending } = await mountEviction();
    await placeBigDecoded(api, pending);
    renderWavMock.mockImplementation(
      (_arrangement, _buffers, _window, options) =>
        new Promise<ArrangementWavResult>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('cancelled')));
        }),
    );
    let exported: Promise<void> = Promise.resolve();
    act(() => {
      exported = live(api).exportWav();
    });
    await flushAsync();
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    act(() => live(api).cancelExport());
    await act(async () => {
      await exported;
    });
    expect(live(api).exportState.phase).toBe('cancelled');
    act(() => live(api).undo());
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV5: a replaced export does not release the pins of the export that replaced it', async () => {
    const { api, pending } = await mountEviction();
    await placeBigDecoded(api, pending);
    renderWavMock.mockImplementation(
      (_arrangement, _buffers, _window, options) =>
        new Promise<ArrangementWavResult>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('cancelled')));
        }),
    );
    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = live(api).exportWav();
    });
    await flushAsync();
    let second: Promise<void> = Promise.resolve();
    act(() => {
      second = live(api).exportWav();
    });
    await act(async () => {
      await first;
    });
    await flushAsync();
    expect(renderWavMock).toHaveBeenCalledTimes(2);
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(observedCache().has('big')).toBe(true);
    act(() => live(api).cancelExport());
    await act(async () => {
      await second;
    });
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV6: a failed re-decode sets the source to error and shows the existing failure text', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).sourceStates.big).toEqual({
      status: 'error',
      duration: 0,
      error: DECODE_ERROR,
    });
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe(null);
  });

  it('EV6: an export whose re-decode fails creates no file and shows the export failure text', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    let exported: Promise<void> = Promise.resolve();
    act(() => {
      exported = live(api).exportWav();
    });
    await settleNext(pending, new Error(DECODE_ERROR));
    await act(async () => {
      await exported;
    });
    expect(renderWavMock).not.toHaveBeenCalled();
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: studioExportStrings.exportFailed(studioLibraryStrings.sourceFailed(BIG_TITLE)),
    });
  });

  it('EV9: a preview plays the re-decoded source and releases it on Stop', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).libraryPreviewSourceId).toBe(null);
    await settleNext(pending, bigBuffer());
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(observedCache().has('big')).toBe(true);
    act(() => live(api).stopLibraryPreview());
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV9: a superseded preview request does not start when its decode settles', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    act(() => live(api).startLibraryPreview('keep', 0));
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    const statusBefore = live(api).status;
    await settleNext(pending, bigBuffer());
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    expect(live(api).status).toBe(statusBefore);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV7: a collection change deletes exactly the old collection ids, never clears, and an old decode in flight never sets', async () => {
    const { api, pending, view } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    expect(pending).toHaveLength(1);
    const cache = observedCache();
    expect(cache.has('keep')).toBe(true);
    const deleteManyBefore = cache.deleteManyCalls().length;
    const next: WorkspaceCollection = {
      id: 'next',
      label: 'next',
      origin: 'demo',
      sources: [
        { id: 'other', title: 'Other', collectionLabel: 'next', kind: 'sfx', origin: 'demo' },
      ],
      loadSource: () => new Promise<AudioBuffer>(() => undefined),
    };
    view.rerender(
      <ArrangementProvider collection={next} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    expect(cache.has('keep')).toBe(false);
    expect(cache.deleteManyCalls().slice(deleteManyBefore)).toEqual([['big', 'keep']]);
    expect(cache.clearCalls()).toBe(0);
    await settleNext(pending, bigBuffer());
    expect(cache.has('big')).toBe(false);
    expect(cache.clearCalls()).toBe(0);
  });

  it('EV10: peaks of two sources that arrive in the same tick are both kept, each with its own array', async () => {
    const { collection, pending } = sameTickPeaksCollection();
    const api: ProbeRef = { current: null };
    render(
      <ArrangementProvider collection={collection} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    expect(pending).toHaveLength(2);
    expect(live(api).sourcePeaks.size).toBe(0);
    const [first, second] = pending;
    await act(async () => {
      first?.resolve(
        new AudioBuffer({ length: 4800, numberOfChannels: 1, sampleRate: SAMPLE_RATE }),
      );
      second?.resolve(
        new AudioBuffer({ length: 9600, numberOfChannels: 2, sampleRate: SAMPLE_RATE }),
      );
    });
    await flushAsync();
    const peaks = live(api).sourcePeaks;
    expect([...peaks.keys()]).toEqual(['first', 'second']);
    const firstPeaks = peaks.get('first');
    const secondPeaks = peaks.get('second');
    expect(firstPeaks).toBeInstanceOf(Float32Array);
    expect(secondPeaks).toBeInstanceOf(Float32Array);
    expect(firstPeaks).not.toBe(secondPeaks);
    expect(live(api).sourceStates.first?.status).toBe('ready');
    expect(live(api).sourceStates.second?.status).toBe('ready');
  });

  it('EV8: a volume edit that keeps the clips array does not recompute pins', async () => {
    const { api, pending } = await mountEviction();
    await placeBigDecoded(api, pending);
    const cache = observedCache();
    const before = cache.setPinnedCalls();
    const clipsBefore = live(api).arrangement.clips;
    act(() => live(api).previewTrackVolume('music', 0.25));
    act(() => live(api).commitTrackVolume('music'));
    expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.volume).toBe(0.25);
    expect(live(api).arrangement.clips).toBe(clipsBefore);
    expect(cache.setPinnedCalls()).toBe(before);
    act(() => live(api).addSourceToActiveTrack('keep'));
    expect(cache.setPinnedCalls()).toBe(before + 1);
  });
  it('EV11: a resync that throws after a re-decode while playing stops playback with a status and leaks no rejection', async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => {
      rejections.push(reason);
    };
    process.on('unhandledRejection', onRejection);
    try {
      const { api, pending } = await mountEviction();
      act(() => live(api).addSourceToActiveTrack('keep'));
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      act(() => live(api).addSourceToActiveTrack('big'));
      applyScheduleMock.mockImplementationOnce(() => {
        throw new Error('schedule failed');
      });
      await settleNext(pending, bigBuffer());
      await flushAsync(10);
      expect(rejections).toEqual([]);
      expect(live(api).isPlaying).toBe(false);
      expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
      expect(live(api).sourceStates.big?.status).toBe('ready');
      expect(observedCache().has('big')).toBe(true);
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      expect(live(api).status).not.toBe(studioPlaybackStrings.scheduleFailed);
      expect(live(api).status.startsWith('Playing from ')).toBe(true);
      act(() => live(api).togglePlayback());
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });

  it('EV11: an export waiting on the same re-decode still renders when the resync throws', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('keep'));
    act(() => live(api).togglePlayback());
    act(() => live(api).addSourceToActiveTrack('big'));
    let exported: Promise<void> = Promise.resolve();
    act(() => {
      exported = live(api).exportWav();
    });
    applyScheduleMock.mockImplementationOnce(() => {
      throw new Error('schedule failed');
    });
    await settleNext(pending, bigBuffer());
    await act(async () => {
      await exported;
    });
    expect(live(api).isPlaying).toBe(false);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState.phase).not.toBe('error');
  });

  it('EV12: a stale preview call from before a collection change decodes nothing under the new collection', async () => {
    const { api, view, bigLoads } = await mountEviction();
    const stale = live(api);
    const next: WorkspaceCollection = {
      id: 'next',
      label: 'next',
      origin: 'demo',
      sources: [
        { id: 'other', title: 'Other', collectionLabel: 'next', kind: 'sfx', origin: 'demo' },
      ],
      loadSource: () => new Promise<AudioBuffer>(() => undefined),
    };
    view.rerender(
      <ArrangementProvider collection={next} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    const loadsBefore = bigLoads.count;
    act(() => stale.startLibraryPreview('big', 0));
    await flushAsync();
    expect(bigLoads.count).toBe(loadsBefore);
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV13: a preview of an evicted source keeps the timeline playing until its decode succeeds', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('keep'));
    act(() => live(api).togglePlayback());
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    await settleNext(pending, bigBuffer());
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).libraryPreviewSourceId).toBe('big');
    act(() => live(api).stopLibraryPreview());
  });

  it('EV13: a preview whose decode fails leaves the timeline playing and shows the failure text', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('keep'));
    act(() => live(api).togglePlayback());
    act(() => live(api).startLibraryPreview('big', 0));
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    act(() => live(api).togglePlayback());
  });

  it('EV14: re-rendering the provider with the same collection loads nothing again and deletes no buffer', async () => {
    const { api, view, bigLoads, collection } = await mountEviction();
    const cache = observedCache();
    const loadsBefore = bigLoads.count;
    const deleteManyBefore = cache.deleteManyCalls().length;
    view.rerender(
      <ArrangementProvider collection={collection} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    act(() => live(api).addSourceToActiveTrack('keep'));
    await flushAsync();
    expect(bigLoads.count).toBe(loadsBefore);
    expect(cache.deleteManyCalls().length).toBe(deleteManyBefore);
    expect(cache.has('keep')).toBe(true);
  });
  it('EV15: a resync that throws after the first load of a placed source stops playback and keeps the source ready', async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => {
      rejections.push(reason);
    };
    process.on('unhandledRejection', onRejection);
    try {
      const setup = evictionCollection();
      const withKeep = addClip(evictionArrangement(), {
        trackId: 'music',
        sourceId: 'keep',
        sourceDuration: 0.1,
        desiredStart: 0,
      });
      const withBig = withKeep
        ? addClip(withKeep.arrangement, {
            trackId: 'music',
            sourceId: 'big',
            sourceDuration: 10,
            desiredStart: 1,
          })
        : null;
      if (!withBig) {
        throw new Error('seed arrangement not built');
      }
      const api: ProbeRef = { current: null };
      render(
        <ArrangementProvider collection={setup.collection} initialArrangement={withBig.arrangement}>
          <EvictionProbe api={api} />
        </ArrangementProvider>,
      );
      await flushAsync();
      expect(live(api).sourceStates.big?.status).toBe('loading');
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      applyScheduleMock.mockImplementationOnce(() => {
        throw new Error('schedule failed');
      });
      await settleNext(setup.pending, bigBuffer());
      await flushAsync(10);
      expect(rejections).toEqual([]);
      expect(live(api).isPlaying).toBe(false);
      expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
      expect(live(api).sourceStates.big?.status).toBe('ready');
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });
});
