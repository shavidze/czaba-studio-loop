export const PEAK_BUCKETS_PER_SECOND = 100;

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
