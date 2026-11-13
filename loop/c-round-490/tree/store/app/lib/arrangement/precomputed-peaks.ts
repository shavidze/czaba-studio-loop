import { PEAK_BUCKETS_PER_SECOND, peakBucketCount } from './peaks';
import { plainSourceFetch, type SourceFetch } from './source-fetch';

export const PRECOMPUTED_PEAKS_BUCKET_TOLERANCE = 1;

export const PRECOMPUTED_PEAKS_MAX_BYTES = 4 * 1024 * 1024;

export interface PrecomputedPeaks {
  peaks: Float32Array;
  bits: 8 | 16;
}

function readBits(value: unknown): 8 | 16 | null {
  return value === 8 || value === 16 ? value : null;
}

function readPositiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function readChannelCount(version: unknown, channels: unknown): number | null {
  if (version === 1) {
    return channels === undefined || channels === 1 ? 1 : null;
  }
  if (version === 2) {
    return readPositiveInteger(channels);
  }
  return null;
}

export function parseAudiowaveformPeaks(data: unknown): PrecomputedPeaks | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return null;
  }
  const record: Record<string, unknown> = { ...data };
  const channels = readChannelCount(record.version, record.channels);
  const sampleRate = readPositiveInteger(record.sample_rate);
  const samplesPerPixel = readPositiveInteger(record.samples_per_pixel);
  const length = readPositiveInteger(record.length);
  const bits = readBits(record.bits);
  const values = record.data;
  if (
    channels === null ||
    sampleRate === null ||
    samplesPerPixel === null ||
    length === null ||
    bits === null ||
    samplesPerPixel > sampleRate / PEAK_BUCKETS_PER_SECOND ||
    !Array.isArray(values) ||
    values.length !== length * channels * 2
  ) {
    return null;
  }
  const fullScale = bits === 8 ? 128 : 32768;
  const pixels = new Float32Array(length);
  for (let pixel = 0; pixel < length; pixel++) {
    let max = 0;
    for (let offset = pixel * channels * 2; offset < (pixel + 1) * channels * 2; offset++) {
      const value: unknown = values[offset];
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < -fullScale ||
        value >= fullScale
      ) {
        return null;
      }
      max = Math.max(max, Math.abs(value));
    }
    pixels[pixel] = Math.min(1, max / fullScale);
  }
  const totalSamples = length * samplesPerPixel;
  const samplesPerBucket = sampleRate / PEAK_BUCKETS_PER_SECOND;
  const peaks = new Float32Array(
    peakBucketCount(totalSamples, sampleRate, PEAK_BUCKETS_PER_SECOND),
  );
  for (let bucket = 0; bucket < peaks.length; bucket++) {
    const from = Math.floor(bucket * samplesPerBucket);
    const to = Math.min(totalSamples, Math.floor((bucket + 1) * samplesPerBucket));
    const lastPixel = Math.min(length, Math.ceil(to / samplesPerPixel));
    let max = 0;
    for (let pixel = Math.floor(from / samplesPerPixel); pixel < lastPixel; pixel++) {
      max = Math.max(max, pixels[pixel]);
    }
    peaks[bucket] = max;
  }
  return { peaks, bits };
}

export function precomputedPeaksMatchDecodedLength(
  peaks: Float32Array,
  decodedLength: number,
  sampleRate: number,
): boolean {
  const expected = peakBucketCount(decodedLength, sampleRate, PEAK_BUCKETS_PER_SECOND);
  return expected > 0 && Math.abs(peaks.length - expected) <= PRECOMPUTED_PEAKS_BUCKET_TOLERANCE;
}

async function readCappedText(
  body: ReadableStream<Uint8Array>,
  maxBytes: number,
  signal: AbortSignal,
): Promise<string | null> {
  const reader = body.getReader();
  const cancel = () => {
    void reader.cancel().catch(() => undefined);
  };
  if (signal.aborted) {
    cancel();
    return null;
  }
  signal.addEventListener('abort', cancel, { once: true });
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > maxBytes) {
        cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener('abort', cancel);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchPrecomputedPeaks(
  url: string,
  signal: AbortSignal,
  fetchPeaks: SourceFetch = plainSourceFetch,
): Promise<PrecomputedPeaks | null> {
  try {
    const response = await fetchPeaks(url, { credentials: 'omit', signal });
    const declaredBytes = Number(response.headers.get('content-length') ?? 0);
    if (!response.ok || !(declaredBytes <= PRECOMPUTED_PEAKS_MAX_BYTES) || response.body === null) {
      void response.body?.cancel().catch(() => undefined);
      return null;
    }
    const text = await readCappedText(response.body, PRECOMPUTED_PEAKS_MAX_BYTES, signal);
    if (text === null || signal.aborted) {
      return null;
    }
    const data: unknown = JSON.parse(text);
    return parseAudiowaveformPeaks(data);
  } catch {
    return null;
  }
}
