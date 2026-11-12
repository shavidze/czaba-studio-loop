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
import { createFakeWebAudio } from './helpers/fake-web-audio';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

interface ObservedDecodedCache {
  has: (id: string) => boolean;
  setPinnedCalls: () => number;
  setPinnedArgs: () => [string, string[]][];
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
      setPinnedArgs: () =>
        setPinned.mock.calls.map(([owner, ids]): [string, string[]] => [owner, [...ids]]),
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

const mp3EncoderStub = vi.hoisted(() => ({
  encode: vi.fn(async (_wav: Blob) => new Blob(['mp3'])),
}));

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: async () => ({ encode: mp3EncoderStub.encode }),
  resetArrangementMp3Encoder: () => undefined,
}));

const renderWavMock = vi.mocked(renderArrangementWav);
const applyScheduleMock = vi.mocked(applySchedule);

const { createdSources, install } = createFakeWebAudio();

const BIG_TITLE = 'Big Preview';
const KEEP_TITLE = 'Kept Synth';
const SECOND_BIG_TITLE = 'Second Big Preview';
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

function twoEvictableCollection() {
  const pending: PendingLoad[] = [];
  const collection: WorkspaceCollection = {
    id: 'two-evictable',
    label: 'two-evictable',
    origin: 'demo',
    sources: [
      { id: 'big', title: BIG_TITLE, collectionLabel: 'two', kind: 'music', origin: 'demo' },
      {
        id: 'big2',
        title: SECOND_BIG_TITLE,
        collectionLabel: 'two',
        kind: 'music',
        origin: 'demo',
      },
    ],
    loadSource: () =>
      new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
    canReloadSource: () => true,
  };
  return { collection, pending };
}

describe('decoded audio eviction and re-decode (PERF-13b-i)', () => {
  beforeEach(() => {
    cacheObserver.instances.length = 0;
    renderWavMock.mockReset();
    applyScheduleMock.mockReset();
    renderWavMock.mockResolvedValue({
      blob: new Blob(['wav']),
      peak: 0.5,
      clippedSamples: 0,
    });
    install();
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
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, bigBuffer());
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
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
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, bigBuffer());
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
    expect(observedCache().has('big')).toBe(true);
    act(() => live(api).stopLibraryPreview());
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV9: a superseded preview request does not start when its decode settles', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    act(() => live(api).startLibraryPreview('keep', 0));
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    await settleNext(pending, bigBuffer());
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    expect(observedCache().has('big')).toBe(false);
  });

  it('EV9: a preview stopped before its decode settles shows the ready text and does not start', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    act(() => live(api).stopLibraryPreview());
    await settleNext(pending, bigBuffer());
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
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
    const cache = observedCache();
    const pinsBefore = cache.setPinnedArgs().length;
    const statuses: string[] = [live(api).status];
    act(() => stale.startLibraryPreview('big', 0));
    statuses.push(live(api).status);
    for (let i = 0; i < 3; i++) {
      await flushAsync();
      statuses.push(live(api).status);
    }
    console.info(`EV12 record: statuses=${JSON.stringify(statuses)}`);
    expect(bigLoads.count).toBe(loadsBefore);
    expect(cache.has('big')).toBe(false);
    expect(live(api).status).toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    expect(statuses).not.toContain(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    expect(cache.setPinnedArgs().slice(pinsBefore)).not.toContainEqual(['preview', ['big']]);
    expect(live(api).libraryPreviewSourceId).toBe(null);
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

  it('EV16: a status written during the wait survives a successful settle', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    act(() => live(api).addSourceToActiveTrack('keep'));
    const secondWrite = live(api).status;
    expect(secondWrite).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, bigBuffer());
    expect(live(api).status).toBe(secondWrite);
    expect(live(api).isPlaying).toBe(false);
  });

  it('EV16: a failed settle writes the failure even after another status replaced the loading text', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    act(() => live(api).addSourceToActiveTrack('keep'));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    expect(live(api).isPlaying).toBe(false);
  });

  it('EV17: Play waits for every awaited source, and a later failure names that source', async () => {
    const setup = twoEvictableCollection();
    const api: ProbeRef = { current: null };
    render(
      <ArrangementProvider collection={setup.collection} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    await settleNext(setup.pending, bigBuffer());
    await settleNext(setup.pending, bigBuffer());
    expect(observedCache().has('big')).toBe(false);
    expect(observedCache().has('big2')).toBe(false);
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).addSourceToActiveTrack('big2'));
    expect(setup.pending).toHaveLength(2);
    act(() => live(api).togglePlayback());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(setup.pending, bigBuffer());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(setup.pending, new Error(DECODE_ERROR));
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(SECOND_BIG_TITLE));
    expect(live(api).isPlaying).toBe(false);
  });

  it('EV17: when every awaited source decodes, the ready text comes only after the last one', async () => {
    const setup = twoEvictableCollection();
    const api: ProbeRef = { current: null };
    render(
      <ArrangementProvider collection={setup.collection} initialArrangement={evictionArrangement()}>
        <EvictionProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    await settleNext(setup.pending, bigBuffer());
    await settleNext(setup.pending, bigBuffer());
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).addSourceToActiveTrack('big2'));
    act(() => live(api).togglePlayback());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(setup.pending, bigBuffer());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(setup.pending, bigBuffer());
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
    expect(live(api).isPlaying).toBe(false);
  });

  it('EV18: a preview whose re-decode fails shows the failure text and does not start', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe(null);
  });

  it('EV19: an export refuses a clip whose source failed, renders nothing and releases its pins', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).sourceStates.big?.status).toBe('error');
    act(() => live(api).addSourceToActiveTrack('keep'));
    const cache = observedCache();
    const pinsBefore = cache.setPinnedArgs().length;
    await act(async () => {
      await live(api).exportWav();
    });
    expect(renderWavMock).not.toHaveBeenCalled();
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: studioExportStrings.exportFailed(studioLibraryStrings.sourceFailed(BIG_TITLE)),
    });
    expect(cache.setPinnedArgs().slice(pinsBefore)).toEqual([
      ['export', ['big', 'keep']],
      ['export', []],
    ]);
  });

  it('EV20: a range export whose window misses the failed clip still renders', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, new Error(DECODE_ERROR));
    act(() => live(api).addSourceToActiveTrack('keep'));
    const bigClip = live(api).arrangement.clips.find((clip) => clip.sourceId === 'big');
    const keepClip = live(api).arrangement.clips.find((clip) => clip.sourceId === 'keep');
    if (!bigClip || !keepClip) {
      throw new Error('clips not placed');
    }
    const renderWindow = { start: keepClip.start, end: keepClip.start + keepClip.duration };
    expect(
      bigClip.start < renderWindow.end && bigClip.start + bigClip.duration > renderWindow.start,
    ).toBe(false);
    await act(async () => {
      await live(api).exportWav(renderWindow);
    });
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState.phase).toBe('done');
  });

  it('EV21: Play with a failed clip plays and names the failed source instead of the start point', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, new Error(DECODE_ERROR));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    expect(live(api).status.startsWith('Playing from ')).toBe(false);
    act(() => live(api).togglePlayback());
  });

  it('EV22: a settle during a pointer gesture never leaves the loading text (record row)', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    let release: () => void = () => undefined;
    act(() => {
      release = live(api).beginPointerGesture();
    });
    await settleNext(pending, bigBuffer());
    act(() => release());
    await flushAsync();
    console.info(
      `EV22 record: status=${JSON.stringify(live(api).status)} preview=${JSON.stringify(live(api).getStatusPreviewText())}`,
    );
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
  });

  it('EV23: a superseded preview whose decode fails still shows the failure text', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    act(() => live(api).startLibraryPreview('keep', 0));
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    await settleNext(pending, new Error(DECODE_ERROR));
    expect(live(api).status).toBe(studioLibraryStrings.sourceFailed(BIG_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe('keep');
    act(() => live(api).stopLibraryPreview());
  });

  it('EV24: an MP3 range export whose window misses the failed clip still renders and encodes', async () => {
    const { api, pending } = await mountEviction();
    mp3EncoderStub.encode.mockClear();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, new Error(DECODE_ERROR));
    act(() => live(api).addSourceToActiveTrack('keep'));
    const bigClip = live(api).arrangement.clips.find((clip) => clip.sourceId === 'big');
    const keepClip = live(api).arrangement.clips.find((clip) => clip.sourceId === 'keep');
    if (!bigClip || !keepClip) {
      throw new Error('clips not placed');
    }
    const renderWindow = { start: keepClip.start, end: keepClip.start + keepClip.duration };
    expect(
      bigClip.start < renderWindow.end && bigClip.start + bigClip.duration > renderWindow.start,
    ).toBe(false);
    const cache = observedCache();
    const pinsBefore = cache.setPinnedArgs().length;
    await act(async () => {
      await live(api).exportMp3(renderWindow);
    });
    await flushAsync();
    expect(live(api).exportState).not.toEqual({
      phase: 'error',
      message: studioExportStrings.exportFailed(studioLibraryStrings.sourceFailed(BIG_TITLE)),
    });
    expect(live(api).exportState.phase).toBe('done');
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toEqual(renderWindow);
    expect(mp3EncoderStub.encode).toHaveBeenCalledTimes(1);
    const exportPins = cache
      .setPinnedArgs()
      .slice(pinsBefore)
      .filter(([owner]) => owner === 'export');
    expect(exportPins.at(-1)).toEqual(['export', []]);
  });

  it('EV25: an old decode that settles after a collection change leaves the new collection status', async () => {
    const { api, pending, view } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
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
    const collectionStatus = live(api).status;
    expect(collectionStatus).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleNext(pending, bigBuffer());
    console.info(
      `EV25 record: collectionStatus=${JSON.stringify(collectionStatus)} afterSettle=${JSON.stringify(live(api).status)}`,
    );
    expect(live(api).status).toBe(collectionStatus);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    expect(live(api).isPlaying).toBe(false);
  });
});
