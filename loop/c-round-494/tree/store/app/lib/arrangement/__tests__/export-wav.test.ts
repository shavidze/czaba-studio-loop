import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement } from '~/types/arrangement';
import { encodeSfxWav } from '../../sfx-edit';
import { ArrangementExportCancelledError } from '../export-cancel';
import { arrangementRenderSuspendFrames } from '../export-progress';
import { encodeArrangementWav, measureExportOverload } from '../export-wav';
import {
  ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
  ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS,
  ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE,
  encodeArrangementWavStreamOffMainThread,
} from '../export-wav.client';
import {
  measureExportOverload as graphMeasureExportOverload,
  renderArrangementWav,
} from '../graph.client';
import { MAX_24BIT_SAMPLE } from '../meter';
import { createArrangement } from '../model';
import { studioExportStrings } from '../strings';
import { fakeRenderedBuffer } from './helpers/fake-rendered-buffer';

function wavOracle(raw: readonly Float32Array[], sampleRate: number) {
  const report = measureExportOverload(raw);
  const channels = raw.map((data) => {
    const clamped = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));
    }
    return clamped;
  });
  const bytes = encodeSfxWav({ sampleRate, channels });
  return { bytes, ...report };
}

function seededChannel(length: number, seed: number): Float32Array {
  const channel = new Float32Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    channel[i] = (state / 2_147_483_648) * 3 - 1.5;
  }
  channel.set([1.5, -1.5, MAX_24BIT_SAMPLE, -1, Number.NaN, 1, -1.0001, 0], 0);
  return channel;
}

function testChannels(length = 70_000): Float32Array[] {
  return [seededChannel(length, 7), seededChannel(length, 11)];
}

function bytesOf(buffer: ArrayBuffer): number[] {
  return Array.from(new Uint8Array(buffer));
}

class FakeWorker {
  static instances: FakeWorker[] = [];
  posts: unknown[] = [];
  terminated = 0;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(message: unknown) {
    this.posts.push(message);
  }
  terminate() {
    this.terminated += 1;
  }
  emit(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
}

function lastWorker(): FakeWorker {
  const worker = FakeWorker.instances.at(-1);
  if (!worker) {
    throw new Error('worker not created');
  }
  return worker;
}

describe('SRW-20 stage 3a WAV encoding off the main thread (D-29z52)', () => {
  afterEach(() => {
    FakeWorker.instances = [];
    vi.unstubAllGlobals();
  });

  it('EW1 encodeArrangementWav bytes and report equal the previous inline path (measure, clamp, encode)', () => {
    const raw = testChannels();
    const expected = wavOracle(raw, 48000);
    const actual = encodeArrangementWav(raw, 48000);
    expect(actual.peak).toBe(expected.peak);
    expect(actual.clippedSamples).toBe(expected.clippedSamples);
    expect({ peak: actual.peak, clippedSamples: actual.clippedSamples }).toEqual(
      measureExportOverload(raw),
    );
    expect(actual.clippedSamples).toBeGreaterThan(0);
    expect(actual.bytes.byteLength).toBe(expected.bytes.byteLength);
    expect(bytesOf(actual.bytes)).toEqual(bytesOf(expected.bytes));
  });

  it('EW2 graph.client re-exports the same measureExportOverload', () => {
    expect(graphMeasureExportOverload).toBe(measureExportOverload);
  });

  it('EW3 encoding progress never decreases and ends at 1', () => {
    const fractions: number[] = [];
    encodeArrangementWav(testChannels(), 48000, (fraction) => fractions.push(fraction));
    expect(fractions.length).toBeGreaterThan(2);
    for (let i = 1; i < fractions.length; i++) {
      expect(fractions[i]).toBeGreaterThanOrEqual(fractions[i - 1]);
    }
    expect(fractions.at(-1)).toBe(1);
  });
});

interface SuspendCall {
  time: number;
  resolve: () => void;
  reject: (reason: Error) => void;
}

const renderLog: { events: string[]; suspends: SuspendCall[]; resumes: number } = {
  events: [],
  suspends: [],
  resumes: 0,
};

class FakeRenderNode {
  connect(destination: FakeRenderNode) {
    return destination;
  }
  disconnect() {}
}

class FakeRenderGain extends FakeRenderNode {
  gain = {
    value: 1,
    setTargetAtTime(target: number) {
      this.value = target;
    },
  };
}

class FakeRenderPanner extends FakeRenderNode {
  pan = {
    value: 0,
    setTargetAtTime(target: number) {
      this.value = target;
    },
  };
}

class FakeRenderSource extends FakeRenderNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class PlainOfflineContext {
  currentTime = 0;
  destination = new FakeRenderNode();
  createGain() {
    return new FakeRenderGain();
  }
  createStereoPanner() {
    return new FakeRenderPanner();
  }
  createBufferSource() {
    return new FakeRenderSource();
  }
  startRendering() {
    renderLog.events.push('startRendering');
    return this.renderedChannels();
  }
  renderedChannels() {
    const channels = [Float32Array.of(1.25, 0.5, -0.25), Float32Array.of(-1.5, 0, 0.75)];
    return Promise.resolve(fakeRenderedBuffer(channels));
  }
}

class SuspendingOfflineContext extends PlainOfflineContext {
  suspend(time: number) {
    renderLog.events.push(`suspend:${time}`);
    return new Promise<void>((resolve, reject) => {
      renderLog.suspends.push({ time, resolve, reject });
    });
  }
  resume() {
    renderLog.resumes += 1;
    return Promise.resolve();
  }
  async startRendering() {
    renderLog.events.push('startRendering');
    for (const call of [...renderLog.suspends].sort((a, b) => a.time - b.time)) {
      call.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return this.renderedChannels();
  }
}

class RejectingSuspendContext extends PlainOfflineContext {
  suspend() {
    renderLog.events.push('suspend');
    return Promise.reject(new Error('suspend refused'));
  }
  resume() {
    renderLog.resumes += 1;
    return Promise.resolve();
  }
}

function renderTestArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
    ],
  };
}

async function blobBytes(blob: Blob): Promise<number[]> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error('WAV bytes missing'));
    reader.onerror = () => reject(new Error('WAV read failed'));
    reader.readAsArrayBuffer(blob);
  });
  return bytesOf(buffer);
}

describe('SRW-20 stage 3a render progress through OfflineAudioContext.suspend (EW6)', () => {
  afterEach(() => {
    renderLog.events = [];
    renderLog.suspends = [];
    renderLog.resumes = 0;
    vi.unstubAllGlobals();
  });

  const expectedRaw = [Float32Array.of(1.25, 0.5, -0.25), Float32Array.of(-1.5, 0, 0.75)];

  it('EW6 with onProgress, suspends are scheduled before startRendering at the quantum frames and progress runs render then wav', async () => {
    vi.stubGlobal('OfflineAudioContext', SuspendingOfflineContext);
    const progress: Array<[string, number]> = [];
    const result = await renderArrangementWav(renderTestArrangement(), new Map(), undefined, {
      onProgress: (phase, fraction) => progress.push([phase, fraction]),
    });
    const frames = arrangementRenderSuspendFrames(480_000);
    expect(frames).toHaveLength(19);
    const startIndex = renderLog.events.indexOf('startRendering');
    expect(renderLog.events.slice(0, startIndex)).toEqual(
      frames.map((frame) => `suspend:${frame / 48000}`),
    );
    expect(renderLog.resumes).toBe(frames.length);
    const renderFractions = progress.filter(([phase]) => phase === 'render').map(([, f]) => f);
    expect(renderFractions).toEqual([...frames.map((frame) => frame / 480_000), 1]);
    const firstWav = progress.findIndex(([phase]) => phase === 'wav');
    expect(firstWav).toBe(renderFractions.length);
    const wavFractions = progress.slice(firstWav).map(([phase, f]) => {
      expect(phase).toBe('wav');
      return f;
    });
    expect(wavFractions.at(-1)).toBe(1);
    expect(await blobBytes(result.blob)).toEqual(bytesOf(wavOracle(expectedRaw, 48000).bytes));
    expect({ peak: result.peak, clippedSamples: result.clippedSamples }).toEqual(
      measureExportOverload(expectedRaw),
    );
  });

  it('EW6 without onProgress no suspend is called, and a context without suspend still renders', async () => {
    vi.stubGlobal('OfflineAudioContext', SuspendingOfflineContext);
    const quiet = await renderArrangementWav(renderTestArrangement(), new Map());
    expect(renderLog.events).toEqual(['startRendering']);
    expect(renderLog.suspends).toEqual([]);
    expect(await blobBytes(quiet.blob)).toEqual(bytesOf(wavOracle(expectedRaw, 48000).bytes));
    renderLog.events = [];
    vi.stubGlobal('OfflineAudioContext', PlainOfflineContext);
    const progress: string[] = [];
    const plain = await renderArrangementWav(renderTestArrangement(), new Map(), undefined, {
      onProgress: (phase) => progress.push(phase),
    });
    expect(renderLog.events).toEqual(['startRendering']);
    expect(progress[0]).toBe('render');
    expect(progress.at(-1)).toBe('wav');
    expect(await blobBytes(plain.blob)).toEqual(bytesOf(wavOracle(expectedRaw, 48000).bytes));
  });

  it('EW6 a throwing progress callback still resumes every suspend, so the render settles instead of hanging', async () => {
    vi.stubGlobal('OfflineAudioContext', SuspendingOfflineContext);
    const result = await renderArrangementWav(renderTestArrangement(), new Map(), undefined, {
      onProgress: (phase) => {
        if (phase === 'render') {
          throw new Error('progress listener broke');
        }
      },
    }).catch((error: unknown) => error);
    expect(renderLog.resumes).toBe(19);
    expect(result instanceof Error ? result.message : 'completed').toBe('progress listener broke');
  });

  it('EW6 a rejecting suspend does not fail the render', async () => {
    vi.stubGlobal('OfflineAudioContext', RejectingSuspendContext);
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const result = await renderArrangementWav(renderTestArrangement(), new Map(), undefined, {
        onProgress: () => undefined,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(renderLog.events.filter((event) => event === 'suspend')).toHaveLength(19);
      expect(renderLog.resumes).toBe(0);
      expect(await blobBytes(result.blob)).toEqual(bytesOf(wavOracle(expectedRaw, 48000).bytes));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});

class NoChannelDataOfflineContext extends PlainOfflineContext {
  renderedChannels() {
    const channels = [Float32Array.of(1.25, 0.5, -0.25), Float32Array.of(-1.5, 0, 0.75)];
    return Promise.resolve({
      ...fakeRenderedBuffer(channels),
      getChannelData: (): Float32Array => {
        throw new Error('getChannelData must not be called by the export');
      },
    });
  }
}

describe('PERF-12a SW7 renderArrangementWav streams the rendered buffer without getChannelData', () => {
  afterEach(() => {
    renderLog.events = [];
    vi.unstubAllGlobals();
  });

  it('SW7 a rendered buffer whose getChannelData throws still gives a Blob equal to the oracle for its channels', async () => {
    vi.stubGlobal('OfflineAudioContext', NoChannelDataOfflineContext);
    const expectedRaw = [Float32Array.of(1.25, 0.5, -0.25), Float32Array.of(-1.5, 0, 0.75)];
    const progress: Array<[string, number]> = [];
    const result = await renderArrangementWav(renderTestArrangement(), new Map(), undefined, {
      onProgress: (phase, fraction) => progress.push([phase, fraction]),
    });
    expect(result.blob.type).toBe('audio/wav');
    expect(await blobBytes(result.blob)).toEqual(bytesOf(wavOracle(expectedRaw, 48000).bytes));
    expect({ peak: result.peak, clippedSamples: result.clippedSamples }).toEqual(
      measureExportOverload(expectedRaw),
    );
    expect(result.peak).toBe(1.5);
    expect(result.clippedSamples).toBe(2);
    expect(progress.filter(([phase]) => phase === 'wav').map(([, f]) => f)).toEqual([0, 1]);
  });
});

interface StallOutcome {
  state: 'pending' | 'resolved' | 'rejected';
  error: unknown;
}

function startStallEncode(signal?: AbortSignal, length = 2) {
  vi.stubGlobal('Worker', FakeWorker);
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const fractions: number[] = [];
  const buffer = fakeRenderedBuffer([new Float32Array(length)]);
  const source = { ...buffer, copyFromChannel: vi.fn(buffer.copyFromChannel) };
  const pending = encodeArrangementWavStreamOffMainThread(
    source,
    (fraction) => fractions.push(fraction),
    signal,
  );
  const outcome: StallOutcome = { state: 'pending', error: null };
  pending.then(
    () => {
      outcome.state = 'resolved';
    },
    (error: unknown) => {
      outcome.state = 'rejected';
      outcome.error = error;
    },
  );
  return { pending, outcome, fractions, source, worker: lastWorker() };
}

function completeMessage() {
  return {
    type: 'complete',
    blob: new Blob([new Uint8Array(8)], { type: 'audio/wav' }),
    peak: 0.5,
    clippedSamples: 0,
  };
}

describe('EW8 stall watchdog and worker error text (GATE89-S3), re-pointed at the WAV stream (PERF-12a SW5)', () => {
  afterEach(() => {
    vi.useRealTimers();
    FakeWorker.instances = [];
    vi.unstubAllGlobals();
  });

  it('EW8a SW5 a silent worker times out once with the stalled message, terminates once, and a later complete changes nothing', async () => {
    const { pending, outcome, worker } = startStallEncode();
    await vi.advanceTimersByTimeAsync(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS - 1);
    expect(outcome.state).toBe('pending');
    expect(worker.terminated).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(outcome.state).toBe('rejected');
    await expect(pending).rejects.toThrow(new Error(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE));
    expect(worker.terminated).toBe(1);
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.onmessageerror).toBeNull();
    worker.emit(completeMessage());
    await vi.advanceTimersByTimeAsync(0);
    expect(outcome.state).toBe('rejected');
    expect(worker.terminated).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('EW8b SW5 each ack restarts the stall timer: acks at 29 s and 58 s keep the stream alive past 30 s and 60 s, and the stall fires 30 s after the last ack', async () => {
    const { pending, outcome, fractions, worker } = startStallEncode(undefined, 3 * 65_536);
    await vi.advanceTimersByTimeAsync(29_000);
    worker.emit({ type: 'ack', written: 65_536 });
    expect(worker.posts).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(1_001);
    expect(outcome.state).toBe('pending');
    await vi.advanceTimersByTimeAsync(27_999);
    worker.emit({ type: 'ack', written: 2 * 65_536 });
    expect(worker.posts).toHaveLength(4);
    await vi.advanceTimersByTimeAsync(2_001);
    expect(outcome.state).toBe('pending');
    expect(worker.terminated).toBe(0);
    await vi.advanceTimersByTimeAsync(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS - 2_001 - 1);
    expect(outcome.state).toBe('pending');
    await vi.advanceTimersByTimeAsync(1);
    expect(outcome.state).toBe('rejected');
    await expect(pending).rejects.toThrow(new Error(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE));
    expect(fractions).toEqual([0, 1 / 3, 2 / 3]);
    expect(worker.terminated).toBe(1);
  });

  it('EW8b SW5 the last ack also restarts the timer: after finish is posted the stream stays alive 30 s from that ack', async () => {
    const { pending, outcome, fractions, worker } = startStallEncode();
    await vi.advanceTimersByTimeAsync(29_000);
    worker.emit({ type: 'ack', written: 2 });
    expect(fractions).toEqual([0, 1]);
    expect(worker.posts.at(-1)).toEqual({ type: 'finish' });
    await vi.advanceTimersByTimeAsync(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS - 1);
    expect(outcome.state).toBe('pending');
    await vi.advanceTimersByTimeAsync(1);
    expect(outcome.state).toBe('rejected');
    await expect(pending).rejects.toThrow(new Error(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE));
    expect(worker.terminated).toBe(1);
  });

  it('EW8c SW5 complete before the timeout resolves, clears the timer and ignores a late ack', async () => {
    const { pending, outcome, worker, fractions, source } = startStallEncode();
    await vi.advanceTimersByTimeAsync(10_000);
    const complete = completeMessage();
    worker.emit(complete);
    await expect(pending).resolves.toEqual({
      blob: complete.blob,
      peak: 0.5,
      clippedSamples: 0,
    });
    expect(vi.getTimerCount()).toBe(0);
    const posts = worker.posts.length;
    worker.emit({ type: 'ack', written: 2 });
    expect(fractions).toEqual([0]);
    expect(worker.posts).toHaveLength(posts);
    expect(source.copyFromChannel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(outcome.state).toBe('resolved');
    expect(worker.terminated).toBe(1);
  });

  it('EW8d SW5 an abort mid-stream rejects cancelled, clears the timer, and the copyFromChannel count stops changing', async () => {
    const controller = new AbortController();
    const { outcome, worker, source } = startStallEncode(controller.signal, 3 * 65_536);
    worker.emit({ type: 'ack', written: 65_536 });
    expect(source.copyFromChannel).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    controller.abort();
    await vi.advanceTimersByTimeAsync(0);
    expect(outcome.state).toBe('rejected');
    expect(outcome.error instanceof ArrangementExportCancelledError).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    worker.emit({ type: 'ack', written: 2 * 65_536 });
    expect(source.copyFromChannel).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(source.copyFromChannel).toHaveBeenCalledTimes(2);
    expect(worker.terminated).toBe(1);
    expect(outcome.state).toBe('rejected');
  });

  it('EW8e a worker error message is appended trimmed, a blank one and onerror keep the exact constant, and each clears the timer and ignores a late ack', async () => {
    const cases: Array<{ fail: (worker: FakeWorker) => void; expected: string }> = [
      {
        fail: (worker) => worker.emit({ type: 'error', message: '  boom  ' }),
        expected: `${studioExportStrings.wavWorkerFailed} boom`,
      },
      {
        fail: (worker) => worker.emit({ type: 'error', message: '   ' }),
        expected: ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
      },
      {
        fail: (worker) => worker.onerror?.(new Event('error')),
        expected: ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
      },
    ];
    for (const { fail, expected } of cases) {
      const { pending, worker, fractions } = startStallEncode();
      await vi.advanceTimersByTimeAsync(1_000);
      fail(worker);
      await expect(pending).rejects.toThrow(new Error(expected));
      expect(worker.terminated).toBe(1);
      expect(vi.getTimerCount()).toBe(0);
      worker.emit({ type: 'ack', written: 2 });
      expect(fractions).toEqual([0]);
      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS);
      expect(worker.terminated).toBe(1);
    }
    expect(FakeWorker.instances).toHaveLength(3);
  });

  it('EW8f the stall timeout is exactly 30 s and the stalled message is exact', () => {
    expect(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS).toBe(30000);
    expect(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE).toBe(
      'Writing WAV stalled — the worker has not responded for 30 seconds.',
    );
  });
});
