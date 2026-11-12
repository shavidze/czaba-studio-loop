import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARRANGEMENT_WAV_CHUNK_FRAMES, encodeArrangementWav } from '../export-wav';
import {
  ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
  encodeArrangementWavStreamOffMainThread,
} from '../export-wav.client';
import { MAX_24BIT_SAMPLE } from '../meter';
import { fakeRenderedBuffer } from './helpers/fake-rendered-buffer';

await import('../export-wav.worker');
const workerHandler = window.onmessage;

function seededChannel(length: number, seed: number): Float32Array {
  const channel = new Float32Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    channel[i] = (state / 2_147_483_648) * 3 - 1.5;
  }
  channel.set([1.5, -1.5, MAX_24BIT_SAMPLE, -1, Number.NaN, 1, -1.0001, 0].slice(0, length), 0);
  return channel;
}

function stereo(length: number): Float32Array[] {
  return [seededChannel(length, 7), seededChannel(length, 11)];
}

function spiedSource(channels: Float32Array[], sampleRate = 48000) {
  const source = fakeRenderedBuffer(channels, sampleRate);
  const copyFromChannel = vi.fn(source.copyFromChannel);
  return { ...source, copyFromChannel };
}

function countByteMismatches(actual: Uint8Array, expected: Uint8Array): number {
  let mismatches = Math.abs(actual.length - expected.length);
  for (let i = 0; i < Math.min(actual.length, expected.length); i++) {
    if (actual[i] !== expected[i]) {
      mismatches += 1;
    }
  }
  return mismatches;
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error('WAV bytes missing'));
    reader.onerror = () => reject(new Error('WAV read failed'));
    reader.readAsArrayBuffer(blob);
  });
  return new Uint8Array(buffer);
}

interface PostedMessage {
  message: unknown;
  transfer: Transferable[];
}

interface WorkerPost extends PostedMessage {
  original: unknown;
}

function snapshotWorkerMessage(message: unknown): unknown {
  if (
    typeof message === 'object' &&
    message !== null &&
    'channels' in message &&
    Array.isArray(message.channels)
  ) {
    return {
      ...message,
      channels: message.channels.map((channel) =>
        channel instanceof Float32Array ? channel.slice() : channel,
      ),
    };
  }
  return message;
}

class StreamFakeWorker {
  static instances: StreamFakeWorker[] = [];
  static throwOnPost: ((index: number) => boolean) | null = null;
  readonly url: URL;
  readonly options: WorkerOptions | undefined;
  posts: WorkerPost[] = [];
  terminated = 0;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor(url: URL, options?: WorkerOptions) {
    this.url = url;
    this.options = options;
    StreamFakeWorker.instances.push(this);
  }
  postMessage(message: unknown, transfer: Transferable[] = []) {
    if (StreamFakeWorker.throwOnPost?.(this.posts.length)) {
      throw new DOMException('could not clone', 'DataCloneError');
    }
    const snapshot = snapshotWorkerMessage(message);
    structuredClone(transfer, { transfer });
    this.posts.push({ message: snapshot, transfer, original: message });
  }
  terminate() {
    this.terminated += 1;
  }
  emit(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
  types(): string[] {
    return this.posts.map(({ message }) =>
      typeof message === 'object' && message !== null && 'type' in message
        ? String(message.type)
        : '?',
    );
  }
}

function lastWorker(): StreamFakeWorker {
  const worker = StreamFakeWorker.instances.at(-1);
  if (!worker) {
    throw new Error('worker not created');
  }
  return worker;
}

function chunkChannelsOf(message: unknown): Float32Array[] {
  if (
    typeof message === 'object' &&
    message !== null &&
    'channels' in message &&
    Array.isArray(message.channels)
  ) {
    return message.channels.filter(
      (channel): channel is Float32Array => channel instanceof Float32Array,
    );
  }
  return [];
}

async function outcomeOf<T>(work: Promise<T>): Promise<unknown> {
  return work.then(
    (value) => ({ resolved: value }),
    (error: unknown) => error,
  );
}

describe('PERF-12a SW1 the no-Worker fallback streams through the same writer (replaces EW4)', () => {
  it('SW1 without a Worker global the fallback returns a Blob whose bytes, peak and clipped equal the oracle', async () => {
    expect(typeof Worker).toBe('undefined');
    const raw = stereo(2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123);
    const expected = encodeArrangementWav(
      raw.map((channel) => channel.slice()),
      44100,
    );
    const source = spiedSource(raw, 44100);
    const fractions: number[] = [];
    const result = await encodeArrangementWavStreamOffMainThread(source, (fraction) =>
      fractions.push(fraction),
    );
    expect(result.blob.type).toBe('audio/wav');
    expect(result.blob.size).toBe(expected.bytes.byteLength);
    expect(countByteMismatches(await blobBytes(result.blob), new Uint8Array(expected.bytes))).toBe(
      0,
    );
    expect(result.peak).toBe(expected.peak);
    expect(result.clippedSamples).toBe(expected.clippedSamples);
    expect(source.copyFromChannel).toHaveBeenCalledTimes(3 * 2);
    expect(
      source.copyFromChannel.mock.calls.map(([, channel, offset]) => [channel, offset]),
    ).toEqual([
      [0, 0],
      [1, 0],
      [0, ARRANGEMENT_WAV_CHUNK_FRAMES],
      [1, ARRANGEMENT_WAV_CHUNK_FRAMES],
      [0, 2 * ARRANGEMENT_WAV_CHUNK_FRAMES],
      [1, 2 * ARRANGEMENT_WAV_CHUNK_FRAMES],
    ]);
    expect(fractions[0]).toBe(0);
    expect(fractions.at(-1)).toBe(1);
  });

  it('SW1 the fallback rejects a length-0 source at once with the writer message', async () => {
    const source = spiedSource([new Float32Array(0)]);
    const progress = vi.fn();
    await expect(encodeArrangementWavStreamOffMainThread(source, progress)).rejects.toThrow(
      new Error('WAV stream: invalid length or channel count'),
    );
    expect(source.copyFromChannel).not.toHaveBeenCalled();
    expect(progress).not.toHaveBeenCalled();
  });
});

describe('PERF-12a SW2 the worker pump: one chunk in flight', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', StreamFakeWorker);
  });

  afterEach(() => {
    StreamFakeWorker.instances = [];
    StreamFakeWorker.throwOnPost = null;
    vi.unstubAllGlobals();
  });

  it('SW2a begin has the exact shape, one chunk is posted before the first ack, then one per ack, finish after the last ack, and complete resolves and terminates once', async () => {
    const length = 2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123;
    const raw = stereo(length);
    const source = spiedSource(raw);
    const events: string[] = [];
    const pending = encodeArrangementWavStreamOffMainThread(source, (fraction) =>
      events.push(`progress:${fraction}`),
    );
    const worker = lastWorker();
    expect(StreamFakeWorker.instances).toHaveLength(1);
    expect(worker.url.pathname.endsWith('/export-wav.worker.ts')).toBe(true);
    expect(worker.options?.type).toBe('module');
    expect(worker.posts[0]?.message).toEqual({
      type: 'begin',
      length,
      channelCount: 2,
      sampleRate: 48000,
    });
    expect(worker.posts[0]?.transfer).toEqual([]);
    expect(worker.types()).toEqual(['begin', 'chunk']);
    expect(events).toEqual(['progress:0']);
    const offsets = [0, ARRANGEMENT_WAV_CHUNK_FRAMES, 2 * ARRANGEMENT_WAV_CHUNK_FRAMES];
    const sizes = [ARRANGEMENT_WAV_CHUNK_FRAMES, ARRANGEMENT_WAV_CHUNK_FRAMES, 123];
    for (let index = 0; index < offsets.length; index++) {
      const post = worker.posts[index + 1];
      const channels = chunkChannelsOf(post?.message);
      const originals = chunkChannelsOf(post?.original);
      expect(channels).toHaveLength(2);
      expect(originals).toHaveLength(2);
      expect(post?.transfer).toHaveLength(2);
      expect(post?.transfer[0]).toBe(originals[0]?.buffer);
      expect(post?.transfer[1]).toBe(originals[1]?.buffer);
      expect(originals.map((channel) => channel.buffer.byteLength)).toEqual([0, 0]);
      expect(originals.map((channel) => channel.length)).toEqual([0, 0]);
      for (let channel = 0; channel < 2; channel++) {
        const expected = raw[channel].subarray(offsets[index], offsets[index] + sizes[index]);
        expect(channels[channel]?.length).toBe(sizes[index]);
        expect(Array.from(channels[channel] ?? []).every((v, i) => Object.is(v, expected[i]))).toBe(
          true,
        );
      }
      expect(source.copyFromChannel).toHaveBeenCalledTimes(2 * (index + 1));
      expect(worker.types()).toHaveLength(index + 2);
      worker.emit({ type: 'ack', written: offsets[index] + sizes[index] });
    }
    expect(worker.types()).toEqual(['begin', 'chunk', 'chunk', 'chunk', 'finish']);
    expect(worker.posts.at(-1)?.message).toEqual({ type: 'finish' });
    expect(worker.posts.at(-1)?.transfer).toEqual([]);
    expect(source.copyFromChannel).toHaveBeenCalledTimes(6);
    expect(worker.terminated).toBe(0);
    const blob = new Blob([new Uint8Array(4)], { type: 'audio/wav' });
    worker.emit({ type: 'complete', blob, peak: 1.2, clippedSamples: 3 });
    const result = await pending;
    expect(result).toEqual({ blob, peak: 1.2, clippedSamples: 3 });
    expect(result.blob).toBe(blob);
    expect(worker.terminated).toBe(1);
    expect(worker.onmessage).toBeNull();
    expect(events.at(-1)).toBe('progress:1');
  });

  it('SW2b a worker error, onerror and onmessageerror each reject with the exact message and terminate once', async () => {
    const failures: Array<{ fail: (worker: StreamFakeWorker) => void; expected: string }> = [
      {
        fail: (worker) => worker.emit({ type: 'error', message: 'WAV stream: empty chunk' }),
        expected: `${ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE} WAV stream: empty chunk`,
      },
      {
        fail: (worker) => worker.onerror?.(new Event('error')),
        expected: ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
      },
      {
        fail: (worker) => worker.onmessageerror?.(new MessageEvent('messageerror')),
        expected: ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
      },
    ];
    for (const { fail, expected } of failures) {
      const pending = outcomeOf(encodeArrangementWavStreamOffMainThread(spiedSource(stereo(4))));
      const worker = lastWorker();
      fail(worker);
      const result = await pending;
      expect(result).toEqual(new Error(expected));
      expect(worker.terminated).toBe(1);
      worker.emit({ type: 'ack', written: 4 });
      expect(worker.types()).toEqual(['begin', 'chunk']);
      expect(worker.terminated).toBe(1);
    }
    expect(StreamFakeWorker.instances).toHaveLength(3);
  });

  it('SW2c a Worker constructor that throws rejects with the exact message and copies nothing', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error("Failed to construct 'Worker'");
        }
      },
    );
    const source = spiedSource(stereo(4));
    await expect(encodeArrangementWavStreamOffMainThread(source)).rejects.toThrow(
      new Error(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE),
    );
    expect(source.copyFromChannel).not.toHaveBeenCalled();
  });

  it('SW2d postMessage throwing on begin, the first chunk, a later chunk or finish rejects with the constant and terminates once', async () => {
    for (const failingPost of [0, 1, 2, 3]) {
      StreamFakeWorker.throwOnPost = (index) => index === failingPost;
      const pending = outcomeOf(
        encodeArrangementWavStreamOffMainThread(
          spiedSource(stereo(2 * ARRANGEMENT_WAV_CHUNK_FRAMES)),
        ),
      );
      const worker = lastWorker();
      for (let ack = 1; ack < failingPost; ack++) {
        expect(worker.types()).toHaveLength(ack + 1);
        worker.emit({ type: 'ack', written: ack * ARRANGEMENT_WAV_CHUNK_FRAMES });
      }
      expect(worker.types()).toEqual(['begin', 'chunk', 'chunk'].slice(0, failingPost));
      expect(await pending).toEqual(new Error(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE));
      expect(worker.terminated).toBe(1);
      expect(worker.onmessage).toBeNull();
    }
  });

  it('SW2e a throwing onProgress still completes, on the worker path and on the no-Worker fallback', async () => {
    const throwing = vi.fn(() => {
      throw new Error('progress listener broke');
    });
    const raw = stereo(ARRANGEMENT_WAV_CHUNK_FRAMES + 5);
    const pending = encodeArrangementWavStreamOffMainThread(spiedSource(raw), throwing);
    const worker = lastWorker();
    worker.emit({ type: 'ack', written: ARRANGEMENT_WAV_CHUNK_FRAMES });
    worker.emit({ type: 'ack', written: ARRANGEMENT_WAV_CHUNK_FRAMES + 5 });
    expect(worker.types()).toEqual(['begin', 'chunk', 'chunk', 'finish']);
    const blob = new Blob([new Uint8Array(2)], { type: 'audio/wav' });
    worker.emit({ type: 'complete', blob, peak: 0.5, clippedSamples: 0 });
    await expect(pending).resolves.toEqual({ blob, peak: 0.5, clippedSamples: 0 });
    expect(throwing).toHaveBeenCalledTimes(3);
    vi.unstubAllGlobals();
    expect(typeof Worker).toBe('undefined');
    throwing.mockClear();
    const expected = encodeArrangementWav(
      raw.map((channel) => channel.slice()),
      48000,
    );
    const fallback = await encodeArrangementWavStreamOffMainThread(spiedSource(raw), throwing);
    expect(throwing).toHaveBeenCalledTimes(3);
    expect(fallback.peak).toBe(expected.peak);
    expect(fallback.clippedSamples).toBe(expected.clippedSamples);
    expect(
      countByteMismatches(await blobBytes(fallback.blob), new Uint8Array(expected.bytes)),
    ).toBe(0);
  });
});

function completeWorkerStream(worker: StreamFakeWorker) {
  worker.emit({
    type: 'complete',
    blob: new Blob([new Uint8Array(2)], { type: 'audio/wav' }),
    peak: 0,
    clippedSamples: 0,
  });
}

describe('PERF-12a SW4 the wav progress is whole-percent, monotonic and ends at 1', () => {
  afterEach(() => {
    StreamFakeWorker.instances = [];
    StreamFakeWorker.throwOnPost = null;
    vi.unstubAllGlobals();
  });

  it('SW4 on the worker path progress starts at 0, never decreases and ends at exactly 1', async () => {
    vi.stubGlobal('Worker', StreamFakeWorker);
    const length = 4 * ARRANGEMENT_WAV_CHUNK_FRAMES;
    const fractions: number[] = [];
    const pending = encodeArrangementWavStreamOffMainThread(
      spiedSource([new Float32Array(length)]),
      (f) => fractions.push(f),
    );
    const worker = lastWorker();
    for (let chunk = 1; chunk <= 4; chunk++) {
      worker.emit({ type: 'ack', written: chunk * ARRANGEMENT_WAV_CHUNK_FRAMES });
    }
    expect(fractions).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(worker.types().at(-1)).toBe('finish');
    completeWorkerStream(worker);
    await expect(pending).resolves.toMatchObject({ peak: 0, clippedSamples: 0 });
    expect(fractions).toHaveLength(5);
  });

  it('SW4 two acks inside the same whole percent give one callback', async () => {
    vi.stubGlobal('Worker', StreamFakeWorker);
    const length = 3 * ARRANGEMENT_WAV_CHUNK_FRAMES;
    const fractions: number[] = [];
    const pending = encodeArrangementWavStreamOffMainThread(
      spiedSource([new Float32Array(length)]),
      (f) => fractions.push(f),
    );
    const worker = lastWorker();
    worker.emit({ type: 'ack', written: ARRANGEMENT_WAV_CHUNK_FRAMES });
    worker.emit({ type: 'ack', written: ARRANGEMENT_WAV_CHUNK_FRAMES + 64 });
    expect(Math.floor(((ARRANGEMENT_WAV_CHUNK_FRAMES + 64) / length) * 100)).toBe(33);
    expect(fractions).toEqual([0, ARRANGEMENT_WAV_CHUNK_FRAMES / length]);
    worker.emit({ type: 'ack', written: length });
    expect(fractions).toEqual([0, ARRANGEMENT_WAV_CHUNK_FRAMES / length, 1]);
    completeWorkerStream(worker);
    await expect(pending).resolves.toMatchObject({ peak: 0, clippedSamples: 0 });
  });

  it('SW4 on the fallback progress starts at 0, never decreases, has one call per whole percent and ends at exactly 1 (replaces IP3)', async () => {
    expect(typeof Worker).toBe('undefined');
    const length = 3 * ARRANGEMENT_WAV_CHUNK_FRAMES + 5;
    const fractions: number[] = [];
    await encodeArrangementWavStreamOffMainThread(spiedSource([new Float32Array(length)]), (f) =>
      fractions.push(f),
    );
    expect(fractions[0]).toBe(0);
    expect(fractions).toHaveLength(5);
    for (let i = 1; i < fractions.length; i++) {
      expect(fractions[i]).toBeGreaterThan(fractions[i - 1]);
    }
    const percents = fractions.map((fraction) => Math.floor(fraction * 100));
    expect(new Set(percents).size).toBe(percents.length);
    expect(fractions.at(-1)).toBe(1);
  });
});

describe('PERF-12a SW3 the worker module: begin, ack, finish, complete, error (replaces EW7, IP4)', () => {
  const posted: PostedMessage[] = [];

  function send(data: unknown) {
    if (!workerHandler) {
      throw new Error('worker onmessage not installed');
    }
    workerHandler.call(window, new MessageEvent('message', { data }));
  }

  beforeEach(() => {
    vi.spyOn(window, 'postMessage').mockImplementation(
      (message: unknown, options?: WindowPostMessageOptions) => {
        posted.push({ message, transfer: options?.transfer ?? [] });
      },
    );
    send({ type: 'finish' });
    expect(posted.map(({ message }) => message)).toEqual([
      { type: 'error', message: 'WAV stream: no begin message' },
    ]);
    posted.length = 0;
  });

  afterEach(() => {
    posted.length = 0;
    vi.restoreAllMocks();
  });

  it('SW3 begin is silent, each chunk acks the cumulative written count, and complete carries a Blob with the oracle bytes', async () => {
    const length = 2 * ARRANGEMENT_WAV_CHUNK_FRAMES + 123;
    const raw = stereo(length);
    const expected = encodeArrangementWav(
      raw.map((channel) => channel.slice()),
      48000,
    );
    send({ type: 'begin', length, channelCount: 2, sampleRate: 48000 });
    expect(posted).toEqual([]);
    const acks: number[] = [];
    for (let offset = 0; offset < length; offset += ARRANGEMENT_WAV_CHUNK_FRAMES) {
      send({
        type: 'chunk',
        channels: raw.map((channel) =>
          channel.slice(offset, offset + ARRANGEMENT_WAV_CHUNK_FRAMES),
        ),
      });
      const message = posted.at(-1)?.message;
      acks.push(
        typeof message === 'object' && message !== null && 'written' in message
          ? Number(message.written)
          : Number.NaN,
      );
    }
    expect(acks).toEqual([ARRANGEMENT_WAV_CHUNK_FRAMES, 2 * ARRANGEMENT_WAV_CHUNK_FRAMES, length]);
    expect(posted.map(({ message }) => message)).toEqual(
      acks.map((written) => ({ type: 'ack', written })),
    );
    send({ type: 'finish' });
    expect(posted).toHaveLength(4);
    const last = posted.at(-1)?.message;
    expect(last).toMatchObject({
      type: 'complete',
      peak: expected.peak,
      clippedSamples: expected.clippedSamples,
    });
    const blob =
      typeof last === 'object' && last !== null && 'blob' in last && last.blob instanceof Blob
        ? last.blob
        : null;
    expect(blob?.type).toBe('audio/wav');
    expect(blob?.size).toBe(expected.bytes.byteLength);
    expect(
      blob ? countByteMismatches(await blobBytes(blob), new Uint8Array(expected.bytes)) : -1,
    ).toBe(0);
    for (const entry of posted) {
      expect(entry.transfer).toEqual([]);
    }
  });

  it('SW3 a chunk before begin, a shape mismatch, too many frames, a short finish and an empty chunk each post the exact error', () => {
    const errorOf = () => posted.at(-1)?.message;
    send({ type: 'chunk', channels: [new Float32Array(2)] });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: no begin message' });
    send({ type: 'begin', length: 4, channelCount: 2, sampleRate: 48000 });
    send({ type: 'chunk', channels: [new Float32Array(2)] });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: chunk shape does not match' });
    send({ type: 'chunk', channels: [new Float32Array(2)] });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: no begin message' });
    send({ type: 'begin', length: 4, channelCount: 1, sampleRate: 48000 });
    send({ type: 'chunk', channels: [new Float32Array(5)] });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: more frames than declared' });
    send({ type: 'begin', length: 4, channelCount: 1, sampleRate: 48000 });
    send({ type: 'chunk', channels: [new Float32Array(3)] });
    expect(errorOf()).toEqual({ type: 'ack', written: 3 });
    send({ type: 'finish' });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: fewer frames than declared' });
    send({ type: 'begin', length: 4, channelCount: 1, sampleRate: 48000 });
    send({ type: 'chunk', channels: [new Float32Array(0)] });
    expect(errorOf()).toEqual({ type: 'error', message: 'WAV stream: empty chunk' });
    send({ type: 'begin', length: 0, channelCount: 1, sampleRate: 48000 });
    expect(errorOf()).toEqual({
      type: 'error',
      message: 'WAV stream: invalid length or channel count',
    });
  });
});
