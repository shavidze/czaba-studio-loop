import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import {
  accumulatePeakChunk,
  computePeaks,
  PEAK_BUCKETS_PER_SECOND,
  peakBucketCount,
} from '../peaks';
import {
  createSourcePeaksComputer,
  PEAKS_CHUNK_SECONDS,
  PEAKS_CHUNKS_IN_FLIGHT,
  PEAKS_WORKER_COLD_START_TIMEOUT_MS,
  PEAKS_WORKER_STALL_TIMEOUT_MS,
} from '../peaks.client';
import {
  handlePeaksWorkerRequest,
  type PeaksWorkerRequest,
  type PeaksWorkerResponse,
  type PeaksWorkerState,
} from '../peaks.worker-protocol';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

class FakeAudioBuffer implements AudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  copies: number[] = [];
  constructor(
    private readonly channels: Float32Array<ArrayBuffer>[],
    readonly sampleRate: number,
  ) {
    this.length = channels[0]?.length ?? 0;
    this.numberOfChannels = channels.length;
    this.duration = this.length / sampleRate;
  }
  getChannelData(channel: number): Float32Array<ArrayBuffer> {
    return this.channels[channel];
  }
  copyFromChannel(destination: Float32Array<ArrayBuffer>, channel: number, start = 0): void {
    this.copies.push(destination.length);
    destination.set(this.channels[channel].subarray(start, start + destination.length));
  }
  copyToChannel(): void {}
}

function signal(seed: number, length: number): Float32Array<ArrayBuffer> {
  const data = new Float32Array(length);
  let x = seed;
  for (let i = 0; i < length; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    data[i] = (x / 2147483648) * 2 - 1;
  }
  return data;
}

function bytes(values: Float32Array): number[] {
  return Array.from(new Uint8Array(values.buffer, values.byteOffset, values.byteLength));
}

function streamed(channels: Float32Array[], sampleRate: number, chunk: number): Float32Array {
  const length = channels[0]?.length ?? 0;
  const peaks = new Float32Array(peakBucketCount(length, sampleRate, PEAK_BUCKETS_PER_SECOND));
  for (let start = 0; start < length; start += chunk) {
    const size = Math.min(chunk, length - start);
    accumulatePeakChunk(
      peaks,
      channels.map((channel) => {
        const padded = new Float32Array(chunk).fill(1);
        padded.set(channel.subarray(start, start + size));
        return padded;
      }),
      start,
      size,
      sampleRate,
      PEAK_BUCKETS_PER_SECOND,
    );
  }
  return peaks;
}

describe('PW1-PW2 streaming peak kernel', () => {
  it('PW1 equals computePeaks byte for byte across rates, lengths, chunk sizes and channel counts', () => {
    for (const sampleRate of [48000, 44100, 22050, 8000, 96000]) {
      for (const length of [1, 479, 480, 481, 2205, Math.round(sampleRate * 2.37)]) {
        for (const count of [1, 2, 6]) {
          const channels = Array.from({ length: count }, (_, c) =>
            signal(7 + c * 31 + length, length),
          );
          const expected = computePeaks(channels, sampleRate, PEAK_BUCKETS_PER_SECOND);
          for (const chunk of [1, 7, 480, 221, sampleRate * PEAKS_CHUNK_SECONDS, length]) {
            if (chunk === 1 && length > 2205) {
              continue;
            }
            expect(bytes(streamed(channels, sampleRate, chunk))).toEqual(bytes(expected));
          }
        }
      }
    }
  });

  it('PW1b keeps NaN, -0 and infinity handling identical', () => {
    const left = new Float32Array([0, -0, Number.NaN, 0.5, -Infinity, 0.25, Number.NaN, -0.75]);
    const right = new Float32Array([-0, Number.NaN, 0.1, -0, 0.2, Number.NaN, 0, 0.3]);
    const expected = computePeaks([left, right], 400, PEAK_BUCKETS_PER_SECOND);
    for (const chunk of [1, 3, 8]) {
      expect(bytes(streamed([left, right], 400, chunk))).toEqual(bytes(expected));
    }
  });

  it('PW2 bucket count matches computePeaks, including empty and invalid input', () => {
    for (const [length, rate] of [
      [0, 48000],
      [1, 48000],
      [480, 48000],
      [481, 48000],
      [221, 22050],
      [5, 0],
      [5, Number.NaN],
      [5, -48000],
    ]) {
      const expected = computePeaks(
        [new Float32Array(length)],
        rate,
        PEAK_BUCKETS_PER_SECOND,
      ).length;
      expect(peakBucketCount(length, rate, PEAK_BUCKETS_PER_SECOND)).toBe(expected);
    }
  });
});

describe('PW3 worker protocol', () => {
  it('accumulates chunks, acks with the same arrays and transfers the peaks on end', () => {
    const state: PeaksWorkerState = { job: null };
    const posted: { response: PeaksWorkerResponse; transfer: ArrayBuffer[] }[] = [];
    const post = (response: PeaksWorkerResponse, transfer: ArrayBuffer[]) =>
      posted.push({ response, transfer });
    const data = signal(3, 22050 * 3 + 17);
    const send = (request: PeaksWorkerRequest) => handlePeaksWorkerRequest(state, request, post);
    send({
      type: 'begin',
      jobId: 4,
      length: data.length,
      sampleRate: 22050,
      bucketsPerSecond: PEAK_BUCKETS_PER_SECOND,
    });
    const sent: Float32Array<ArrayBuffer>[] = [];
    for (let start = 0; start < data.length; start += 5000) {
      const chunk = new Float32Array(5000);
      chunk.set(data.subarray(start, start + 5000));
      sent.push(chunk);
      send({
        type: 'chunk',
        jobId: 4,
        start,
        length: Math.min(5000, data.length - start),
        channels: [chunk],
      });
    }
    send({ type: 'chunk', jobId: 99, start: 0, length: 1, channels: [new Float32Array([1])] });
    send({ type: 'end', jobId: 4 });
    const acks = posted.filter((entry) => entry.response.type === 'ack');
    expect(acks).toHaveLength(sent.length + 1);
    acks.slice(0, sent.length).forEach((entry, index) => {
      expect(entry.response.type === 'ack' && entry.response.channels[0]).toBe(sent[index]);
      expect(entry.transfer).toEqual([sent[index].buffer]);
    });
    const done = posted.at(-1);
    expect(done?.response.type).toBe('done');
    if (done?.response.type !== 'done') {
      return;
    }
    expect(bytes(done.response.peaks)).toEqual(
      bytes(computePeaks([data], 22050, PEAK_BUCKETS_PER_SECOND)),
    );
    expect(done.transfer).toEqual([done.response.peaks.buffer]);
    expect(state.job).toBeNull();
  });

  it('cancel drops the job without a done reply', () => {
    const state: PeaksWorkerState = { job: null };
    const posted: PeaksWorkerResponse[] = [];
    handlePeaksWorkerRequest(
      state,
      { type: 'begin', jobId: 1, length: 10, sampleRate: 1000, bucketsPerSecond: 100 },
      (r) => posted.push(r),
    );
    handlePeaksWorkerRequest(state, { type: 'cancel', jobId: 1 }, (r) => posted.push(r));
    handlePeaksWorkerRequest(state, { type: 'end', jobId: 1 }, (r) => posted.push(r));
    expect(posted).toEqual([]);
    expect(state.job).toBeNull();
  });
});

class FakePeaksWorker {
  static instances: FakePeaksWorker[] = [];
  static auto = true;
  static marker: Float32Array | null = null;
  static throwOn: PeaksWorkerRequest['type'] | null = null;
  posted: { message: PeaksWorkerRequest; transfer: ArrayBuffer[] }[] = [];
  terminated = 0;
  state: PeaksWorkerState = { job: null };
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  inFlightMax = 0;
  private inFlight = 0;
  constructor() {
    FakePeaksWorker.instances.push(this);
  }
  postMessage(message: PeaksWorkerRequest, options?: { transfer?: ArrayBuffer[] }) {
    if (message.type === FakePeaksWorker.throwOn) {
      throw new DOMException('post failed', 'DataCloneError');
    }
    this.posted.push({ message, transfer: options?.transfer ?? [] });
    if (message.type === 'chunk') {
      this.inFlight += 1;
      this.inFlightMax = Math.max(this.inFlightMax, this.inFlight);
    }
    if (FakePeaksWorker.auto) {
      queueMicrotask(() => this.run(message));
    }
  }
  run(message: PeaksWorkerRequest) {
    handlePeaksWorkerRequest(this.state, message, (response) => {
      if (response.type === 'ack') {
        this.inFlight -= 1;
      }
      const data =
        response.type === 'done' && FakePeaksWorker.marker
          ? { ...response, peaks: FakePeaksWorker.marker }
          : response;
      this.onmessage?.(new MessageEvent('message', { data }));
    });
  }
  terminate() {
    this.terminated += 1;
  }
}

async function settle(rounds = 400) {
  for (let i = 0; i < rounds; i++) {
    await Promise.resolve();
  }
}

describe('PW4-PW10 peaks client', () => {
  beforeEach(() => {
    FakePeaksWorker.instances = [];
    FakePeaksWorker.auto = true;
    FakePeaksWorker.marker = null;
    vi.stubGlobal('Worker', FakePeaksWorker);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('PW4 streams bounded, reused chunks to one worker and delivers its peaks', async () => {
    const rate = 8000;
    const channels = [signal(1, rate * 11 + 3), signal(2, rate * 11 + 3)];
    const buffer = new FakeAudioBuffer(channels, rate);
    const computer = createSourcePeaksComputer();
    const results: Float32Array[] = [];
    computer.request(buffer, new AbortController().signal, (peaks) => results.push(peaks));
    expect(results).toHaveLength(0);
    await settle();
    expect(FakePeaksWorker.instances).toHaveLength(1);
    expect(results).toHaveLength(1);
    expect(bytes(results[0])).toEqual(bytes(computePeaks(channels, rate, PEAK_BUCKETS_PER_SECOND)));
    const worker = FakePeaksWorker.instances[0];
    const chunks = worker.posted.filter((entry) => entry.message.type === 'chunk');
    expect(chunks.length).toBe(Math.ceil(buffer.length / (rate * PEAKS_CHUNK_SECONDS)));
    expect(worker.inFlightMax).toBeLessThanOrEqual(PEAKS_CHUNKS_IN_FLIGHT);
    expect(Math.max(...buffer.copies)).toBe(rate * PEAKS_CHUNK_SECONDS);
    const arrays = new Set(
      chunks.flatMap((entry) => (entry.message.type === 'chunk' ? entry.message.channels : [])),
    );
    expect(arrays.size).toBeLessThanOrEqual(PEAKS_CHUNKS_IN_FLIGHT * 2);
    for (const entry of chunks) {
      if (entry.message.type === 'chunk') {
        expect(entry.transfer).toEqual(entry.message.channels.map((channel) => channel.buffer));
      }
    }
    computer.dispose();
    expect(worker.terminated).toBe(1);
  });

  it('PW5 delivers the worker reply object itself (no main-thread recompute)', async () => {
    const marker = new Float32Array([9, 9, 9]);
    FakePeaksWorker.marker = marker;
    const computer = createSourcePeaksComputer();
    const results: Float32Array[] = [];
    computer.request(
      new FakeAudioBuffer([signal(5, 900)], 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    await settle();
    expect(results).toEqual([marker]);
    expect(results[0]).toBe(marker);
  });

  it('PW6 without Worker computes synchronously on the main thread', () => {
    vi.stubGlobal('Worker', undefined);
    const channels = [signal(8, 1234)];
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer(channels, 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    expect(results).toHaveLength(1);
    expect(bytes(results[0])).toEqual(bytes(computePeaks(channels, 1000, PEAK_BUCKETS_PER_SECOND)));
  });

  it('PW7 abort drops the job, posts cancel and runs the next job', async () => {
    const computer = createSourcePeaksComputer();
    const first = new AbortController();
    const results: string[] = [];
    computer.request(new FakeAudioBuffer([signal(1, 50000)], 1000), first.signal, () =>
      results.push('first'),
    );
    computer.request(
      new FakeAudioBuffer([signal(2, 3000)], 1000),
      new AbortController().signal,
      () => results.push('second'),
    );
    first.abort();
    await settle();
    expect(results).toEqual(['second']);
    const types = FakePeaksWorker.instances[0].posted.map((entry) => entry.message.type);
    expect(types).toContain('cancel');
    expect(types.filter((type) => type === 'begin')).toHaveLength(2);
  });

  it('PW7b an abort after the last chunk drops the done reply', async () => {
    FakePeaksWorker.auto = false;
    const computer = createSourcePeaksComputer();
    const controller = new AbortController();
    const results: string[] = [];
    computer.request(new FakeAudioBuffer([signal(3, 900)], 1000), controller.signal, () =>
      results.push('late'),
    );
    const worker = FakePeaksWorker.instances[0];
    for (let index = 0; index < worker.posted.length; index++) {
      if (worker.posted[index].message.type === 'end') {
        controller.abort();
      }
      worker.run(worker.posted[index].message);
    }
    await settle();
    expect(worker.posted.map((entry) => entry.message.type)).toContain('end');
    expect(results).toEqual([]);
  });

  it('PW8 a worker error falls back to main-thread peaks for pending jobs', async () => {
    FakePeaksWorker.auto = false;
    const channels = [signal(4, 2500)];
    const computer = createSourcePeaksComputer();
    const results: Float32Array[] = [];
    computer.request(new FakeAudioBuffer(channels, 1000), new AbortController().signal, (p) =>
      results.push(p),
    );
    computer.request(new FakeAudioBuffer(channels, 1000), new AbortController().signal, (p) =>
      results.push(p),
    );
    FakePeaksWorker.instances[0].onerror?.(new Event('error'));
    expect(results).toHaveLength(2);
    expect(bytes(results[1])).toEqual(bytes(computePeaks(channels, 1000, PEAK_BUCKETS_PER_SECOND)));
    expect(FakePeaksWorker.instances[0].terminated).toBe(1);
    computer.request(new FakeAudioBuffer(channels, 1000), new AbortController().signal, (p) =>
      results.push(p),
    );
    expect(results).toHaveLength(3);
    expect(FakePeaksWorker.instances).toHaveLength(1);
  });

  it('PW20 an empty buffer gets its peaks at once on the main thread and starts no worker', () => {
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer([new Float32Array(0)], 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    expect(results).toHaveLength(1);
    expect(bytes(results[0])).toEqual(
      bytes(computePeaks([new Float32Array(0)], 1000, PEAK_BUCKETS_PER_SECOND)),
    );
    expect(FakePeaksWorker.instances).toHaveLength(0);
  });

  it('PW9 after the first reply, a stalled worker falls back after the stall timeout', () => {
    vi.useFakeTimers();
    FakePeaksWorker.auto = false;
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer([signal(6, 7000)], 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    const worker = FakePeaksWorker.instances[0];
    worker.run(worker.posted[0].message);
    worker.run(worker.posted[1].message);
    expect(results).toHaveLength(0);
    vi.advanceTimersByTime(PEAKS_WORKER_STALL_TIMEOUT_MS - 1);
    expect(results).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(results).toHaveLength(1);
    expect(worker.terminated).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('PW14 a worker that has not replied yet gets the cold-start budget, not the stall timeout', () => {
    vi.useFakeTimers();
    FakePeaksWorker.auto = false;
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer([signal(14, 700)], 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    vi.advanceTimersByTime(PEAKS_WORKER_STALL_TIMEOUT_MS);
    expect(results).toHaveLength(0);
    vi.advanceTimersByTime(PEAKS_WORKER_COLD_START_TIMEOUT_MS - PEAKS_WORKER_STALL_TIMEOUT_MS - 1);
    expect(results).toHaveLength(0);
    expect(FakePeaksWorker.instances[0].terminated).toBe(0);
    vi.advanceTimersByTime(1);
    expect(results).toHaveLength(1);
    expect(FakePeaksWorker.instances[0].terminated).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('PW15 every worker reply re-arms the stall timer', () => {
    vi.useFakeTimers();
    FakePeaksWorker.auto = false;
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer([signal(15, 20000)], 1000),
      new AbortController().signal,
      (p) => results.push(p),
    );
    const worker = FakePeaksWorker.instances[0];
    worker.run(worker.posted[0].message);
    for (let step = 1; step <= 3; step++) {
      vi.advanceTimersByTime(PEAKS_WORKER_STALL_TIMEOUT_MS - 1);
      worker.run(worker.posted[step].message);
    }
    vi.advanceTimersByTime(PEAKS_WORKER_STALL_TIMEOUT_MS - 1);
    expect(results).toHaveLength(0);
    expect(worker.terminated).toBe(0);
    vi.advanceTimersByTime(1);
    expect(results).toHaveLength(1);
    expect(worker.terminated).toBe(1);
  });

  it('PW10 runs jobs one at a time in request order', async () => {
    FakePeaksWorker.auto = false;
    const computer = createSourcePeaksComputer();
    computer.request(
      new FakeAudioBuffer([signal(1, 300)], 1000),
      new AbortController().signal,
      () => {},
    );
    computer.request(
      new FakeAudioBuffer([signal(2, 300)], 1000),
      new AbortController().signal,
      () => {},
    );
    const worker = FakePeaksWorker.instances[0];
    expect(worker.posted.filter((entry) => entry.message.type === 'begin')).toHaveLength(1);
    for (let index = 0; index < worker.posted.length; index++) {
      worker.run(worker.posted[index].message);
    }
    await settle();
    const begins = worker.posted.filter((entry) => entry.message.type === 'begin');
    expect(begins.map((entry) => entry.message.jobId)).toEqual([1, 2]);
  });
});

interface PeaksProbeRef {
  current: WorkspaceProbeValue | null;
}

function PeaksProbe({ api }: { api: PeaksProbeRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

class FakeOfflineAudioContext {}

describe('PW11 context keeps "ready" after the worker peaks', () => {
  beforeEach(() => {
    FakePeaksWorker.instances = [];
    FakePeaksWorker.auto = false;
    FakePeaksWorker.marker = new Float32Array([0.5, 0.25]);
    vi.stubGlobal('Worker', FakePeaksWorker);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('PW11 the source becomes ready only after done, with the worker peaks as its sourcePeaks', async () => {
    const marker = FakePeaksWorker.marker;
    const buffer = new FakeAudioBuffer([signal(11, 1500)], 1000);
    const collection: WorkspaceCollection = {
      id: 'peaks-worker',
      label: 'peaks-worker',
      origin: 'demo',
      sources: [
        {
          id: 'tone',
          title: 'Tone',
          collectionLabel: 'peaks-worker',
          kind: 'music',
          origin: 'demo',
        },
      ],
      loadSource: async () => buffer,
    };
    const api: PeaksProbeRef = { current: null };
    const view = render(
      createElement(ArrangementProvider, { collection }, createElement(PeaksProbe, { api })),
    );
    await act(async () => {
      await settle(50);
    });
    expect(api.current?.sourceStates.tone?.status).toBe('loading');
    expect(api.current?.sourcePeaks.has('tone')).toBe(false);
    expect(FakePeaksWorker.instances).toHaveLength(1);
    const worker = FakePeaksWorker.instances[0];
    expect(worker.posted.map((entry) => entry.message.type)).toEqual(['begin', 'chunk']);
    await act(async () => {
      for (let index = 0; index < worker.posted.length; index++) {
        worker.run(worker.posted[index].message);
      }
      await settle(50);
    });
    expect(worker.posted.map((entry) => entry.message.type)).toEqual(['begin', 'chunk', 'end']);
    expect(api.current?.sourceStates.tone?.status).toBe('ready');
    expect(api.current?.sourcePeaks.get('tone')).toBe(marker);
    view.unmount();
    expect(worker.terminated).toBe(1);
  });
});

class RecordingSource {
  static started: unknown[] = [];
  buffer: unknown = null;
  onended: (() => void) | null = null;
  connect(destination: unknown) {
    return destination;
  }
  disconnect() {}
  start() {
    RecordingSource.started.push(this.buffer);
  }
  stop() {}
}

class RecordingAudioContext {
  state = 'running';
  sampleRate = 48000;
  currentTime = 0;
  destination = { connect: () => undefined, disconnect: () => undefined };
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return {
      gain: { value: 0, setTargetAtTime() {} },
      connect: (d: unknown) => d,
      disconnect() {},
    };
  }
  createStereoPanner() {
    return { pan: { value: 0, setTargetAtTime() {} }, connect: (d: unknown) => d, disconnect() {} };
  }
  createBufferSource() {
    return new RecordingSource();
  }
}

describe('PW18 a source buffer reaches playback only together with "ready"', () => {
  beforeEach(() => {
    FakePeaksWorker.instances = [];
    FakePeaksWorker.auto = false;
    FakePeaksWorker.marker = null;
    RecordingSource.started = [];
    vi.stubGlobal('Worker', FakePeaksWorker);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioContext', RecordingAudioContext);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('PW18 playback started while peaks run leaves the clip out, then re-syncs it in when the source is ready', async () => {
    const buffer = new FakeAudioBuffer([signal(18, 1500)], 1000);
    const collection: WorkspaceCollection = {
      id: 'peaks-buffer',
      label: 'peaks-buffer',
      origin: 'demo',
      sources: [
        {
          id: 'tone',
          title: 'Tone',
          collectionLabel: 'peaks-buffer',
          kind: 'music',
          origin: 'demo',
        },
      ],
      loadSource: async () => buffer,
    };
    const base = createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'music', kind: 'audio', name: 'Music' },
    ]);
    const initialArrangement = {
      ...base,
      clips: [
        { id: 'c1', trackId: 'music', sourceId: 'tone', start: 0, sourceOffset: 0, duration: 1.5 },
      ],
    };
    const api: PeaksProbeRef = { current: null };
    const view = render(
      createElement(
        ArrangementProvider,
        { collection, initialArrangement },
        createElement(PeaksProbe, { api }),
      ),
    );
    await act(async () => {
      await settle(50);
    });
    expect(api.current?.sourceStates.tone?.status).toBe('loading');
    await act(async () => {
      api.current?.togglePlayback();
      await settle(50);
    });
    expect(api.current?.isPlaying).toBe(true);
    expect(RecordingSource.started).not.toContain(buffer);
    const worker = FakePeaksWorker.instances[0];
    await act(async () => {
      for (let index = 0; index < worker.posted.length; index++) {
        worker.run(worker.posted[index].message);
      }
      await settle(50);
    });
    expect(api.current?.sourceStates.tone?.status).toBe('ready');
    expect(RecordingSource.started).toContain(buffer);
    view.unmount();
  });
});

const POST_FAILURE_TYPES: PeaksWorkerRequest['type'][] = ['begin', 'chunk'];
const LATE_POST_FAILURE_TYPES: PeaksWorkerRequest['type'][] = ['end', 'cancel'];

describe('PW12-PW13 peaks client robustness (A-R312 review)', () => {
  beforeEach(() => {
    FakePeaksWorker.instances = [];
    FakePeaksWorker.auto = true;
    FakePeaksWorker.marker = null;
    FakePeaksWorker.throwOn = null;
    vi.stubGlobal('Worker', FakePeaksWorker);
  });
  afterEach(() => {
    FakePeaksWorker.throwOn = null;
    vi.unstubAllGlobals();
  });

  it('PW12 a request made inside onPeaks keeps every queued job and delivers all of them in order', async () => {
    const computer = createSourcePeaksComputer();
    const results: string[] = [];
    const third = new FakeAudioBuffer([signal(9, 700)], 1000);
    computer.request(
      new FakeAudioBuffer([signal(7, 700)], 1000),
      new AbortController().signal,
      () => {
        results.push('first');
        computer.request(third, new AbortController().signal, () => results.push('third'));
      },
    );
    computer.request(
      new FakeAudioBuffer([signal(8, 700)], 1000),
      new AbortController().signal,
      () => results.push('second'),
    );
    await settle();
    expect(results).toEqual(['first', 'second', 'third']);
    const begins = FakePeaksWorker.instances[0].posted.filter(
      (entry) => entry.message.type === 'begin',
    );
    expect(begins.map((entry) => entry.message.jobId)).toEqual([1, 2, 3]);
  });

  it.each(
    POST_FAILURE_TYPES,
  )('PW13 a throwing postMessage on %s falls back to main-thread peaks at once and turns the worker off', (type) => {
    FakePeaksWorker.auto = false;
    FakePeaksWorker.throwOn = type;
    const channels = [signal(12, 2500)];
    const computer = createSourcePeaksComputer();
    const results: Float32Array[] = [];
    expect(() =>
      computer.request(new FakeAudioBuffer(channels, 1000), new AbortController().signal, (p) =>
        results.push(p),
      ),
    ).not.toThrow();
    expect(results).toHaveLength(1);
    expect(bytes(results[0])).toEqual(bytes(computePeaks(channels, 1000, PEAK_BUCKETS_PER_SECOND)));
    expect(FakePeaksWorker.instances).toHaveLength(1);
    expect(FakePeaksWorker.instances[0].terminated).toBe(1);
    computer.request(new FakeAudioBuffer(channels, 1000), new AbortController().signal, (p) =>
      results.push(p),
    );
    expect(results).toHaveLength(2);
    expect(FakePeaksWorker.instances).toHaveLength(1);
  });
  it.each(
    LATE_POST_FAILURE_TYPES,
  )('PW13b a throwing postMessage on %s turns the worker off without a stray timer', async (type) => {
    vi.useFakeTimers();
    FakePeaksWorker.auto = false;
    const channels = [signal(13, 2500)];
    const controller = new AbortController();
    const results: Float32Array[] = [];
    createSourcePeaksComputer().request(
      new FakeAudioBuffer(channels, 1000),
      controller.signal,
      (p) => results.push(p),
    );
    const worker = FakePeaksWorker.instances[0];
    worker.run(worker.posted[0].message);
    if (type === 'cancel') {
      controller.abort();
    } else {
      worker.run(worker.posted[1].message);
    }
    FakePeaksWorker.throwOn = type;
    const last = type === 'cancel' ? 1 : 2;
    expect(() => worker.run(worker.posted[last].message)).not.toThrow();
    expect(worker.terminated).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    if (type === 'end') {
      expect(results).toHaveLength(1);
      expect(bytes(results[0])).toEqual(
        bytes(computePeaks(channels, 1000, PEAK_BUCKETS_PER_SECOND)),
      );
    } else {
      expect(results).toHaveLength(0);
    }
    vi.useRealTimers();
  });

  it('PW16 a throwing onPeaks still starts and delivers the next job and rethrows on a timer', () => {
    FakePeaksWorker.auto = false;
    const computer = createSourcePeaksComputer();
    const results: string[] = [];
    computer.request(
      new FakeAudioBuffer([signal(16, 700)], 1000),
      new AbortController().signal,
      () => {
        results.push('first');
        throw new Error('first onPeaks failed');
      },
    );
    computer.request(
      new FakeAudioBuffer([signal(17, 700)], 1000),
      new AbortController().signal,
      () => results.push('second'),
    );
    const worker = FakePeaksWorker.instances[0];
    worker.run(worker.posted[0].message);
    worker.run(worker.posted[1].message);
    vi.useFakeTimers();
    expect(() => worker.run(worker.posted[2].message)).not.toThrow();
    expect(results).toEqual(['first']);
    const begins = worker.posted.filter((entry) => entry.message.type === 'begin');
    expect(begins.map((entry) => entry.message.jobId)).toEqual([1, 2]);
    for (let index = 3; index < worker.posted.length; index++) {
      worker.run(worker.posted[index].message);
    }
    expect(results).toEqual(['first', 'second']);
    expect(() => vi.runOnlyPendingTimers()).toThrow('first onPeaks failed');
    vi.useRealTimers();
  });

  it('PW17 a worker failure delivers every pending job even when one onPeaks throws, and rethrows on a timer', () => {
    vi.useFakeTimers();
    FakePeaksWorker.auto = false;
    const computer = createSourcePeaksComputer();
    const results: string[] = [];
    computer.request(
      new FakeAudioBuffer([signal(18, 700)], 1000),
      new AbortController().signal,
      () => {
        results.push('first');
        throw new Error('fallback onPeaks failed');
      },
    );
    computer.request(
      new FakeAudioBuffer([signal(19, 700)], 1000),
      new AbortController().signal,
      () => results.push('second'),
    );
    const worker = FakePeaksWorker.instances[0];
    expect(() => worker.onerror?.(new Event('error'))).not.toThrow();
    expect(results).toEqual(['first', 'second']);
    expect(worker.terminated).toBe(1);
    expect(() => vi.runOnlyPendingTimers()).toThrow('fallback onPeaks failed');
    vi.useRealTimers();
  });
});
