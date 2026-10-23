import { createHash } from 'node:crypto';
import { buildPeakShape } from '~/components/arrangement/ArrangementClip';
const peaks = new Float32Array(300);
for (let i = 0; i < 300; i++) {
  peaks[i] = Math.abs(Math.sin(i / 7)) * (0.3 + 0.7 * Math.abs(Math.cos(i / 41)));
}
const shape = buildPeakShape(peaks, 0.5, 2, 120);
const wg1 = buildPeakShape(new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01]), 0, 0.05, 5);
console.log(JSON.stringify({ columns: shape?.columns, len: shape?.path.length, sha256: createHash('sha256').update(shape?.path ?? '').digest('hex'), wg1: wg1?.path }));
console.log(shape?.path);
