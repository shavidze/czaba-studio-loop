import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement } from '~/types/arrangement';
import { encodeSfxWav } from '../../sfx-edit';
import { arrangementRenderSuspendFrames } from '../export-progress';
import { encodeArrangementWav, measureExportOverload } from '../export-wav';
import {
  ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
  encodeArrangementWavOffMainThread,
} from '../export-wav.client';
import {
  measureExportOverload as graphMeasureExportOverload,
  renderArrangementWav,
} from '../graph.client';
import { MAX_24BIT_SAMPLE } from '../meter';
import { createArrangement } from '../model';

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
  readonly url: URL;
  readonly options: WorkerOptions | undefined;
  posted: unknown = null;
  transfer: Transferable[] = [];
  terminated = 0;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor(url: URL, options?: WorkerOptions) {
    this.url = url;
    this.options = options;
    FakeWorker.instances.push(this);
  }
  postMessage(message: unknown, transfer: Transferable[] = []) {
    this.posted = message;
    this.transfer = transfer;
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

  it('EW4 without a Worker global the client encodes on the calling thread with identical bytes', async () => {
    expect(typeof Worker).toBe('undefined');
    const raw = testChannels();
    const expected = wavOracle(raw, 48000);
    const fractions: number[] = [];
    const actual = await encodeArrangementWavOffMainThread(raw, 48000, (fraction) =>
      fractions.push(fraction),
    );
    expect(bytesOf(actual.bytes)).toEqual(bytesOf(expected.bytes));
    expect(actual.peak).toBe(expected.peak);
    expect(actual.clippedSamples).toBe(expected.clippedSamples);
    expect(fractions.at(-1)).toBe(1);
  });

  it('EW5 the worker path posts transferred channels, forwards progress, resolves on complete and terminates', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const channels = [new Float32Array(4), new Float32Array(4)];
    const fractions: number[] = [];
    const pending = encodeArrangementWavOffMainThread(channels, 48000, (fraction) =>
      fractions.push(fraction),
    );
    const worker = lastWorker();
    expect(FakeWorker.instances).toHaveLength(1);
    expect(worker.url.pathname.endsWith('/export-wav.worker.ts')).toBe(true);
    expect(worker.options?.type).toBe('module');
    expect(worker.posted).toEqual({ channels, sampleRate: 48000 });
    expect(worker.transfer).toHaveLength(2);
    expect(worker.transfer).toContain(channels[0]?.buffer);
    expect(worker.transfer).toContain(channels[1]?.buffer);
    worker.emit({ type: 'progress', fraction: 0.25 });
    worker.emit({ type: 'progress', fraction: 0.75 });
    expect(fractions).toEqual([0.25, 0.75]);
    expect(worker.terminated).toBe(0);
    const bytes = new ArrayBuffer(8);
    worker.emit({ type: 'complete', bytes, peak: 1.2, clippedSamples: 3 });
    await expect(pending).resolves.toEqual({ bytes, peak: 1.2, clippedSamples: 3 });
    expect(worker.terminated).toBe(1);
  });

  it('EW5 worker error, onerror and onmessageerror each reject with the exact message and terminate', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const failures: Array<(worker: FakeWorker) => void> = [
      (worker) => worker.emit({ type: 'error', message: 'boom' }),
      (worker) => worker.onerror?.(new Event('error')),
      (worker) => worker.onmessageerror?.(new MessageEvent('messageerror')),
    ];
    for (const fail of failures) {
      const pending = encodeArrangementWavOffMainThread([new Float32Array(2)], 48000);
      const worker = lastWorker();
      fail(worker);
      await expect(pending).rejects.toThrow(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE);
      expect(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE).toBe('WAV-ის ჩაწერა ვერ მოხერხდა (worker).');
      expect(worker.terminated).toBeGreaterThanOrEqual(1);
    }
    expect(FakeWorker.instances).toHaveLength(3);
  });

  it('EW5 a Worker constructor that throws rejects with the exact message', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error("Failed to construct 'Worker'");
        }
      },
    );
    await expect(encodeArrangementWavOffMainThread([new Float32Array(2)], 48000)).rejects.toThrow(
      new Error(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE),
    );
  });

  it('EW7 the worker module posts whole-percent progress, transfers the bytes on complete and reports errors', async () => {
    const posted: Array<{ message: unknown; transfer: Transferable[] }> = [];
    vi.spyOn(window, 'postMessage').mockImplementation(
      (message: unknown, options?: WindowPostMessageOptions) => {
        posted.push({ message, transfer: options?.transfer ?? [] });
      },
    );
    await import('../export-wav.worker');
    const handler = window.onmessage;
    if (!handler) {
      throw new Error('worker onmessage not installed');
    }
    const raw = testChannels(200_000);
    const expected = wavOracle(raw, 48000);
    handler.call(
      window,
      new MessageEvent('message', { data: { channels: raw, sampleRate: 48000 } }),
    );
    const progress = posted.slice(0, -1).map((entry) => entry.message);
    const percents = progress.map((message) =>
      typeof message === 'object' && message !== null && 'fraction' in message
        ? Math.floor(Number(message.fraction) * 100)
        : Number.NaN,
    );
    expect(percents.length).toBeGreaterThan(2);
    expect(new Set(percents).size).toBe(percents.length);
    expect(percents.at(-1)).toBe(100);
    for (const entry of posted.slice(0, -1)) {
      expect(entry.transfer).toEqual([]);
    }
    const last = posted.at(-1);
    expect(last?.message).toMatchObject({
      type: 'complete',
      peak: expected.peak,
      clippedSamples: expected.clippedSamples,
    });
    const bytes =
      typeof last?.message === 'object' && last.message !== null && 'bytes' in last.message
        ? last.message.bytes
        : null;
    expect(bytes instanceof ArrayBuffer).toBe(true);
    expect(last?.transfer).toEqual([bytes]);
    expect(bytes instanceof ArrayBuffer ? bytesOf(bytes) : []).toEqual(bytesOf(expected.bytes));
    posted.length = 0;
    handler.call(
      window,
      new MessageEvent('message', { data: { channels: [], sampleRate: 48000 } }),
    );
    expect(posted).toHaveLength(1);
    expect(posted[0]?.message).toMatchObject({ type: 'error' });
    expect(posted[0]?.transfer).toEqual([]);
    window.onmessage = null;
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
    return Promise.resolve({
      sampleRate: 48000,
      getChannelData: (index: number) => channels[index] ?? new Float32Array(3),
    });
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
