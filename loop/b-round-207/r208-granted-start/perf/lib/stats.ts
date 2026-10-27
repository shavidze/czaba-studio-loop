export function sortedNumbers(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

export function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = sortedNumbers(values);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

export function median(values: readonly number[]): number {
  return percentile(values, 0.5);
}

export function frameIntervals(timestamps: readonly number[]): number[] {
  const intervals: number[] = [];
  for (let index = 1; index < timestamps.length; index += 1) {
    intervals.push(timestamps[index] - timestamps[index - 1]);
  }
  return intervals;
}

export function countsAgree(values: readonly number[]): boolean {
  if (values.length === 0) return true;
  const center = median(values);
  const allowed = Math.max(2, Math.abs(center) * 0.1);
  return values.every((value) => Math.abs(value - center) <= allowed);
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
