import { describe, expect, it, vi } from 'vitest';
import { computePeaks, PEAK_BUCKETS_PER_SECOND, peakBucketCount } from '../peaks';
import {
  fetchPrecomputedPeaks,
  PRECOMPUTED_PEAKS_MAX_BYTES,
  parseAudiowaveformPeaks,
  precomputedPeaksMatchDecodedLength,
} from '../precomputed-peaks';
import type { SourceFetch } from '../source-fetch';

interface WaveformJson {
  version: number;
  channels?: number;
  sample_rate: number;
  samples_per_pixel: number;
  bits: number;
  length: number;
  data: number[];
}

function waveform(overrides: Partial<WaveformJson> & Pick<WaveformJson, 'data'>): WaveformJson {
  const channels = overrides.channels ?? 1;
  return {
    version: 2,
    channels,
    sample_rate: 48000,
    samples_per_pixel: 480,
    bits: 16,
    length: overrides.data.length / (channels * 2),
    ...overrides,
  };
}

function values(peaks: Float32Array | undefined): number[] {
  return Array.from(peaks ?? []);
}

function audiowaveformOf(
  channels: readonly Int16Array[],
  samplesPerPixel: number,
  sampleRate: number,
): WaveformJson {
  const length = Math.ceil(channels[0].length / samplesPerPixel);
  const data: number[] = [];
  for (let pixel = 0; pixel < length; pixel++) {
    for (const channel of channels) {
      const slice = channel.subarray(pixel * samplesPerPixel, (pixel + 1) * samplesPerPixel);
      data.push(Math.min(...slice), Math.max(...slice));
    }
  }
  return {
    version: 2,
    channels: channels.length,
    sample_rate: sampleRate,
    samples_per_pixel: samplesPerPixel,
    bits: 16,
    length,
    data,
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('PP1-PP5 parseAudiowaveformPeaks (audiowaveform JSON v1/v2 -> 100 buckets per second)', () => {
  it('PP1 v2 16-bit stereo, one pixel per bucket: max of |min| and |max| over every channel, over 32768', () => {
    const parsed = parseAudiowaveformPeaks(
      waveform({
        channels: 2,
        data: [-16384, 8192, -100, 200, -10, 4096, -32768, 32767, 0, 0, -1, 1],
      }),
    );
    expect(parsed?.bits).toBe(16);
    expect(values(parsed?.peaks)).toEqual([0.5, 1, 1 / 32768]);
  });

  it('PP2 v1 8-bit mono without a channels field: values over 128, -128 is full scale', () => {
    const parsed = parseAudiowaveformPeaks({
      version: 1,
      sample_rate: 44100,
      samples_per_pixel: 441,
      bits: 8,
      length: 3,
      data: [-128, 10, -32, 64, 0, -1],
    });
    expect(parsed?.bits).toBe(8);
    expect(values(parsed?.peaks)).toEqual([1, 0.5, 1 / 128]);
  });

  it('PP3 finer pixels pool by max into each bucket, and the bucket count follows peakBucketCount', () => {
    const parsed = parseAudiowaveformPeaks(
      waveform({ samples_per_pixel: 240, data: [0, 100, -300, 0, 0, 200, -50, 0, 0, 400] }),
    );
    expect(peakBucketCount(5 * 240, 48000, PEAK_BUCKETS_PER_SECOND)).toBe(3);
    expect(values(parsed?.peaks)).toEqual([300 / 32768, 200 / 32768, 400 / 32768]);
  });

  it('PP4 on a non-integer pixel/bucket ratio it matches computePeaks within one neighbouring bucket', () => {
    const sampleRate = 44100;
    const length = sampleRate * 2 + 123;
    const left = new Int16Array(length);
    const right = new Int16Array(length);
    let seed = 7;
    for (let i = 0; i < length; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const envelope = Math.abs(Math.sin(i / 3000));
      left[i] = Math.round(((seed / 2147483648) * 2 - 1) * 32767 * envelope);
      right[i] = Math.round(-left[i] * 0.5);
    }
    const parsed = parseAudiowaveformPeaks(audiowaveformOf([left, right], 256, sampleRate));
    const computed = computePeaks(
      [left, right].map((channel) => Float32Array.from(channel, (value) => value / 32768)),
      sampleRate,
      PEAK_BUCKETS_PER_SECOND,
    );
    const peaks = parsed?.peaks ?? new Float32Array(0);
    expect(peaks.length).toBe(computed.length);
    const tolerance = 1 / 32768;
    for (let bucket = 0; bucket < computed.length; bucket++) {
      const neighbours = Math.max(
        computed[bucket],
        computed[bucket - 1] ?? 0,
        computed[bucket + 1] ?? 0,
      );
      expect(peaks[bucket]).toBeGreaterThanOrEqual(computed[bucket] - tolerance);
      expect(peaks[bucket]).toBeLessThanOrEqual(neighbours + tolerance);
    }
  });

  it('PP5 rejects every malformed or unsupported file with null', () => {
    const good = waveform({ data: [-1, 1, -2, 2] });
    expect(parseAudiowaveformPeaks(good)).not.toBeNull();
    const rejected: unknown[] = [
      null,
      'peaks',
      [good],
      { ...good, version: 3 },
      { ...good, version: '2' },
      { ...good, version: 1, channels: 2, data: [-1, 1, -2, 2, -3, 3, -4, 4] },
      { ...good, channels: 0 },
      { ...good, bits: 12 },
      { ...good, sample_rate: 0 },
      { ...good, samples_per_pixel: 481 },
      { ...good, samples_per_pixel: 1.5 },
      { ...good, length: 0, data: [] },
      { ...good, length: 3 },
      { ...good, data: [-1, 1, -2] },
      { ...good, data: [-1, 1, -2, 2.5] },
      { ...good, data: [-1, 1, -2, '2'] },
      { ...good, data: [-32769, 1, -2, 2] },
      { ...good, data: [-1, 32768, -2, 2] },
      { ...good, bits: 8, data: [-1, 128, -2, 2] },
      { ...good, bits: 8, data: [-129, 1, -2, 2] },
    ];
    for (const entry of rejected) {
      expect(parseAudiowaveformPeaks(entry)).toBeNull();
    }
  });
});

describe('PP6 precomputedPeaksMatchDecodedLength', () => {
  it('PP6 accepts the decoded bucket count within one bucket, at any decode sample rate', () => {
    const peaks = new Float32Array(200);
    expect(precomputedPeaksMatchDecodedLength(peaks, 96000, 48000)).toBe(true);
    expect(precomputedPeaksMatchDecodedLength(peaks, 88200, 44100)).toBe(true);
    expect(precomputedPeaksMatchDecodedLength(peaks, 96000 + 480, 48000)).toBe(true);
    expect(precomputedPeaksMatchDecodedLength(peaks, 96000 - 480, 48000)).toBe(true);
    expect(precomputedPeaksMatchDecodedLength(peaks, 96000 + 961, 48000)).toBe(false);
    expect(precomputedPeaksMatchDecodedLength(peaks, 96000 - 960, 48000)).toBe(false);
    expect(precomputedPeaksMatchDecodedLength(new Float32Array(1), 0, 48000)).toBe(false);
  });
});

describe('PP7 fetchPrecomputedPeaks never throws and falls back with null', () => {
  const body = waveform({ data: [-16384, 0] });

  it('PP7a parses an ok response and passes the abort signal to the fetch', async () => {
    const controller = new AbortController();
    const fetchPeaks = vi.fn<SourceFetch>(async () => jsonResponse(body));
    const parsed = await fetchPrecomputedPeaks('/peaks/a.json', controller.signal, fetchPeaks);
    expect(values(parsed?.peaks)).toEqual([0.5]);
    expect(fetchPeaks).toHaveBeenCalledTimes(1);
    expect(fetchPeaks.mock.calls[0][0]).toBe('/peaks/a.json');
    expect(fetchPeaks.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('PP7b a non-ok status, bad JSON, invalid data or a rejected fetch give null', async () => {
    const signal = new AbortController().signal;
    const cases: SourceFetch[] = [
      async () => jsonResponse(body, { status: 404 }),
      async () => new Response('not json', { status: 200 }),
      async () => jsonResponse({ ...body, bits: 4 }),
      async () => {
        throw new TypeError('network down');
      },
    ];
    for (const fetchPeaks of cases) {
      await expect(fetchPrecomputedPeaks('/peaks/a.json', signal, fetchPeaks)).resolves.toBeNull();
    }
  });

  it('PP7c a declared size above the cap is refused before parsing; the cap itself and a missing header pass', async () => {
    const signal = new AbortController().signal;
    const sized = (bytes: number | null): SourceFetch => {
      return async () => {
        const response = jsonResponse(body);
        const headers = new Headers(response.headers);
        if (bytes === null) {
          headers.delete('content-length');
        } else {
          headers.set('content-length', String(bytes));
        }
        return new Response(JSON.stringify(body), { status: 200, headers });
      };
    };
    expect(PRECOMPUTED_PEAKS_MAX_BYTES).toBe(4 * 1024 * 1024);
    await expect(
      fetchPrecomputedPeaks('/p', signal, sized(PRECOMPUTED_PEAKS_MAX_BYTES + 1)),
    ).resolves.toBeNull();
    await expect(
      fetchPrecomputedPeaks('/p', signal, sized(PRECOMPUTED_PEAKS_MAX_BYTES)),
    ).resolves.not.toBeNull();
    await expect(fetchPrecomputedPeaks('/p', signal, sized(null))).resolves.not.toBeNull();
  });

  it('PP7d an abort while the body is read gives null and cancels the rest of the body', async () => {
    const controller = new AbortController();
    const cancelled: string[] = [];
    const text = JSON.stringify(body);
    const half = Math.floor(text.length / 2);
    const fetchPeaks: SourceFetch = async () => {
      let step = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(streamController) {
          step += 1;
          if (step === 1) {
            streamController.enqueue(new TextEncoder().encode(text.slice(0, half)));
            return;
          }
          controller.abort();
          streamController.enqueue(new TextEncoder().encode(text.slice(half)));
          streamController.close();
        },
        cancel() {
          cancelled.push('aborted');
        },
      });
      return new Response(stream, { status: 200 });
    };
    await expect(
      fetchPrecomputedPeaks('/peaks/a.json', controller.signal, fetchPeaks),
    ).resolves.toBeNull();
    await vi.waitFor(() => expect(cancelled).toEqual(['aborted']));
  });
});

describe('PP8-PP9 fetchPrecomputedPeaks request policy and refused bodies (PERF-15b)', () => {
  const body = waveform({ data: [-16384, 0] });

  function trackedBody(cancelled: string[], label: string): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(body)));
      },
      cancel() {
        cancelled.push(label);
      },
    });
  }

  it('PP8 the peaks request omits credentials, like the audio request', async () => {
    const fetchPeaks = vi.fn<SourceFetch>(async () => jsonResponse(body));
    await fetchPrecomputedPeaks('/peaks/a.json', new AbortController().signal, fetchPeaks);
    expect(fetchPeaks).toHaveBeenCalledTimes(1);
    expect(fetchPeaks.mock.calls[0][1].credentials).toBe('omit');
  });

  it('PP9 a non-ok or over-cap response cancels its unread body; an ok body is read, not cancelled', async () => {
    const cancelled: string[] = [];
    const signal = new AbortController().signal;
    const notFound: SourceFetch = async () =>
      new Response(trackedBody(cancelled, '404'), { status: 404 });
    const overCap: SourceFetch = async () =>
      new Response(trackedBody(cancelled, 'over-cap'), {
        status: 200,
        headers: { 'content-length': String(PRECOMPUTED_PEAKS_MAX_BYTES + 1) },
      });
    await expect(fetchPrecomputedPeaks('/p', signal, notFound)).resolves.toBeNull();
    await expect(fetchPrecomputedPeaks('/p', signal, overCap)).resolves.toBeNull();
    await vi.waitFor(() => expect(cancelled).toEqual(['404', 'over-cap']));
    const okCancelled: string[] = [];
    const ok: SourceFetch = async () => {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(body)));
          controller.close();
        },
        cancel() {
          okCancelled.push('ok');
        },
      });
      return new Response(stream, { status: 200 });
    };
    await expect(fetchPrecomputedPeaks('/p', signal, ok)).resolves.not.toBeNull();
    expect(okCancelled).toEqual([]);
  });
});

describe('PP7e abort after the whole body arrived (PERF-15b-ii)', () => {
  it('PP7e an abort that lands after the last chunk, before the read ends, still gives null', async () => {
    const controller = new AbortController();
    const text = JSON.stringify(waveform({ data: [-16384, 0] }));
    let pulls = 0;
    const fetchPeaks: SourceFetch = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          pull(streamController) {
            pulls += 1;
            if (pulls === 1) {
              streamController.enqueue(new TextEncoder().encode(text));
              return;
            }
            controller.abort();
            streamController.close();
          },
        }),
        { status: 200 },
      );
    await expect(fetchPrecomputedPeaks('/p', controller.signal, fetchPeaks)).resolves.toBeNull();
    expect(pulls).toBe(2);
  });
});

describe('PP10-PP12 streamed-bytes cap and abort (PERF-15b-ii, TL-R411-L4, TL-R413-L1)', () => {
  const body = waveform({ data: [-16384, 0] });

  function chunkedBody(
    chunks: number,
    chunkBytes: number,
    cancelled: string[],
    label: string,
  ): ReadableStream<Uint8Array> {
    let sent = 0;
    return new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent === chunks) {
          controller.close();
          return;
        }
        sent += 1;
        controller.enqueue(new Uint8Array(chunkBytes).fill(32));
      },
      cancel() {
        cancelled.push(label);
      },
    });
  }

  it('PP10 without content-length, a body that streams past the cap is refused and cancelled; the stream is not read to its end', async () => {
    const cancelled: string[] = [];
    const chunkBytes = 1024 * 1024;
    const chunks = 8;
    const stream = chunkedBody(chunks, chunkBytes, cancelled, 'no-length');
    const fetchPeaks: SourceFetch = async () => new Response(stream, { status: 200 });
    await expect(
      fetchPrecomputedPeaks('/p', new AbortController().signal, fetchPeaks),
    ).resolves.toBeNull();
    await vi.waitFor(() => expect(cancelled).toEqual(['no-length']));
    expect(PRECOMPUTED_PEAKS_MAX_BYTES / chunkBytes).toBeLessThan(chunks);
  });

  it('PP12 an abort while the body is stalled settles to null and cancels the body, even when the fetch ignores the signal', async () => {
    const controller = new AbortController();
    const cancelled: string[] = [];
    const stalled = new ReadableStream<Uint8Array>({
      pull() {
        return new Promise<void>(() => undefined);
      },
      cancel() {
        cancelled.push('stalled');
      },
    });
    const ignoresSignal: SourceFetch = async () => new Response(stalled, { status: 200 });
    const pending = fetchPrecomputedPeaks('/p', controller.signal, ignoresSignal);
    setTimeout(() => controller.abort(), 10);
    const outcome = await Promise.race([
      pending,
      new Promise<string>((resolve) => setTimeout(() => resolve('still pending'), 1000)),
    ]);
    expect(outcome).toBeNull();
    expect(cancelled).toEqual(['stalled']);
  });

  it('PP12b an already aborted signal gives null at once and cancels the body, even when the fetch ignores the signal', async () => {
    const controller = new AbortController();
    controller.abort();
    const cancelled: string[] = [];
    const stalled = new ReadableStream<Uint8Array>({
      pull() {
        return new Promise<void>(() => undefined);
      },
      cancel() {
        cancelled.push('pre-aborted');
      },
    });
    const ignoresSignal: SourceFetch = async () => new Response(stalled, { status: 200 });
    const outcome = await Promise.race([
      fetchPrecomputedPeaks('/p', controller.signal, ignoresSignal),
      new Promise<string>((resolve) => setTimeout(() => resolve('still pending'), 1000)),
    ]);
    expect(outcome).toBeNull();
    expect(cancelled).toEqual(['pre-aborted']);
  });

  it('PP11 a small declared content-length does not let a longer streamed body through; a body exactly at the cap is parsed', async () => {
    const cancelled: string[] = [];
    const lying: SourceFetch = async () =>
      new Response(chunkedBody(8, 1024 * 1024, cancelled, 'lying'), {
        status: 200,
        headers: { 'content-length': '100' },
      });
    await expect(
      fetchPrecomputedPeaks('/p', new AbortController().signal, lying),
    ).resolves.toBeNull();
    await vi.waitFor(() => expect(cancelled).toEqual(['lying']));
    const text = JSON.stringify(body);
    const padded = text + ' '.repeat(PRECOMPUTED_PEAKS_MAX_BYTES - text.length);
    expect(new TextEncoder().encode(padded).byteLength).toBe(PRECOMPUTED_PEAKS_MAX_BYTES);
    const atCap: SourceFetch = async () => new Response(padded, { status: 200 });
    const parsed = await fetchPrecomputedPeaks('/p', new AbortController().signal, atCap);
    expect(values(parsed?.peaks)).toEqual([0.5]);
  });
});
