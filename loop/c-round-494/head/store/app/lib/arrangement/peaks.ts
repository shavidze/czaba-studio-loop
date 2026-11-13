export const PEAK_BUCKETS_PER_SECOND = 100;

export const PEAK_SHAPE_MAX_COLUMNS = 4096;

const PEAK_COLUMN_BAND_FACTOR = 4;

export function waveformPeakColumns(duration: number, pxPerSecond: number): number {
  const width = duration * pxPerSecond;
  if (!Number.isFinite(width) || Math.round(width) <= 0) {
    return 0;
  }
  const pixelsPerBucket = pxPerSecond / PEAK_BUCKETS_PER_SECOND;
  let bucketsPerColumn = 1;
  while (bucketsPerColumn * PEAK_COLUMN_BAND_FACTOR * pixelsPerBucket <= 1) {
    bucketsPerColumn *= PEAK_COLUMN_BAND_FACTOR;
  }
  const buckets = Math.ceil(duration * PEAK_BUCKETS_PER_SECOND);
  return Math.max(1, Math.min(PEAK_SHAPE_MAX_COLUMNS, Math.ceil(buckets / bucketsPerColumn)));
}

export function computePeaks(
  channels: readonly Float32Array[],
  sampleRate: number,
  bucketsPerSecond: number,
): Float32Array {
  const length = channels[0]?.length ?? 0;
  if (length === 0 || sampleRate <= 0 || bucketsPerSecond <= 0) {
    return new Float32Array(0);
  }
  const samplesPerBucket = sampleRate / bucketsPerSecond;
  const count = Math.ceil(length / samplesPerBucket);
  const peaks = new Float32Array(count);
  for (let bucket = 0; bucket < count; bucket++) {
    const from = Math.floor(bucket * samplesPerBucket);
    const to = Math.min(length, Math.floor((bucket + 1) * samplesPerBucket));
    let max = 0;
    for (const channel of channels) {
      for (let i = from; i < to; i++) {
        const value = Math.abs(channel[i]);
        if (value > max) {
          max = value;
        }
      }
    }
    peaks[bucket] = max;
  }
  return peaks;
}

const PEAK_SILENCE_FLOOR = 1e-6;

export function normalizePeakColumns(columns: readonly number[]): number[] {
  const max = columns.reduce(
    (current, value) => (Number.isFinite(value) ? Math.max(current, Math.abs(value)) : current),
    0,
  );
  if (max <= PEAK_SILENCE_FLOOR) {
    return columns.map(() => 0);
  }
  return columns.map((value) => (Number.isFinite(value) ? Math.min(1, Math.abs(value) / max) : 0));
}

export function peakBucketCount(
  length: number,
  sampleRate: number,
  bucketsPerSecond: number,
): number {
  if (length <= 0 || sampleRate <= 0 || bucketsPerSecond <= 0) {
    return 0;
  }
  const count = Math.ceil(length / (sampleRate / bucketsPerSecond));
  return Number.isFinite(count) ? count : 0;
}

export function accumulatePeakChunk(
  peaks: Float32Array,
  chunk: readonly Float32Array[],
  chunkStart: number,
  chunkLength: number,
  sampleRate: number,
  bucketsPerSecond: number,
): void {
  if (chunkLength <= 0 || peaks.length === 0) {
    return;
  }
  const samplesPerBucket = sampleRate / bucketsPerSecond;
  const chunkEnd = chunkStart + chunkLength;
  let bucket = Math.max(0, Math.floor(chunkStart / samplesPerBucket) - 1);
  while (bucket < peaks.length && Math.floor((bucket + 1) * samplesPerBucket) <= chunkStart) {
    bucket += 1;
  }
  for (; bucket < peaks.length; bucket++) {
    const bucketFrom = Math.floor(bucket * samplesPerBucket);
    if (bucketFrom >= chunkEnd) {
      break;
    }
    const from = Math.max(bucketFrom, chunkStart) - chunkStart;
    const to = Math.min(Math.floor((bucket + 1) * samplesPerBucket), chunkEnd) - chunkStart;
    let max = peaks[bucket];
    for (const channel of chunk) {
      for (let i = from; i < to; i++) {
        const value = Math.abs(channel[i]);
        if (value > max) {
          max = value;
        }
      }
    }
    peaks[bucket] = max;
  }
}
