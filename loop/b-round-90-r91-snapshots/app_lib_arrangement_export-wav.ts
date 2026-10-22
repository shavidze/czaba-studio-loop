import { encodeSfxWav } from '../sfx-edit';
import { isOverFullScale, MAX_24BIT_SAMPLE } from './meter';

export interface ExportOverloadReport {
  peak: number;
  clippedSamples: number;
}

export interface ArrangementWavEncoding extends ExportOverloadReport {
  bytes: ArrayBuffer;
}

export interface ArrangementWavEncodeRequest {
  channels: Float32Array[];
  sampleRate: number;
}

export type ArrangementWavEncodeResponse =
  | { type: 'progress'; fraction: number }
  | ({ type: 'complete' } & ArrangementWavEncoding)
  | { type: 'error'; message: string };

export function measureExportOverload(
  channels: readonly ArrayLike<number>[],
): ExportOverloadReport {
  let peak = 0;
  let clippedSamples = 0;
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      const sample = channel[i];
      const magnitude = Math.abs(sample);
      if (magnitude > peak) {
        peak = magnitude;
      }
      if (isOverFullScale(sample)) {
        clippedSamples += 1;
      }
    }
  }
  return { peak, clippedSamples };
}

export function encodeArrangementWav(
  channels: readonly Float32Array[],
  sampleRate: number,
  onProgress?: (fraction: number) => void,
): ArrangementWavEncoding {
  const report = measureExportOverload(channels);
  const clampedChannels = channels.map((data) => {
    const clamped = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      clamped[i] = Math.min(MAX_24BIT_SAMPLE, Math.max(-1, data[i]));
    }
    return clamped;
  });
  const bytes = encodeSfxWav({ sampleRate, channels: clampedChannels }, onProgress);
  return { bytes, ...report };
}
