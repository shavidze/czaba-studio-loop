import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { createLibraryPreviewPlayer } from '../preview.client';
import { studioLibraryStrings } from '../strings';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

interface ObservedDecodedCache {
  has: (id: string) => boolean;
  setPinnedArgs: () => [string, string[]][];
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
    cacheObserver.instances.push({
      has: cache.has,
      setPinnedArgs: () =>
        setPinned.mock.calls.map(([owner, ids]): [string, string[]] => [owner, [...ids]]),
    });
    return { ...cache, setPinned };
  };
  return { ...actual, createDecodedBufferCache: vi.fn(createSpiedCache) };
});

const fakeClock = { base: 0 };
const timeline: string[] = [];

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
  buffer: { duration: number } | null = null;
  onended: (() => void) | null = null;
  startOffset: number | null = null;
  start(_when?: number, offset?: number) {
    this.startOffset = offset ?? 0;
    startedSources.push(this);
  }
  stop() {
    timeline.push('source-stop');
  }
}

const startedSources: FakeSource[] = [];

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

const BIG_TITLE = 'Big Preview';
const KEEP_TITLE = 'Kept Synth';
const BIG_URL = '/big.mp3';
const SAMPLE_RATE = 48000;
const BIG_FRAMES = (40 * 1024 * 1024) / 4;
const BIG_DURATION = BIG_FRAMES / SAMPLE_RATE;

interface MediaCalls {
  play: HTMLMediaElement[];
  pause: HTMLMediaElement[];
  load: HTMLMediaElement[];
}

const mediaCalls: MediaCalls = { play: [], pause: [], load: [] };
const createdElements: HTMLAudioElement[] = [];

function callsOn(list: HTMLMediaElement[], element: HTMLMediaElement) {
  return list.filter((entry) => entry === element).length;
}

function installMediaSpies() {
  mediaCalls.play.length = 0;
  mediaCalls.pause.length = 0;
  mediaCalls.load.length = 0;
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    mediaCalls.play.push(this);
    timeline.push('play');
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    mediaCalls.pause.push(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    mediaCalls.load.push(this);
  });
}

function createTrackedAudio(): HTMLAudioElement {
  const element = document.createElement('audio');
  createdElements.push(element);
  return element;
}

function onlyElement(): HTMLAudioElement {
  expect(createdElements).toHaveLength(1);
  const element = createdElements[0];
  if (!element) {
    throw new Error('no media element created');
  }
  return element;
}

function installGlobals() {
  cacheObserver.instances.length = 0;
  startedSources.length = 0;
  createdElements.length = 0;
  timeline.length = 0;
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  installMediaSpies();
}

describe('PERF-13c-i library preview stream player', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PS1 a stream preview sets the url and offset, plays once, reports the element time, and stop releases the media', () => {
    const player = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: createTrackedAudio,
    });
    player.playLibraryPreviewStream(BIG_URL, 12, vi.fn());
    const element = onlyElement();
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(element.currentTime).toBe(12);
    expect(callsOn(mediaCalls.play, element)).toBe(1);
    element.currentTime = 13.5;
    expect(player.getLibraryPreviewOffset()).toBe(13.5);
    player.stopLibraryPreview();
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
    expect(callsOn(mediaCalls.load, element)).toBe(1);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PS2 a seek on the playing stream reuses the same element without pausing it', () => {
    const player = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: createTrackedAudio,
    });
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    player.playLibraryPreviewStream(BIG_URL, 40, vi.fn());
    const element = onlyElement();
    expect(element.currentTime).toBe(40);
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
  });

  it('PS3 ended fires onEnded once; an old element ending after its stop does nothing', () => {
    const ended = vi.fn();
    const player = createLibraryPreviewPlayer(new AudioContext(), ended, {
      createAudioElement: createTrackedAudio,
    });
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    const first = onlyElement();
    first.dispatchEvent(new Event('ended'));
    expect(ended).toHaveBeenCalledTimes(1);
    expect(player.getLibraryPreviewOffset()).toBeNull();
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    player.stopLibraryPreview();
    expect(createdElements).toHaveLength(2);
    createdElements[1]?.dispatchEvent(new Event('ended'));
    first.dispatchEvent(new Event('ended'));
    expect(ended).toHaveBeenCalledTimes(1);
  });

  it('PS4 an error or a play rejection on the active stream reports its time; a play rejection after stop does not', async () => {
    const player = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: createTrackedAudio,
    });
    const onError = vi.fn();
    player.playLibraryPreviewStream(BIG_URL, 5, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(5);
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);

    const refused = document.createElement('audio');
    vi.spyOn(refused, 'play').mockRejectedValue(new DOMException('no source', 'NotSupportedError'));
    const refusedError = vi.fn();
    const third = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: () => refused,
    });
    third.playLibraryPreviewStream(BIG_URL, 7, refusedError);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(refusedError).toHaveBeenCalledTimes(1);
    expect(refusedError).toHaveBeenCalledWith(7);
    expect(refused.hasAttribute('src')).toBe(false);
    expect(third.getLibraryPreviewOffset()).toBeNull();

    let rejectPlay: (error: DOMException) => void = () => undefined;
    const pendingPlay = new Promise<void>((_resolve, reject) => {
      rejectPlay = reject;
    });
    const late = document.createElement('audio');
    vi.spyOn(late, 'play').mockReturnValue(pendingPlay);
    const lateError = vi.fn();
    const second = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: () => late,
    });
    second.playLibraryPreviewStream(BIG_URL, 0, lateError);
    second.stopLibraryPreview();
    rejectPlay(new DOMException('aborted', 'AbortError'));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(lateError).not.toHaveBeenCalled();
  });

  it('PS5 a buffer preview after a stream releases the stream element and starts one buffer source', () => {
    const player = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: createTrackedAudio,
    });
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    const element = onlyElement();
    const buffer = new AudioBuffer({ length: 4800, numberOfChannels: 1, sampleRate: SAMPLE_RATE });
    player.playLibraryPreview(buffer, 0);
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
    expect(startedSources).toHaveLength(1);
  });
});

interface PendingLoad {
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: Error) => void;
}

function bigBuffer(): AudioBuffer {
  return new AudioBuffer({ length: BIG_FRAMES, numberOfChannels: 1, sampleRate: SAMPLE_RATE });
}

function streamCollection() {
  const pending: PendingLoad[] = [];
  const bigLoads = { count: 0 };
  const collection: WorkspaceCollection = {
    id: 'stream',
    label: 'stream',
    origin: 'demo',
    sources: [
      { id: 'big', title: BIG_TITLE, collectionLabel: 'stream', kind: 'music', origin: 'demo' },
      { id: 'keep', title: KEEP_TITLE, collectionLabel: 'stream', kind: 'sfx', origin: 'demo' },
    ],
    loadSource: (source) => {
      if (source.id === 'keep') {
        return Promise.resolve(
          new AudioBuffer({ length: 48000, numberOfChannels: 2, sampleRate: SAMPLE_RATE }),
        );
      }
      bigLoads.count += 1;
      return new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      });
    },
    canReloadSource: (source) => source.id === 'big',
    previewUrl: (source) => (source.id === 'big' ? BIG_URL : null),
  };
  return { collection, pending, bigLoads };
}

function streamArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface ProbeRef {
  current: WorkspaceProbeValue | null;
}

function StreamProbe({ api }: { api: ProbeRef }) {
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

function previewReleaseCalls() {
  return observedCache()
    .setPinnedArgs()
    .filter(([owner, ids]) => owner === 'preview' && ids.length === 0).length;
}

async function settleNext(pending: PendingLoad[], buffer: AudioBuffer) {
  const next = pending.shift();
  if (!next) {
    throw new Error('no decode in flight');
  }
  next.resolve(buffer);
  await flushAsync();
}

function stubTrackedAudioConstructor() {
  const NativeAudio = window.Audio;
  vi.stubGlobal(
    'Audio',
    class extends NativeAudio {
      constructor() {
        super();
        createdElements.push(this);
      }
    },
  );
}

async function mountStream() {
  const setup = streamCollection();
  const api: ProbeRef = { current: null };
  const view = render(
    <ArrangementProvider collection={setup.collection} initialArrangement={streamArrangement()}>
      <StreamProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  await settleNext(setup.pending, bigBuffer());
  expect(observedCache().has('big')).toBe(false);
  return { ...setup, api, view };
}

describe('PERF-13c-i library preview of a URL source streams without decoding', () => {
  beforeEach(() => {
    installGlobals();
    stubTrackedAudioConstructor();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PS6 Preview of an evicted URL source streams: no decode, no loading text, no pin, preview id set', async () => {
    const { api, pending, bigLoads } = await mountStream();
    const loadsBefore = bigLoads.count;
    const statuses: string[] = [];
    act(() => live(api).startLibraryPreview('big', 0));
    statuses.push(live(api).status);
    await flushAsync();
    statuses.push(live(api).status);
    expect(bigLoads.count).toBe(loadsBefore);
    expect(pending).toHaveLength(0);
    expect(statuses).not.toContain(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    const element = onlyElement();
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(callsOn(mediaCalls.play, element)).toBe(1);
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(observedCache().has('big')).toBe(false);
    expect(observedCache().setPinnedArgs()).not.toContainEqual(['preview', ['big']]);
    act(() => live(api).stopLibraryPreview());
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PS7 a cached buffer wins over the stream: no media element, one buffer source', async () => {
    const { api, pending } = await mountStream();
    act(() => live(api).addSourceToActiveTrack('big'));
    await settleNext(pending, bigBuffer());
    expect(observedCache().has('big')).toBe(true);
    const startsBefore = startedSources.length;
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(0);
    expect(mediaCalls.play).toHaveLength(0);
    expect(startedSources).toHaveLength(startsBefore + 1);
    expect(startedSources.at(-1)?.buffer?.duration).toBe(BIG_DURATION);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });

  it('PS8 a stream error falls back to the decode path, plays the buffer, and the fallback is remembered', async () => {
    const { api, pending } = await mountStream();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    await act(async () => {
      element.dispatchEvent(new Event('error'));
    });
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    const startsBefore = startedSources.length;
    await settleNext(pending, bigBuffer());
    expect(live(api).status).toBe(studioLibraryStrings.sourceReady(BIG_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(startedSources).toHaveLength(startsBefore + 1);
    expect(startedSources.at(-1)?.buffer?.duration).toBe(BIG_DURATION);
    act(() => live(api).stopLibraryPreview());
    expect(observedCache().has('big')).toBe(false);
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(1);
    expect(mediaCalls.play).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    expect(pending).toHaveLength(1);
  });

  it('PS9 Play stops a streaming preview: the element is released and the transport plays', async () => {
    const { api } = await mountStream();
    act(() => live(api).addSourceToActiveTrack('keep'));
    await flushAsync();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    expect(live(api).libraryPreviewSourceId).toBe('big');
    act(() => live(api).togglePlayback());
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).togglePlayback());
  });

  it('PS10 unmounting the provider releases a streaming element', async () => {
    const { api, view } = await mountStream();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
    view.unmount();
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PS11 a stream preview stops the playing transport before the element plays', async () => {
    const { api } = await mountStream();
    act(() => live(api).addSourceToActiveTrack('keep'));
    await flushAsync();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    timeline.length = 0;
    act(() => live(api).startLibraryPreview('big', 0));
    expect(live(api).isPlaying).toBe(false);
    const element = onlyElement();
    expect(callsOn(mediaCalls.play, element)).toBe(1);
    expect(timeline).toContain('source-stop');
    expect(timeline.lastIndexOf('source-stop')).toBeLessThan(timeline.indexOf('play'));
  });

  it('PS12 the natural end of a stream clears the preview id and releases the preview pin', async () => {
    const { api } = await mountStream();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const releasesBefore = previewReleaseCalls();
    act(() => {
      element.dispatchEvent(new Event('ended'));
    });
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(previewReleaseCalls()).toBeGreaterThan(releasesBefore);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PS13 the fallback resumes from the element time, not from zero', async () => {
    const { api, pending } = await mountStream();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    element.currentTime = 30;
    await act(async () => {
      element.dispatchEvent(new Event('error'));
    });
    const startsBefore = startedSources.length;
    await settleNext(pending, bigBuffer());
    expect(startedSources).toHaveLength(startsBefore + 1);
    expect(startedSources.at(-1)?.startOffset).toBe(30);
  });

  it('PS14 a streamed preview writes no status', async () => {
    const { api } = await mountStream();
    const textBefore = live(api).status;
    const sequenceBefore = live(api).statusSequence;
    act(() => live(api).startLibraryPreview('big', 0));
    await flushAsync();
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(live(api).status).toBe(textBefore);
    expect(live(api).statusSequence).toBe(sequenceBefore);
  });

  it('PS27 the remembered fallback lives with its collection object: a new collection streams the same source again', async () => {
    const { api, pending, view } = await mountStream();
    act(() => live(api).startLibraryPreview('big', 0));
    await act(async () => {
      onlyElement().dispatchEvent(new Event('error'));
    });
    await settleNext(pending, bigBuffer());
    act(() => live(api).stopLibraryPreview());
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(1);
    await settleNext(pending, bigBuffer());
    act(() => live(api).stopLibraryPreview());
    const next = streamCollection();
    view.rerender(
      <ArrangementProvider collection={next.collection} initialArrangement={streamArrangement()}>
        <StreamProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    await settleNext(next.pending, bigBuffer());
    expect(observedCache().has('big')).toBe(false);
    const loadsBefore = next.bigLoads.count;
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(2);
    expect(createdElements[1]?.getAttribute('src')).toBe(BIG_URL);
    expect(next.pending).toHaveLength(0);
    expect(next.bigLoads.count).toBe(loadsBefore);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });
});

interface FakeStallScheduler {
  schedule: (callback: () => void, ms: number) => () => void;
  pending: () => number;
  delays: number[];
  fire: () => void;
}

function createFakeStallScheduler(): FakeStallScheduler {
  const timers: { callback: () => void; live: boolean }[] = [];
  const delays: number[] = [];
  return {
    delays,
    schedule(callback, ms) {
      const timer = { callback, live: true };
      timers.push(timer);
      delays.push(ms);
      return () => {
        timer.live = false;
      };
    },
    pending: () => timers.filter((timer) => timer.live).length,
    fire() {
      for (const timer of timers.filter((entry) => entry.live)) {
        timer.live = false;
        timer.callback();
      }
    },
  };
}

function streamPlayer(scheduler: FakeStallScheduler, onEnded = vi.fn()) {
  return createLibraryPreviewPlayer(new AudioContext(), onEnded, {
    createAudioElement: createTrackedAudio,
    scheduleStallTimeout: scheduler.schedule,
  });
}

describe('PERF-13c-ii-a stream lifecycle robustness', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PS16 a stream that never plays falls back after the stall timeout with its time', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 7, onError);
    const element = onlyElement();
    expect(scheduler.pending()).toBe(1);
    expect(scheduler.delays).toEqual([8000]);
    scheduler.fire();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(7);
    expect(ended).not.toHaveBeenCalled();
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PS17 playing disarms the watchdog; waiting re-arms it; progress restarts an armed timer only', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    expect(scheduler.pending()).toBe(0);
    element.dispatchEvent(new Event('progress'));
    expect(scheduler.pending()).toBe(0);
    scheduler.fire();
    expect(onError).not.toHaveBeenCalled();
    element.dispatchEvent(new Event('waiting'));
    expect(scheduler.pending()).toBe(1);
    element.dispatchEvent(new Event('progress'));
    expect(scheduler.pending()).toBe(1);
    expect(scheduler.delays).toHaveLength(3);
    scheduler.fire();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('PS18 the watchdog does nothing when the element time moved since it was armed', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.currentTime = 2.5;
    scheduler.fire();
    expect(onError).not.toHaveBeenCalled();
    expect(player.getLibraryPreviewOffset()).toBe(2.5);
    expect(element.getAttribute('src')).toBe(BIG_URL);
  });

  it('PS19 stop, a new preview and a same-url seek never leave or arm a stall timer by themselves', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    onlyElement().dispatchEvent(new Event('playing'));
    player.playLibraryPreviewStream(BIG_URL, 30, onError);
    expect(scheduler.pending()).toBe(0);
    player.stopLibraryPreview();
    expect(scheduler.pending()).toBe(0);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    expect(scheduler.pending()).toBe(1);
    player.playLibraryPreview(
      new AudioBuffer({ length: 48000, numberOfChannels: 1, sampleRate: 48000 }),
      0,
    );
    expect(scheduler.pending()).toBe(0);
    scheduler.fire();
    expect(onError).not.toHaveBeenCalled();
  });

  it('PS20 an external pause ends the preview once and releases the element', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    element.dispatchEvent(new Event('pause'));
    expect(ended).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
    element.dispatchEvent(new Event('pause'));
    element.dispatchEvent(new Event('ended'));
    expect(ended).toHaveBeenCalledTimes(1);
  });

  it('PS21 our own stop and a natural end never count as an external pause; a pause with an error is left to the error event', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const stopped = onlyElement();
    player.stopLibraryPreview();
    stopped.dispatchEvent(new Event('pause'));
    expect(ended).not.toHaveBeenCalled();

    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const finishing = createdElements[1];
    if (!finishing) {
      throw new Error('no second element');
    }
    Object.defineProperty(finishing, 'ended', { configurable: true, get: () => true });
    finishing.dispatchEvent(new Event('pause'));
    expect(ended).not.toHaveBeenCalled();
    finishing.dispatchEvent(new Event('ended'));
    expect(ended).toHaveBeenCalledTimes(1);

    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const failing = createdElements[2];
    if (!failing) {
      throw new Error('no third element');
    }
    Object.defineProperty(failing, 'error', {
      configurable: true,
      get: () => ({ code: 2, message: 'network' }),
    });
    failing.dispatchEvent(new Event('pause'));
    expect(ended).toHaveBeenCalledTimes(1);
    failing.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('PS22 a synchronous throw from currentTime or play() is a stream error, never an uncaught exception', () => {
    const scheduler = createFakeStallScheduler();
    const throwingTime = document.createElement('audio');
    Object.defineProperty(throwingTime, 'currentTime', {
      configurable: true,
      get: () => 0,
      set: () => {
        throw new DOMException('not ready', 'InvalidStateError');
      },
    });
    const first = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: () => throwingTime,
      scheduleStallTimeout: scheduler.schedule,
    });
    const timeError = vi.fn();
    expect(() => first.playLibraryPreviewStream(BIG_URL, 3, timeError)).not.toThrow();
    expect(timeError).toHaveBeenCalledTimes(1);
    expect(first.getLibraryPreviewOffset()).toBeNull();
    expect(throwingTime.hasAttribute('src')).toBe(false);

    const throwingPlay = document.createElement('audio');
    vi.spyOn(throwingPlay, 'play').mockImplementation(() => {
      throw new DOMException('blocked', 'NotSupportedError');
    });
    const second = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
      createAudioElement: () => throwingPlay,
      scheduleStallTimeout: scheduler.schedule,
    });
    const playError = vi.fn();
    expect(() => second.playLibraryPreviewStream(BIG_URL, 0, playError)).not.toThrow();
    expect(playError).toHaveBeenCalledTimes(1);
    expect(second.getLibraryPreviewOffset()).toBeNull();
    expect(throwingPlay.hasAttribute('src')).toBe(false);
    expect(scheduler.pending()).toBe(0);
  });

  it('PS23 a synchronous throw on a same-url seek is a stream error of the active preview', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 4, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => 9,
      set: () => {
        throw new DOMException('not seekable', 'InvalidStateError');
      },
    });
    expect(() => player.playLibraryPreviewStream(BIG_URL, 60, onError)).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(9);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PS24 the default scheduler arms an 8000 ms window timer that a stop clears', () => {
    vi.useFakeTimers();
    try {
      const onError = vi.fn();
      const player = createLibraryPreviewPlayer(new AudioContext(), vi.fn(), {
        createAudioElement: createTrackedAudio,
      });
      player.playLibraryPreviewStream(BIG_URL, 0, onError);
      vi.advanceTimersByTime(7999);
      expect(onError).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onError).toHaveBeenCalledTimes(1);
      player.playLibraryPreviewStream(BIG_URL, 0, onError);
      player.stopLibraryPreview();
      vi.advanceTimersByTime(20000);
      expect(onError).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('PS25 a same-url seek before playing restarts the armed watchdog from the new time', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    player.playLibraryPreviewStream(BIG_URL, 5, onError);
    expect(scheduler.pending()).toBe(1);
    expect(scheduler.delays).toEqual([8000, 8000]);
    expect(element.getAttribute('src')).toBe(BIG_URL);
    scheduler.fire();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(5);
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PS26 a stop removes every listener the stream added', () => {
    const scheduler = createFakeStallScheduler();
    const player = streamPlayer(scheduler);
    const added = vi.spyOn(EventTarget.prototype, 'addEventListener');
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    const element = onlyElement();
    const removed = vi.spyOn(element, 'removeEventListener');
    player.stopLibraryPreview();
    expect(removed.mock.calls.map(([type]) => type).sort()).toEqual([
      'ended',
      'error',
      'pause',
      'playing',
      'progress',
      'waiting',
    ]);
    const addedPairs = added.mock.calls
      .filter((_, index) => added.mock.contexts[index] === element)
      .map(([type, listener]) => [type, listener]);
    const removedPairs = removed.mock.calls.map(([type, listener]) => [type, listener]);
    expect(addedPairs).toHaveLength(6);
    expect(removedPairs).toHaveLength(6);
    expect(removedPairs).toEqual(expect.arrayContaining(addedPairs));
  });

  it('PS28 a synchronous throw on a same-url seek before playing is a stream error and leaves no stall timer', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 3, onError);
    const element = onlyElement();
    expect(scheduler.pending()).toBe(1);
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => 3,
      set: () => {
        throw new DOMException('not seekable', 'InvalidStateError');
      },
    });
    expect(() => player.playLibraryPreviewStream(BIG_URL, 50, onError)).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(3);
    expect(scheduler.pending()).toBe(0);
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PS29 the stream element requests its URL in anonymous CORS mode, like the credential-free decode fetch', () => {
    const nativeSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    const crossOriginAtSrc: Array<string | null> = [];
    vi.spyOn(HTMLMediaElement.prototype, 'src', 'set').mockImplementation(function (
      this: HTMLMediaElement,
      value: string,
    ) {
      crossOriginAtSrc.push(this.getAttribute('crossorigin'));
      nativeSrc?.set?.call(this, value);
    });
    const scheduler = createFakeStallScheduler();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, vi.fn());
    const element = onlyElement();
    expect(crossOriginAtSrc).toEqual(['anonymous']);
    expect(element.getAttribute('crossorigin')).toBe('anonymous');
    expect(element.getAttribute('src')).toBe(BIG_URL);
  });
});

const SLOW_TITLE = 'Slow Decode';

function decodeCollection() {
  const pending: PendingLoad[] = [];
  const collection: WorkspaceCollection = {
    id: 'decode',
    label: 'decode',
    origin: 'demo',
    sources: [
      { id: 'big', title: BIG_TITLE, collectionLabel: 'decode', kind: 'music', origin: 'demo' },
      { id: 'slow', title: SLOW_TITLE, collectionLabel: 'decode', kind: 'music', origin: 'demo' },
    ],
    loadSource: () =>
      new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
    canReloadSource: () => true,
    previewUrl: (source) => (source.id === 'big' ? BIG_URL : null),
  };
  return { collection, pending };
}

async function settleAll(pending: PendingLoad[]) {
  while (pending.length > 0) {
    await settleNext(pending, bigBuffer());
  }
}

async function mountDecode() {
  const setup = decodeCollection();
  const api: ProbeRef = { current: null };
  const view = render(
    <ArrangementProvider collection={setup.collection} initialArrangement={streamArrangement()}>
      <StreamProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  await settleAll(setup.pending);
  expect(observedCache().has('big')).toBe(false);
  expect(observedCache().has('slow')).toBe(false);
  return { ...setup, api, view };
}

function bigSources() {
  return startedSources.filter((source) => source.buffer?.duration === BIG_DURATION);
}

describe('SYS-R416 preview controller: request token and deferred fallback', () => {
  beforeEach(() => {
    installGlobals();
    stubTrackedAudioConstructor();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PC1 stop then a re-preview of the same source during its decode starts once, at the second offset', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 5));
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(SLOW_TITLE));
    act(() => live(api).stopLibraryPreview());
    act(() => live(api).startLibraryPreview('slow', 2));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(2);
    expect(live(api).libraryPreviewSourceId).toBe('slow');
  });

  it('PC2 a stream preview supersedes a pending decode preview of another source', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const startsBefore = startedSources.length;
    await settleNext(
      pending,
      new AudioBuffer({ length: SAMPLE_RATE, numberOfChannels: 1, sampleRate: SAMPLE_RATE }),
    );
    expect(observedCache().has('slow')).toBe(true);
    expect(startedSources).toHaveLength(startsBefore);
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
  });

  it('PC3 a stale call whose collection has no live owner writes its refusal and leaves the live preview playing', async () => {
    const { api, view } = await mountDecode();
    const stale = live(api).startLibraryPreview;
    const next = decodeCollection();
    view.rerender(
      <ArrangementProvider collection={next.collection} initialArrangement={streamArrangement()}>
        <StreamProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    await settleAll(next.pending);
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => stale('slow', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceNotLoaded(SLOW_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
    expect(next.pending).toHaveLength(0);
  });

  it('PC4 a stream error starts the fallback after the media handler returns, never inside it', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const statusBefore = live(api).status;
    act(() => {
      element.dispatchEvent(new Event('error'));
    });
    expect(pending).toHaveLength(0);
    expect(live(api).status).toBe(statusBefore);
    await flushAsync();
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });

  it('PC5 a synchronous src throw inside the stream start falls back once, after the start call returns', async () => {
    const NativeAudio = window.Audio;
    vi.stubGlobal(
      'Audio',
      class extends NativeAudio {
        constructor() {
          super();
          Object.defineProperty(this, 'src', {
            configurable: true,
            get: () => '',
            set: () => {
              throw new DOMException('blocked', 'NotSupportedError');
            },
          });
        }
      },
    );
    const { api, pending } = await mountDecode();
    expect(() => act(() => live(api).startLibraryPreview('big', 0))).not.toThrow();
    expect(pending).toHaveLength(0);
    await flushAsync();
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(0);
    expect(createdElements).toHaveLength(1);
  });

  it('PC6 a stop between the stream error and its deferred fallback wins: no decode, no restart, the fallback is still remembered', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => {
      element.dispatchEvent(new Event('error'));
      live(api).stopLibraryPreview();
    });
    await flushAsync();
    expect(pending).toHaveLength(0);
    expect(bigSources()).toHaveLength(0);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(1);
  });

  it('PC12 a same-url seek re-targets the stream error: an error after the seek still falls back, from the element time', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => live(api).startLibraryPreview('big', 5));
    expect(createdElements).toHaveLength(1);
    expect(element.currentTime).toBe(5);
    await act(async () => {
      element.dispatchEvent(new Event('error'));
    });
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(5);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });

  it('PC7 unmounting the provider during a decode preview starts nothing when the decode settles', async () => {
    const { api, pending, view } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    expect(pending).toHaveLength(1);
    const startsBefore = startedSources.length;
    view.unmount();
    await settleAll(pending);
    expect(startedSources).toHaveLength(startsBefore);
  });
});

describe('SYS-R416 preview player re-entrancy and media reads', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PC8 a pause fired synchronously inside a same-url seek ends the preview once and throws nothing', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => 0,
      set: () => {
        element.dispatchEvent(new Event('pause'));
      },
    });
    expect(() => player.playLibraryPreviewStream(BIG_URL, 12, onError)).not.toThrow();
    expect(ended).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PC9 the stall watchdog reads the element time once per tick and a throwing read is a stream error at the start offset', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 7, onError);
    const element = onlyElement();
    const reads = { count: 0 };
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => {
        reads.count += 1;
        throw new DOMException('gone', 'InvalidStateError');
      },
      set: () => undefined,
    });
    expect(() => scheduler.fire()).not.toThrow();
    expect(reads.count).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(7);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PC10 a media error whose time read throws still reports one stream error at the start offset', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 4, onError);
    const element = onlyElement();
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => {
        throw new DOMException('gone', 'InvalidStateError');
      },
      set: () => undefined,
    });
    element.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(4);
    expect(element.hasAttribute('src')).toBe(false);
    expect(scheduler.pending()).toBe(0);
  });

  it('PC11 a stream with a different url releases the previous element before the new one plays', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    player.playLibraryPreviewStream('/other.mp3', 0, onError);
    expect(createdElements).toHaveLength(2);
    const [first, second] = createdElements;
    if (!first || !second) {
      throw new Error('two media elements expected');
    }
    expect(callsOn(mediaCalls.pause, first)).toBe(1);
    expect(first.hasAttribute('src')).toBe(false);
    first.dispatchEvent(new Event('ended'));
    first.dispatchEvent(new Event('error'));
    expect(ended).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(second.getAttribute('src')).toBe('/other.mp3');
    expect(callsOn(mediaCalls.play, second)).toBe(1);
    expect(scheduler.pending()).toBe(1);
  });
});

function rerenderWith(
  view: ReturnType<typeof render>,
  api: ProbeRef,
  collection: WorkspaceCollection,
) {
  view.rerender(
    <ArrangementProvider collection={collection} initialArrangement={streamArrangement()}>
      <StreamProbe api={api} />
    </ArrangementProvider>,
  );
}

function throwingTimeAfter(element: HTMLAudioElement) {
  const reads = { count: 0 };
  Object.defineProperty(element, 'currentTime', {
    configurable: true,
    get: () => {
      reads.count += 1;
      throw new DOMException('gone', 'InvalidStateError');
    },
    set: () => undefined,
  });
  return reads;
}

describe('SYS-R418 preview lifecycle: collection change, unmount and guarded reads', () => {
  beforeEach(() => {
    installGlobals();
    stubTrackedAudioConstructor();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PL1 a collection change stops a playing stream preview: the element is released and the preview id clears', async () => {
    const { api, view } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    expect(live(api).libraryPreviewSourceId).toBe('big');
    const next = decodeCollection();
    act(() => rerenderWith(view, api, next.collection));
    await flushAsync();
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).getLibraryPreviewOffset()).toBeNull();
  });

  it('PL2 a stream fallback queued before a collection change never starts a source of the new collection', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const next = decodeCollection();
    act(() => {
      element.dispatchEvent(new Event('error'));
      rerenderWith(view, api, next.collection);
    });
    await flushAsync();
    await settleAll(next.pending);
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(0);
    expect(next.pending).toHaveLength(0);
    expect(bigSources()).toHaveLength(0);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
  });

  it('PL3 a decode preview pending across a collection change starts nothing when its decode settles', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    expect(pending).toHaveLength(1);
    const startsBefore = startedSources.length;
    const next = decodeCollection();
    act(() => rerenderWith(view, api, next.collection));
    await flushAsync();
    await settleAll(pending);
    await settleAll(next.pending);
    expect(startedSources).toHaveLength(startsBefore);
    expect(live(api).libraryPreviewSourceId).toBe(null);
  });

  it('PL4 lock: a stream error queued before the provider unmounts starts nothing after it (defence; no observable effect by design)', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const startsBefore = startedSources.length;
    act(() => {
      element.dispatchEvent(new Event('error'));
      view.unmount();
    });
    await flushAsync();
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(0);
    expect(startedSources).toHaveLength(startsBefore);
  });

  it('PL5 a provider re-render with the same collection keeps the stream preview playing', async () => {
    const { api, view, collection } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => rerenderWith(view, api, collection));
    await flushAsync();
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });
});

describe('SYS-R418 preview player: the read fallback follows the seek', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PL6 after a same-url seek a media error whose time read throws reports the seek offset, not the first start', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    player.playLibraryPreviewStream(BIG_URL, 6, onError);
    throwingTimeAfter(element);
    element.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(6);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PL7 a watchdog armed at a real time whose tick read throws reports a stall at the armed time', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    element.currentTime = 3;
    element.dispatchEvent(new Event('waiting'));
    expect(scheduler.pending()).toBe(1);
    const reads = throwingTimeAfter(element);
    expect(() => scheduler.fire()).not.toThrow();
    expect(reads.count).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(3);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PL8 the preview offset never throws: a throwing read returns the latest seek offset while the stream is active', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    player.playLibraryPreviewStream(BIG_URL, 6, onError);
    throwingTimeAfter(element);
    expect(() => player.getLibraryPreviewOffset()).not.toThrow();
    expect(player.getLibraryPreviewOffset()).toBe(6);
    expect(onError).not.toHaveBeenCalled();
    expect(element.getAttribute('src')).toBe(BIG_URL);
  });

  it('PL9 a same-url seek then a stall falls back through the newest request at the seek time', () => {
    const scheduler = createFakeStallScheduler();
    const first = vi.fn();
    const second = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, first);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    player.playLibraryPreviewStream(BIG_URL, 5, second);
    expect(scheduler.pending()).toBe(0);
    element.dispatchEvent(new Event('waiting'));
    expect(scheduler.pending()).toBe(1);
    scheduler.fire();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(5);
    expect(element.hasAttribute('src')).toBe(false);
  });
});
