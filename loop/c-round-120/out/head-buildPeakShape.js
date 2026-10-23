function buildPeakShape(
  peaks,
  sourceOffset,
  duration,
  columns,
){
  if (!peaks || peaks.length === 0 || columns <= 0) {
    return null;
  }
  const from = Math.floor(sourceOffset * PEAK_BUCKETS_PER_SECOND);
  const to = Math.min(peaks.length, Math.ceil((sourceOffset + duration) * PEAK_BUCKETS_PER_SECOND));
  const span = to - from;
  if (span <= 0) {
    return null;
  }
  const count = Math.max(1, Math.min(span, Math.round(columns)));
  const perColumn = span / count;
  const parts = [];
  for (let column = 0; column < count; column++) {
    const start = from + Math.floor(column * perColumn);
    const end = Math.max(start + 1, from + Math.floor((column + 1) * perColumn));
    let max = 0;
    for (let i = start; i < end && i < to; i++) {
      max = Math.max(max, peaks[i]);
    }
    const height = Math.max(0.02, Math.min(1, max));
    parts.push(`M${column} ${(1 - height).toFixed(3)}h1V${(1 + height).toFixed(3)}h-1Z`);
  }
  return { columns: count, path: parts.join('') };
}
